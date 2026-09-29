//! Roadmap step 7, done when the gauntlet passes: the whole identity
//! gauntlet, every home on this machine.

use mor_harness::gauntlet::Gauntlet;

#[tokio::test(flavor = "multi_thread")]
async fn the_identity_gauntlet_passes() {
    let report = Gauntlet::local(false).await.run().await;
    let text = report.text();
    println!("{text}");
    assert!(report.passed(), "{text}");
}
