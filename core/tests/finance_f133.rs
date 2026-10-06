//! Finance rule 14 with F133, over real signed acts: the pointer version an
//! obligation names must be one its agreement act holds in its history
//! (cites, directly or through what it cites). Freeze scenario 1, step 5c:
//! a thief with the contributor's stolen signing key adds a newer flow
//! pointer; the debtor re-signs the royalty debt to name it, under the
//! film's deal, whose act never saw it. Test identities only.

mod common;

use common::{finance_spec, own_home, World};
use mor_core::finance::{pointer_cited, Amount, Obligation, PayeePointer, Payload, Rail};
use mor_core::hash::{sha256, Hash};

fn h(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn pointer(payee: Hash, version: u64, previous: Option<Hash>, node: &str) -> Payload {
    Payload::PayeePointer(PayeePointer {
        payee,
        version,
        previous,
        rails: vec![Rail {
            module: h("a rail Module"),
            address: node.as_bytes().to_vec(),
        }],
    })
}

/// An act standing for an agreement in these tests: what it is does not
/// matter to F133, only what it cites.
fn deal_spec() -> Hash {
    h("a deal's terms, for this test")
}

fn debt(service: Hash, contributor: Hash, pointer: Hash, agreement: Option<Hash>) -> Obligation {
    Obligation {
        debtor: service,
        creditor: contributor,
        amount: Amount {
            unit: h("a test unit"),
            value: 40_000,
        },
        pointer,
        agreement,
    }
}

#[test]
fn the_pointer_a_debt_names_must_be_one_its_agreement_act_cites() {
    let mut w = World::new();
    let mut c = w.genesis("contributor", vec![own_home()], None, None);
    let mut service = w.genesis("the film's split service", vec![own_home()], None, None);
    let fin = finance_spec();
    let id = c.id;

    // The contributor's own flow pointer, version 1.
    let a = w.everyday_act(&mut c, fin, 0, pointer(id, 1, None, "own node").to_map(), None, None);
    let own = w.add(&a);
    // The film's deal, drafted by the contributor after it: its sequence
    // cites the pointer.
    let a = w.everyday_act(&mut c, deal_spec(), 0, vec![], None, None);
    let deal = w.add(&a);
    // An offer by the service, citing the contributor's pointer directly
    // in its `objects`.
    let a = w.everyday_act(
        &mut service,
        deal_spec(),
        1,
        vec![],
        Some(vec![mor_core::act::Object { chain: c.id, predecessor: own }]),
        None,
    );
    let offer = w.add(&a);
    // The thief, with the stolen signing key, adds version 2.
    let mut thief = c.clone();
    let a = w.everyday_act(&mut thief, fin, 0, pointer(id, 2, Some(own), "thief's node").to_map(), None, None);
    let thiefs = w.add(&a);

    // The royalty debt names version 1 under the deal: cited.
    assert_eq!(pointer_cited(&w.v, &debt(service.id, c.id, own, Some(deal))), Some(true));
    assert_eq!(pointer_cited(&w.v, &debt(service.id, c.id, own, Some(offer))), Some(true));

    // The debtor re-signs it naming the thief's version 2, under the same
    // deal, which never saw it: the version does not count for it.
    assert_eq!(pointer_cited(&w.v, &debt(service.id, c.id, thiefs, Some(deal))), Some(false));
    assert_eq!(pointer_cited(&w.v, &debt(service.id, c.id, thiefs, Some(offer))), Some(false));

    // A deal the thief makes after its pointer cites it: a debt under it
    // naming version 2 counts on that flow (the stream between theft and
    // rotation, a stated cost no clockless rule closes).
    let a = w.everyday_act(&mut thief, deal_spec(), 0, vec![], None, None);
    let later = w.add(&a);
    assert_eq!(pointer_cited(&w.v, &debt(service.id, c.id, thiefs, Some(later))), Some(true));

    // A debt naming no agreement act: no history holds its pointer.
    assert_eq!(pointer_cited(&w.v, &debt(service.id, c.id, own, None)), Some(false));
    // An agreement act not held: not known.
    assert_eq!(pointer_cited(&w.v, &debt(service.id, c.id, own, Some(h("a deal nobody holds")))), None);
    // An agreement whose history passes through an act not held, without
    // reaching the pointer: not known.
    let _unheld = w.everyday_act(&mut service, deal_spec(), 2, vec![], None, None);
    let a = w.everyday_act(&mut service, deal_spec(), 0, vec![], None, None);
    let gap = w.add(&a);
    assert_eq!(pointer_cited(&w.v, &debt(service.id, c.id, thiefs, Some(gap))), None);
}
