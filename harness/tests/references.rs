//! Freeze test suite v23, scenario 5, step 3a (F272): a stranger holding only
//! a reply at one home follows it, by the signer named, to the post at
//! another home. Two real homes on this machine, run from the relay
//! program; the stranger is a reader that knows only the home where the
//! reply is, and judges everything with the core library.

use mor_core::act::Ref;
use mor_core::chain::Status;
use mor_harness::net::{Http, Site};
use mor_harness::person::Person;
use mor_harness::reader::Reader;
use mor_relay::operator::random;
use mor_relay::{Policy, Role};

async fn put(site: &Site, bytes: &[u8]) {
    site.client.put_act(bytes).await.expect("the home takes it");
}

#[tokio::test(flavor = "multi_thread")]
async fn a_stranger_follows_a_reply_by_the_signer_it_names_to_the_post_at_another_home() {
    let run = mor_relay::wire::hex(&random::<32>())[..16].to_string();
    let http = Http::new(None);
    let home1 = Site::start(&run, "home1", Role::Home, Policy::Open, &http).await;
    let home2 = Site::start(&run, "home2", Role::Home, Policy::Open, &http).await;
    let homes = || vec![home1.home(), home2.home()];

    // The author keeps its posts at home1; Machine keeps its acts at home2.
    // Both identities are served by both homes, as on the deployed homes.
    let (g, mut author) = Person::genesis(&random::<32>(), "author", homes(), None, None);
    let (mg, mut machine) = Person::genesis(&random::<32>(), "machine", homes(), None, None);
    for site in [&home1, &home2] {
        put(site, &g.encode()).await;
        put(site, &mg.encode()).await;
    }
    let routes = author.outbox_routes(1, None, &home1.base, None);
    put(&home1, &routes.encode()).await;
    put(&home2, &routes.encode()).await;
    let mroutes = machine.outbox_routes(1, None, &home2.base, None);
    put(&home1, &mroutes.encode()).await;
    put(&home2, &mroutes.encode()).await;
    let post = author.post("A post, kept at home1.");
    put(&home1, &post.encode()).await;
    let named = Ref::Signed { act: post.id(), signer: author.id };
    let reply = machine.reply("A reply, kept at home2.", vec![named.clone()]);
    put(&home2, &reply.encode()).await;
    assert!(home2.client.get_act(&post.id()).await.is_err(), "home2 does not hold the post");

    // The stranger holds only the reply, from home2, and knows only home2.
    let start = vec![home2.base.clone()];
    let mut stranger = Reader::new(http.clone());
    let got = mor_core::act::Act::decode(&home2.client.get_act(&reply.id()).await.unwrap()).unwrap();
    let inside = got.open(None).unwrap();
    let refs = inside.refs.clone().unwrap();
    assert_eq!(refs, vec![named.clone()]);
    assert_eq!(refs[0].signer(), Some(author.id));

    // It follows the reference: the post is not at home2; the signer named
    // leads to the author's identity, its routes, and home1.
    let (found, at) = stranger.follow_ref(&refs[0], &start).await.expect("followed by its signer");
    assert_eq!(found.id(), post.id());
    assert_eq!(at, home1.base);
    assert_eq!(stranger.status(&post.id()), Status::Valid, "the post verifies through its signer's chain");
    stranger.follow(&machine.id, &start).await;
    stranger.add(&reply.encode());
    assert_eq!(stranger.status(&reply.id()), Status::Valid);

    // The same reference without the signer: the stranger has nothing to look by.
    let mut bare_reader = Reader::new(http.clone());
    let e = bare_reader.follow_ref(&Ref::Act(post.id()), &start).await.unwrap_err();
    assert!(e.contains("names no signer"), "{e}");

    // A wrong signer: the reply stands, and following it fails, since the
    // post fetched shows its own signer.
    let wrong = Ref::Signed { act: post.id(), signer: machine.id };
    let liar = machine.reply("A reply naming the wrong signer.", vec![wrong.clone()]);
    put(&home2, &liar.encode()).await;
    let mut third = Reader::new(http.clone());
    third.follow(&machine.id, &start).await;
    third.add(&liar.encode());
    assert_eq!(third.status(&liar.id()), Status::Valid, "a wrong signer never makes the act naming it invalid");
    let start1 = vec![home1.base.clone()];
    let e = third.follow_ref(&wrong, &start1).await.unwrap_err();
    assert!(e.contains("another identity"), "{e}");

}
