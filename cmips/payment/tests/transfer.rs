//! Step 4a of the payment cMIP, draft 4 (F355): a commitment whose
//! `fulfils` names the vault declaration `paid-to` names is a transfer to
//! oneself, and only that. Damgar's tests (`clients/damgar/test/vault.test.ts`)
//! check the whole verification on the Lightning rail through the core
//! library; these check the step itself.

use mor_core::act::Scheme;
use mor_core::hash::{sha256, Hash};
use mor_core::identity::SigningKey;
use mor_core::money::Payer;
use mor_payment::{transfer_to_oneself, Answer, PaidTo};

fn h(s: &str) -> Hash {
    sha256(s.as_bytes())
}

#[test]
fn a_transfer_to_oneself_paid_by_oneself_passes() {
    let (me, genesis) = (h("me"), h("genesis declaring the vault"));
    let v = PaidTo::Vault { declared_by: genesis, entry: 0 };
    assert_eq!(transfer_to_oneself(&genesis, &me, Some(&Payer::Identity(me)), false, &v), Ok(()));
}

#[test]
fn naming_the_vault_declaration_but_paid_by_another_is_invalid() {
    let (me, other, genesis) = (h("me"), h("someone else"), h("genesis declaring the vault"));
    let v = PaidTo::Vault { declared_by: genesis, entry: 0 };
    for payer in [Some(Payer::Identity(other)), None, Some(Payer::Key(SigningKey { scheme: Scheme::Founding(1), key: vec![7; 32] }))] {
        let a = transfer_to_oneself(&genesis, &me, payer.as_ref(), false, &v);
        assert!(matches!(a, Err(Answer::Invalid(ref why)) if why.contains("step 4a")), "{payer:?}: {a:?}");
    }
}

#[test]
fn a_transfer_to_oneself_names_no_purchase() {
    let (me, genesis) = (h("me"), h("genesis declaring the vault"));
    let v = PaidTo::Vault { declared_by: genesis, entry: 0 };
    assert!(matches!(transfer_to_oneself(&genesis, &me, Some(&Payer::Identity(me)), true, &v), Err(Answer::Invalid(_))));
}

#[test]
fn draft_3s_form_and_ordinary_payments_are_untouched() {
    let (me, other, genesis, pointer) = (h("me"), h("someone else"), h("genesis declaring the vault"), h("my payee pointer"));
    let v = PaidTo::Vault { declared_by: genesis, entry: 0 };
    // Draft 3's reading: one's own payee pointer as `fulfils`, paid to one's vault.
    assert_eq!(transfer_to_oneself(&pointer, &me, Some(&Payer::Identity(me)), false, &v), Ok(()));
    // Another paying into one's vault, naming what it pays.
    assert_eq!(transfer_to_oneself(&pointer, &me, Some(&Payer::Identity(other)), false, &v), Ok(()));
    // Paid to the flow: step 4a does not apply, whatever `fulfils` names.
    let flow = PaidTo::Flow { pointer, rail: 0 };
    assert_eq!(transfer_to_oneself(&pointer, &me, Some(&Payer::Identity(other)), true, &flow), Ok(()));
}
