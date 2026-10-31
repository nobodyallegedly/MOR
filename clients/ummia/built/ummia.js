// ../genesis/wasm/mor_wasm.js
var Verifier = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    VerifierFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_verifier_free(ptr, 0);
  }
  /**
   * Hold a private act, opened with its content key.
   * @param {Uint8Array} bytes
   * @param {Uint8Array} key
   * @returns {string}
   */
  addWithKey(bytes, key) {
    let deferred4_0;
    let deferred4_1;
    try {
      const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
      const len1 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_addWithKey(this.__wbg_ptr, ptr0, len0, ptr1, len1);
      var ptr3 = ret[0];
      var len3 = ret[1];
      if (ret[3]) {
        ptr3 = 0;
        len3 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred4_0 = ptr3;
      deferred4_1 = len3;
      return getStringFromWasm0(ptr3, len3);
    } finally {
      wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
  }
  /**
   * Hold an act. Returns its id. A malformed act is refused; a validly
   * shaped act with a bad signature is held and judged invalid.
   * @param {Uint8Array} bytes
   * @returns {string}
   */
  add(bytes) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_add(this.__wbg_ptr, ptr0, len0);
      var ptr2 = ret[0];
      var len2 = ret[1];
      if (ret[3]) {
        ptr2 = 0;
        len2 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
  /**
   * An agreement as held: its parties, who signed, whether it exists (a
   * deal, founding terms) or is ready to be recorded (a collective's
   * clone), and the powers its mark must name. `specs`: the six MIR
   * hashes, and the layers of extensions it adds or drops.
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsAgreement(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsAgreement(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Whether an act under a grant binds the collective that issued it.
   * @param {any} specs
   * @param {string} act
   * @returns {any}
   */
  agreementsBacking(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsBacking(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Whether the collective's act `x` counts as made before the line
   * `line` (a record or a rotation of it), on its own sequences (F109).
   * @param {any} specs
   * @param {string} x
   * @param {string} line
   * @returns {boolean}
   */
  agreementsBefore(specs, x, line) {
    const ptr0 = passStringToWasm0(x, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(line, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsBefore(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
  }
  /**
   * Where Agreements read a collective as broken and a rollback can bring it
   * back (Agreements rule 37d, F185): `{ act, before, reason }`, the broken act
   * (a rotation of the collective), the agreement in force just before
   * it, a rollback's parent, and Agreements' reason; null otherwise.
   * @param {any} specs
   * @param {string} collective
   * @returns {any}
   */
  agreementsBrokenAct(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsBrokenAct(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Why Agreements read a collective as broken (the agreement its latest key
   * lives under cannot be found: a rotation's declared clone incomplete,
   * a false mark, rules 37 and 45a), or null where it reads it as working.
   * @param {any} specs
   * @param {string} collective
   * @returns {string | undefined}
   */
  agreementsBroken(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsBroken(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
      v2 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
  }
  /**
   * As `moneyChoose`, the pointer in force read by Agreements (Money
   * draft 10, rule 7, F358): for a collective, a pointer signed with the
   * member keys of its area reaching Money counts where that area's
   * holders and threshold are met. `specs` as for every Agreements call.
   * @param {any} specs
   * @param {string} payee
   * @param {any} amount
   * @param {string[]} accepted
   * @returns {any}
   */
  agreementsChoose(specs, payee, amount, accepted) {
    const ptr0 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(accepted, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsChoose(this.__wbg_ptr, specs, ptr0, len0, amount, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Whether a claim on a work is shown as made after its release: the
   * release, if so (F121, D).
   * @param {any} specs
   * @param {string} claim
   * @param {string} work
   * @returns {string | undefined}
   */
  agreementsClaimAfterRelease(specs, claim, work) {
    const ptr0 = passStringToWasm0(claim, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(work, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsClaimAfterRelease(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v3;
    if (ret[0] !== 0) {
      v3 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v3;
  }
  /**
   * A closing act, judged (rule 47a, F124 N9).
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsClosing(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsClosing(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The collective whose genesis declares the root of `agreement`'s
   * lineage, where held: what null names in its terms (S1).
   * @param {any} specs
   * @param {string} agreement
   * @returns {string | undefined}
   */
  agreementsCollectiveOf(specs, agreement) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsCollectiveOf(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
      v2 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
  }
  /**
   * Agreements' answer for an act of a collective: which areas reach it, and
   * whether their holders' signature acts meet each (rule 36a, 44d).
   * @param {any} specs
   * @param {string} act
   * @returns {any}
   */
  agreementsConsent(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsConsent(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The collective's state after everything held under its latest key:
   * the agreement in force, who left, who stepped down from which area,
   * which areas are frozen, its records. Null if it is not a collective.
   * @param {any} specs
   * @param {string} collective
   * @returns {any}
   */
  agreementsCurrent(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsCurrent(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * @param {any} specs
   * @param {string} agreement
   * @returns {any}
   */
  agreementsDealFork(specs, agreement) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDealFork(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A creditor's release, judged (Money type 4, F126; rule 47b):
   * whether it ends the obligation it names (signed by that obligation's
   * creditor, a collective by its Money lane).
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsDebtRelease(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDebtRelease(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Who owes an obligation of a collective a fork closed (N13): the
   * successors it assigns it to, every successor where it assigns it to
   * none (F125, D1); null where its debtor is not closed by a fork.
   * @param {any} specs
   * @param {string} id
   * @returns {string[] | undefined}
   */
  agreementsDebtors(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDebtors(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
      v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    }
    return v2;
  }
  /**
   * @param {any} specs
   * @param {string} party
   * @returns {any}
   */
  agreementsDeclarationsNaming(specs, party) {
    const ptr0 = passStringToWasm0(party, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDeclarationsNaming(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The agreement an identity's chain declares at the chain act
   * `binding`, if any (for a rotation: the clone it declares).
   * @param {any} specs
   * @param {string} identity
   * @param {string} binding
   * @returns {string | undefined}
   */
  agreementsDeclared(specs, identity, binding) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(binding, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDeclared(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v3;
    if (ret[0] !== 0) {
      v3 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v3;
  }
  /**
   * Whether an act in a collective's name is done (F126, F128): sealed to
   * every member, or public; where it is held decides nothing. `{ done,
   * why }`, or null where the act is not in a collective's name.
   * @param {any} specs
   * @param {string} act
   * @returns {any}
   */
  agreementsDone(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsDone(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Every fork and closing of `collective` held, complete or not: what a
   * new ending names in its `objects`, `[agreement, ending]` (F131 IT1,
   * client conformance).
   * @param {any} specs
   * @param {string} collective
   * @returns {string[]}
   */
  agreementsEndingActs(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsEndingActs(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
  }
  /**
   * Client conformance (rule 45b, F186): the alarm a seller's client and
   * a split service raise when a payment names a version of the deal that
   * does not descend from the version they hold. Null where it does;
   * else `{ named, held, shared, kind, heldLine, namedLine }`, `kind`
   * "fork" (the alarm), "unheld" (a version this verifier does not hold:
   * the alarm, F189 3) or "older" (a plain notice, F188 DQ7).
   * @param {any} specs
   * @param {string} payment
   * @param {string} held
   * @returns {any}
   */
  agreementsForkAlarm(specs, payment, held) {
    const ptr0 = passStringToWasm0(payment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(held, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsForkAlarm(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A fork of a collective, judged (rule 47a, F121 shape B, F124):
   * whether it closes the original, the members whose voice remains,
   * who signed and who leaves on no side, each side's default share, who
   * every successor keeps as a departed holder, each side's successor's
   * founding agreement where it fits, and the obligations in the history
   * it cites that it does not hand out, which keep it from taking effect
   * (F127, replacing F125 D1).
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsFork(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsFork(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * What a fork of `collective` must hand out, its line the acts `line`
   * it would cite on the collective's chain, with `agreement` in force
   * there: every obligation in that history, its own and those an
   * earlier fork handed to it. Null where the line does not hold.
   * @param {any} specs
   * @param {string} collective
   * @param {string} agreement
   * @param {string[]} line
   * @returns {string[] | undefined}
   */
  agreementsHandOut(specs, collective, agreement, line) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(line, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsHandOut(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, ptr2, len2);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v4;
    if (ret[0] !== 0) {
      v4 = getArrayJsValueFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    }
    return v4;
  }
  /**
   * The agreement in force for an act of a collective (rule 37c, F109),
   * or null if its signer is not a collective.
   * @param {any} specs
   * @param {string} act
   * @returns {string | undefined}
   */
  agreementsInForce(specs, act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsInForce(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
      v2 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
  }
  /**
   * The acts the history of a line citing `line` on the collective's
   * chain names that this verifier does not hold: a member's client signs
   * no fork or closing while any is missing (client conformance).
   * @param {any} specs
   * @param {string} collective
   * @param {string[]} line
   * @returns {string[]}
   */
  agreementsLineUnheld(specs, collective, line) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(line, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsLineUnheld(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v3 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v3;
  }
  /**
   * Who counts for a power (`{ form, area }`, as `agreementsClonePlan` gives
   * it) of the collective's agreement in force, at its next line, after
   * every act held (rule 44d), `leaving` taken out: the agreement, the
   * parties counted among, the voices that remain, and how many meet it
   * (null where none remains); or `{ error }`, why there is no such count.
   * @param {any} specs
   * @param {string} collective
   * @param {any} power
   * @param {string[]} leaving
   * @returns {any}
   */
  agreementsNextVoices(specs, collective, power, leaving) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(leaving, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsNextVoices(this.__wbg_ptr, specs, ptr0, len0, power, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Whether an obligation binds its debtor: for a collective, once done
   * (F128, N13's public outside withdrawn); null if not one.
   * @param {any} specs
   * @param {string} id
   * @returns {boolean | undefined}
   */
  agreementsObligationBinds(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsObligationBinds(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] === 16777215 ? void 0 : ret[0] !== 0;
  }
  /**
   * The payments a collective received during a broken stretch and owes
   * back, the sale not signed anew after the rollback (rule 37d, RB2):
   * open obligations, each `{ payment, to, unit, value, stillBroken,
   * unknown }`. An entry is marked `unknown` where it rests on a record
   * whose payment `specs.railPayments` does not state, or on one whose
   * rail answer `specs.railValid` does not give (Money rules 8 and 12).
   * @param {any} specs
   * @param {string} collective
   * @returns {any}
   */
  agreementsOwedBack(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsOwedBack(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * What a collective owes now (F125, D5): its obligations that bind,
   * and those it owes as a fork's successor, neither paid in full by the
   * receipts held nor ended by a creditor's release.
   * @param {any} specs
   * @param {string} collective
   * @returns {string[]}
   */
  agreementsOwes(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsOwes(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
  }
  /**
   * What is paid toward an obligation, as a binding answer: an error
   * coded `agreements/own-attempt` where it rests on this client's own failed
   * attempts to reach homes, shown as unknown (F153); an error coded
   * `law/payment-unstated` where it rests on whether two receipts
   * or claims are one payment and `specs.railPayments` does not say
   * (Money rule 12, F380), shown as unknown.
   * @param {any} specs
   * @param {string} id
   * @returns {bigint}
   */
  agreementsPaid(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPaid(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return BigInt.asUintN(64, ret[0]);
  }
  /**
   * The pointer check (rule 18, F123): whether the payee pointer of
   * `owners` counts for Agreements under `agreement`: "no-split-service",
   * "ordinary", "bypasses" (with the addresses no service's own pointer
   * carries, as hex) or "undetermined".
   * @param {any} specs
   * @param {string} owners
   * @param {string} agreement
   * @returns {any}
   */
  agreementsPointerCheck(specs, owners, agreement) {
    const ptr0 = passStringToWasm0(owners, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPointerCheck(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The payee's pointer acts its own acts hold, for what a payment
   * follows (an obligation, an agreement or an offer; Money rule 14,
   * F145, F157, F163, F168): `{ pointers, complete }`, or null where
   * `fulfils` is none of these.
   * @param {any} specs
   * @param {string} fulfils
   * @param {string} payee
   * @returns {any}
   */
  agreementsPointerHolding(specs, fulfils, payee) {
    const ptr0 = passStringToWasm0(fulfils, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPointerHolding(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The payee pointer in force as Agreements judge it (F358): `{ act,
   * version, why }`, `act` null and `why` said where none counts.
   * @param {any} specs
   * @param {string} payee
   * @returns {any}
   */
  agreementsPointer(specs, payee) {
    const ptr0 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPointer(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The tips a payment names (F409), for a publication by its first
   * version: `latest`, its latest versions (two or more, the parties'
   * fork); `tags`, the latest version of each price tag line that counts
   * under it, one per price; `owners` and `ownersLatest`, the ownership
   * agreement it names and that agreement's latest version, which a
   * purchase names in field 9.
   * @param {any} specs
   * @param {string} first
   * @returns {any}
   */
  agreementsPublicationTip(specs, first) {
    const ptr0 = passStringToWasm0(first, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPublicationTip(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A publication, judged (Agreements rule 11): its parties and who has
   * not signed, whether it counts and why not, the latest versions of its
   * line, whether this version ends it, and the ownership agreements
   * claiming what it sells that it stands outside of (rule 14).
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsPublication(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPublication(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The resignations the parties of a collective's agreement published,
   * registered or not (rule 37a; F187, 3): departures `{ act, party,
   * kind, agreement }`. What a client reads beside Agreements' count of the
   * voices that remain, to warn the last voice.
   * @param {any} specs
   * @param {string} collective
   * @returns {any}
   */
  agreementsPublishedResignations(specs, collective) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPublishedResignations(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The contests shown beside a purchase (Agreements rule 54, "Contest
   * (type 14)", F386), by the act that is the purchase (the buyer's
   * payer's claim of the payment, or the buyer's signature act on an
   * offer at no price): the buyer's own contests of it, ascending. A
   * contest by anyone else shows nothing; for an act that is no
   * purchase, none shows. `specs.railValid` names the claims whose rail
   * the client checked. Errs where it is unknown: `law/payment-unstated`
   * where it rests on two or more records whose payment
   * `specs.railPayments` does not state (Money rule 12);
   * `law/rail-unanswered` where it rests on a claim neither
   * `specs.railValid` nor `specs.railInvalid` names (Money rule 8: a
   * record counts toward a purchase only with a valid answer).
   * @param {any} specs
   * @param {string} purchase
   * @returns {string[]}
   */
  agreementsPurchaseContests(specs, purchase) {
    const ptr0 = passStringToWasm0(purchase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPurchaseContests(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
  }
  /**
   * A payment for a work, judged (F126, F127 W2, F128 W4): "purchase",
   * "no-purchase" (a refund owed to the payer, with why), or "unrecorded"
   * (on a request rail, a collective seller's actions chain has not
   * recorded it yet; on a push rail (`specs.pushRails`), a holder has not
   * signed its receipt yet, or receipts of one payment name different
   * claims and the rail has not shown which the payment committed to),
   * or "wrong-receipt" (F131 IT3: a receipt `specs.railInvalid` names,
   * whose claim the payment did not commit to; it counts for nothing);
   * or "unknown" (Money rule 8: the receipt or claim `id`, or a receipt
   * it is judged with, is named neither in `specs.railValid` nor in
   * `specs.railInvalid`, and the answer rests on it); null where the
   * payment is not for a work.
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsPurchase(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPurchase(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A record act of a collective, judged: whether it is a line, the
   * clone it names and whether it puts it in force, and what it registers.
   * @param {any} specs
   * @param {string} collective
   * @param {string} record
   * @returns {any}
   */
  agreementsRecord(specs, collective, record2) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(record2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsRecord(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A public domain release, judged (rule 17, F121 shape D).
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsRelease(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsRelease(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A clone read as a rollback's (Agreements rule 37d, F185): as `agreementsAgreement`,
   * its mark checked against the powers a rollback names.
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsRollbackAgreement(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsRollbackAgreement(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * What a rollback made next would register (rule 37d, RB3; F187 2),
   * checked from what this verifier holds: `{ error, departures }`, each
   * departure `{ act, party, kind }` ("resigned", "stepped-down",
   * "declared"). A client asks it from a fresh reading of the relays
   * before it sends the rollback's rotation.
   * @param {any} specs
   * @param {string} collective
   * @param {string[]} registers
   * @returns {any}
   */
  agreementsRollbackRegisters(specs, collective, registers) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(registers, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsRollbackRegisters(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Who counts for a power (`{ form, area }`) of the agreement in force
   * just before a broken collective's broken act, at a rollback made
   * next (Agreements rules 37d, 44d), `leaving` taken out (the parties whose
   * resignations the rollback registers): as `agreementsNextVoices`; or
   * `{ error }`, why there is no such count.
   * @param {any} specs
   * @param {string} collective
   * @param {any} power
   * @param {string[]} leaving
   * @returns {any}
   */
  agreementsRollbackVoices(specs, collective, power, leaving) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(leaving, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsRollbackVoices(this.__wbg_ptr, specs, ptr0, len0, power, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * What a split service owes (Agreements rule 29): every incoming receipt and
   * payer's claim without its split, and every payout without the
   * receiver's receipt, each naming one receiver and one agreement.
   * @param {any} specs
   * @param {string} service
   * @returns {any}
   */
  agreementsServiceAccount(specs, service) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsServiceAccount(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The declarations of absence naming `party` this verifier holds (RB3,
   * client conformance): `{ act, signer, agreement, clause, outcomes,
   * contests }`, `contests` the party's contests of it (BQ4).
   * The numbers on the splits a service made under a deal (DQ6, F188):
   * `{ numbers: [number, split][], gaps, repeated, unnumbered }`. Client
   * conformance: a holder's client MUST raise the alarm where the
   * numbers it receives skip (`gaps`).
   * @param {any} specs
   * @param {string} service
   * @param {string} agreement
   * @returns {any}
   */
  agreementsSplitNumbers(specs, service, agreement) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsSplitNumbers(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Rule 15a's turns (F165, F171): for `stake` (its index) of
   * `agreement`'s version in force, the leftover units each holder has
   * received so far from `service`'s splits, as `previous` (the
   * service's latest split act for the stake, which its next split
   * cites) carries them in its running count; null `previous`: no split
   * yet, every count zero. In the order of `holders` (hex). Null where
   * `previous` is not held, not one of the service's splits for the
   * stake, or carries no count.
   * @param {any} specs
   * @param {string} service
   * @param {string} owners
   * @param {string[]} holders
   * @param {string | null} [previous]
   * @returns {Float64Array | undefined}
   */
  agreementsSplitTurns(specs, service, owners, holders, previous) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(owners, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(holders, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(previous) ? 0 : passStringToWasm0(previous, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsSplitTurns(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v5;
    if (ret[0] !== 0) {
      v5 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
      wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    }
    return v5;
  }
  /**
   * A split, judged (rules 20, 21, 26; F121 Q9, F124 N10): whether it
   * sums to what arrived, each fee and who received it, the holders it
   * pays and was not delivered to, and every payout that does not match
   * its stake.
   * @param {any} specs
   * @param {string} id
   * @returns {any}
   */
  agreementsSplit(specs, id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsSplit(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Whether a price tag counts under its publication (Money rule 18;
   * Agreements rule 12): "counts" (with the publication, and whether this
   * version withdraws the tag), "nobody's offer" or "unknown", with why.
   * @param {any} specs
   * @param {string} tag
   * @returns {any}
   */
  agreementsTagUnder(specs, tag) {
    const ptr0 = passStringToWasm0(tag, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsTagUnder(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Where a deal stands forked (rule 45b, F186): `{ reference, branches,
   * tangled }`, each branch its versions from the split to its latest,
   * `tangled` the reason where the fork is tangled (F188, DQ1 to DQ4: the
   * deal stays on its reference); null where it is not forked. Throws
   * where the shape is not decided (QH1, refused rather than guessed).
   * The version of an agreement in force, as rule 45b reads a deal's
   * forks (F186, F188, F192): while forked or tangled, the reference.
   * Throws where the shape is not decided (QH1: two settlements, a
   * judge's among them, neither holding the other). What a buyer's
   * client checks an offer against before paying (F188, a strong
   * SHOULD).
   * @param {any} specs
   * @param {string} agreement
   * @returns {string}
   */
  agreementsVersionInForce(specs, agreement) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_agreementsVersionInForce(this.__wbg_ptr, specs, ptr0, len0);
      var ptr2 = ret[0];
      var len2 = ret[1];
      if (ret[3]) {
        ptr2 = 0;
        len2 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
  /**
   * A vow, read (Agreements rule 13; F237, F240, F253): its signer, whether
   * its genesis is void, its versions and latest words, the offers naming
   * it, and each sale with its state, "pending", "confirmed" (with the
   * acknowledging acts) or "contested" (with the contests), and the
   * evidence beside it; and the payments with no buyer signed on.
   * `specs.railValid` names the receipts and claims whose rail the
   * client checked: a payment is a sale only by a record with the rail's
   * answer, valid, and read only from a buyer's own claim with it. A
   * sale or payment resting on a record neither `specs.railValid` nor
   * `specs.railInvalid` names is marked "unknown" (a sale's state, or
   * the `unknown` list; Money rule 8).
   * @param {any} specs
   * @param {string} name
   * @returns {any}
   */
  agreementsVow(specs, name) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsVow(this.__wbg_ptr, specs, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Who uploaded a bake, as a verifier reading Money and Envelopes tells
   * it (Money, "Only identities have payee pointers"): the signer's
   * identity hash, or "unknown" where the bake names another chain, a
   * collective's perhaps, which a Money-only wallet refuses to tip.
   * `null` for no bake held.
   * @param {string} bake
   * @returns {string | undefined}
   */
  bakeUploader(bake) {
    const ptr0 = passStringToWasm0(bake, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_bakeUploader(this.__wbg_ptr, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
      v2 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
  }
  /**
   * The standing of an act for everything binding (keeper records,
   * payments, discharge of debts, agreements, forks, closings): as
   * `status`, except "unknown" where the answer rests on this client's
   * own failed attempts to reach homes ("re-homed without audit") or on
   * what it found at homes (`foundAtHome`), until it no longer does
   * (Identity, the sentence after rule 17, F153, F159).
   * Reading and following an identity use `status`.
   * @param {string} act
   * @returns {string}
   */
  bindingStatus(act) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_bindingStatus(this.__wbg_ptr, ptr0, len0);
      var ptr2 = ret[0];
      var len2 = ret[1];
      if (ret[3]) {
        ptr2 = 0;
        len2 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
  /**
   * Record that this client itself tried and failed to reach an operator's home.
   * @param {string} operator
   */
  failedToReach(operator) {
    const ptr0 = passStringToWasm0(operator, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_failedToReach(this.__wbg_ptr, ptr0, len0);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * Record that this client found the act, in its sealed form, at the
   * home operated by `home` (the operator's identity hash; for a
   * self-hosted home, the identity itself). A private link act counts
   * only if found at a home its signer's chain names at its binding;
   * otherwise it is unknown, never invalid. What was found is this
   * client's own input: `bindingStatus` shows an answer resting on it
   * as unknown (Identity, "The envelope", F152, F159).
   * @param {string} act
   * @param {string} home
   */
  foundAtHome(act, home2) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(home2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_foundAtHome(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
  /**
   * Every act held, by id.
   * @returns {string[]}
   */
  held() {
    const ret = wasm.verifier_held(this.__wbg_ptr);
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
  }
  /**
   * The routes act (Identity type 3) or encryption-key act (Envelopes type
   * 4) that counts for an identity: its valid acts of that spec and type,
   * followed from version 1 (Identity, "Routes"; Envelopes, "Encryption
   * key"). Returns the act, whether the chain is contested past it, and
   * its payload as CBOR.
   * @param {string} identity
   * @param {string} spec
   * @param {number} type_
   * @returns {any}
   */
  latest(identity, spec, type_) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_latest(this.__wbg_ptr, ptr0, len0, ptr1, len1, type_);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A link between two MOR identities as the act `seenBy` sees it
   * (Identity rules 23 and 24, F152): "not linked", "linked", "ended"
   * (`seenBy` holds a termination in its history) or "unknown".
   * @param {string} claim
   * @param {string} seen_by
   * @returns {string}
   */
  link(claim, seen_by) {
    let deferred4_0;
    let deferred4_1;
    try {
      const ptr0 = passStringToWasm0(claim, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      const ptr1 = passStringToWasm0(seen_by, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_link(this.__wbg_ptr, ptr0, len0, ptr1, len1);
      var ptr3 = ret[0];
      var len3 = ret[1];
      if (ret[3]) {
        ptr3 = 0;
        len3 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred4_0 = ptr3;
      deferred4_1 = len3;
      return getStringFromWasm0(ptr3, len3);
    } finally {
      wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
  }
  /**
   * Where a payer pays this payee this amount (the payment cMIP,
   * "Choosing where to pay"; Money rules 1, 3 and 5): the pointer that
   * counts and the vault in force, as this verifier holds the payee's
   * acts, and the first rail, in the payee's order, on a rail Module the
   * person accepts that carries the unit. `{ to: "flow", pointer, rail,
   * module, address }`, `{ to: "vault", declaredBy, entry, module,
   * address }` or `{ to: "nowhere", why }`.
   * @param {string} money_spec
   * @param {string} payee
   * @param {any} amount
   * @param {string[]} accepted
   * @returns {any}
   */
  moneyChoose(money_spec, payee, amount, accepted) {
    const ptr0 = passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(accepted, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_moneyChoose(this.__wbg_ptr, ptr0, len0, ptr1, len1, amount, ptr2, len2);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Judge a receipt or claim this verifier holds, as a Money-only client
   * with the person's accepted cMIPs and Modules (F338): the act's
   * standing; the rail's answer, by the rail Module its field 0 names,
   * adopted only if accepted (a Module, unit or payment cMIP not accepted
   * is unknown: Development rule 9); and what is judged beside it.
   * @param {string} act
   * @param {any} opts
   * @returns {any}
   */
  moneyJudge(act, opts) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_moneyJudge(this.__wbg_ptr, ptr0, len0, opts);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The payee pointer that counts for an identity (Money rule 1), from
   * the valid pointers this verifier holds: `{ act, version, forked }`,
   * `act` null where it holds none; `forked` where two name one
   * predecessor, the pointer that counts the last before the fork.
   * @param {string} money_spec
   * @param {string} payee
   * @returns {any}
   */
  moneyPointer(money_spec, payee) {
    const ptr0 = passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_moneyPointer(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The vault an identity's chain declares in force (Money rule 3), as
   * this verifier holds the chain: `{ declaredBy, entries }`, or null
   * where it declares none.
   * @param {string} money_spec
   * @param {string} identity
   * @returns {any}
   */
  moneyVault(money_spec, identity) {
    const ptr0 = passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_moneyVault(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * A verifier for the given Identity spec hash (`IDENTITY`; a test value
   * until the freeze). Given the Money and Agreements spec hashes too, it can
   * tell which acts may carry acknowledgements (F110); without them, an
   * act of another specification carrying `acks` is unknown to it. Given
   * the Envelopes and Text spec hashes, which every client holds (MICS,
   * "Client conformance"), it decodes their acts strictly (Envelopes
   * draft 10, rule 30; Text draft 8, rule 14; F295, F296) and shows a text
   * or Envelopes act carrying `acks` as invalid without the Money and
   * Agreements hashes (Fable's E5, the clients' half).
   * @param {string} identity_spec
   * @param {string | null} [money_spec]
   * @param {string | null} [agreements_spec]
   * @param {string | null} [envelopes_spec]
   * @param {string | null} [text_spec]
   */
  constructor(identity_spec, money_spec, agreements_spec, envelopes_spec, text_spec) {
    const ptr0 = passStringToWasm0(identity_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(money_spec) ? 0 : passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(agreements_spec) ? 0 : passStringToWasm0(agreements_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(envelopes_spec) ? 0 : passStringToWasm0(envelopes_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    var ptr4 = isLikeNone(text_spec) ? 0 : passStringToWasm0(text_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len4 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_new(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0];
    VerifierFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * Where to look for an act a reference names beside this signer
   * (Envelopes draft 9, rule 20, F272): its outbox routes that count,
   * then the homes in force at its latest position. Hints, each once.
   * @param {string} signer
   * @returns {string[]}
   */
  places(signer) {
    const ptr0 = passStringToWasm0(signer, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_places(this.__wbg_ptr, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v2;
  }
  /**
   * Whose offer a price tag is (Money rule 18), as a verifier reading
   * Money and Envelopes tells it: "counts" (on a bare bake, its
   * uploader's), "nobody's offer", or "unknown" (not held, or under a
   * publication, which Agreements judges). `null` for no price tag held.
   * @param {string} act
   * @returns {string | undefined}
   */
  priceTag(act) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_priceTag(this.__wbg_ptr, ptr0, len0);
    if (ret[3]) {
      throw takeFromExternrefTable0(ret[2]);
    }
    let v2;
    if (ret[0] !== 0) {
      v2 = getStringFromWasm0(ret[0], ret[1]);
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v2;
  }
  /**
   * The home quorum of a counting rotation (Money rule 15, F180): the
   * receipts the home rule in effect before it requires, each passing
   * the receipt checks, per home operator, and how many operators are
   * needed. `kind` is "own" (it counts on its own signatures: anchor the
   * rotation itself), "homes", or "homeless" (the new homes' receipts,
   * under the new home rule, F182); null where it is not a counting
   * rotation. *The owner's client anchors these after a lock
   * change (Money rule 15, F181).*
   * @param {string} identity
   * @param {string} rotation
   * @returns {any}
   */
  quorum(identity, rotation) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(rotation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_quorum(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Which act counts at each position of an identity chain.
   * @param {string} identity
   * @returns {any}
   */
  resolve(identity) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_resolve(this.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * The standing of an act held: "valid", "disputed", "void", "pending",
   * "invalid", "unknown", or "scoped" (signed with a key a higher MIR's
   * act installs, a grant key: Agreements judge it, F128).
   * @param {string} act
   * @returns {string}
   */
  status(act) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.verifier_status(this.__wbg_ptr, ptr0, len0);
      var ptr2 = ret[0];
      var len2 = ret[1];
      if (ret[3]) {
        ptr2 = 0;
        len2 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
  /**
   * An identity's succession (Identity draft 13, section 8, F300):
   * `{ state, rotation, successor, confirmation }`, `state` one of
   * "none", "declared" (shown as declared, never followed), "confirmed"
   * (followed), "unknown" (a confirmation held whose status cannot be
   * told), "elsewhere" (another protocol's, confirmed as its link cMIP
   * says).
   * @param {string} identity
   * @returns {any}
   */
  succession(identity) {
    const ptr0 = passStringToWasm0(identity, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_succession(this.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
};
if (Symbol.dispose) Verifier.prototype[Symbol.dispose] = Verifier.prototype.free;
function actId(bytes) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.actId(ptr0, len0);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm0(ptr2, len2);
  } finally {
    wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}
function anchoringBatch(leaves) {
  const ptr0 = passArrayJsValueToWasm0(leaves, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.anchoringBatch(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function anchoringLeaf(act, blind) {
  let deferred4_0;
  let deferred4_1;
  try {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(blind, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.anchoringLeaf(ptr0, len0, ptr1, len1);
    var ptr3 = ret[0];
    var len3 = ret[1];
    if (ret[3]) {
      ptr3 = 0;
      len3 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred4_0 = ptr3;
    deferred4_1 = len3;
    return getStringFromWasm0(ptr3, len3);
  } finally {
    wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
  }
}
function anchoringReadOffer(publication2, tags) {
  const ptr0 = passArray8ToWasm0(publication2, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.anchoringReadOffer(ptr0, len0, isLikeNone(tags) ? 0 : addToExternrefTable0(tags));
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function anchoringReadPublication(payload) {
  const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.anchoringReadPublication(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function batchAnchor(input) {
  const ret = wasm.batchAnchor(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function batchAnchorCheck(act, proof, chain) {
  const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(proof, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.batchAnchorCheck(ptr0, len0, ptr1, len1, chain);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function cborDecode(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.cborDecode(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function cborEncode(v) {
  const ret = wasm.cborEncode(v);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function chainKeyFromSeeds(scheme, seeds) {
  const ptr0 = passArray8ToWasm0(seeds, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.chainKeyFromSeeds(scheme, ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function checkText(s) {
  const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.checkText(ptr0, len0);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function decodeSpec(content, payment_cmip) {
  const ptr0 = passArray8ToWasm0(content, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(payment_cmip) ? 0 : passStringToWasm0(payment_cmip, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len1 = WASM_VECTOR_LEN;
  const ret = wasm.decodeSpec(ptr0, len0, ptr1, len1);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function describeAct(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.describeAct(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function encryptionKeyPayload(version2, previous, _public) {
  var ptr0 = isLikeNone(previous) ? 0 : passStringToWasm0(previous, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(_public, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.encryptionKeyPayload(version2, ptr0, len0, ptr1, len1);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v3;
}
function formEncode(label, data) {
  let deferred4_0;
  let deferred4_1;
  try {
    const ptr0 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.formEncode(ptr0, len0, ptr1, len1);
    var ptr3 = ret[0];
    var len3 = ret[1];
    if (ret[3]) {
      ptr3 = 0;
      len3 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred4_0 = ptr3;
    deferred4_1 = len3;
    return getStringFromWasm0(ptr3, len3);
  } finally {
    wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
  }
}
function formRead(s, want) {
  const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passStringToWasm0(want, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.formRead(ptr0, len0, ptr1, len1);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function formWithHints(label, data, hints) {
  let deferred5_0;
  let deferred5_1;
  try {
    const ptr0 = passStringToWasm0(label, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(hints, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.formWithHints(ptr0, len0, ptr1, len1, ptr2, len2);
    var ptr4 = ret[0];
    var len4 = ret[1];
    if (ret[3]) {
      ptr4 = 0;
      len4 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred5_0 = ptr4;
    deferred5_1 = len4;
    return getStringFromWasm0(ptr4, len4);
  } finally {
    wasm.__wbindgen_free(deferred5_0, deferred5_1, 1);
  }
}
function keyDeliveryPayload(target, key, media) {
  const ptr0 = passStringToWasm0(target, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.keyDeliveryPayload(ptr0, len0, ptr1, len1, media);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v3;
}
function lockMedia(plaintext) {
  const ptr0 = passArray8ToWasm0(plaintext, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.lockMedia(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function makeChainSignature(input) {
  const ret = wasm.makeChainSignature(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function makeEveryday(input) {
  const ret = wasm.makeEveryday(input);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function makeGenesis(input) {
  const ret = wasm.makeGenesis(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function makeRotation(input) {
  const ret = wasm.makeRotation(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function merkleBranch(txids, index) {
  const ptr0 = passArrayJsValueToWasm0(txids, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.merkleBranch(ptr0, len0, index);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayJsValueFromWasm0(ret[0], ret[1]);
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
  return v2;
}
function moneySpecs() {
  const ret = wasm.moneySpecs();
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function newEncryptionSecret() {
  const ret = wasm.newEncryptionSecret();
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function newSigningSecret() {
  const ret = wasm.newSigningSecret();
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function newTestChainKey(scheme) {
  const ret = wasm.newTestChainKey(scheme);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function openMedia(locked, key, nonce) {
  const ptr0 = passArray8ToWasm0(locked, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ptr2 = passArray8ToWasm0(nonce, wasm.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN;
  const ret = wasm.openMedia(ptr0, len0, ptr1, len1, ptr2, len2);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v4;
}
function openSealed(bytes, me, secret) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(me) ? 0 : passStringToWasm0(me, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len1 = WASM_VECTOR_LEN;
  const ptr2 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN;
  const ret = wasm.openSealed(ptr0, len0, ptr1, len1, ptr2, len2);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function pickupTag(_public) {
  let deferred2_0;
  let deferred2_1;
  try {
    const ptr0 = passArray8ToWasm0(_public, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.pickupTag(ptr0, len0);
    deferred2_0 = ret[0];
    deferred2_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}
function randomBytes(n) {
  const ret = wasm.randomBytes(n);
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function readKeyDelivery(payload) {
  const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.readKeyDelivery(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function readTerms(payload, specs) {
  const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.readTerms(ptr0, len0, specs);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function routesPayload(input) {
  const ret = wasm.routesPayload(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function runningSummary(ids) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passArrayJsValueToWasm0(ids, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.runningSummary(ptr0, len0);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm0(ptr2, len2);
  } finally {
    wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}
function seal(input) {
  const ret = wasm.seal(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function sealedParts(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.sealedParts(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function signingPublic(secret) {
  const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.signingPublic(ptr0, len0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
}
function workHash(plaintext) {
  let deferred2_0;
  let deferred2_1;
  try {
    const ptr0 = passArray8ToWasm0(plaintext, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.workHash(ptr0, len0);
    deferred2_0 = ret[0];
    deferred2_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}
function xwingPublic(secret) {
  const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.xwingPublic(ptr0, len0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
}
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg_Error_30c8987f7c2ed4e2: function(arg0, arg1) {
      const ret = Error(getStringFromWasm0(arg0, arg1));
      return ret;
    },
    __wbg_Number_14af1003b8dd5ead: function(arg0) {
      const ret = Number(arg0);
      return ret;
    },
    __wbg_String_8564e559799eccda: function(arg0, arg1) {
      const ret = String(arg1);
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_bigint_get_as_i64_a2383202b9353e4c: function(arg0, arg1) {
      const v = arg1;
      const ret = typeof v === "bigint" ? v : void 0;
      getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    },
    __wbg___wbindgen_boolean_get_5b446f51afd21013: function(arg0) {
      const v = arg0;
      const ret = typeof v === "boolean" ? v : void 0;
      return isLikeNone(ret) ? 16777215 : ret ? 1 : 0;
    },
    __wbg___wbindgen_debug_string_4687d8d8c2017d52: function(arg0, arg1) {
      const ret = debugString(arg1);
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_in_92f62ee1427d9e49: function(arg0, arg1) {
      const ret = arg0 in arg1;
      return ret;
    },
    __wbg___wbindgen_is_bigint_b123553bed3bb382: function(arg0) {
      const ret = typeof arg0 === "bigint";
      return ret;
    },
    __wbg___wbindgen_is_function_1f9d30630b8b1d3d: function(arg0) {
      const ret = typeof arg0 === "function";
      return ret;
    },
    __wbg___wbindgen_is_null_e343b7d08827ba72: function(arg0) {
      const ret = arg0 === null;
      return ret;
    },
    __wbg___wbindgen_is_object_3c45d4f2dde4e749: function(arg0) {
      const val = arg0;
      const ret = typeof val === "object" && val !== null;
      return ret;
    },
    __wbg___wbindgen_is_string_90b56bc79aad6f6c: function(arg0) {
      const ret = typeof arg0 === "string";
      return ret;
    },
    __wbg___wbindgen_is_undefined_8865fb403f8fe9d8: function(arg0) {
      const ret = arg0 === void 0;
      return ret;
    },
    __wbg___wbindgen_jsval_eq_02babf21faa37971: function(arg0, arg1) {
      const ret = arg0 === arg1;
      return ret;
    },
    __wbg___wbindgen_jsval_loose_eq_677f21e468d6b461: function(arg0, arg1) {
      const ret = arg0 == arg1;
      return ret;
    },
    __wbg___wbindgen_number_get_2e0e7dee9f701a71: function(arg0, arg1) {
      const obj = arg1;
      const ret = typeof obj === "number" ? obj : void 0;
      getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    },
    __wbg___wbindgen_string_get_0380ccaa2f57f0d9: function(arg0, arg1) {
      const obj = arg1;
      const ret = typeof obj === "string" ? obj : void 0;
      var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_throw_41e9ee4f547fc59a: function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbg_call_187d372bd5fdd4aa: function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
      }, arguments);
    },
    __wbg_call_6137034ef55c9d0f: function() {
      return handleError(function(arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
      }, arguments);
    },
    __wbg_crypto_38df2bab126b63dc: function(arg0) {
      const ret = arg0.crypto;
      return ret;
    },
    __wbg_done_b41a1d26cdb37fb6: function(arg0) {
      const ret = arg0.done;
      return ret;
    },
    __wbg_entries_3602f27ad32994b8: function(arg0) {
      const ret = arg0.entries();
      return ret;
    },
    __wbg_entries_fb6397112b1de25f: function(arg0) {
      const ret = Object.entries(arg0);
      return ret;
    },
    __wbg_from_296ca31f8d0f1c52: function(arg0) {
      const ret = Array.from(arg0);
      return ret;
    },
    __wbg_getRandomValues_c44a50d8cfdaebeb: function() {
      return handleError(function(arg0, arg1) {
        arg0.getRandomValues(arg1);
      }, arguments);
    },
    __wbg_get_658f6698067d9515: function() {
      return handleError(function(arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
      }, arguments);
    },
    __wbg_get_6c896e0571ddae51: function(arg0, arg1) {
      const ret = arg0[arg1 >>> 0];
      return ret;
    },
    __wbg_get_unchecked_288889d017702237: function(arg0, arg1) {
      const ret = arg0[arg1 >>> 0];
      return ret;
    },
    __wbg_get_with_ref_key_6412cf3094599694: function(arg0, arg1) {
      const ret = arg0[arg1];
      return ret;
    },
    __wbg_instanceof_ArrayBuffer_a99f175873e5d9b8: function(arg0) {
      let result;
      try {
        result = arg0 instanceof ArrayBuffer;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_instanceof_Map_b2611749102d7ba3: function(arg0) {
      let result;
      try {
        result = arg0 instanceof Map;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_instanceof_Uint8Array_828cef2aaacafc31: function(arg0) {
      let result;
      try {
        result = arg0 instanceof Uint8Array;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_isArray_e15a2ff68ffdbef2: function(arg0) {
      const ret = Array.isArray(arg0);
      return ret;
    },
    __wbg_isSafeInteger_717808ad6a54bd9e: function(arg0) {
      const ret = Number.isSafeInteger(arg0);
      return ret;
    },
    __wbg_iterator_e3c31c892080e444: function() {
      const ret = Symbol.iterator;
      return ret;
    },
    __wbg_length_7f3c00c40364105e: function(arg0) {
      const ret = arg0.length;
      return ret;
    },
    __wbg_length_d4bdea10311bd9cf: function(arg0) {
      const ret = arg0.length;
      return ret;
    },
    __wbg_msCrypto_bd5a034af96bcba6: function(arg0) {
      const ret = arg0.msCrypto;
      return ret;
    },
    __wbg_new_1dbf7428bba60a42: function(arg0) {
      const ret = new Uint8Array(arg0);
      return ret;
    },
    __wbg_new_28744009d011f847: function() {
      const ret = /* @__PURE__ */ new Map();
      return ret;
    },
    __wbg_new_617a8cdb8bb1130e: function() {
      const ret = new Object();
      return ret;
    },
    __wbg_new_ee2291f50781bf1d: function() {
      const ret = new Array();
      return ret;
    },
    __wbg_new_from_slice_9a868026ffa4208a: function(arg0, arg1) {
      const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
      return ret;
    },
    __wbg_new_with_length_3da0ad195f6f63ba: function(arg0) {
      const ret = new Uint8Array(arg0 >>> 0);
      return ret;
    },
    __wbg_next_33784799010f1bbe: function(arg0) {
      const ret = arg0.next;
      return ret;
    },
    __wbg_next_f4aac29c42af995c: function() {
      return handleError(function(arg0) {
        const ret = arg0.next();
        return ret;
      }, arguments);
    },
    __wbg_node_84ea875411254db1: function(arg0) {
      const ret = arg0.node;
      return ret;
    },
    __wbg_process_44c7a14e11e9f69e: function(arg0) {
      const ret = arg0.process;
      return ret;
    },
    __wbg_prototypesetcall_bc27214492979395: function(arg0, arg1, arg2) {
      Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
    },
    __wbg_push_2baf45db356cf468: function(arg0, arg1) {
      const ret = arg0.push(arg1);
      return ret;
    },
    __wbg_randomFillSync_6c25eac9869eb53c: function() {
      return handleError(function(arg0, arg1) {
        arg0.randomFillSync(arg1);
      }, arguments);
    },
    __wbg_require_b4edbdcf3e2a1ef0: function() {
      return handleError(function() {
        const ret = module.require;
        return ret;
      }, arguments);
    },
    __wbg_set_6ae97e73113c4f0b: function(arg0, arg1, arg2) {
      const ret = arg0.set(arg1, arg2);
      return ret;
    },
    __wbg_set_6be42768c690e380: function(arg0, arg1, arg2) {
      arg0[arg1] = arg2;
    },
    __wbg_set_bea140a88be9b277: function(arg0, arg1, arg2) {
      arg0[arg1 >>> 0] = arg2;
    },
    __wbg_static_accessor_GLOBAL_266715b9d96ba635: function() {
      const ret = typeof global === "undefined" ? null : global;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_GLOBAL_THIS_10fb7dc1ae063179: function() {
      const ret = typeof globalThis === "undefined" ? null : globalThis;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_SELF_0b583911f537483a: function() {
      const ret = typeof self === "undefined" ? null : self;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_WINDOW_d7f903d1508cbdc4: function() {
      const ret = typeof window === "undefined" ? null : window;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_subarray_002b94d5e13d1411: function(arg0, arg1, arg2) {
      const ret = arg0.subarray(arg1 >>> 0, arg2 >>> 0);
      return ret;
    },
    __wbg_value_f3c585ee8f5ba40c: function(arg0) {
      const ret = arg0.value;
      return ret;
    },
    __wbg_versions_276b2795b1c6a219: function(arg0) {
      const ret = arg0.versions;
      return ret;
    },
    __wbindgen_generic_0000000000000001: function(arg0) {
      const ret = arg0;
      return ret;
    },
    __wbindgen_generic_0000000000000002: function(arg0) {
      const ret = arg0;
      return ret;
    },
    __wbindgen_generic_0000000000000003: function(arg0, arg1) {
      const ret = getArrayU8FromWasm0(arg0, arg1);
      return ret;
    },
    __wbindgen_generic_0000000000000004: function(arg0, arg1) {
      const ret = getStringFromWasm0(arg0, arg1);
      return ret;
    },
    __wbindgen_generic_0000000000000005: function(arg0) {
      const ret = BigInt.asUintN(64, arg0);
      return ret;
    },
    __wbindgen_init_externref_table: function() {
      const table2 = wasm.__wbindgen_externrefs;
      const offset = table2.grow(4);
      table2.set(0, void 0);
      table2.set(offset + 0, void 0);
      table2.set(offset + 1, null);
      table2.set(offset + 2, true);
      table2.set(offset + 3, false);
    }
  };
  return {
    __proto__: null,
    "./mor_wasm_bg.js": import0
  };
}
var VerifierFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_verifier_free(ptr, 1));
function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}
function debugString(val) {
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    return toString.call(val);
  }
  if (className == "Object") {
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  if (val instanceof Error) {
    return `${val.name}: ${val.message}
${val.stack}`;
  }
  return className;
}
function getArrayF64FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}
function getArrayJsValueFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  const mem = getDataViewMemory0();
  const result = [];
  for (let i = ptr; i < ptr + 4 * len; i += 4) {
    result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
  }
  wasm.__externref_drop_slice(ptr, len);
  return result;
}
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
var cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
var cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
  if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
    cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
  }
  return cachedFloat64ArrayMemory0;
}
function getStringFromWasm0(ptr, len) {
  return decodeText(ptr >>> 0, len);
}
var cachedUint32ArrayMemory0 = null;
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e3) {
    const idx = addToExternrefTable0(e3);
    wasm.__wbindgen_exn_store(idx);
  }
}
function isLikeNone(x) {
  return x === void 0 || x === null;
}
function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function passArrayJsValueToWasm0(array, malloc) {
  const ptr = malloc(array.length * 4, 4) >>> 0;
  for (let i = 0; i < array.length; i++) {
    const add = addToExternrefTable0(array[i]);
    getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
  }
  WASM_VECTOR_LEN = array.length;
  return ptr;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN = 0;
var wasmModule;
var wasmInstance;
var wasm;
function __wbg_finalize_init(instance, module2) {
  wasmInstance = instance;
  wasm = instance.exports;
  wasmModule = module2;
  cachedDataViewMemory0 = null;
  cachedFloat64ArrayMemory0 = null;
  cachedUint32ArrayMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
async function __wbg_load(module2, imports) {
  if (typeof Response === "function" && module2 instanceof Response) {
    if (!module2.ok) {
      throw new Error(`failed to fetch Wasm: ${module2.status} ${module2.statusText} fetching '${module2.url}'`);
    }
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module2, imports);
      } catch (e3) {
        const validResponse = expectedResponseType(module2.type);
        if (validResponse && module2.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e3);
        } else {
          throw e3;
        }
      }
    }
    const bytes = await module2.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module2, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module: module2 };
    } else {
      return instance;
    }
  }
  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (module_or_path !== void 0) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === void 0) {
    module_or_path = new URL("mor_wasm_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module: module2 } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module2);
}

// node_modules/@noble/hashes/_u64.js
var fromNumH = (n) => n / 2 ** 32 | 0;
var fromNumL = (n) => n >>> 0;
function setU64FromNum(view, byteOffset, n, isLE) {
  const h = fromNumH(n);
  const l = fromNumL(n);
  view.setUint32(byteOffset, isLE ? l : h, isLE);
  view.setUint32(byteOffset + 4, isLE ? h : l, isLE);
}

// node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
var atitle = (title) => title ? `"${title}" ` : "";
function anumber(n, title = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
  return n;
}
function abytes(value, length, title = "") {
  if (isBytes(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber(length, "length");
  const bytes = isBytes(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message5 = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message5);
  throw new RangeError(message5);
}
var aobject = (value, label) => {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
};
var aopts = (value, label) => {
  aobject(value, label);
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null)
    throw new TypeError(`"${label}" expected plain object`);
  if (Object.hasOwn(value, "__proto__"))
    throw new TypeError(`"${label}.__proto__" is not allowed`);
};
function aexists(instance, checkFinished = true) {
  if (instance.destroyed)
    throw new Error("hash was destroyed");
  if (checkFinished && instance.finished)
    throw new Error("digest() was already called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function checkOpts(defaults, opts, title = "opts") {
  aopts(defaults, "defaults");
  if (opts !== void 0)
    aopts(opts, title);
  const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
  return merged;
}
function createHasher(hashCons, info = {}) {
  if (typeof hashCons !== "function")
    throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
  info = checkOpts({}, info, "info");
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
var oidNist = (suffix) => ({
  // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
  // Larger suffix values would need base-128 OID encoding and a different length byte.
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class {
  blockLen;
  outputLen;
  canXOF = false;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    let processed = false;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        processed = true;
        continue;
      }
      buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
        processed = true;
      }
    }
    this.length += data.length;
    if (processed)
      this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    buffer.fill(0, pos);
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      buffer.fill(0);
    }
    setU64FromNum(view, blockLen - 8, this.length * 8, isLE);
    this.process(view, 0);
    this.roundClean();
    const oview = out === buffer ? view : createView(out);
    const len = this.outputLen;
    const outLen = len / 4;
    const state = this.get();
    if (len % 4 || outLen > state.length)
      throw new Error("invalid outputLen");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneIntoMeta(to) {
    const { buffer, length, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length;
    to.pos = pos;
    if (pos)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// node_modules/@noble/hashes/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B = class extends HashMD {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  // Numeric initializers matter: starting the fields as `undefined` changes
  // V8's field representation and makes sha256 3x slower (measured).
  A = 0;
  B = 0;
  C = 0;
  D = 0;
  E = 0;
  F = 0;
  G = 0;
  H = 0;
  constructor(outputLen, IV) {
    super(64, outputLen, 8, false);
    this.A = IV[0] | 0;
    this.B = IV[1] | 0;
    this.C = IV[2] | 0;
    this.D = IV[3] | 0;
    this.E = IV[4] | 0;
    this.F = IV[5] | 0;
    this.G = IV[6] | 0;
    this.H = IV[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  _cloneInto(to) {
    (to ||= new this.constructor()).set(...this.get());
    return this._cloneIntoMeta(to);
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.destroyed = true;
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var _SHA256 = class extends SHA2_32B {
  constructor() {
    super(32, SHA256_IV);
  }
};
var sha256 = /* @__PURE__ */ createHasher(
  () => new _SHA256(),
  /* @__PURE__ */ oidNist(1)
);

// ../genesis/src/witness.ts
var WITNESS_EXPLANATION = 'A witness act says "I received this act and rely on it". It keeps the act visible as disputed even if its author later disowns it. It is public: anyone can see that you rely on this act, though not what it says.';

// ../reader/src/web/common.ts
var HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
var hex = (b) => {
  let s = "";
  for (const x of b) s += HEX[x];
  return s;
};
var unhex = (s) => {
  if (s.length % 2 || /[^0-9a-fA-F]/.test(s)) throw new Error("not hex");
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(2 * i, 2 * i + 2), 16);
  return out;
};
var base64 = (b) => {
  let s = "";
  for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode(...b.subarray(i, i + 32768));
  return btoa(s);
};
var sha2562 = (data) => hex(sha256(typeof data === "string" ? new TextEncoder().encode(data) : data));
var SPECS = {
  identity: sha2562("IDENTITY, test value until the freeze"),
  envelopes: sha2562("ENVELOPE, test value until the freeze"),
  text: sha2562("TEXT, test value until the freeze")
};
var MIRS = {
  ...SPECS,
  money: sha2562("FINANCE, test value until the freeze"),
  agreements: sha2562("LAW, test value until the freeze"),
  development: sha2562("PRODUCTION, test value until the freeze")
};
var ACK_SPECS = [MIRS.identity, MIRS.money, MIRS.agreements];
var IDENTITY_TYPES = { genesis: 0, rotation: 1, receipt: 2, routes: 3, witness: 15, chainSignature: 16 };
var ENVELOPES_TYPES = { publication: 0, keyDelivery: 1, encryptionKey: 4 };
var withGrantLimits = (specs, verdicts) => ({ ...specs, grantLimits: verdicts });

// ../reader/src/web/core.ts
await __wbg_init({ module_or_path: new URL("mor_wasm_bg.wasm", document.baseURI) });

// src/web/node-fs.ts
var none = (name) => () => {
  throw new Error(`${name}: there are no files in a browser`);
};
var readFileSync = none("readFileSync");
var writeFileSync = none("writeFileSync");
var renameSync = none("renameSync");

// src/web/node-crypto.ts
function randomBytes2(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}
function createHash(algorithm) {
  if (algorithm !== "sha256") throw new Error(`${algorithm}: only sha256 in the browser`);
  const parts = [];
  const h = {
    update(data) {
      parts.push(typeof data === "string" ? new TextEncoder().encode(data) : data);
      return h;
    },
    /** The digest's bytes, or, as Node gives it with "hex", its hexadecimal text (the repo client's spec hashes). */
    digest(encoding) {
      const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
      let at = 0;
      for (const p of parts) {
        all.set(p, at);
        at += p.length;
      }
      const d = sha256(all);
      if (encoding === void 0) return d;
      if (encoding !== "hex") throw new Error(`${encoding}: only hex in the browser`);
      return [...d].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  };
  return h;
}

// ../genesis/src/transport.ts
var RelayError = class extends Error {
  constructor(code, reason, acts2 = [], status = 0) {
    super(`relay error ${code}: ${reason}`);
    this.code = code;
    this.reason = reason;
    this.acts = acts2;
    this.status = status;
  }
};
var CODE = {
  malformed: 0,
  invalid: 1,
  notServed: 2,
  missingPredecessor: 3,
  conflict: 4,
  refused: 5,
  tooLarge: 6,
  notAccepted: 7,
  notHeld: 8,
  notSupported: 9,
  slowDown: 10
};
var bytesList = (v) => Array.isArray(v) ? v : [];
var sealedId = (bytes) => {
  const t = unhex(sha2562("MOR/transport/sealed"));
  const all = new Uint8Array(64 + bytes.length);
  all.set(t, 0);
  all.set(t, 32);
  all.set(bytes, 64);
  return sha2562(all);
};
var stated = /* @__PURE__ */ new Map();
var Relay = class {
  constructor(base, via = base) {
    this.base = base;
    this.via = via;
  }
  async call(path, init) {
    const r = await fetch(this.via.replace(/\/$/, "") + path, init);
    const body = new Uint8Array(await r.arrayBuffer());
    if (!r.ok) {
      let code = -1;
      let reason = `HTTP ${r.status}`;
      let acts2 = [];
      try {
        const e3 = cborDecode(body);
        code = e3.get(0);
        reason = e3.get(1) ?? reason;
        acts2 = bytesList(e3.get(2));
      } catch {
      }
      throw new RelayError(code, reason, acts2, r.status);
    }
    return body;
  }
  post(path, body, type = "application/cbor") {
    return this.call(path, { method: "POST", body, headers: { "content-type": type } });
  }
  async info() {
    return cborDecode(await this.call("/info"));
  }
  /** The relay's stated limits, read from `GET /info` once; null when it does not say, and then the relay judges what it is sent. */
  limits() {
    let l = stated.get(this.via);
    if (!l) {
      l = this.info().then(
        (m) => {
          const x = m.get(3);
          const act = x?.get(0);
          const media = x?.get(1);
          return typeof act === "number" && typeof media === "number" ? { act, media } : null;
        },
        () => null
      );
      stated.set(this.via, l);
      void l.then((v) => v ?? stated.delete(this.via));
    }
    return l;
  }
  /**
   * cMIP draft 3, "Clients", 6: a client SHOULD NOT send a body larger than
   * the relay's stated limits. Refused here, before anything is sent, with
   * the relay's own code for "too large".
   */
  async fits(size, media) {
    const l = await this.limits();
    if (!l) return;
    const limit = media ? l.media : l.act;
    if (size > limit) throw new RelayError(CODE.tooLarge, `not sent: ${size} bytes is over this relay's stated limit of ${limit}`);
  }
  /** `POST /acts`. The act id in the answer is checked against the act sent. */
  async putAct(act) {
    await this.fits(act.length, false);
    const m = cborDecode(await this.post("/acts", act));
    const id = hex(m.get(0));
    if (id !== actId(act)) throw new RelayError(-1, "the relay answered for another act");
    return {
      id,
      arrival: m.get(1),
      receipt: m.get(2),
      objection: m.get(3)
    };
  }
  /** `POST /sealed`, with pickup tags for a container sent to a bare key. */
  async putSealed(sealed, pickup = []) {
    await this.fits(sealed.length, false);
    const req = /* @__PURE__ */ new Map([[0, sealed]]);
    if (pickup.length) req.set(1, pickup.map(unhex));
    const m = cborDecode(await this.post("/sealed", cborEncode(req)));
    const id = hex(m.get(0));
    if (id !== sealedId(sealed)) throw new RelayError(-1, "the relay answered for another container");
    return { id, arrival: m.get(1) };
  }
  /** `GET /acts/{id}`, checked: `null` when the relay does not hold it (which proves nothing). */
  async getAct(id) {
    try {
      const a = await this.call(`/acts/${id}`);
      return actId(a) === id ? a : null;
    } catch (e3) {
      if (e3 instanceof RelayError && e3.code === CODE.notHeld) return null;
      throw e3;
    }
  }
  /** `POST /media`: the relay's answer is checked against the bytes sent. */
  async putMedia(locked) {
    await this.fits(locked.length, true);
    const m = cborDecode(await this.post("/media", locked, "application/octet-stream"));
    const lockedHash = hex(m[0]);
    if (lockedHash !== sha2562(locked) || m[1] !== locked.length) {
      throw new RelayError(-1, "the relay answered for other media");
    }
    return { lockedHash, size: m[1] };
  }
  /** `GET /media/{locked hash}`, checked: `null` when not held or not matching. */
  async getMedia(lockedHash) {
    try {
      const b = await this.call(`/media/${lockedHash}`);
      return sha2562(b) === lockedHash ? b : null;
    } catch (e3) {
      if (e3 instanceof RelayError && e3.code === CODE.notHeld) return null;
      throw e3;
    }
  }
  async feed(q) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(q)) {
      if (v === void 0) continue;
      p.set(k, k === "unaddressed" ? v ? "1" : "0" : String(v));
    }
    const m = cborDecode(await this.call(`/feed?${p}`));
    const items = m.get(0).map(([arrival, kind, item]) => ({
      arrival,
      kind: kind === 0 ? "act" : "sealed",
      item
    }));
    return { items, next: m.get(1) };
  }
  /** `GET /identity/{id}`: everything the home holds about an identity. */
  async identity(id) {
    const m = cborDecode(await this.call(`/identity/${id}`));
    const got = hex(m.get(0));
    if (got !== id) throw new RelayError(-1, "an identity record for another identity");
    return {
      identity: got,
      chain: bytesList(m.get(1)),
      receipts: bytesList(m.get(2)),
      routes: bytesList(m.get(3)),
      encryptionKeys: bytesList(m.get(4)),
      names: bytesList(m.get(5)),
      links: bytesList(m.get(6)),
      evidence: bytesList(m.get(7)),
      otherReceipts: bytesList(m.get(8))
    };
  }
};
var relayAt = (hint, via = {}) => new Relay(hint, via[hint] ?? hint);

// ../genesis/src/kex.ts
var kexLog = { recording: false, entries: [] };
function record(e3) {
  if (kexLog.recording) kexLog.entries.push(e3);
}

// ../genesis/src/lines.ts
var IDENTITY_WORDS = {
  [IDENTITY_TYPES.routes]: "routes: where its acts are found and where to reach it",
  4: "a name",
  5: "a name withdrawn",
  6: "a link claimed",
  7: "a link confirmed",
  8: "a link ended",
  14: "an escape endorsement",
  [IDENTITY_TYPES.witness]: "a witness act: acts of others it relies on"
};
var ENVELOPES_WORDS = {
  [ENVELOPES_TYPES.publication]: "a publication (a post, a picture, a file)",
  [ENVELOPES_TYPES.keyDelivery]: "a key delivery",
  3: "a withdrawal of a publication",
  [ENVELOPES_TYPES.encryptionKey]: "a new encryption key, to receive sealed messages",
  5: "a vow"
};
var MONEY_WORDS = {
  0: "a payee pointer: where it is paid",
  1: "a debt it owes",
  2: "a receipt of a payment",
  3: "a claim of a payment it made",
  4: "a release of a debt owed to it"
};
var AGREEMENTS_WORDS = {
  0: "an agreement proposed",
  1: "its signature on an agreement",
  3: "a work claimed",
  4: "a stake transferred",
  5: "a release",
  6: "a standing offer",
  8: "a split",
  9: "a grant",
  10: "a grant revoked",
  16: "a resignation",
  17: "a record",
  19: "a fork",
  20: "a closing"
};
function whatIs(d, specs = MIRS) {
  if (d.spec === void 0 || d.type === void 0) return "a private act: only those it was meant for can read what it is";
  const words = d.spec === specs.identity ? IDENTITY_WORDS[d.type] : d.spec === specs.envelopes ? ENVELOPES_WORDS[d.type] : d.spec === specs.text ? d.type === 0 ? "a text, such as a post or a message" : void 0 : d.spec === specs.money ? MONEY_WORDS[d.type] : d.spec === specs.agreements ? AGREEMENTS_WORDS[d.type] : void 0;
  const w = words ?? `an act of type ${d.type} under ${d.spec === specs.identity ? "Identity" : d.spec === specs.envelopes ? "Envelopes" : d.spec === specs.money ? "Money" : d.spec === specs.agreements ? "Agreements" : "another specification"}`;
  return d.public ? w : `${w}, private`;
}
function ownLine(sequence) {
  if (!sequence.length) return { acts: 0, card: null };
  return { acts: sequence.length, card: { act: sequence[sequence.length - 1], position: sequence.length, summary: runningSummary(sequence) } };
}
async function actsBy(signer, hints, via = {}) {
  const out = /* @__PURE__ */ new Map();
  for (const hint of hints) {
    try {
      let after;
      for (; ; ) {
        const page = await relayAt(hint, via).feed({ signer, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          try {
            const d = describeAct(it.item);
            if (!out.has(d.id)) out.set(d.id, it.item);
          } catch {
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  return [...out.values()];
}
function linesOf(o) {
  const specs = o.specs ?? MIRS;
  const owns = (o.own.length && Array.isArray(o.own[0]) ? o.own : [o.own]).filter((l) => l.length);
  const held = /* @__PURE__ */ new Map();
  for (const a of o.acts) {
    let d;
    try {
      d = describeAct(a);
    } catch {
      continue;
    }
    if (d.signer !== o.identity) continue;
    if (d.spec === specs.identity && (d.type === IDENTITY_TYPES.genesis || d.type === IDENTITY_TYPES.rotation || d.type === IDENTITY_TYPES.chainSignature)) continue;
    held.set(d.id, d);
  }
  const ownPrev = new Map(owns.flatMap((line) => line.map((id, i) => [id, i ? line[i - 1] : null])));
  const ownPosition = new Map(owns.flatMap((line) => line.map((id, i) => [id, i + 1])));
  const prevOf = (id) => {
    if (ownPrev.has(id)) return { known: true, prev: ownPrev.get(id) };
    const d = held.get(id);
    if (!d || d.spec === void 0) return { known: false, prev: null };
    return { known: true, prev: d.prev ?? null };
  };
  const named2 = /* @__PURE__ */ new Set();
  for (const id of [...held.keys(), ...ownPrev.keys()]) {
    const p = prevOf(id);
    if (p.prev) named2.add(p.prev);
  }
  const ownTips = new Set(owns.map((line) => line[line.length - 1]));
  const tips = [...held.values()].filter((d) => !named2.has(d.id) && d.binding === o.binding).map((d) => d.id);
  for (const t of ownTips) if (!tips.includes(t) && !named2.has(t)) tips.push(t);
  const out = [];
  for (const tip of tips) {
    const d = held.get(tip);
    const latest = d ? whatIs(d, specs) : "an act made on this device";
    const ids = [];
    let at = tip;
    let why;
    while (at) {
      if (ids.includes(at)) {
        why = "its acts name each other in a circle";
        break;
      }
      ids.push(at);
      const p = prevOf(at);
      if (!p.known) {
        why = held.has(at) ? `it holds a private act made elsewhere (${at.slice(0, 12)}\u2026): only the app that made it can read which act comes before it` : `an act in it (${at.slice(0, 12)}\u2026) was not found at its homes or relays`;
        break;
      }
      at = p.prev;
    }
    ids.reverse();
    const position = d?.position ?? ownPosition.get(tip);
    if (!why && position !== void 0 && position !== ids.length) why = `its latest act says position ${position}, but ${ids.length} acts were found behind it`;
    out.push({
      tip,
      own: ownTips.has(tip),
      readable: !why,
      card: why ? null : { act: tip, position: ids.length, summary: runningSummary(ids) },
      latest,
      walked: [...ids].reverse(),
      ...why ? { why } : {}
    });
  }
  return out.sort((a, b) => Number(b.own) - Number(a.own) || (a.tip < b.tip ? -1 : 1));
}
function unplaced(o) {
  const specs = o.specs ?? MIRS;
  const placed = new Set(linesOf({ ...o, own: [] }).filter((l) => l.readable).flatMap((l) => l.walked));
  const out = /* @__PURE__ */ new Set();
  for (const a of o.acts) {
    let d;
    try {
      d = describeAct(a);
    } catch {
      continue;
    }
    if (d.signer !== o.identity || d.binding !== o.binding || placed.has(d.id)) continue;
    if (d.spec === specs.identity && (d.type === IDENTITY_TYPES.genesis || d.type === IDENTITY_TYPES.rotation || d.type === IDENTITY_TYPES.chainSignature)) continue;
    out.add(d.id);
  }
  return [...out];
}
var APP_LINES = {
  Dub: "sealed messages, the follow list, answers to proposals, a member key for a collective, keys delivered to buyers, lane requests for Damgar",
  Edubba: "drafts, an agent\u2019s notes and diary, sealed messages and prompts, a member key for a collective, invitations to a founding, payments prepared for Damgar",
  Damgar: "the accepted list, payment claims, receipts, requests and answers, sales, a vault transfer, asks for a collective\u2019s promise",
  Ummia: "the accepted list, payments prepared for an anchor, asks for a collective\u2019s release, MIP discussions"
};
function lineOf(app2, kind) {
  const k = kind === "earlier" ? "line from before (public and private acts together)" : kind ? `${kind} line` : "line";
  return app2 ? `${app2}\u2019s ${k}` : `a ${k}`;
}
var capital = (t) => t[0].toUpperCase() + t.slice(1);
function livesOn(app2, kind) {
  if (kind === "public") return `${app2 ? `${app2}\u2019s` : "its app\u2019s"} public acts: posts, names, routes, signatures on a collective\u2019s agreement, releases`;
  return (app2 && APP_LINES[app2]) ?? "whatever its app signed there: possibly a member key for a collective, notes, a list";
}
function cardText(c, app2) {
  return `${c.act} ${c.position} ${c.summary}${c.hidden === void 0 ? "" : ` ${c.hidden}`} ${app2}${c.line ? ` ${c.line}` : ""}${c.missing ? ` missing ${c.missing}` : ""}`;
}
function lineWords(l) {
  const whose = l.own ? "This device\u2019s line" : "A line made elsewhere";
  if (l.readable && l.card) return `${whose}: ${l.card.position} act${l.card.position === 1 ? "" : "s"}, the latest ${l.card.act} (${l.latest}); summary ${l.card.summary}.`;
  return `${whose} that this device cannot read, ending at ${l.tip} (${l.latest}): ${l.why}. Give its card (its latest act, position and summary, as the app that made it shows them) to keep it.`;
}
function voidWarning(left) {
  return `${left.length === 1 ? "One line of acts is" : `${left.length} lines of acts are`} left out of this rotation: ${left.map((l) => l.tip).join(", ")}. Every act of ${left.length === 1 ? "that line" : "those lines"}, signed with the key this rotation replaces, becomes void, unless someone relied on it in a way the protocol can see (Identity rules 34 and 35). Leave ${left.length === 1 ? "it" : "them"} out only if you did not make ${left.length === 1 ? "it" : "them"}, or no longer want ${left.length === 1 ? "it" : "them"} to count.`;
}
function planLines(lines2, o = {}) {
  const leaveOut = new Set(o.leaveOut ?? []);
  const cards = o.cards ?? [];
  for (const t of leaveOut) if (!lines2.some((l) => l.tip === t)) throw new Error(`no line found ends at ${t}: nothing to leave out`);
  for (const c of cards) {
    if (!Number.isSafeInteger(c.position) || c.position < 1 || !/^[0-9a-f]{64}$/.test(c.act) || !/^[0-9a-f]{64}$/.test(c.summary)) {
      throw new Error("a card is a latest act and a summary (64 hexadecimal characters each) and a position from 1");
    }
    const l = lines2.find((x) => x.tip === c.act);
    if (l?.card && (l.card.position !== c.position || l.card.summary !== c.summary)) {
      throw new Error(`the card for ${c.act} does not match its line as read here (position ${l.card.position}, summary ${l.card.summary})`);
    }
    if (leaveOut.has(c.act)) throw new Error(`${c.act} is both given a card and left out`);
  }
  const held = o.held ? new Set(o.held) : null;
  const found = (act) => held ? held.has(act) : lines2.some((l) => l.tip === act);
  const kept = [];
  const left = [];
  const shown = [];
  const unplacedSay = [];
  for (const c of cards) {
    const whose = lineOf(c.app, c.line);
    if (!found(c.act)) {
      unplacedSay.push(
        `${whose[0].toUpperCase()}${whose.slice(1)} is not placed: its latest act (${c.act}) is not at the identity's homes, so no reader can follow it. What lives on it (${livesOn(c.app, c.line)}) may stop counting after this change, as if the line were left out: a member key for a collective would be lost with it. ${c.app ? `Open ${c.app} first: it sends its acts to the homes; then give its card again.` : "Open the app that shows this card first: it sends its acts to the homes; then give its card again."}`
      );
    } else if (c.missing) {
      unplacedSay.push(
        `${whose[0].toUpperCase()}${whose.slice(1)} is not placed: ${c.missing === 1 ? "one of its acts is" : `${c.missing} of its acts are`} not at the identity's homes (${c.app ?? "its app"} says so), so no reader can follow it past ${c.missing === 1 ? "it" : "them"}. What lives on it (${livesOn(c.app, c.line)}) may stop counting after this change, as if the line were left out: a member key for a collective would be lost with it.`
      );
    }
  }
  const counts = o.unplaced && cards.length && cards.every((c) => c.hidden !== void 0) ? cards.reduce((n, c) => n + c.hidden, 0) : null;
  const covered = counts !== null && counts === o.unplaced.length && !unplacedSay.length;
  const unread = [];
  for (const l of lines2) {
    const card2 = cards.find((c) => c.act === l.tip) ?? l.card;
    const given = cards.find((c) => c.act === l.tip);
    if (leaveOut.has(l.tip)) {
      left.push(l);
      shown.push({ text: `${lineWords(l)} Left out by name: its acts become void.`, tone: "bad" });
    } else if (card2) {
      kept.push({ act: card2.act, position: card2.position, summary: card2.summary });
      shown.push({
        text: l.readable && !given?.app ? `${lineWords(l)} Kept.` : `${given?.app ? `${capital(lineOf(given.app, given.line))}. ` : ""}${lineWords(l)} Kept by the card given: position ${card2.position}, summary ${card2.summary}.`,
        tone: l.readable || given && !given.missing ? "ok" : "warn"
      });
    } else if (covered) {
      unread.push(l);
    } else {
      left.push(l);
      shown.push({ text: `${lineWords(l)} No card was given, so it is left out: its acts become void.`, tone: "bad" });
    }
  }
  if (unread.length) {
    shown.push({
      text: `${unread.length === 1 ? "One more act Ki\u0161ib cannot read lies" : `${unread.length} more acts Ki\u0161ib cannot read (private, or behind a private act) lie`} on the lines kept by the cards given: those apps count ${counts} such act${counts === 1 ? "" : "s"}, and the homes hold ${counts}. Kept with them: ${unread.map((l) => l.tip).join(", ")}.`,
      tone: "ok"
    });
  }
  if (counts !== null && !covered && !unplacedSay.length && counts < o.unplaced.length) {
    const n = o.unplaced.length - counts;
    shown.push({ text: `${n === 1 ? "One act" : `${n} acts`} at the homes, signed with this key, lie${n === 1 ? "s" : ""} on no line whose card was given (the cards count ${counts}, the homes hold ${o.unplaced.length}): an app whose card is missing, or someone else holding the signing key. Left out unless you give that app\u2019s card.`, tone: "bad" });
  }
  for (const c of cards) {
    if (lines2.some((l) => l.tip === c.act)) continue;
    kept.push({ act: c.act, position: c.position, summary: c.summary });
    shown.push({ text: `${capital(lineOf(c.app, c.line))}, ending at ${c.act}, not found at the identity's homes or relays: kept by the card given (position ${c.position}, summary ${c.summary}), but no reader can follow it.`, tone: found(c.act) ? "warn" : "bad" });
  }
  for (const t of unplacedSay) shown.push({ text: t, tone: "bad" });
  const warning = [left.length ? voidWarning(left) : "", ...unplacedSay].filter(Boolean).join(" ") || null;
  return { kept, left, shown, warning };
}
function checkWarned(plan, warned) {
  if (plan.warning && warned !== plan.warning) {
    throw new Error(`Nothing was signed. ${plan.warning} Show this to the owner and pass it back to go on as it says, or give a card for each line to keep, its acts at the homes.`);
  }
}

// ../genesis/src/lookup.ts
var inBrowser = () => typeof globalThis.window !== "undefined" && typeof globalThis.process === "undefined";
function cannotReach(hint, via = {}) {
  if (via[hint]) return null;
  let host;
  try {
    host = new URL(hint).hostname;
  } catch {
    return "not an address";
  }
  if (host.endsWith(".onion")) {
    return inBrowser() ? "an onion address, which a web browser cannot reach: it is reached only through Tor" : "an onion address, reached only through Tor, and this client has no way in to it";
  }
  return null;
}
async function firstOf(items, ask4, failed) {
  if (!items.length) return null;
  return new Promise((resolve) => {
    let left = items.length;
    let done = false;
    for (const x of items) {
      ask4(x).then(
        (r) => {
          left--;
          if (r !== null && r !== void 0 && !done) {
            done = true;
            resolve(r);
          } else if (!left && !done) resolve(null);
        },
        () => {
          failed?.(x);
          left--;
          if (!left && !done) resolve(null);
        }
      );
    }
  });
}
async function lookUp(identity, hints, via = {}, into) {
  const v = into ?? new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const asked = /* @__PURE__ */ new Set();
  const unreachable = [];
  const notTried = [];
  const operatorActs = /* @__PURE__ */ new Map();
  const heldBytes = /* @__PURE__ */ new Map();
  const keep = (acts2) => {
    for (const a of acts2) {
      try {
        heldBytes.set(actId(a), a);
        v.add(a);
      } catch {
      }
    }
  };
  const tryable = (hint) => {
    const why = cannotReach(hint, via);
    if (!why) return true;
    if (!notTried.some((n) => n.hint === hint)) notTried.push({ hint, why });
    return false;
  };
  const failed = (hint) => {
    if (!unreachable.includes(hint)) unreachable.push(hint);
  };
  const genesis = await firstOf(hints.filter(tryable), (h) => relayAt(h, via).getAct(identity), failed);
  if (!genesis) throw new Error(`the genesis of ${identity} was not found at ${hints.join(", ")}`);
  keep([genesis]);
  const genesisHomes = () => {
    try {
      const d = describeAct(genesis);
      if (d.spec !== SPECS.identity || d.type !== IDENTITY_TYPES.genesis || !d.payload) return [];
      const p = cborDecode(d.payload);
      return (p.get(2) ?? []).map(([op, hint]) => ({ operator: op ? hex(op) : null, hint }));
    } catch {
      return [];
    }
  };
  const inForce = () => {
    const r2 = v.resolve(identity);
    return r2.homesAt?.length ? r2.homesAt[r2.homesAt.length - 1] : genesisHomes();
  };
  const record2 = async (h) => {
    const rec = await relayAt(h.hint, via).identity(identity);
    keep([...rec.chain, ...rec.receipts, ...rec.routes, ...rec.encryptionKeys, ...rec.evidence, ...rec.otherReceipts]);
    for (const a of rec.links) {
      try {
        const d = describeAct(a);
        if (!d.public && d.signer === identity) v.foundAtHome(d.id, h.operator ?? identity);
      } catch {
      }
    }
  };
  const answered = () => [...asked].filter((h) => !unreachable.includes(h) && !notTried.some((n) => n.hint === h));
  const operatorChain = async (op, own) => {
    const from = async (hint) => {
      const r2 = relayAt(hint, via);
      const [g, page] = await Promise.all([r2.getAct(op), r2.feed({ signer: op })]);
      if (!g) return null;
      const chain = page.items.filter((i) => i.kind === "act").map((i) => i.item).filter((a) => {
        try {
          const d = describeAct(a);
          return d.spec === SPECS.identity && d.type === IDENTITY_TYPES.rotation;
        } catch {
          return false;
        }
      });
      return [g, ...chain];
    };
    const ownAnswered = own.filter((h) => answered().includes(h));
    const got = await firstOf(ownAnswered, from) ?? await firstOf(answered().filter((h) => !own.includes(h)), from);
    if (!got) return;
    keep(got);
    operatorActs.set(op, got);
  };
  const homelessHomes = () => {
    const r2 = v.resolve(identity);
    const last = r2.links[r2.links.length - 1];
    if (!last) return [];
    const out = [];
    for (const a of heldBytes.values()) {
      try {
        const d = describeAct(a);
        if (d.signer !== identity || d.spec !== SPECS.identity || d.type !== IDENTITY_TYPES.rotation || !d.payload) continue;
        const p = cborDecode(d.payload);
        if (p.get(11) !== true || Number(p.get(1)) !== last.position + 1 || hex(p.get(0)) !== last.act) continue;
        for (const [op, hint] of p.get(6) ?? []) out.push({ operator: op ? hex(op) : null, hint });
      } catch {
      }
    }
    return out;
  };
  for (let round = 0; round < 8; round++) {
    const homes = inForce();
    let fresh = homes.filter((h) => !asked.has(h.hint));
    if (!fresh.length) {
      const named2 = homelessHomes();
      fresh = named2.filter((h) => !asked.has(h.hint));
      if (!fresh.length) break;
      for (const h of fresh) asked.add(h.hint);
      await Promise.all(fresh.filter((h) => tryable(h.hint)).map((h) => record2(h).catch(() => failed(h.hint))));
      const ops2 = [...new Set(named2.map((h) => h.operator).filter((o) => !!o && o !== identity && !operatorActs.has(o)))];
      await Promise.all(ops2.map((op) => operatorChain(op, named2.filter((h) => h.operator === op).map((h) => h.hint))));
      continue;
    }
    for (const h of fresh) asked.add(h.hint);
    await Promise.all(fresh.filter((h) => tryable(h.hint)).map((h) => record2(h).catch(() => failed(h.hint))));
    const ops = [...new Set(homes.map((h) => h.operator).filter((o) => !!o && o !== identity && !operatorActs.has(o)))];
    await Promise.all(ops.map((op) => operatorChain(op, homes.filter((h) => h.operator === op).map((h) => h.hint))));
  }
  const resolution = v.resolve(identity);
  const r = v.latest(identity, SPECS.identity, IDENTITY_TYPES.routes);
  const routes = [];
  if (r.payload) {
    const p = cborDecode(r.payload);
    for (const x of p.get(2)) {
      routes.push({
        scope: x[0] ? hex(x[0]) : null,
        hints: x[1],
        kind: x[2] ?? 0
      });
    }
  }
  const e3 = v.latest(identity, SPECS.envelopes, ENVELOPES_TYPES.encryptionKey);
  let encryptionKey = null;
  if (e3.payload) {
    const p = cborDecode(e3.payload);
    const [scheme, key] = p.get(2);
    if (scheme === 4) encryptionKey = key;
  }
  const receipts = [];
  for (const [id, a] of heldBytes) {
    const d = describeAct(a);
    if (d.spec !== SPECS.identity || d.type !== IDENTITY_TYPES.receipt || !d.payload) continue;
    const p = cborDecode(d.payload);
    if (hex(p.get(0)) === identity && v.status(id) === "valid") receipts.push(a);
  }
  return {
    resolution,
    verifier: v,
    receipts,
    operatorChains: [...operatorActs.values()].flat(),
    unreachable,
    notTried,
    routes: { act: r.act ?? null, contested: r.contested, routes },
    encryptionKeyAct: e3.act ?? null,
    encryptionKey,
    inbox(spec) {
      const inboxes = routes.filter((x) => x.kind === 1);
      const hit = inboxes.find((x) => x.scope === spec) ?? inboxes.find((x) => x.scope === null);
      return hit ? hit.hints : null;
    }
  };
}
function referenceTo(act) {
  const d = describeAct(act);
  return d.public ? [d.id, d.signer ?? d.id] : d.id;
}
async function referTo(id, hints, via = {}) {
  const act = await firstOf(hints.filter((h) => !cannotReach(h, via)), (h) => relayAt(h, via).getAct(id));
  if (!act) throw new Error(`the act ${id} was not found at ${hints.join(", ")}: a reference is written only to an act this client holds`);
  const d = describeAct(act);
  const signer = d.signer ?? d.id;
  const out = { ref: referenceTo(act), act, public: d.public, signer, chain: [] };
  if (!d.public) return out;
  try {
    return { ...out, chain: await chainOf(signer, hints, via) };
  } catch (e3) {
    return { ...out, chainProblem: `the identity chain of ${signer} was not found: ${e3 instanceof Error ? e3.message : e3}` };
  }
}
async function chainOf(identity, hints, via = {}) {
  const l = await lookUp(identity, hints, via);
  const r = l.resolution;
  const homes = [...new Set([...r.homesAt?.length ? r.homesAt[r.homesAt.length - 1] : r.homes, ...r.homes].map((h) => h.hint))].filter((h) => !cannotReach(h, via));
  const chain = await firstOf(homes, async (h) => {
    const rec = await relayAt(h, via).identity(identity);
    return rec.chain.length && actId(rec.chain[0]) === identity ? rec.chain : null;
  });
  if (!chain) throw new Error(`no home of ${identity} served its identity chain (${homes.join(", ") || "none reachable"})`);
  return chain;
}
async function holdSequence(v, signer, l, places, via = {}) {
  if (l.resolution.links.length < 2) return;
  const homes = (l.resolution.homes ?? []).map((h) => h.hint);
  const hints = [.../* @__PURE__ */ new Set([...homes, ...places])].filter((h) => !cannotReach(h, via));
  for (const a of await actsBy(signer, hints, via)) {
    try {
      v.add(a);
    } catch {
    }
  }
}

// ../genesis/src/identity.ts
var TEST_LABEL = "MOR TEST IDENTITY. The safety key is held in software: a prototype, never for a real identity.";
var CLOCK_KIND = 1;
var NO_CLOCK_WARNING = "This identity declares no clock. If its signing key is ever stolen, what the thief does with it until you change your keys, and every payment made to what the thief published, will be your loss, whatever you anchor: payers are compared with your key change only on a clock you named in advance (Money rule 15).";
var sameRef = (a, b) => a.cmip === b.cmip && a.params === b.params;
function clockDeclaration(c) {
  if (!c) return { spec: MIRS.money, kind: CLOCK_KIND };
  const ref = (r) => [unhex(r.cmip), cborDecode(unhex(r.params))];
  return { spec: MIRS.money, kind: CLOCK_KIND, cbor: cborEncode([ref(c.main), ...c.backup ? [ref(c.backup)] : []]) };
}
function lineFor(f, isPublic) {
  if (f.cites) return f.sequence;
  if (!f.split) {
    if (f.sequence.length) f.earlier = f.sequence;
    f.sequence = [];
    f.private = [];
    f.split = true;
  }
  return isPublic ? f.sequence : f.private ??= [];
}
function ownLines(f) {
  return [f.sequence, f.private ?? [], f.earlier ?? []].filter((l) => l.length);
}
function ownIds(f) {
  return ownLines(f).flat();
}
function freshLines(f) {
  f.sequence = [];
  f.private = [];
  delete f.earlier;
  f.split = true;
}
var HELD_ELSEWHERE_SAY = "This identity\u2019s signing key is not held by this app: it is signed for by Ki\u0161ib\u2019s runner, and this act cannot be signed that way here. Nothing was signed.";
var AGREEMENTS_DECISIONS = [9, 10, 17];
var NO_ACTOR_SAY = "A collective has no signing key (Agreements rule 56): a member acts for it with their own key, naming it. No member was given to act here, and nothing was signed.";
var b64 = (b) => base64(b);
var unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
var TestIdentity = class _TestIdentity {
  constructor(f, via = {}) {
    this.f = f;
    this.via = via;
  }
  /** Where this file holds no signing key: who signs for it (the Dubsar runner cMIP). Never saved with the file. */
  signer;
  /**
   * For a collective (no signing key, Agreements rule 56): the member who
   * makes its next acts, each with their own key, naming the collective in
   * `objects` (rule 58). Never saved with the file.
   */
  actor;
  get id() {
    return this.f.identity;
  }
  // ------------------------------------------------------------ files
  static load(path, via = {}) {
    const f = JSON.parse(readFileSync(path, "utf8"));
    if (f.label !== TEST_LABEL) throw new Error(`${path} is not a MOR test identity file`);
    return new _TestIdentity(f, via);
  }
  /** Written whole to a temporary file, then renamed, readable by its owner only. */
  save(path) {
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.f, null, 2) + "\n", { mode: 384 });
    renameSync(tmp, path);
  }
  // ------------------------------------------------------------ genesis
  /**
   * A new test identity: an signing key, a chain key held in
   * software and committed by hash, and a genesis naming its homes. Nothing
   * is sent yet: save the file first, then `publishGenesis`.
   */
  static create(opts) {
    if (!opts.homes.length) throw new Error("a genesis declares at least one home");
    const signingSecret = newSigningSecret();
    const chainKey = opts.chainKey ?? newTestChainKey(opts.scheme ?? 2);
    const genesis = makeGenesis({
      identitySpec: SPECS.identity,
      signingSecret,
      chainKeyScheme: chainKey.scheme,
      chainKeyCommit: chainKey.commit,
      homes: opts.homes,
      rule: opts.rule,
      declarations: opts.clock ? [clockDeclaration(opts.clock)] : void 0
    });
    const id = actId(genesis);
    return new _TestIdentity(
      {
        label: TEST_LABEL,
        identity: id,
        position: 0,
        binding: id,
        signingSecret: hex(signingSecret),
        safety: { scheme: chainKey.scheme, seeds: hex(chainKey.seeds) },
        chain: [b64(genesis)],
        homes: opts.homes,
        rule: opts.rule ?? null,
        clock: opts.clock ?? null,
        sequence: [],
        routes: null,
        encryption: [],
        pending: null
      },
      opts.via ?? {}
    );
  }
  chainActs() {
    return this.f.chain.map(unb64);
  }
  relay(hint) {
    return relayAt(hint, this.via);
  }
  /**
   * Send an identity-chain act to each home. A home that lacks the earlier
   * chain acts (error 3: a home newly named) gets them first, oldest first.
   */
  async submitChainAct(act, homes) {
    const out = [];
    for (const h of homes) {
      const r = this.relay(h.hint);
      try {
        out.push({ home: h.hint, result: await r.putAct(act) });
      } catch (e3) {
        if (e3 instanceof RelayError && e3.code === CODE.missingPredecessor) {
          try {
            for (const earlier of this.chainActs()) {
              if (actId(earlier) !== actId(act)) await r.putAct(earlier);
            }
            out.push({ home: h.hint, result: await r.putAct(act) });
            continue;
          } catch (e22) {
            out.push(failure(h.hint, e22));
            continue;
          }
        }
        out.push(failure(h.hint, e3));
      }
    }
    return out;
  }
  /** Send the genesis to every home it names; each signs a receipt. */
  async publishGenesis() {
    return this.submitChainAct(this.chainActs()[0], this.f.homes);
  }
  // ------------------------------------------------------------ everyday acts
  /** The objects an everyday act carries: a collective's action cites the decision it acts under, after the entries its type defines (F127). */
  everydayObjects(spec, type, objects, acks) {
    if (acks?.length && !ACK_SPECS.includes(spec)) {
      throw new Error("only Identity, Money and Agreements acts may acknowledge (Envelopes rule 4a, F110): to rely on this act, sign a witness act");
    }
    if (this.f.cites && spec !== SPECS.identity && !objects?.some((o) => o[0] === this.f.identity)) {
      const cited = spec === MIRS.text ? this.f.cites.slice(0, 1) : this.f.cites;
      objects = [...objects ?? [], ...cited.map((d) => [this.f.identity, d])];
    }
    return objects;
  }
  /** After an act is made: on its line, waiting for the homes if private, a record cited next. */
  everydayMade(spec, type, isPublic, line, made) {
    line.push(made.id);
    if (!isPublic && !this.f.cites) (this.f.unsent ??= {})[made.id] = { act: b64(made.act), key: b64(made.key) };
    if (this.f.cites) this.f.cites = spec === MIRS.agreements && AGREEMENTS_DECISIONS.includes(type) ? [made.id] : [this.f.cites[0], made.id];
    return made;
  }
  /** Whether this file is a collective's, keyless: its acts are made by a member (`actor`). */
  get keyless() {
    return !!this.f.cites && !this.f.signingSecret;
  }
  /** An act for this keyless collective, made by its `actor` with their own key, naming the collective (rule 58). */
  async byActor(spec, type, payload, opts) {
    if (!this.actor) throw new Error(NO_ACTOR_SAY);
    const objects = this.everydayObjects(spec, type, opts.objects, opts.acks);
    const made = await this.actor.everydayNow(spec, type, payload, { ...opts, objects });
    return this.everydayMade(spec, type, true, this.f.sequence, made);
  }
  everyday(spec, type, payload, opts) {
    if (this.keyless && this.actor) {
      const made2 = this.actor.everyday(spec, type, payload, { ...opts, objects: this.everydayObjects(spec, type, opts.objects, opts.acks) });
      return this.everydayMade(spec, type, true, this.f.sequence, made2);
    }
    if (!this.f.signingSecret) throw new Error(this.f.cites ? NO_ACTOR_SAY : HELD_ELSEWHERE_SAY);
    const objects = this.everydayObjects(spec, type, opts.objects, opts.acks);
    const line = lineFor(this.f, opts.public);
    const made = makeEveryday({
      signingSecret: unhex(this.f.signingSecret),
      signer: this.f.identity,
      binding: this.f.binding,
      spec,
      type,
      payload,
      sequence: line,
      public: opts.public,
      to: opts.to,
      objects,
      refs: opts.refs,
      acks: opts.acks,
      // The signer's own hint (field 9, display only): no app writes one yet (whether they should is not decided).
      ...opts.hint !== void 0 ? { hint: opts.hint } : {}
    });
    return this.everydayMade(spec, type, opts.public, line, made);
  }
  /**
   * An everyday act signed here, or, where this file holds no signing key,
   * by its `signer` (Kišib's runner, which may wait for the person's click).
   * The line is the same either way. One act at a time: the caller keeps
   * signing serial, as every app does.
   */
  async everydayNow(spec, type, payload, opts) {
    if (this.keyless) return this.byActor(spec, type, payload, opts);
    if (this.f.signingSecret || !this.signer) return this.everyday(spec, type, payload, opts);
    const objects = this.everydayObjects(spec, type, opts.objects, opts.acks);
    const line = lineFor(this.f, opts.public);
    const made = await this.signer({
      identity: this.f.identity,
      binding: this.f.binding,
      line: this.f.cites ? "public" : opts.public ? "public" : "private",
      sequence: [...line],
      spec,
      type,
      payload,
      public: opts.public,
      ...opts.to ? { to: opts.to } : {},
      ...objects ? { objects } : {},
      ...opts.refs ? { refs: opts.refs } : {},
      ...opts.acks ? { acks: opts.acks } : {}
    });
    return this.everydayMade(spec, type, opts.public, line, made);
  }
  /** Send an everyday identity act to every home: its standing depends on it (Envelopes, "How acts reach people"). */
  async toHomes(act) {
    const out = [];
    for (const h of this.f.homes) {
      try {
        out.push({ home: h.hint, result: await this.relay(h.hint).putAct(act) });
      } catch (e3) {
        out.push(failure(h.hint, e3));
      }
    }
    return out;
  }
  /**
   * Publish a new version of the routes (Identity type 3): where this
   * identity's content is found (outbox) and where others deliver to it
   * (inbox). Save the file after, since the sequence moved.
   */
  async publishRoutes(routes) {
    const version2 = (this.f.routes?.version ?? 0) + 1;
    const payload = routesPayload({ version: version2, previous: this.f.routes?.act, routes });
    const made = await this.everydayNow(SPECS.identity, IDENTITY_TYPES.routes, payload, { public: true });
    this.f.routes = { version: version2, act: made.id };
    return { id: made.id, sent: await this.toHomes(made.act) };
  }
  /**
   * Sign a witness act (Identity type 15, F110): "I received this act and
   * rely on it", for each act named. It keeps them visible as disputed if
   * their author later disowns them. Client conformance (Identity rule 18c):
   * never a side effect; the caller passes back the explanation it showed
   * the owner, `WITNESS_EXPLANATION`, word for word, or nothing is signed.
   * Sent to every home and to the relays given, as a public Identity act.
   */
  async witness(acts2, opts) {
    if (opts.shown !== WITNESS_EXPLANATION) {
      throw new Error("a witness act is signed only after the owner was shown what it does (Identity rule 18c)");
    }
    if (!acts2.length) throw new Error("a witness act names at least one act");
    if (acts2.some((a) => ownIds(this.f).includes(a))) throw new Error("a witness act names other identities' acts, not this one's");
    const made = await this.everydayNow(SPECS.identity, IDENTITY_TYPES.witness, cborEncode(/* @__PURE__ */ new Map()), { public: true, acks: acts2 });
    const sent = await this.toHomes(made.act);
    for (const hint of opts.relays ?? []) await relayAt(hint, this.via).putAct(made.act);
    return { id: made.id, act: made.act, sent };
  }
  /**
   * Publish a new encryption key (Envelopes type 4): a fresh X-Wing key
   * pair, or the one `secret` gives (the identity carry Module, draft 2,
   * derives it from the signing seed); the public half in the act, the
   * private half kept in the file.
   */
  async publishEncryptionKey(given) {
    const last = this.f.encryption.at(-1);
    const version2 = (last?.version ?? 0) + 1;
    const secret = given ?? newEncryptionSecret();
    const payload = encryptionKeyPayload(version2, last?.act, xwingPublic(secret));
    const made = await this.everydayNow(SPECS.envelopes, ENVELOPES_TYPES.encryptionKey, payload, { public: true });
    this.f.encryption.push({ version: version2, act: made.id, secret: hex(secret) });
    return { id: made.id, sent: await this.toHomes(made.act) };
  }
  // ------------------------------------------------------------ rotation
  /**
   * Every line of this identity's everyday acts that a rotation would judge
   * (Identity rule 35, was 17; `lines.ts`): read from its homes, the
   * relays its routes name, and `hints`, each followed back by `prev` to
   * its first act; this device's own line among them.
   */
  async lines(o = {}) {
    const homes = this.f.homes.map((h) => h.hint);
    let routed = [];
    try {
      routed = (await lookUp(this.f.identity, homes, this.via)).routes.routes.flatMap((r) => r.hints);
    } catch {
    }
    const at = [.../* @__PURE__ */ new Set([...homes, ...routed, ...o.hints ?? []])];
    return linesOf({ identity: this.f.identity, binding: this.f.binding, own: ownLines(this.f), acts: await actsBy(this.f.identity, at, this.via), specs: o.specs });
  }
  /**
   * What a rotation would keep (Identity rule 35, client conformance): the
   * lines read now, every one kept unless named in `leaveOut` (by its
   * latest act); a line this device cannot read kept by its card in
   * `cards`, or, given none, left out. Show `plan.shown` to the owner, and
   * `plan.warning` where it is not null, before signing.
   */
  async planRotation(o = {}) {
    const lines2 = await this.lines(o);
    return { lines: lines2, plan: planLines(lines2, o) };
  }
  /**
   * Prepare a rotation: a new signing key, a new committed chain key, and
   * every line of this identity's acts kept (`planRotation`): its own, the
   * other apps' and devices', read from its homes and relays, and those it
   * cannot read by the cards given. A line left out, by name or for want of
   * a card, is left out only where `warned` is, word for word, the warning
   * shown (`plan.warning`): otherwise nothing is signed. Optionally new
   * homes or rule (`rule: []` returns to the default). Signed with the
   * chain key the current chain act committed. The rotation is stored as
   * pending; save the file before submitting, so that a retry sends the
   * same bytes.
   */
  async prepareRotation(opts = {}) {
    if (this.f.pending) throw new Error("a rotation is already pending: submit it again, never sign a second one (Identity rule 8a)");
    const { plan } = await this.planRotation(opts);
    checkWarned(plan, opts.warned);
    if (this.f.pending) throw new Error("a rotation is already pending: submit it again, never sign a second one (Identity rule 8a)");
    const newSigning = newSigningSecret();
    const next = newTestChainKey(opts.scheme ?? this.f.safety.scheme);
    const kept = plan.kept;
    const chain = this.chainActs();
    const previous = actId(chain[chain.length - 1]);
    const rotation = makeRotation({
      identitySpec: SPECS.identity,
      identity: this.f.identity,
      previous,
      position: chain.length,
      chainKeyScheme: this.f.safety.scheme,
      chainKeySeeds: unhex(this.f.safety.seeds),
      newSigningPublic: signingPublic(newSigning),
      nextChainKeyScheme: next.scheme,
      nextChainKeyCommit: next.commit,
      kept,
      homes: opts.homes,
      rule: opts.rule,
      declarations: opts.clock !== void 0 ? [clockDeclaration(opts.clock)] : void 0
    });
    const id = actId(rotation);
    this.f.pending = {
      rotation: b64(rotation),
      id,
      signingSecret: hex(newSigning),
      safety: { scheme: next.scheme, seeds: hex(next.seeds) },
      homes: opts.homes ?? this.f.homes,
      rule: opts.rule === void 0 ? this.f.rule : opts.rule.length ? opts.rule : null,
      clock: opts.clock
    };
    return id;
  }
  /**
   * What to say plainly before a genesis or a rotation, where it leaves the
   * identity with no clock (Money rule 14b, F181): `NO_CLOCK_WARNING`, or
   * null. `clock` is what the act would declare (undefined: unchanged).
   */
  clockWarning(clock) {
    const after = clock === void 0 ? this.f.clock : clock;
    return after ? null : NO_CLOCK_WARNING;
  }
  /**
   * Submit the pending rotation, the exact same bytes, to the homes whose
   * receipts count (the current set) and to any new homes it names.
   */
  async submitRotation() {
    const p = this.f.pending;
    if (!p) throw new Error("no rotation pending");
    const homes = [...this.f.homes];
    for (const h of p.homes) if (!homes.some((x) => x.hint === h.hint)) homes.push(h);
    return this.submitChainAct(unb64(p.rotation), homes);
  }
  /**
   * Look the identity up as any reader would, and if the pending rotation
   * now counts, take on its keys. Returns whether it counts.
   */
  async settleRotation(anchoring = []) {
    const p = this.f.pending;
    if (!p) throw new Error("no rotation pending");
    const lookup = await lookUp(this.f.identity, [...this.f.homes, ...p.homes].map((h) => h.hint), this.via);
    const links = lookup.resolution.links;
    const counts = links.some((l) => l.act === p.id);
    const before = this.f.clock ?? null;
    let anchored = [];
    let unanchored;
    if (counts) {
      this.f.chain.push(p.rotation);
      this.f.position = this.f.chain.length - 1;
      this.f.binding = p.id;
      this.f.signingSecret = p.signingSecret;
      this.f.safety = p.safety;
      this.f.homes = p.homes;
      this.f.rule = p.rule;
      if (p.clock !== void 0) this.f.clock = p.clock;
      this.f.pending = null;
      if (this.f.cites) this.f.cites = [p.id];
      await this.spread(lookup);
      try {
        anchored = await this.anchorQuorum(lookup, p.id, before, anchoring);
        this.f.anchored = [...this.f.anchored ?? [], ...anchored.map((a) => ({ act: a.act, on: a.on, proof: b64(a.proof) }))];
      } catch (e3) {
        unanchored = e3.message;
      }
    }
    return { counts, lookup, anchored, unanchored };
  }
  /**
   * Anchor a counting rotation's home quorum on `clock` (Money rule 15,
   * F180, F181): every receipt the core library names as supporting it
   * under the home rule before it (for a homeless rotation, the new homes'
   * receipts under the new rule, F182; for a self-hosted identity, the
   * rotation itself), on the main reference, or, where no anchoring for it is given
   * or it fails, on the backup. Nothing where no clock was declared: there
   * is nothing to compare on, and the owner bears (said by `clockWarning`).
   */
  async anchorQuorum(lookup, rotation, clock, anchoring) {
    if (!clock) return [];
    const q = lookup.verifier.quorum(this.f.identity, rotation);
    if (!q) return [];
    const acts2 = q.supports.flat();
    const tryOn = async (ref, on) => {
      const a = ref && anchoring.find((x) => sameRef(x.reference, ref));
      if (!a) return null;
      try {
        const out = [];
        for (const act of acts2) out.push({ act, on, proof: await a.anchor(act) });
        return out;
      } catch {
        return null;
      }
    };
    const done = await tryOn(clock.main, "main") ?? await tryOn(clock.backup, "backup");
    if (!done) throw new Error("the rotation counts, but its home quorum could not be anchored on the declared clock: anchor it before relying on it (Money rule 15)");
    return done;
  }
  /**
   * A chain signature (Identity type 16, F132): `signs` signed with the
   * chain key the latest identity-chain act committed, on the identity
   * chain, committing a new one; the signing key, homes and rules stay.
   * Agreements take a member's signature on a fork or closing only in this form.
   * The chain key is spent once signed, so the act is kept in the chain
   * file at once and sent to every home, as a rotation is (the same bytes
   * whenever resent, rule 8a); it counts once the homes hold it. Sent to
   * `relays` too, beside the act it signs.
   */
  async chainSign(signs, relays = [], shared) {
    if (this.f.pending) throw new Error("a rotation is pending: submit and settle it first; one chain key signs one identity-chain act (Identity rule 8a)");
    const fresh = shared ? null : newTestChainKey(this.f.safety.scheme);
    const next = shared ? shared.next : fresh;
    const chain = this.chainActs();
    const act = makeChainSignature({
      identitySpec: SPECS.identity,
      identity: this.f.identity,
      previous: actId(chain[chain.length - 1]),
      position: chain.length,
      chainKeyScheme: shared ? shared.scheme : this.f.safety.scheme,
      chainKeySeeds: shared ? shared.seeds : unhex(this.f.safety.seeds),
      nextChainKeyScheme: next.scheme,
      nextChainKeyCommit: next.commit,
      signs
    });
    const id = actId(act);
    this.f.chain.push(b64(act));
    this.f.safety = { scheme: next.scheme, seeds: fresh ? hex(fresh.seeds) : "" };
    const sent = await this.submitChainAct(act, this.f.homes);
    for (const hint of relays) await relayAt(hint, this.via).putAct(act);
    const lookup = await lookUp(this.f.identity, this.f.homes.map((h) => h.hint), this.via);
    const counts = lookup.resolution.links.some((l) => l.act === id);
    if (counts) await this.spread(lookup);
    return { id, counts, sent };
  }
  /**
   * Bring every home up to date, as the owner's client should: the chain
   * acts a home missed while it was away (the exact same bytes), and the
   * receipts the other homes signed (cMIP, identity record part 8), so a
   * reader who reaches a single home can still count the majority.
   */
  async spread(lookup) {
    const l = lookup ?? await lookUp(this.f.identity, this.f.homes.map((h) => h.hint), this.via);
    const extra = [...l.operatorChains, ...l.receipts];
    for (const h of this.f.homes) {
      const r = this.relay(h.hint);
      try {
        for (const a of this.chainActs()) await r.putAct(a);
        for (const rc of extra) {
          try {
            await r.putAct(rc);
          } catch {
          }
        }
      } catch (e3) {
        if (!(e3 instanceof TypeError) && !(e3 instanceof RelayError)) throw e3;
      }
    }
  }
  /**
   * Make a grant key (Agreements, F128): a fresh signing key, its secret kept in
   * this identity's file under the grant once known; its public part, as
   * Identity's `[scheme, key]`, goes into the grant (field 9).
   */
  makeGrantKey() {
    const secret = newSigningSecret();
    return { secret, public: [1, signingPublic(secret)] };
  }
  /** Keep a grant key's secret, under the grant that names it (F128). */
  keepGrantKey(grant, collective, secret) {
    this.f.grantKeys = [...(this.f.grantKeys ?? []).filter((k) => k.grant !== grant), { grant, collective, secret: hex(secret) }];
  }
  /** The public half of the chain key held for the next rotation. */
  nextChainKey() {
    const s = chainKeyFromSeeds(this.f.safety.scheme, unhex(this.f.safety.seeds));
    return { scheme: s.scheme, commit: s.commit };
  }
  // ------------------------------------------------------------ keys
  /**
   * Deliver a content key to another identity (Envelopes, "Key delivery"):
   * look up its current encryption key and inbox, make a private key
   * delivery addressed to it, seal it with X-Wing, and put it in its inbox.
   */
  async deliverKey(opts) {
    const them = await lookUp(opts.to, opts.hints, this.via);
    const pk = them.encryptionKey;
    if (!pk) throw new Error("that identity has published no encryption key that counts");
    const inbox = them.inbox(SPECS.envelopes);
    if (!inbox) throw new Error("that identity declares no inbox");
    const payload = keyDeliveryPayload(opts.target, opts.key, opts.media ?? false);
    const made = await this.everydayNow(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, payload, {
      public: false,
      to: [opts.to]
    });
    const sealed = sealFor(made.act, made.key, [{ id: opts.to, key: pk }]);
    const id = sealedId(sealed);
    for (const hint of inbox) await relayAt(hint, this.via).putSealed(sealed);
    return { delivery: made.id, sealed: id, inbox };
  }
  /** A fresh bare key for one expected delivery (cMIP: a fresh bare key per delivery). */
  static newBareKey() {
    const secret = newEncryptionSecret();
    const pub = xwingPublic(secret);
    return { secret, public: pub, pickup: pickupTag(pub) };
  }
  /** Deliver a content key to a bare key someone supplied, found by its pickup tag. */
  async deliverKeyToBare(opts) {
    const payload = keyDeliveryPayload(opts.target, opts.key, opts.media ?? false);
    const made = await this.everydayNow(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, payload, { public: false });
    const sealed = sealFor(made.act, made.key, [{ key: opts.bareKey }]);
    for (const hint of opts.relays) await relayAt(hint, this.via).putSealed(sealed, [pickupTag(opts.bareKey)]);
    return { delivery: made.id, sealed: sealedId(sealed) };
  }
  /**
   * Sign an everyday act, next in this identity's sequence, without sending
   * it: for a signer that hands the act to someone else to submit. Save the
   * file before handing the act out, so the next act follows it.
   */
  sign(spec, type, payload, opts) {
    return this.everyday(spec, type, payload, opts);
  }
  /** As `sign`, by the runner where this file holds no signing key (the Dubsar runner cMIP). */
  signNow(spec, type, payload, opts) {
    return this.everydayNow(spec, type, payload, opts);
  }
  /**
   * Sign a private act on a line of its own (one act, first in its line),
   * outside this identity's sequence, never left at its homes: for an act
   * whose content no other app of this identity may read, a share of a
   * collective's chain key (F337). *Cost:* its line is never kept by a
   * change of keys, so the act is void after the next one; it is read once,
   * soon after it is made.
   */
  signApart(spec, type, payload, opts = {}) {
    if (!this.f.signingSecret) throw new Error(HELD_ELSEWHERE_SAY);
    return makeEveryday({
      signingSecret: unhex(this.f.signingSecret),
      signer: this.f.identity,
      binding: this.f.binding,
      spec,
      type,
      payload,
      sequence: [],
      public: false,
      to: opts.to,
      refs: opts.refs
    });
  }
  /** As `signApart`, by the runner where this file holds no signing key: the act on its line of its own (`apart`). */
  async signApartNow(spec, type, payload, opts = {}) {
    if (this.f.signingSecret || !this.signer) return this.signApart(spec, type, payload, opts);
    return this.signer({ identity: this.f.identity, binding: this.f.binding, line: "apart", sequence: [], spec, type, payload, public: false, ...opts.to ? { to: opts.to } : {}, ...opts.refs ? { refs: opts.refs } : {} });
  }
  /**
   * Publish an act on this identity's own relays, for example a private
   * post whose key it will deliver. Returns the act id and its content key.
   */
  async publish(spec, type, payload, opts) {
    const made = await this.everydayNow(spec, type, payload, {
      public: opts.public,
      to: opts.to,
      objects: opts.objects,
      refs: opts.refs,
      acks: opts.acks,
      hint: opts.hint
    });
    for (const hint of opts.relays) await relayAt(hint, this.via).putAct(made.act);
    return made;
  }
  /**
   * Acts its homes hold signed by this identity that this file did not make
   * (F152): each a warning for the owner. A home takes an act of an
   * identity it serves only signed with the key its binding set, and serves
   * the identity's private acts too, sealed, as opaque acts by their signer;
   * so a private link that a thief confirmed with a stolen signing key
   * counts only once it is published there, where this shows it. The owner
   * cannot read it, only see that it exists: if they did not make it
   * elsewhere, the signing key may be stolen, and a rotation ends its use.
   * Homes that do not answer are skipped: silence proves nothing.
   */
  async unrecognised() {
    const known = /* @__PURE__ */ new Set([...ownIds(this.f), ...this.chainActs().map((a) => actId(a))]);
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    for (const h of this.f.homes) {
      try {
        let after;
        for (; ; ) {
          const page = await this.relay(h.hint).feed({ signer: this.f.identity, after });
          for (const it of page.items) {
            if (it.kind !== "act") continue;
            const d = describeAct(it.item);
            if (d.signer !== this.f.identity || known.has(d.id) || seen.has(d.id)) continue;
            seen.add(d.id);
            out.push({ id: d.id, home: h.hint, private: !d.public });
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
      }
    }
    return out;
  }
  /**
   * Read this identity's inbox: every sealed container addressed to it, opened
   * with its encryption keys (newest first), the sender looked up and its act
   * judged by the core library.
   */
  async readInbox(opts) {
    const out = [];
    const secrets = [...this.f.encryption].reverse().map((e3) => unhex(e3.secret));
    for (const hint of opts.inbox) {
      const page = await relayAt(hint, this.via).feed({ to: this.f.identity });
      for (const it of page.items) {
        if (it.kind !== "sealed") continue;
        out.push(await receive(it.item, this.f.identity, secrets, opts.senderHints, this.via));
      }
    }
    return out;
  }
};
async function receive(sealed, me, secrets, senderHints, via = {}) {
  const id = sealedId(sealed);
  let parts;
  try {
    parts = sealedParts(sealed);
  } catch (e3) {
    return { sealed: id, opened: false, error: String(e3) };
  }
  const index = me === null ? 0 : parts.to.indexOf(me);
  if (index < 0) return { sealed: id, opened: false, error: "not addressed to this identity" };
  let lastError = "no key";
  for (const secret of secrets) {
    record({ kind: "decapsulate", secret, ct: parts.capsules[index] });
    let o;
    try {
      o = openSealed(sealed, me ?? void 0, secret);
    } catch (e3) {
      lastError = String(e3);
      continue;
    }
    const d = o.described;
    const r = { sealed: id, opened: true, from: d.signer, act: d.id, type: d.type, spec: d.spec };
    if (d.spec === SPECS.envelopes && d.type === ENVELOPES_TYPES.keyDelivery && d.payload) {
      r.delivery = readKeyDelivery(d.payload);
    }
    if (d.spec === SPECS.text && d.type === 0 && d.payload) {
      const t = cborDecode(d.payload).get(0);
      if (typeof t === "string") r.text = t;
    }
    if (d.signer) {
      try {
        const them = await lookUp(d.signer, senderHints, via);
        if (o.key) them.verifier.addWithKey(o.act, o.key);
        else them.verifier.add(o.act);
        r.status = them.verifier.status(d.id);
      } catch (e3) {
        r.status = `sender not found: ${e3}`;
      }
    }
    return r;
  }
  return { sealed: id, opened: false, error: lastError };
}
function sealFor(act, key, recipients) {
  const eseeds = recipients.map(() => new Uint8Array(randomBytes2(64)));
  const sealed = seal({
    act,
    key,
    recipients,
    random: {
      containerKey: new Uint8Array(randomBytes2(32)),
      nonce: new Uint8Array(randomBytes2(24)),
      eseeds
    }
  });
  const parts = sealedParts(sealed);
  recipients.forEach((r, i) => record({ kind: "encapsulate", publicKey: r.key, eseed: eseeds[i], ct: parts.capsules[i] }));
  return sealed;
}
function failure(home2, e3) {
  if (e3 instanceof RelayError) return { home: home2, error: e3.reason, code: e3.code };
  return { home: home2, error: String(e3) };
}

// ../genesis/src/private.ts
var unb642 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
function ownKey(me) {
  const e3 = me.f.encryption[me.f.encryption.length - 1];
  if (!e3) return null;
  return e3.secret ? xwingPublic(unhex(e3.secret)) : e3.public ? unhex(e3.public) : null;
}
async function leaveAtHomes(me, made, o = {}) {
  const via = o.via ?? me.via;
  const key = o.sealed || o.lockedOnly ? null : ownKey(me);
  const to = describeAct(made.act).to ?? [];
  let copy2 = null;
  if (key && to.length === 1 && to[0] === me.f.identity) copy2 = { sealed: sealFor(made.act, made.key, [{ id: me.f.identity, key }]), tags: [] };
  else if (key && !to.length) copy2 = { sealed: sealFor(made.act, made.key, [{ key }]), tags: [pickupTag(key)] };
  else if (key) {
    const kd = await me.signApartNow(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, keyDeliveryPayload(made.id, made.key, false), { to: [me.f.identity] });
    copy2 = { sealed: sealFor(kd.act, kd.key, [{ id: me.f.identity, key }]), tags: [] };
  }
  const took = [];
  for (const h of me.f.homes) {
    try {
      await relayAt(h.hint, via).putAct(made.act);
      if (copy2) await relayAt(h.hint, via).putSealed(copy2.sealed, copy2.tags);
      took.push(h.hint);
    } catch {
    }
  }
  if (took.length && (o.sealed || o.lockedOnly || copy2) && me.f.unsent?.[made.id]) delete me.f.unsent[made.id];
  return took;
}
async function sendWaiting(me, via = me.via) {
  for (const [id, x] of Object.entries(me.f.unsent ?? {})) {
    await leaveAtHomes(me, { id, act: unb642(x.act), key: unb642(x.key) }, { via });
  }
  return Object.keys(me.f.unsent ?? {}).length;
}
function linesHeld(f) {
  if (!f.split) return f.sequence.length ? [{ ids: f.sequence }] : [];
  return [["public", f.sequence], ["private", f.private ?? []], ["earlier", f.earlier ?? []]].filter(([, ids]) => ids.length).map(([kind, ids]) => ({ kind, ids }));
}
async function lineAtHomes(me, app2, via = me.via) {
  const lines2 = linesHeld(me.f).map((l) => ({ ...l, card: ownLine(l.ids).card }));
  const acts2 = lines2.reduce((n, l) => n + l.ids.length, 0);
  const shown = (l) => ({ acts: acts2, latest: l?.card.act ?? null, summary: l?.card.summary ?? null });
  const first = lines2.find((l) => l.kind === "private") ?? lines2[0];
  if (!lines2.length) return { ...shown(), atHomes: null, missing: 0, hidden: 0, card: null };
  const homes = me.f.homes.map((h) => h.hint);
  let places = homes;
  try {
    const look2 = await lookUp(me.f.identity, homes, via);
    places = [.../* @__PURE__ */ new Set([...homes, ...look2.resolution.homes.map((h) => h.hint), ...look2.routes.routes.flatMap((x) => x.hints)])];
  } catch {
  }
  const found = await actsBy(me.f.identity, places, via);
  if (!found.length) return { ...shown(first), atHomes: null, missing: 0, hidden: null, card: null };
  const held = new Set(found.map((a) => describeAct(a).id));
  const u2 = new Set(unplaced({ identity: me.f.identity, binding: me.f.binding, acts: found }));
  const cards = lines2.map((l) => {
    const missing = l.ids.filter((id) => !held.has(id)).length;
    const card2 = { ...l.card, hidden: l.ids.filter((id) => u2.has(id)).length, ...l.kind ? { line: l.kind } : {}, ...missing ? { missing } : {} };
    return { l, card: card2, missing, atHomes: held.has(l.card.act) };
  });
  const away = cards.find((c) => !c.atHomes);
  return {
    ...shown(away?.l ?? first),
    atHomes: !away,
    missing: cards.reduce((n, c) => n + c.missing, 0),
    hidden: cards.reduce((n, c) => n + c.card.hidden, 0),
    card: away ? null : cards.map((c) => cardText(c.card, app2)).join("; ")
  };
}
function lineReader(app2) {
  const seen = /* @__PURE__ */ new Map();
  return async (me, via = me.via) => {
    const latest = linesHeld(me.f).map((l) => l.ids[l.ids.length - 1]).join(" ") || null;
    const was = seen.get(me.f.identity);
    const waiting = Object.keys(me.f.unsent ?? {}).length > 0;
    if (was && was.latest === latest && !waiting && was.line.atHomes && Date.now() - was.at < 6e4) return was.line;
    const line = await lineAtHomes(me, app2, via);
    seen.set(me.f.identity, { latest, at: Date.now(), line });
    return line;
  };
}
function noLine(f) {
  const lines2 = linesHeld(f);
  const l = (lines2.find((x) => x.kind === "private") ?? lines2[0])?.ids ?? [];
  const own = ownLine(l);
  return { acts: lines2.reduce((n, x) => n + x.ids.length, 0), latest: own.card?.act ?? null, summary: own.card?.summary ?? null, atHomes: null, missing: 0, hidden: null, card: null };
}

// ../repo/src/specs.ts
var test = (s) => createHash("sha256").update(s).digest("hex");
var REPO_SPECS = {
  /** The Agreements MIR (`AGREEMENTS`). */
  agreements: test("LAW, test value until the freeze"),
  /** The release manifest cMIP (cmips/cmip-release-manifest-draft-1.md). */
  manifest: test("release manifest cMIP, draft 1, test value until publication"),
  /** The payment cMIP: a Module under it must carry fields 11 and 13 (Development draft 10, F301). The core's test value. */
  payment: test("payment cMIP, draft 2, test value until publication")
};
var AGREEMENTS_TYPES = {
  terms: 0,
  signature: 1,
  claim: 3,
  release: 5,
  /** The publication (rules 11 to 17): the offer, with its partners, split service and plan; its price a price tag (Money type 5). */
  publication: 6,
  split: 8,
  grant: 9,
  revocation: 10,
  /** Liveness (type 12, rule 50): here, an act of the collective acknowledging what it relies on (F303). */
  liveness: 12,
  declaration: 13,
  /** A contest of a declaration of absence (rule 52; BQ4, F188). */
  contest: 14,
  /** A party's request that a deal's arbitrator settle its fork (DQ8, F188). */
  settlementRequest: 22,
  /** The arbitrator's settlement of a deal's fork (DQ8, F188). */
  forkSettlement: 23,
  /** A notice to a payer owed money back who gave no address (rule 37d; F197). */
  notice: 24,
  resignation: 16,
  record: 17,
  fork: 19,
  closing: 20
  // 21, the creditor's release under F125, is retired: a Money act now (F126).
};
var TEST_RAIL = test("a test rail Module, no real rail");
var TEST_TIME = test("a test time reference, no real clock");
var FOUNDING_AGREEMENT = 0;

// ../repo/src/proposals.ts
var NEGOTIATION = 18;
var negotiationPayload = (text3, format) => cborEncode(new Map([[0, text3.normalize("NFC")], ...format ? [[1, unhex(format)]] : []]));
async function negotiate(by, to, o) {
  const made = await by.signNow(REPO_SPECS.agreements, NEGOTIATION, negotiationPayload(o.text, o.format), {
    public: false,
    to: [to.id],
    objects: o.thread ? [[o.thread, o.previous ?? o.thread]] : void 0,
    acks: o.acks?.length ? o.acks : void 0,
    refs: o.refs
  });
  const sealed = sealFor(made.act, made.key, [{ id: to.id, key: to.key }]);
  const left = [];
  const failed = [];
  for (const hint of to.inbox) {
    try {
      const r = relayAt(hint, by.via);
      for (const c of by.chainActs()) await r.putAct(c).catch(() => void 0);
      await r.putSealed(sealed);
      left.push(hint);
    } catch (e3) {
      failed.push({ relay: hint, reason: e3 instanceof Error ? e3.message : String(e3) });
    }
  }
  if (o.home !== false) await leaveAtHomes(by, made);
  return { id: made.id, act: made.act, key: made.key, sealed: sealedId(sealed), left, failed };
}

// ../repo/src/agreements.ts
var AGREEMENTS_SPECS = { ...MIRS, agreements: REPO_SPECS.agreements, extLayers: { [REPO_SPECS.manifest]: [] } };
var SPLIT_CMIP = sha2562("split cMIP, draft 4, test value until publication");

// ../../modules/timestamp/src/stamp.ts
var TIMESTAMP_SPEC = sha2562("timestamp clock Module, draft 1, test value until publication");
var STAMP_TYPE = 1;
var MOST_PER_STAMP = 256;
var NotAStamp = class extends Error {
};
function decodeStamp(payload) {
  let m;
  try {
    m = cborDecode(payload);
  } catch (e3) {
    throw new NotAStamp(`not CBOR (${e3 instanceof Error ? e3.message : e3})`);
  }
  if (!(m instanceof Map)) throw new NotAStamp("not a map");
  for (const k of m.keys()) if (k !== 0 && k !== 1) throw new NotAStamp(`${String(k)} is not one of its fields`);
  const time = m.get(0);
  if (typeof time !== "number" || !Number.isSafeInteger(time) || time < 0) throw new NotAStamp("its time (field 0) is not a whole number of seconds");
  const list3 = m.get(1);
  if (!Array.isArray(list3) || !list3.length) throw new NotAStamp("its acts (field 1) are not a list of at least one");
  if (list3.length > MOST_PER_STAMP) throw new NotAStamp(`it names more than ${MOST_PER_STAMP} acts`);
  const acts2 = list3.map((x, i) => {
    if (!(x instanceof Uint8Array) || x.length !== 32) throw new NotAStamp(`its act ${i + 1} is not an act id`);
    return hex(x);
  });
  if (new Set(acts2).size !== acts2.length) throw new NotAStamp("it names an act twice");
  return { time, acts: acts2 };
}

// ../../modules/timestamp/src/read.ts
function asStamp(d, clock) {
  if (!d.public || d.signer !== clock || d.spec !== TIMESTAMP_SPEC || d.type !== STAMP_TYPE || !d.payload) return null;
  try {
    const s = decodeStamp(d.payload);
    return { stamp: d.id, time: s.time, acts: s.acts };
  } catch (e3) {
    if (e3 instanceof NotAStamp) return null;
    throw e3;
  }
}
function earliest(stamps2) {
  const out = /* @__PURE__ */ new Map();
  for (const s of stamps2) for (const a of s.acts) if (!out.has(a) || s.time < out.get(a)) out.set(a, s.time);
  return out;
}
async function readStamps(clock, places, judge2, via = {}) {
  const seen = /* @__PURE__ */ new Map();
  for (const h of places) {
    let after;
    for (; ; ) {
      let page;
      try {
        page = await relayAt(h, via).feed({ signer: clock, after });
      } catch {
        break;
      }
      for (const it of page.items) {
        if (it.kind !== "act") continue;
        let s = null;
        try {
          s = asStamp(describeAct(it.item), clock);
        } catch {
          continue;
        }
        if (s && !seen.has(s.stamp)) seen.set(s.stamp, { s, act: it.item });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
  const verified = [];
  for (const { s, act } of seen.values()) {
    try {
      if (await judge2.standing(act, s.stamp, clock) === "valid") verified.push(s);
    } catch {
    }
  }
  return { found: seen.size, verified, earliest: earliest(verified) };
}

// ../grants/src/limits.ts
var GRANT_LIMITS_SPEC = sha2562("Grant limits cMIP, draft 1, test value until publication");
var MESSAGES = { specs: [] };

// ../grants/src/grant.ts
var GRANTABLE = [
  { key: "posts", kind: { spec: SPECS.text, type: 0 }, words: "posts and messages (Text acts)" },
  // Key 'publications' kept for the apps that store it; what it reaches is a bake (Envelopes type 0, F407).
  { key: "publications", kind: { spec: SPECS.envelopes, type: 0 }, words: "bakes (uploads), a picture among them (Envelopes)" },
  // The six layers (F407): 0 Identity, 1 Text, 2 Envelopes, 3 Money, 4 Agreements, 5 Development.
  { key: "money", kind: { layer: 3 }, words: "money acts: promises to pay, claims, receipts and price tags (the Money layer)" }
];
async function allBy(signer, hints, via) {
  const out = [];
  for (const h of hints) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via).feed({ signer, after });
        for (const it of page.items) if (it.kind === "act") out.push(it.item);
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  return out;
}

// ../grants/src/member.ts
var DECISIONS = [AGREEMENTS_TYPES.grant, AGREEMENTS_TYPES.revocation, AGREEMENTS_TYPES.record];
async function foundingOf(collective, hints, via) {
  const l = await lookUp(collective, hints, via);
  const links = l.resolution.links.map((x) => x.act);
  const chain = await chainOf(collective, hints, via);
  const g = chain.find((b) => describeAct(b).id === collective);
  const d = g ? describeAct(g) : null;
  const decl = d?.payload ? cborDecode(d.payload).get(4) : void 0;
  for (const x of decl ?? []) {
    if (x[0] instanceof Uint8Array && hex(x[0]) === REPO_SPECS.agreements && Number(x[1]) === FOUNDING_AGREEMENT && x[2] instanceof Uint8Array) return { founding: hex(x[2]), links };
  }
  throw new Error("The collective\u2019s genesis declares no founding agreement.");
}
async function chainFor(collective, hints, via = {}) {
  const { links } = await foundingOf(collective, hints, via);
  const { acts: acts2 } = await collectiveVerifier(collective, hints, via);
  const cites = /* @__PURE__ */ new Map();
  for (const a of acts2) {
    const d = describeAct(a);
    if (d.spec !== REPO_SPECS.agreements || !DECISIONS.includes(d.type ?? -1)) continue;
    for (const [chain, cited] of d.objects ?? []) if (chain === collective) cites.set(cited, [...cites.get(cited) ?? [], d.id]);
  }
  let decision = links[links.length - 1];
  for (let i = 0; i < 1024; i++) {
    const next = cites.get(decision);
    if (!next?.length) break;
    decision = next[next.length - 1];
  }
  return { decision, strand: [] };
}
async function signAsMember(collective, me, at, a) {
  const objects = a.spec === MIRS.text && a.type === 0 ? [[collective, at.decision]] : [...a.objects ?? [], [collective, at.decision]];
  const made = await me.signNow(a.spec, a.type, a.payload, {
    public: a.public,
    ...a.to?.length ? { to: a.to } : {},
    objects,
    ...a.refs?.length ? { refs: a.refs } : {}
  });
  at.strand.push(made.id);
  return made;
}
async function publishAt(acts2, places, via = {}) {
  const ok = [];
  for (const p of places) {
    try {
      for (const a of acts2) await relayAt(p, via).putAct(a);
      ok.push(p);
    } catch {
    }
  }
  return ok;
}
async function collectiveVerifier(collective, hints, via = {}, acts2 = []) {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const held = [];
  const add = (a) => {
    try {
      v.add(a);
      held.push(a);
    } catch {
    }
  };
  const hold = async (id) => {
    let places = hints;
    try {
      const l = await lookUp(id, hints, via, v);
      places = [.../* @__PURE__ */ new Set([...hints, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)])];
    } catch {
    }
    for (const a of await allBy(id, places, via)) add(a);
  };
  await hold(collective);
  const { founding } = await foundingOf(collective, hints, via);
  const parties = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  const termsOfId = async (id) => {
    if (seen.has(id)) return;
    seen.add(id);
    for (const h of hints) {
      const a = await relayAt(h, via).getAct(id).catch(() => null);
      if (!a) continue;
      add(a);
      const d = describeAct(a);
      if (d.payload) for (const p of readTerms(d.payload, AGREEMENTS_SPECS).parties) parties.add(p);
      break;
    }
  };
  await termsOfId(founding);
  for (const a of await allBy(collective, hints, via)) {
    const d = describeAct(a);
    if (d.spec === SPECS.identity && d.type === 1 && d.payload) {
      for (const x of cborDecode(d.payload).get(8) ?? []) {
        if (x[0] instanceof Uint8Array && hex(x[0]) === REPO_SPECS.agreements && Array.isArray(x[2])) await termsOfId(hex(x[2][0]));
      }
    }
  }
  for (const p of parties) await hold(p);
  for (const id of acts2) {
    {
      for (const h of hints) {
        const a = await relayAt(h, via).getAct(id).catch(() => null);
        if (a) {
          add(a);
          break;
        }
      }
    }
  }
  return { v, founding, parties: [...parties], acts: held };
}
async function collectiveNow(collective, hints, via = {}) {
  const { v, parties } = await collectiveVerifier(collective, hints, via);
  const cur = v.agreementsCurrent(AGREEMENTS_SPECS, collective);
  let resignations = [];
  try {
    resignations = v.agreementsPublishedResignations(AGREEMENTS_SPECS, collective);
  } catch {
  }
  return { agreement: cur?.agreement ?? null, departed: cur?.departed ?? [], resignations, parties };
}
async function judgeCollective(collective, acts2, hints, via = {}, limits = []) {
  const { v } = await collectiveVerifier(collective, hints, via, acts2);
  const out = /* @__PURE__ */ new Map();
  for (const id of acts2) {
    try {
      out.set(id, v.agreementsConsent(withGrantLimits(AGREEMENTS_SPECS, limits), id));
    } catch (e3) {
      out.set(id, { kind: "unread", reason: e3 instanceof Error ? e3.message : String(e3), met: false, areas: [] });
    }
  }
  return out;
}
var LAYER_OF = { [MIRS.text]: 1, [MIRS.envelopes]: 2, [MIRS.money]: 3, [MIRS.agreements]: 4, [MIRS.development]: 5 };
var LAYER_NAME = { 1: "Text", 2: "Envelopes", 3: "Money", 4: "Agreements", 5: "Development" };
async function areaReaching(collective, places, kind, via = {}) {
  const now4 = await collectiveNow(collective, places, via);
  if (!now4.agreement) return { agreement: null, area: null };
  for (const h of places) {
    const a = await relayAt(h, via).getAct(now4.agreement).catch(() => null);
    if (!a) continue;
    const d = describeAct(a);
    if (!d.payload) break;
    const t = readTerms(d.payload, AGREEMENTS_SPECS);
    const x = t.areas.find((r2) => r2.kinds.some((k) => k.spec === kind.spec && k.type === kind.type));
    if (x) return { agreement: now4.agreement, area: { id: x.id, name: x.name, holders: x.holders, number: x.threshold } };
    const layer = LAYER_OF[kind.spec];
    const r = t.layers.find(([l]) => l === layer)?.[1];
    if (!r) return { agreement: now4.agreement, area: null };
    const voices = t.parties.filter((p) => !now4.departed.includes(p));
    const holders = r.form === "named" ? r.named ?? [] : voices;
    const number = r.form === "threshold" ? r.threshold ?? 1 : holders.length;
    return { agreement: now4.agreement, area: { id: -layer, name: `the ${LAYER_NAME[layer]} layer`, holders, number, layer } };
  }
  return { agreement: now4.agreement, area: null };
}

// ../../modules/carry/src/english.ts
var ENGLISH = [
  "abandon",
  "ability",
  "able",
  "about",
  "above",
  "absent",
  "absorb",
  "abstract",
  "absurd",
  "abuse",
  "access",
  "accident",
  "account",
  "accuse",
  "achieve",
  "acid",
  "acoustic",
  "acquire",
  "across",
  "act",
  "action",
  "actor",
  "actress",
  "actual",
  "adapt",
  "add",
  "addict",
  "address",
  "adjust",
  "admit",
  "adult",
  "advance",
  "advice",
  "aerobic",
  "affair",
  "afford",
  "afraid",
  "again",
  "age",
  "agent",
  "agree",
  "ahead",
  "aim",
  "air",
  "airport",
  "aisle",
  "alarm",
  "album",
  "alcohol",
  "alert",
  "alien",
  "all",
  "alley",
  "allow",
  "almost",
  "alone",
  "alpha",
  "already",
  "also",
  "alter",
  "always",
  "amateur",
  "amazing",
  "among",
  "amount",
  "amused",
  "analyst",
  "anchor",
  "ancient",
  "anger",
  "angle",
  "angry",
  "animal",
  "ankle",
  "announce",
  "annual",
  "another",
  "answer",
  "antenna",
  "antique",
  "anxiety",
  "any",
  "apart",
  "apology",
  "appear",
  "apple",
  "approve",
  "april",
  "arch",
  "arctic",
  "area",
  "arena",
  "argue",
  "arm",
  "armed",
  "armor",
  "army",
  "around",
  "arrange",
  "arrest",
  "arrive",
  "arrow",
  "art",
  "artefact",
  "artist",
  "artwork",
  "ask",
  "aspect",
  "assault",
  "asset",
  "assist",
  "assume",
  "asthma",
  "athlete",
  "atom",
  "attack",
  "attend",
  "attitude",
  "attract",
  "auction",
  "audit",
  "august",
  "aunt",
  "author",
  "auto",
  "autumn",
  "average",
  "avocado",
  "avoid",
  "awake",
  "aware",
  "away",
  "awesome",
  "awful",
  "awkward",
  "axis",
  "baby",
  "bachelor",
  "bacon",
  "badge",
  "bag",
  "balance",
  "balcony",
  "ball",
  "bamboo",
  "banana",
  "banner",
  "bar",
  "barely",
  "bargain",
  "barrel",
  "base",
  "basic",
  "basket",
  "battle",
  "beach",
  "bean",
  "beauty",
  "because",
  "become",
  "beef",
  "before",
  "begin",
  "behave",
  "behind",
  "believe",
  "below",
  "belt",
  "bench",
  "benefit",
  "best",
  "betray",
  "better",
  "between",
  "beyond",
  "bicycle",
  "bid",
  "bike",
  "bind",
  "biology",
  "bird",
  "birth",
  "bitter",
  "black",
  "blade",
  "blame",
  "blanket",
  "blast",
  "bleak",
  "bless",
  "blind",
  "blood",
  "blossom",
  "blouse",
  "blue",
  "blur",
  "blush",
  "board",
  "boat",
  "body",
  "boil",
  "bomb",
  "bone",
  "bonus",
  "book",
  "boost",
  "border",
  "boring",
  "borrow",
  "boss",
  "bottom",
  "bounce",
  "box",
  "boy",
  "bracket",
  "brain",
  "brand",
  "brass",
  "brave",
  "bread",
  "breeze",
  "brick",
  "bridge",
  "brief",
  "bright",
  "bring",
  "brisk",
  "broccoli",
  "broken",
  "bronze",
  "broom",
  "brother",
  "brown",
  "brush",
  "bubble",
  "buddy",
  "budget",
  "buffalo",
  "build",
  "bulb",
  "bulk",
  "bullet",
  "bundle",
  "bunker",
  "burden",
  "burger",
  "burst",
  "bus",
  "business",
  "busy",
  "butter",
  "buyer",
  "buzz",
  "cabbage",
  "cabin",
  "cable",
  "cactus",
  "cage",
  "cake",
  "call",
  "calm",
  "camera",
  "camp",
  "can",
  "canal",
  "cancel",
  "candy",
  "cannon",
  "canoe",
  "canvas",
  "canyon",
  "capable",
  "capital",
  "captain",
  "car",
  "carbon",
  "card",
  "cargo",
  "carpet",
  "carry",
  "cart",
  "case",
  "cash",
  "casino",
  "castle",
  "casual",
  "cat",
  "catalog",
  "catch",
  "category",
  "cattle",
  "caught",
  "cause",
  "caution",
  "cave",
  "ceiling",
  "celery",
  "cement",
  "census",
  "century",
  "cereal",
  "certain",
  "chair",
  "chalk",
  "champion",
  "change",
  "chaos",
  "chapter",
  "charge",
  "chase",
  "chat",
  "cheap",
  "check",
  "cheese",
  "chef",
  "cherry",
  "chest",
  "chicken",
  "chief",
  "child",
  "chimney",
  "choice",
  "choose",
  "chronic",
  "chuckle",
  "chunk",
  "churn",
  "cigar",
  "cinnamon",
  "circle",
  "citizen",
  "city",
  "civil",
  "claim",
  "clap",
  "clarify",
  "claw",
  "clay",
  "clean",
  "clerk",
  "clever",
  "click",
  "client",
  "cliff",
  "climb",
  "clinic",
  "clip",
  "clock",
  "clog",
  "close",
  "cloth",
  "cloud",
  "clown",
  "club",
  "clump",
  "cluster",
  "clutch",
  "coach",
  "coast",
  "coconut",
  "code",
  "coffee",
  "coil",
  "coin",
  "collect",
  "color",
  "column",
  "combine",
  "come",
  "comfort",
  "comic",
  "common",
  "company",
  "concert",
  "conduct",
  "confirm",
  "congress",
  "connect",
  "consider",
  "control",
  "convince",
  "cook",
  "cool",
  "copper",
  "copy",
  "coral",
  "core",
  "corn",
  "correct",
  "cost",
  "cotton",
  "couch",
  "country",
  "couple",
  "course",
  "cousin",
  "cover",
  "coyote",
  "crack",
  "cradle",
  "craft",
  "cram",
  "crane",
  "crash",
  "crater",
  "crawl",
  "crazy",
  "cream",
  "credit",
  "creek",
  "crew",
  "cricket",
  "crime",
  "crisp",
  "critic",
  "crop",
  "cross",
  "crouch",
  "crowd",
  "crucial",
  "cruel",
  "cruise",
  "crumble",
  "crunch",
  "crush",
  "cry",
  "crystal",
  "cube",
  "culture",
  "cup",
  "cupboard",
  "curious",
  "current",
  "curtain",
  "curve",
  "cushion",
  "custom",
  "cute",
  "cycle",
  "dad",
  "damage",
  "damp",
  "dance",
  "danger",
  "daring",
  "dash",
  "daughter",
  "dawn",
  "day",
  "deal",
  "debate",
  "debris",
  "decade",
  "december",
  "decide",
  "decline",
  "decorate",
  "decrease",
  "deer",
  "defense",
  "define",
  "defy",
  "degree",
  "delay",
  "deliver",
  "demand",
  "demise",
  "denial",
  "dentist",
  "deny",
  "depart",
  "depend",
  "deposit",
  "depth",
  "deputy",
  "derive",
  "describe",
  "desert",
  "design",
  "desk",
  "despair",
  "destroy",
  "detail",
  "detect",
  "develop",
  "device",
  "devote",
  "diagram",
  "dial",
  "diamond",
  "diary",
  "dice",
  "diesel",
  "diet",
  "differ",
  "digital",
  "dignity",
  "dilemma",
  "dinner",
  "dinosaur",
  "direct",
  "dirt",
  "disagree",
  "discover",
  "disease",
  "dish",
  "dismiss",
  "disorder",
  "display",
  "distance",
  "divert",
  "divide",
  "divorce",
  "dizzy",
  "doctor",
  "document",
  "dog",
  "doll",
  "dolphin",
  "domain",
  "donate",
  "donkey",
  "donor",
  "door",
  "dose",
  "double",
  "dove",
  "draft",
  "dragon",
  "drama",
  "drastic",
  "draw",
  "dream",
  "dress",
  "drift",
  "drill",
  "drink",
  "drip",
  "drive",
  "drop",
  "drum",
  "dry",
  "duck",
  "dumb",
  "dune",
  "during",
  "dust",
  "dutch",
  "duty",
  "dwarf",
  "dynamic",
  "eager",
  "eagle",
  "early",
  "earn",
  "earth",
  "easily",
  "east",
  "easy",
  "echo",
  "ecology",
  "economy",
  "edge",
  "edit",
  "educate",
  "effort",
  "egg",
  "eight",
  "either",
  "elbow",
  "elder",
  "electric",
  "elegant",
  "element",
  "elephant",
  "elevator",
  "elite",
  "else",
  "embark",
  "embody",
  "embrace",
  "emerge",
  "emotion",
  "employ",
  "empower",
  "empty",
  "enable",
  "enact",
  "end",
  "endless",
  "endorse",
  "enemy",
  "energy",
  "enforce",
  "engage",
  "engine",
  "enhance",
  "enjoy",
  "enlist",
  "enough",
  "enrich",
  "enroll",
  "ensure",
  "enter",
  "entire",
  "entry",
  "envelope",
  "episode",
  "equal",
  "equip",
  "era",
  "erase",
  "erode",
  "erosion",
  "error",
  "erupt",
  "escape",
  "essay",
  "essence",
  "estate",
  "eternal",
  "ethics",
  "evidence",
  "evil",
  "evoke",
  "evolve",
  "exact",
  "example",
  "excess",
  "exchange",
  "excite",
  "exclude",
  "excuse",
  "execute",
  "exercise",
  "exhaust",
  "exhibit",
  "exile",
  "exist",
  "exit",
  "exotic",
  "expand",
  "expect",
  "expire",
  "explain",
  "expose",
  "express",
  "extend",
  "extra",
  "eye",
  "eyebrow",
  "fabric",
  "face",
  "faculty",
  "fade",
  "faint",
  "faith",
  "fall",
  "false",
  "fame",
  "family",
  "famous",
  "fan",
  "fancy",
  "fantasy",
  "farm",
  "fashion",
  "fat",
  "fatal",
  "father",
  "fatigue",
  "fault",
  "favorite",
  "feature",
  "february",
  "federal",
  "fee",
  "feed",
  "feel",
  "female",
  "fence",
  "festival",
  "fetch",
  "fever",
  "few",
  "fiber",
  "fiction",
  "field",
  "figure",
  "file",
  "film",
  "filter",
  "final",
  "find",
  "fine",
  "finger",
  "finish",
  "fire",
  "firm",
  "first",
  "fiscal",
  "fish",
  "fit",
  "fitness",
  "fix",
  "flag",
  "flame",
  "flash",
  "flat",
  "flavor",
  "flee",
  "flight",
  "flip",
  "float",
  "flock",
  "floor",
  "flower",
  "fluid",
  "flush",
  "fly",
  "foam",
  "focus",
  "fog",
  "foil",
  "fold",
  "follow",
  "food",
  "foot",
  "force",
  "forest",
  "forget",
  "fork",
  "fortune",
  "forum",
  "forward",
  "fossil",
  "foster",
  "found",
  "fox",
  "fragile",
  "frame",
  "frequent",
  "fresh",
  "friend",
  "fringe",
  "frog",
  "front",
  "frost",
  "frown",
  "frozen",
  "fruit",
  "fuel",
  "fun",
  "funny",
  "furnace",
  "fury",
  "future",
  "gadget",
  "gain",
  "galaxy",
  "gallery",
  "game",
  "gap",
  "garage",
  "garbage",
  "garden",
  "garlic",
  "garment",
  "gas",
  "gasp",
  "gate",
  "gather",
  "gauge",
  "gaze",
  "general",
  "genius",
  "genre",
  "gentle",
  "genuine",
  "gesture",
  "ghost",
  "giant",
  "gift",
  "giggle",
  "ginger",
  "giraffe",
  "girl",
  "give",
  "glad",
  "glance",
  "glare",
  "glass",
  "glide",
  "glimpse",
  "globe",
  "gloom",
  "glory",
  "glove",
  "glow",
  "glue",
  "goat",
  "goddess",
  "gold",
  "good",
  "goose",
  "gorilla",
  "gospel",
  "gossip",
  "govern",
  "gown",
  "grab",
  "grace",
  "grain",
  "grant",
  "grape",
  "grass",
  "gravity",
  "great",
  "green",
  "grid",
  "grief",
  "grit",
  "grocery",
  "group",
  "grow",
  "grunt",
  "guard",
  "guess",
  "guide",
  "guilt",
  "guitar",
  "gun",
  "gym",
  "habit",
  "hair",
  "half",
  "hammer",
  "hamster",
  "hand",
  "happy",
  "harbor",
  "hard",
  "harsh",
  "harvest",
  "hat",
  "have",
  "hawk",
  "hazard",
  "head",
  "health",
  "heart",
  "heavy",
  "hedgehog",
  "height",
  "hello",
  "helmet",
  "help",
  "hen",
  "hero",
  "hidden",
  "high",
  "hill",
  "hint",
  "hip",
  "hire",
  "history",
  "hobby",
  "hockey",
  "hold",
  "hole",
  "holiday",
  "hollow",
  "home",
  "honey",
  "hood",
  "hope",
  "horn",
  "horror",
  "horse",
  "hospital",
  "host",
  "hotel",
  "hour",
  "hover",
  "hub",
  "huge",
  "human",
  "humble",
  "humor",
  "hundred",
  "hungry",
  "hunt",
  "hurdle",
  "hurry",
  "hurt",
  "husband",
  "hybrid",
  "ice",
  "icon",
  "idea",
  "identify",
  "idle",
  "ignore",
  "ill",
  "illegal",
  "illness",
  "image",
  "imitate",
  "immense",
  "immune",
  "impact",
  "impose",
  "improve",
  "impulse",
  "inch",
  "include",
  "income",
  "increase",
  "index",
  "indicate",
  "indoor",
  "industry",
  "infant",
  "inflict",
  "inform",
  "inhale",
  "inherit",
  "initial",
  "inject",
  "injury",
  "inmate",
  "inner",
  "innocent",
  "input",
  "inquiry",
  "insane",
  "insect",
  "inside",
  "inspire",
  "install",
  "intact",
  "interest",
  "into",
  "invest",
  "invite",
  "involve",
  "iron",
  "island",
  "isolate",
  "issue",
  "item",
  "ivory",
  "jacket",
  "jaguar",
  "jar",
  "jazz",
  "jealous",
  "jeans",
  "jelly",
  "jewel",
  "job",
  "join",
  "joke",
  "journey",
  "joy",
  "judge",
  "juice",
  "jump",
  "jungle",
  "junior",
  "junk",
  "just",
  "kangaroo",
  "keen",
  "keep",
  "ketchup",
  "key",
  "kick",
  "kid",
  "kidney",
  "kind",
  "kingdom",
  "kiss",
  "kit",
  "kitchen",
  "kite",
  "kitten",
  "kiwi",
  "knee",
  "knife",
  "knock",
  "know",
  "lab",
  "label",
  "labor",
  "ladder",
  "lady",
  "lake",
  "lamp",
  "language",
  "laptop",
  "large",
  "later",
  "latin",
  "laugh",
  "laundry",
  "lava",
  "law",
  "lawn",
  "lawsuit",
  "layer",
  "lazy",
  "leader",
  "leaf",
  "learn",
  "leave",
  "lecture",
  "left",
  "leg",
  "legal",
  "legend",
  "leisure",
  "lemon",
  "lend",
  "length",
  "lens",
  "leopard",
  "lesson",
  "letter",
  "level",
  "liar",
  "liberty",
  "library",
  "license",
  "life",
  "lift",
  "light",
  "like",
  "limb",
  "limit",
  "link",
  "lion",
  "liquid",
  "list",
  "little",
  "live",
  "lizard",
  "load",
  "loan",
  "lobster",
  "local",
  "lock",
  "logic",
  "lonely",
  "long",
  "loop",
  "lottery",
  "loud",
  "lounge",
  "love",
  "loyal",
  "lucky",
  "luggage",
  "lumber",
  "lunar",
  "lunch",
  "luxury",
  "lyrics",
  "machine",
  "mad",
  "magic",
  "magnet",
  "maid",
  "mail",
  "main",
  "major",
  "make",
  "mammal",
  "man",
  "manage",
  "mandate",
  "mango",
  "mansion",
  "manual",
  "maple",
  "marble",
  "march",
  "margin",
  "marine",
  "market",
  "marriage",
  "mask",
  "mass",
  "master",
  "match",
  "material",
  "math",
  "matrix",
  "matter",
  "maximum",
  "maze",
  "meadow",
  "mean",
  "measure",
  "meat",
  "mechanic",
  "medal",
  "media",
  "melody",
  "melt",
  "member",
  "memory",
  "mention",
  "menu",
  "mercy",
  "merge",
  "merit",
  "merry",
  "mesh",
  "message",
  "metal",
  "method",
  "middle",
  "midnight",
  "milk",
  "million",
  "mimic",
  "mind",
  "minimum",
  "minor",
  "minute",
  "miracle",
  "mirror",
  "misery",
  "miss",
  "mistake",
  "mix",
  "mixed",
  "mixture",
  "mobile",
  "model",
  "modify",
  "mom",
  "moment",
  "monitor",
  "monkey",
  "monster",
  "month",
  "moon",
  "moral",
  "more",
  "morning",
  "mosquito",
  "mother",
  "motion",
  "motor",
  "mountain",
  "mouse",
  "move",
  "movie",
  "much",
  "muffin",
  "mule",
  "multiply",
  "muscle",
  "museum",
  "mushroom",
  "music",
  "must",
  "mutual",
  "myself",
  "mystery",
  "myth",
  "naive",
  "name",
  "napkin",
  "narrow",
  "nasty",
  "nation",
  "nature",
  "near",
  "neck",
  "need",
  "negative",
  "neglect",
  "neither",
  "nephew",
  "nerve",
  "nest",
  "net",
  "network",
  "neutral",
  "never",
  "news",
  "next",
  "nice",
  "night",
  "noble",
  "noise",
  "nominee",
  "noodle",
  "normal",
  "north",
  "nose",
  "notable",
  "note",
  "nothing",
  "notice",
  "novel",
  "now",
  "nuclear",
  "number",
  "nurse",
  "nut",
  "oak",
  "obey",
  "object",
  "oblige",
  "obscure",
  "observe",
  "obtain",
  "obvious",
  "occur",
  "ocean",
  "october",
  "odor",
  "off",
  "offer",
  "office",
  "often",
  "oil",
  "okay",
  "old",
  "olive",
  "olympic",
  "omit",
  "once",
  "one",
  "onion",
  "online",
  "only",
  "open",
  "opera",
  "opinion",
  "oppose",
  "option",
  "orange",
  "orbit",
  "orchard",
  "order",
  "ordinary",
  "organ",
  "orient",
  "original",
  "orphan",
  "ostrich",
  "other",
  "outdoor",
  "outer",
  "output",
  "outside",
  "oval",
  "oven",
  "over",
  "own",
  "owner",
  "oxygen",
  "oyster",
  "ozone",
  "pact",
  "paddle",
  "page",
  "pair",
  "palace",
  "palm",
  "panda",
  "panel",
  "panic",
  "panther",
  "paper",
  "parade",
  "parent",
  "park",
  "parrot",
  "party",
  "pass",
  "patch",
  "path",
  "patient",
  "patrol",
  "pattern",
  "pause",
  "pave",
  "payment",
  "peace",
  "peanut",
  "pear",
  "peasant",
  "pelican",
  "pen",
  "penalty",
  "pencil",
  "people",
  "pepper",
  "perfect",
  "permit",
  "person",
  "pet",
  "phone",
  "photo",
  "phrase",
  "physical",
  "piano",
  "picnic",
  "picture",
  "piece",
  "pig",
  "pigeon",
  "pill",
  "pilot",
  "pink",
  "pioneer",
  "pipe",
  "pistol",
  "pitch",
  "pizza",
  "place",
  "planet",
  "plastic",
  "plate",
  "play",
  "please",
  "pledge",
  "pluck",
  "plug",
  "plunge",
  "poem",
  "poet",
  "point",
  "polar",
  "pole",
  "police",
  "pond",
  "pony",
  "pool",
  "popular",
  "portion",
  "position",
  "possible",
  "post",
  "potato",
  "pottery",
  "poverty",
  "powder",
  "power",
  "practice",
  "praise",
  "predict",
  "prefer",
  "prepare",
  "present",
  "pretty",
  "prevent",
  "price",
  "pride",
  "primary",
  "print",
  "priority",
  "prison",
  "private",
  "prize",
  "problem",
  "process",
  "produce",
  "profit",
  "program",
  "project",
  "promote",
  "proof",
  "property",
  "prosper",
  "protect",
  "proud",
  "provide",
  "public",
  "pudding",
  "pull",
  "pulp",
  "pulse",
  "pumpkin",
  "punch",
  "pupil",
  "puppy",
  "purchase",
  "purity",
  "purpose",
  "purse",
  "push",
  "put",
  "puzzle",
  "pyramid",
  "quality",
  "quantum",
  "quarter",
  "question",
  "quick",
  "quit",
  "quiz",
  "quote",
  "rabbit",
  "raccoon",
  "race",
  "rack",
  "radar",
  "radio",
  "rail",
  "rain",
  "raise",
  "rally",
  "ramp",
  "ranch",
  "random",
  "range",
  "rapid",
  "rare",
  "rate",
  "rather",
  "raven",
  "raw",
  "razor",
  "ready",
  "real",
  "reason",
  "rebel",
  "rebuild",
  "recall",
  "receive",
  "recipe",
  "record",
  "recycle",
  "reduce",
  "reflect",
  "reform",
  "refuse",
  "region",
  "regret",
  "regular",
  "reject",
  "relax",
  "release",
  "relief",
  "rely",
  "remain",
  "remember",
  "remind",
  "remove",
  "render",
  "renew",
  "rent",
  "reopen",
  "repair",
  "repeat",
  "replace",
  "report",
  "require",
  "rescue",
  "resemble",
  "resist",
  "resource",
  "response",
  "result",
  "retire",
  "retreat",
  "return",
  "reunion",
  "reveal",
  "review",
  "reward",
  "rhythm",
  "rib",
  "ribbon",
  "rice",
  "rich",
  "ride",
  "ridge",
  "rifle",
  "right",
  "rigid",
  "ring",
  "riot",
  "ripple",
  "risk",
  "ritual",
  "rival",
  "river",
  "road",
  "roast",
  "robot",
  "robust",
  "rocket",
  "romance",
  "roof",
  "rookie",
  "room",
  "rose",
  "rotate",
  "rough",
  "round",
  "route",
  "royal",
  "rubber",
  "rude",
  "rug",
  "rule",
  "run",
  "runway",
  "rural",
  "sad",
  "saddle",
  "sadness",
  "safe",
  "sail",
  "salad",
  "salmon",
  "salon",
  "salt",
  "salute",
  "same",
  "sample",
  "sand",
  "satisfy",
  "satoshi",
  "sauce",
  "sausage",
  "save",
  "say",
  "scale",
  "scan",
  "scare",
  "scatter",
  "scene",
  "scheme",
  "school",
  "science",
  "scissors",
  "scorpion",
  "scout",
  "scrap",
  "screen",
  "script",
  "scrub",
  "sea",
  "search",
  "season",
  "seat",
  "second",
  "secret",
  "section",
  "security",
  "seed",
  "seek",
  "segment",
  "select",
  "sell",
  "seminar",
  "senior",
  "sense",
  "sentence",
  "series",
  "service",
  "session",
  "settle",
  "setup",
  "seven",
  "shadow",
  "shaft",
  "shallow",
  "share",
  "shed",
  "shell",
  "sheriff",
  "shield",
  "shift",
  "shine",
  "ship",
  "shiver",
  "shock",
  "shoe",
  "shoot",
  "shop",
  "short",
  "shoulder",
  "shove",
  "shrimp",
  "shrug",
  "shuffle",
  "shy",
  "sibling",
  "sick",
  "side",
  "siege",
  "sight",
  "sign",
  "silent",
  "silk",
  "silly",
  "silver",
  "similar",
  "simple",
  "since",
  "sing",
  "siren",
  "sister",
  "situate",
  "six",
  "size",
  "skate",
  "sketch",
  "ski",
  "skill",
  "skin",
  "skirt",
  "skull",
  "slab",
  "slam",
  "sleep",
  "slender",
  "slice",
  "slide",
  "slight",
  "slim",
  "slogan",
  "slot",
  "slow",
  "slush",
  "small",
  "smart",
  "smile",
  "smoke",
  "smooth",
  "snack",
  "snake",
  "snap",
  "sniff",
  "snow",
  "soap",
  "soccer",
  "social",
  "sock",
  "soda",
  "soft",
  "solar",
  "soldier",
  "solid",
  "solution",
  "solve",
  "someone",
  "song",
  "soon",
  "sorry",
  "sort",
  "soul",
  "sound",
  "soup",
  "source",
  "south",
  "space",
  "spare",
  "spatial",
  "spawn",
  "speak",
  "special",
  "speed",
  "spell",
  "spend",
  "sphere",
  "spice",
  "spider",
  "spike",
  "spin",
  "spirit",
  "split",
  "spoil",
  "sponsor",
  "spoon",
  "sport",
  "spot",
  "spray",
  "spread",
  "spring",
  "spy",
  "square",
  "squeeze",
  "squirrel",
  "stable",
  "stadium",
  "staff",
  "stage",
  "stairs",
  "stamp",
  "stand",
  "start",
  "state",
  "stay",
  "steak",
  "steel",
  "stem",
  "step",
  "stereo",
  "stick",
  "still",
  "sting",
  "stock",
  "stomach",
  "stone",
  "stool",
  "story",
  "stove",
  "strategy",
  "street",
  "strike",
  "strong",
  "struggle",
  "student",
  "stuff",
  "stumble",
  "style",
  "subject",
  "submit",
  "subway",
  "success",
  "such",
  "sudden",
  "suffer",
  "sugar",
  "suggest",
  "suit",
  "summer",
  "sun",
  "sunny",
  "sunset",
  "super",
  "supply",
  "supreme",
  "sure",
  "surface",
  "surge",
  "surprise",
  "surround",
  "survey",
  "suspect",
  "sustain",
  "swallow",
  "swamp",
  "swap",
  "swarm",
  "swear",
  "sweet",
  "swift",
  "swim",
  "swing",
  "switch",
  "sword",
  "symbol",
  "symptom",
  "syrup",
  "system",
  "table",
  "tackle",
  "tag",
  "tail",
  "talent",
  "talk",
  "tank",
  "tape",
  "target",
  "task",
  "taste",
  "tattoo",
  "taxi",
  "teach",
  "team",
  "tell",
  "ten",
  "tenant",
  "tennis",
  "tent",
  "term",
  "test",
  "text",
  "thank",
  "that",
  "theme",
  "then",
  "theory",
  "there",
  "they",
  "thing",
  "this",
  "thought",
  "three",
  "thrive",
  "throw",
  "thumb",
  "thunder",
  "ticket",
  "tide",
  "tiger",
  "tilt",
  "timber",
  "time",
  "tiny",
  "tip",
  "tired",
  "tissue",
  "title",
  "toast",
  "tobacco",
  "today",
  "toddler",
  "toe",
  "together",
  "toilet",
  "token",
  "tomato",
  "tomorrow",
  "tone",
  "tongue",
  "tonight",
  "tool",
  "tooth",
  "top",
  "topic",
  "topple",
  "torch",
  "tornado",
  "tortoise",
  "toss",
  "total",
  "tourist",
  "toward",
  "tower",
  "town",
  "toy",
  "track",
  "trade",
  "traffic",
  "tragic",
  "train",
  "transfer",
  "trap",
  "trash",
  "travel",
  "tray",
  "treat",
  "tree",
  "trend",
  "trial",
  "tribe",
  "trick",
  "trigger",
  "trim",
  "trip",
  "trophy",
  "trouble",
  "truck",
  "true",
  "truly",
  "trumpet",
  "trust",
  "truth",
  "try",
  "tube",
  "tuition",
  "tumble",
  "tuna",
  "tunnel",
  "turkey",
  "turn",
  "turtle",
  "twelve",
  "twenty",
  "twice",
  "twin",
  "twist",
  "two",
  "type",
  "typical",
  "ugly",
  "umbrella",
  "unable",
  "unaware",
  "uncle",
  "uncover",
  "under",
  "undo",
  "unfair",
  "unfold",
  "unhappy",
  "uniform",
  "unique",
  "unit",
  "universe",
  "unknown",
  "unlock",
  "until",
  "unusual",
  "unveil",
  "update",
  "upgrade",
  "uphold",
  "upon",
  "upper",
  "upset",
  "urban",
  "urge",
  "usage",
  "use",
  "used",
  "useful",
  "useless",
  "usual",
  "utility",
  "vacant",
  "vacuum",
  "vague",
  "valid",
  "valley",
  "valve",
  "van",
  "vanish",
  "vapor",
  "various",
  "vast",
  "vault",
  "vehicle",
  "velvet",
  "vendor",
  "venture",
  "venue",
  "verb",
  "verify",
  "version",
  "very",
  "vessel",
  "veteran",
  "viable",
  "vibrant",
  "vicious",
  "victory",
  "video",
  "view",
  "village",
  "vintage",
  "violin",
  "virtual",
  "virus",
  "visa",
  "visit",
  "visual",
  "vital",
  "vivid",
  "vocal",
  "voice",
  "void",
  "volcano",
  "volume",
  "vote",
  "voyage",
  "wage",
  "wagon",
  "wait",
  "walk",
  "wall",
  "walnut",
  "want",
  "warfare",
  "warm",
  "warrior",
  "wash",
  "wasp",
  "waste",
  "water",
  "wave",
  "way",
  "wealth",
  "weapon",
  "wear",
  "weasel",
  "weather",
  "web",
  "wedding",
  "weekend",
  "weird",
  "welcome",
  "west",
  "wet",
  "whale",
  "what",
  "wheat",
  "wheel",
  "when",
  "where",
  "whip",
  "whisper",
  "wide",
  "width",
  "wife",
  "wild",
  "will",
  "win",
  "window",
  "wine",
  "wing",
  "wink",
  "winner",
  "winter",
  "wire",
  "wisdom",
  "wise",
  "wish",
  "witness",
  "wolf",
  "woman",
  "wonder",
  "wood",
  "wool",
  "word",
  "work",
  "world",
  "worry",
  "worth",
  "wrap",
  "wreck",
  "wrestle",
  "wrist",
  "write",
  "wrong",
  "yard",
  "year",
  "yellow",
  "you",
  "young",
  "youth",
  "zebra",
  "zero",
  "zone",
  "zoo"
];

// ../../modules/carry/src/carry.ts
var Refused = class extends Error {
};
var INDEX = new Map(ENGLISH.map((w, i) => [w, i]));
function toWords(seed) {
  if (seed.length !== 32) throw new Refused("a signing seed is 32 bytes");
  const check = createHash("sha256").update(seed).digest()[0];
  let bits = 0n;
  for (const b of seed) bits = bits << 8n | BigInt(b);
  bits = bits << 8n | BigInt(check);
  const out = [];
  for (let i = 23; i >= 0; i--) out.push(ENGLISH[Number(bits >> BigInt(i * 11) & 2047n)]);
  return out;
}
function splitWords(written) {
  return written.toLowerCase().split(/\s+/).filter(Boolean);
}
function fromWords(written) {
  const words = typeof written === "string" ? splitWords(written) : written.map((w) => w.trim().toLowerCase());
  if (words.length !== 24) throw new Refused(`${words.length} words, not 24`);
  let bits = 0n;
  words.forEach((w, i) => {
    const n = INDEX.get(w);
    if (n === void 0) throw new Refused(`word ${i + 1}, \u201C${w}\u201D, is not on the list: check how it is written`);
    bits = bits << 11n | BigInt(n);
  });
  const seed = new Uint8Array(32);
  for (let i = 0; i < 32; i++) seed[i] = Number(bits >> BigInt(8 + (31 - i) * 8) & 255n);
  const check = Number(bits & 255n);
  if (createHash("sha256").update(seed).digest()[0] !== check) {
    throw new Refused("the checksum does not match: a word was written or read wrong");
  }
  return seed;
}
var ENCRYPTION_TAG = "MOR/module/carry/encryption";
function encryptionSecret(signingSeed) {
  if (signingSeed.length !== 32) throw new Refused("a signing seed is 32 bytes");
  const t = createHash("sha256").update(ENCRYPTION_TAG).digest();
  return new Uint8Array(createHash("sha256").update(t).update(t).update(signingSeed).digest());
}
var groupId = (id) => id.match(/.{1,4}/g).join(" ");

// ../genesis/src/forms.ts
var form = (label, hex3) => formEncode(label, unhex(hex3));
var idForm = (id) => form("mid", id);
var actForm = (id) => form("mact", id);
var specForm = (hash) => form("mspec", hash);
var idWhere = (id, hints) => formWithHints("mid", unhex(id), hints.filter((h) => /^https?:\/\//.test(h)));
function readForm(typed, want) {
  const t = typed.trim();
  const squeezed = t.replace(/\s+/g, "");
  if (want !== "mkey" && /^[0-9a-fA-F]{64}$/.test(squeezed)) return { hex: squeezed.toLowerCase(), hints: [], bare: true };
  if (!/^m[a-z]+1/i.test(t)) throw new Refused(`${WHAT[want]} is 64 characters, 0 to 9 and a to f (spaces do not matter), or its form written for people, ${want}1\u2026`);
  try {
    const r = formRead(t, want);
    return { hex: r.data, hints: r.hints, bare: r.bare };
  } catch (e3) {
    throw new Refused(e3 instanceof Error ? e3.message : String(e3));
  }
}
var WHAT = { mid: "an ID", mact: "an act id", mkey: "a key", mspec: "a spec hash", mwork: "a work hash" };
var readId = (typed) => readForm(typed, "mid").hex;
var readActId = (typed) => readForm(typed, "mact").hex;
function readIdWhere(typed) {
  const t = typed.trim().replace(/^.*#/, "");
  const parts = t.split(/\s+/).filter(Boolean);
  const beside = parts.slice(1).filter((p) => /^https?:\/\//.test(p));
  const head = beside.length ? parts.filter((p) => !/^https?:\/\//.test(p)).join("") : t;
  const r = readForm(head, "mid");
  return { id: r.hex, hints: [.../* @__PURE__ */ new Set([...r.hints, ...beside])] };
}

// ../dub/src/carryin.ts
var message = (e3) => e3 instanceof Error ? e3.message : String(e3);
var NOT_CURRENT = "These words do not give this identity\u2019s current signing key: they are another identity\u2019s, an earlier key\u2019s, or written wrong. Nothing was kept. If these are your chain key\u2019s words, they must never be typed into an online app.";
async function lookCurrent(id, seed, hints, via) {
  let pub;
  try {
    pub = signingPublic(seed);
  } catch {
    throw new Error("The words do not hold a signing key. Nothing was kept.");
  }
  let look2;
  try {
    look2 = await lookUp(id, hints, via);
  } catch (e3) {
    throw new Error(`This identity was not found at ${hints.join(", ")}: ${message(e3)}`);
  }
  const r = look2.resolution;
  if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing can be signed for it until they agree.");
  if (r.stop === "pending" || r.waiting.length) throw new Error("A change of its keys is waiting for its homes: bring it once that change counts, with the new words.");
  if (!r.signingKey || !r.links.length) throw new Error(`Its chain could not be read (${r.stop}).`);
  if (hex(r.signingKey) !== hex(pub)) throw new Error(NOT_CURRENT);
  return look2;
}
async function servedChain(id, homes, via) {
  for (const h of homes) {
    try {
      const chain = (await relayAt(h.hint, via).identity(id)).chain;
      if (chain.length) return chain;
    } catch {
    }
  }
  throw new Error("None of its homes served its chain.");
}
function carriedKey(look2, seed) {
  const secret = encryptionSecret(seed);
  if (!look2.encryptionKey || !look2.encryptionKeyAct || hex(xwingPublic(secret)) !== hex(look2.encryptionKey)) return null;
  const e3 = look2.verifier.latest(look2.resolution.identity, SPECS.envelopes, 4);
  const version2 = e3.payload ? Number(cborDecode(e3.payload).get(0)) : 1;
  return { version: version2, act: look2.encryptionKeyAct, secret: hex(secret) };
}

// ../dub/src/people.ts
var PEOPLE_SPEC = sha2562("People cMIP, draft 2, test value until publication");
var PEOPLE_SPEC_1 = sha2562("People cMIP, draft 1, test value until publication");
var SEALED_LIST = 1;
function sealedListPayload(a) {
  const m = /* @__PURE__ */ new Map([[0, a.version]]);
  if (a.previous) m.set(1, unhex(a.previous));
  m.set(
    2,
    a.follows.map((f) => f.name ? [unhex(f.id), f.name] : [unhex(f.id)])
  );
  return cborEncode(m);
}
function openerOf(identity, secrets) {
  return async (sealed) => sealed.map((bytes) => {
    for (const s of secrets) {
      try {
        return openSealed(bytes, identity, s);
      } catch {
      }
    }
    return null;
  });
}
async function readSealedList(identity, keys, homes, via = {}) {
  const out = { act: null, version: 0, follows: [], forked: false, problems: [] };
  if (Array.isArray(keys) && !keys.length) return out;
  const open = Array.isArray(keys) ? openerOf(identity, keys) : keys;
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l;
  try {
    l = await lookUp(identity, homes, via, v);
  } catch (e3) {
    out.problems.push(`its homes did not answer (${e3 instanceof Error ? e3.message : String(e3)})`);
    return out;
  }
  const at = [.../* @__PURE__ */ new Set([...homes, ...l.resolution.homes.map((h) => h.hint)])];
  const acts2 = /* @__PURE__ */ new Map();
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via).feed({ to: identity, after });
        const sealed = page.items.filter((it) => it.kind === "sealed");
        const opened2 = sealed.length ? await open(sealed.map((it) => it.item)) : [];
        for (const o of opened2) {
          const d = o?.described;
          if (!o || !d || acts2.has(d.id) || d.public || d.signer !== identity || d.spec !== PEOPLE_SPEC || d.type !== SEALED_LIST || !d.payload) continue;
          if (o.key) l.verifier.addWithKey(o.act, o.key);
          else l.verifier.add(o.act);
          if (l.verifier.status(d.id) !== "valid") continue;
          try {
            const m = cborDecode(d.payload);
            const prev = m.get(1);
            const follows2 = [];
            for (const x of m.get(2)) {
              if (!Array.isArray(x) || !(x[0] instanceof Uint8Array) || x[0].length !== 32) continue;
              const id = hex(x[0]);
              if (follows2.some((f) => f.id === id)) continue;
              follows2.push({ id, name: typeof x[1] === "string" && x[1].trim() ? x[1].slice(0, 64) : null });
            }
            acts2.set(d.id, { version: Number(m.get(0)), previous: prev instanceof Uint8Array ? hex(prev) : null, follows: follows2 });
          } catch {
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e3) {
      out.problems.push(`${h}: ${e3 instanceof Error ? e3.message : String(e3)}`);
    }
  }
  const best = (from, version2) => {
    const next = [...acts2.entries()].filter(([, a]) => a.previous === from && a.version === version2 + 1);
    if (next.length > 1) out.forked = true;
    let pick = null;
    for (const [id] of next) {
      const below = best(id, version2 + 1);
      const depth = below ? below.depth : version2 + 1;
      const tip2 = below ? below.id : id;
      if (!pick || depth > pick.depth || depth === pick.depth && tip2 < pick.tip) pick = { id: tip2, depth, tip: tip2 };
    }
    return pick ? { id: pick.tip, depth: pick.depth } : null;
  };
  const tip = best(null, 0);
  if (tip) {
    const a = acts2.get(tip.id);
    Object.assign(out, { act: tip.id, version: a.version, follows: a.follows });
  }
  return out;
}

// ../damgar/src/units.ts
var u = moneySpecs().units;
var BITCOIN_UNITS = {
  key: "bitcoin-units",
  name: "Bitcoin units",
  text: "modules/units-bitcoin-draft-1.md",
  draft: 1,
  does: "The satoshi on Bitcoin, and the satoshi of each of Bitcoin\u2019s test networks, which is not a satoshi: four units, each its own specification, so that a test payment can never pay a real debt.",
  units: [
    { hash: u.bitcoin, name: "satoshi (Bitcoin)", one: "satoshi", many: "satoshis", test: false, network: 0 },
    { hash: u.testnet, name: "satoshi (testnet)", one: "testnet satoshi", many: "testnet satoshis", test: true, network: 1 },
    { hash: u.signet, name: "satoshi (signet)", one: "signet satoshi", many: "signet satoshis", test: true, network: 2 },
    { hash: u.regtest, name: "satoshi (regtest)", one: "regtest satoshi", many: "regtest satoshis", test: true, network: 3 }
  ]
};
var UNITS_MODULES = [BITCOIN_UNITS];
var unitOf = (hash) => {
  for (const m of UNITS_MODULES) {
    const x = m.units.find((y) => y.hash === hash);
    if (x) return { unit: x, module: m };
  }
  return null;
};
var grouped = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
function say(a, accepted) {
  const k = unitOf(a.unit);
  if (!k || !accepted.has(a.unit)) return `${grouped(a.value)} of unit ${a.unit.slice(0, 8)}\u2026 (${k ? `${k.module.name}, not accepted here` : "a units Module Damgar does not know"})`;
  return `${grouped(a.value)} ${a.value === 1 ? k.unit.one : k.unit.many}`;
}

// ../damgar/src/specs.ts
var MONEY = MIRS.money;
var MESSAGES_SPEC = sha2562("Money messages cMIP, draft 4, test value until publication");
var MESSAGES_SPEC_3 = sha2562("Money messages cMIP, draft 3, test value until publication");
var MESSAGES_SPEC_2 = sha2562("Money messages cMIP, draft 2, test value until publication");
var MESSAGES_SPEC_1 = sha2562("Money messages cMIP, draft 1, test value until publication");
var MESSAGES_SPECS = [MESSAGES_SPEC, MESSAGES_SPEC_3, MESSAGES_SPEC_2, MESSAGES_SPEC_1];
MESSAGES.specs = MESSAGES_SPECS;
var ACCEPTED_SPEC = sha2562("Accepted cMIP, draft 1, test value until publication");
var SPEC = moneySpecs();
var unitsEntry = (u2) => ({
  key: u2.key,
  name: u2.name,
  kind: "Module",
  text: u2.text,
  draft: u2.draft,
  hashes: u2.units.map((x) => x.hash),
  does: u2.does,
  here: "Every amount names its unit; Damgar shows an amount in these units with their names, and never adds or compares amounts of different units.",
  built: true,
  needs: []
});
var ACCEPTABLE = [
  {
    key: "payment",
    name: "Payment",
    kind: "cMIP",
    text: "cmips/cmip-payment-draft-3.md",
    draft: 3,
    hashes: [SPEC.payment],
    does: "The common language of a payment: the commitment a rail carries (who pays whom, how much, for what), the proof a receipt or claim carries, and how both are checked by the rail Module they name.",
    here: "Needed for every payment: without it, every receipt and claim is unknown here.",
    built: true,
    needs: []
  },
  {
    key: "lightning",
    name: "Lightning rail",
    kind: "Module",
    text: "modules/module-lightning-rail-draft-3.md",
    draft: 3,
    hashes: [SPEC.lightning.hash],
    does: "Payments over Lightning: the payee\u2019s node signs an invoice committing to the payment; paying it reveals a secret (the preimage), which is the proof. A request rail, its proof binding the payee and the purpose (its fields 11 and 13).",
    here: "You are shown an invoice to pay in your own wallet, and paste back the preimage; to be paid, you paste an invoice your wallet made.",
    built: true,
    needs: ["payment", "bitcoin-units"]
  },
  {
    key: "onchain",
    name: "On-chain rail",
    kind: "Module",
    text: "modules/module-onchain-rail-draft-3.md",
    draft: 3,
    hashes: [SPEC.onchain.hash],
    does: "Payments on the Bitcoin chain itself: a fresh address bound to each payment (pay-to-contract, no OP_RETURN), the transaction and its block as the proof, counted at six confirmations. A request rail, its proof binding the payee and the purpose.",
    here: "You are shown an address bound to the payment, to pay from your own wallet, and paste back the transaction\u2019s id. Checked against the chain Damgar follows: on this computer, the regtest node you name; in the web client, none (paid, not yet checked against the chain).",
    built: true,
    needs: ["payment", "bitcoin-units"]
  },
  unitsEntry(BITCOIN_UNITS),
  {
    key: "split",
    name: "Split",
    kind: "cMIP",
    text: "cmips/cmip-split-draft-3.md",
    draft: 3,
    hashes: [SPEC.split],
    does: "How a payment to a collective or a deal is divided among its owners by a split service: an agreement\u2019s choice, defined with the agreement.",
    here: "Not used in round 1: splits are defined in Edubba\u2019s Collectives tab, in round 2, and never approved here. Accepting it records your choice for the apps that read it.",
    built: false,
    needs: ["payment"]
  },
  {
    key: "conversion",
    name: "Conversion",
    kind: "cMIP",
    text: "cmips/cmip-conversion-draft-3.md",
    draft: 3,
    hashes: [SPEC.conversion],
    does: "A conversion service that receives on one rail or unit and pays on another, at the rate of its own offer: the only way two amounts of different units are ever read together.",
    here: "Not used in round 1. Accepting it records your choice.",
    built: false,
    needs: ["payment"]
  },
  {
    key: "anchoring",
    name: "Anchoring",
    kind: "cMIP",
    text: "cmips/cmip-anchoring-draft-7.md",
    draft: 7,
    hashes: [SPEC.anchoring],
    does: "Putting an act\u2019s fingerprint on a clock everyone can read (the Bitcoin chain), through a pooled service paid per fingerprint: its offer, the ticket it signs for each paid fingerprint, the batches it publishes.",
    here: "Edubba asks for an anchor of a collective\u2019s act, Ummia of a release; the payment for it arrives here, and is signed here. Its ticket is shown with it.",
    built: true,
    needs: ["payment", "lightning", "bitcoin-units", "bitcoin-clock"]
  },
  {
    key: "bitcoin-clock",
    name: "Bitcoin clock",
    kind: "Module",
    text: "modules/module-bitcoin-clock-draft-3.md",
    draft: 3,
    hashes: [SPEC.bitcoinClock],
    does: "The Bitcoin chain read as a clock: a moment on it is a block. The clock an anchoring service\u2019s offer names; and the clock an owner may declare, so that a theft\u2019s window ends at a block (Money rule 29).",
    here: "Shown with an anchor\u2019s ticket (its deadline is a block). Damgar does not judge Money rule 29, which needs Agreements\u2019 reading of the payee\u2019s acts: said where it applies.",
    built: true,
    needs: ["anchoring"]
  },
  {
    key: "messages",
    name: "Money messages",
    kind: "cMIP",
    text: "cmips/cmip-money-messages-draft-5.md",
    draft: 5,
    hashes: [MESSAGES_SPEC, MESSAGES_SPEC_3, MESSAGES_SPEC_2, MESSAGES_SPEC_1],
    does: "The messages between apps and people: a draft sealed to yourself by Dub or Edubba, a request to be paid, an invoice request and its answer (draft 1); a lane asked by an app, and a sale told to your own Dub (draft 2); the amount in an answer, so a lane\u2019s cap is judged on it (draft 3); an invoice request sent to a collective\u2019s split service, and a purchase confirmed from Edubba (draft 4); a deal between separate people, its tips to the deal, and a purchase\u2019s claim readable by every party or member (draft 5, no format change). Written by Damgar\u2019s builds, awaiting approval.",
    here: "Needed to receive drafts from Dub and Edubba, requests from others, and to pay or be paid at all: without it, nothing arrives here.",
    built: true,
    needs: ["payment"]
  },
  {
    key: "grant-limits",
    name: "Grant limits",
    kind: "cMIP",
    text: "cmips/cmip-grant-limits-draft-1.md",
    draft: 1,
    hashes: [GRANT_LIMITS_SPEC],
    does: "A grant\u2019s limits: how much one act may move, in a named unit, and until when, on a named clock. Written by Edubba\u2019s agents session (F345).",
    here: "Every lane (round 2) carries its limits under it: a cap per act, and an expiry if you give one. Without it, an act under a lane is unknown here, and no lane is granted.",
    built: true,
    needs: ["payment"]
  }
];
var acceptable = (key) => ACCEPTABLE.find((a) => a.key === key);
var OURS = new Set(ACCEPTABLE.flatMap((a) => a.hashes));
var labelOf = (hash) => {
  const a = ACCEPTABLE.find((x) => x.hashes.includes(hash));
  if (!a) return void 0;
  if (a.hashes.length === 1) return `${a.name} ${a.kind}, draft ${a.draft}`;
  const u2 = BITCOIN_UNITS.units.find((x) => x.hash === hash);
  return `${a.name}, draft ${a.draft}: ${u2?.name ?? "a unit"}`;
};

// ../damgar/src/accepted.ts
var SEALED_LIST2 = 1;
var PUBLISHED_LIST = 0;
function listPayload(a, withdrawn = false) {
  const m = /* @__PURE__ */ new Map([[0, a.version]]);
  if (a.previous) m.set(1, unhex(a.previous));
  m.set(
    2,
    [...a.entries.entries()].sort(([x], [y]) => x < y ? -1 : 1).map(([h, label]) => label ? [unhex(h), label.slice(0, 120)] : [unhex(h)])
  );
  if (a.merged.length) m.set(3, a.merged.map(unhex));
  if (withdrawn) m.set(4, true);
  return cborEncode(m);
}
function readList(id, payload) {
  try {
    const m = cborDecode(payload);
    for (const k of m.keys()) if (![0, 1, 2, 3].includes(k)) return null;
    const version2 = m.get(0);
    if (typeof version2 !== "number" || version2 < 1) return null;
    const prev = m.get(1);
    if (version2 === 1 !== (prev === void 0)) return null;
    const entries = /* @__PURE__ */ new Map();
    for (const x of m.get(2)) {
      if (!Array.isArray(x) || !(x[0] instanceof Uint8Array) || x[0].length !== 32) return null;
      entries.set(hex(x[0]), typeof x[1] === "string" ? x[1].slice(0, 120) : null);
    }
    const merged = (m.get(3) ?? []).map((x) => {
      if (!(x instanceof Uint8Array) || x.length !== 32) throw new Error("merged");
      return hex(x);
    });
    return { id, version: version2, previous: prev instanceof Uint8Array ? hex(prev) : null, merged, entries };
  } catch {
    return null;
  }
}
async function readActs(identity, keys, homes, via) {
  const acts2 = /* @__PURE__ */ new Map();
  const problems = [];
  if (Array.isArray(keys) && !keys.length) return { acts: acts2, problems: ["this app holds no encryption key of this identity"] };
  const open = Array.isArray(keys) ? openerOf(identity, keys) : keys;
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l;
  try {
    l = await lookUp(identity, homes, via, v);
  } catch (e3) {
    return { acts: acts2, problems: [`its homes did not answer (${e3 instanceof Error ? e3.message : String(e3)})`] };
  }
  const at = [.../* @__PURE__ */ new Set([...homes, ...l.resolution.homes.map((h) => h.hint)])];
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via).feed({ to: identity, after });
        const sealed = page.items.filter((it) => it.kind === "sealed").map((it) => it.item);
        const opened2 = sealed.length ? await open(sealed) : [];
        for (const o of opened2) {
          const d = o?.described;
          if (!o || !d || acts2.has(d.id) || d.public || d.signer !== identity || d.spec !== ACCEPTED_SPEC || d.type !== SEALED_LIST2 || !d.payload) continue;
          if (o.key) l.verifier.addWithKey(o.act, o.key);
          else l.verifier.add(o.act);
          if (l.verifier.status(d.id) !== "valid") continue;
          const x = readList(d.id, d.payload);
          if (x) acts2.set(d.id, x);
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e3) {
      problems.push(`${h}: ${e3 instanceof Error ? e3.message : String(e3)}`);
    }
  }
  return { acts: acts2, problems };
}
function ancestors(acts2, id) {
  const out = /* @__PURE__ */ new Set();
  const walk = (x) => {
    if (out.has(x)) return;
    out.add(x);
    const a = acts2.get(x);
    if (!a) return;
    if (a.previous) walk(a.previous);
    for (const m of a.merged) walk(m);
  };
  walk(id);
  return out;
}
async function readAccepted(identity, keys, homes, via = {}) {
  const { acts: acts2, problems } = await readActs(identity, keys, homes, via);
  const followed = /* @__PURE__ */ new Set();
  for (const a of acts2.values()) {
    if (a.previous) followed.add(a.previous);
    for (const m of a.merged) followed.add(m);
  }
  const tips = [...acts2.values()].filter((a) => !followed.has(a.id)).sort((x, y) => x.id < y.id ? -1 : 1);
  const version2 = Math.max(0, ...tips.map((t) => t.version));
  if (tips.length <= 1) return { entries: new Map(tips[0]?.entries ?? []), tips, merged: [], version: version2, problems };
  const anc = tips.map((t) => ancestors(acts2, t.id));
  const common = [...anc[0]].filter((x) => anc.every((s) => s.has(x)) && acts2.has(x));
  const base = common.map((x) => acts2.get(x)).sort((a, b) => b.version - a.version)[0];
  const baseEntries = base?.entries ?? /* @__PURE__ */ new Map();
  const entries = new Map(baseEntries);
  const merged = [];
  for (const t of tips) {
    for (const [h, label] of t.entries) {
      if (!baseEntries.has(h)) {
        entries.set(h, label);
        merged.push(`Added in one app: ${label ?? labelOf(h) ?? h.slice(0, 12)}.`);
      }
    }
    for (const h of baseEntries.keys()) {
      if (!t.entries.has(h) && entries.has(h)) {
        entries.delete(h);
        merged.push(`Removed in one app: ${baseEntries.get(h) ?? labelOf(h) ?? h.slice(0, 12)}.`);
      }
    }
  }
  return { entries, tips, merged: [...new Set(merged)], version: version2, problems };
}
var sameTips = (a, b) => a.map((x) => x.id).join() === b.map((x) => x.id).join();
async function changeAccepted(me, change, opts) {
  const via = opts.via ?? {};
  const homes = me.f.homes.map((h) => h.hint);
  const held = [...me.f.encryption].reverse().filter((e3) => e3.secret).map((e3) => unhex(e3.secret));
  const secrets = held.length ? held : opts.open ?? [];
  if (Array.isArray(secrets) && !secrets.length) throw new Error("This app holds no encryption key of this identity, so its accepted list cannot be sealed to it. Nothing was changed.");
  for (let round = 0; round < 5; round++) {
    const read4 = await readAccepted(me.id, secrets, homes, via);
    if (read4.problems.length >= homes.length && !read4.tips.length) throw new Error(`The identity\u2019s homes did not answer (${read4.problems.join("; ")}): the accepted list was not changed.`);
    const next = new Map(read4.entries);
    change(next);
    const same = read4.tips.length === 1 && JSON.stringify([...next].sort()) === JSON.stringify([...read4.entries].sort());
    if (same || !read4.tips.length && !next.size) return { written: null, list: read4 };
    const again = await readAccepted(me.id, secrets, homes, via);
    if (!sameTips(again.tips, read4.tips)) continue;
    await opts.check();
    const look2 = await lookUp(me.id, homes, via);
    if (!look2.encryptionKey || !me.f.encryption.some((e3) => (e3.secret ? hex(xwingPublic(unhex(e3.secret))) : e3.public) === hex(look2.encryptionKey))) {
      throw new Error("The encryption key this identity publishes is not one this app holds: the accepted list cannot be sealed. Nothing was changed.");
    }
    const [first, ...others] = read4.tips;
    const payload = listPayload({ version: read4.version + 1, previous: first?.id ?? null, merged: others.map((t) => t.id), entries: next });
    let made;
    try {
      made = await me.signNow(ACCEPTED_SPEC, SEALED_LIST2, payload, { public: false, to: [me.id] });
    } finally {
      await opts.save();
    }
    const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look2.encryptionKey }]);
    let left = 0;
    for (const h of homes) {
      try {
        await relayAt(h, via).putSealed(sealed);
        left++;
      } catch {
      }
    }
    await leaveAtHomes(me, made, { via, sealed: left > 0 });
    await opts.save();
    if (!left) throw new Error("No home took the accepted list: nothing was changed. Try again.");
    return { written: made.id, list: { entries: next, tips: [{ id: made.id, version: read4.version + 1, previous: first?.id ?? null, merged: others.map((t) => t.id), entries: next }], merged: read4.merged, version: read4.version + 1, problems: [] } };
  }
  throw new Error("Another app kept changing the accepted list while this one wrote: nothing was changed. Try again.");
}
async function publishAccepted(me, list3, relays, previous, withdrawn, save) {
  const payload = listPayload({ version: (previous?.version ?? 0) + 1, previous: previous?.act ?? null, merged: [], entries: withdrawn ? /* @__PURE__ */ new Map() : list3.entries }, withdrawn);
  let made;
  try {
    made = await me.signNow(ACCEPTED_SPEC, PUBLISHED_LIST, payload, { public: true });
  } finally {
    await save();
  }
  let left = 0;
  for (const r of relays) {
    try {
      await relayAt(r, me.via).putAct(made.act);
      left++;
    } catch {
    }
  }
  if (!left) throw new Error("No relay took the published list.");
  return made.id;
}

// ../../modules/jpeg/src/jpeg.ts
var NotJpeg = class extends Error {
};
var SOI = 216;
var EOI = 217;
var SOS = 218;
var DNL = 220;
var APP0 = 224;
var APP1 = 225;
var APP2 = 226;
var APP13 = 237;
var APP14 = 238;
var COM = 254;
function isFrame(m) {
  return m >= 192 && m <= 207 && m !== 196 && m !== 200 && m !== 204;
}
var PROCESS = {
  192: "baseline",
  193: "extended sequential",
  194: "progressive",
  195: "lossless",
  197: "differential sequential",
  198: "differential progressive",
  199: "differential lossless",
  201: "extended sequential, arithmetic coding",
  202: "progressive, arithmetic coding",
  203: "lossless, arithmetic coding",
  205: "differential sequential, arithmetic coding",
  206: "differential progressive, arithmetic coding",
  207: "differential lossless, arithmetic coding"
};
var ascii = (b, from, s) => {
  if (b.length < from + s.length) return false;
  for (let i = 0; i < s.length; i++) if (b[from + i] !== s.charCodeAt(i)) return false;
  return true;
};
var u16 = (b, i) => b[i] << 8 | b[i + 1];
function segments(b) {
  if (b.length < 4 || b[0] !== 255 || b[1] !== SOI) throw new NotJpeg("it does not begin with a JPEG start marker");
  const out = [];
  let i = 2;
  let frameSeen = false;
  let hierarchical = false;
  for (; ; ) {
    if (i >= b.length) throw new NotJpeg("it ends before its end marker");
    if (b[i] !== 255) throw new NotJpeg(`a byte that is not a marker at ${i}`);
    while (i < b.length && b[i] === 255) i++;
    if (i >= b.length) throw new NotJpeg("it ends before its end marker");
    const m = b[i];
    const start2 = i - 1;
    i++;
    if (m === EOI) {
      if (!frameSeen) throw new NotJpeg("it has no frame header");
      out.push({ marker: m, start: start2, end: i, body: new Uint8Array(0) });
      return { segments: out, end: i };
    }
    if (m === SOI) throw new NotJpeg("a second start marker before the end");
    if (m === 0 || m === 1 || m >= 208 && m <= 215) throw new NotJpeg(`a stray marker FF${hex2(m)} at ${start2}`);
    if (i + 2 > b.length) throw new NotJpeg("it ends inside a segment");
    const len = u16(b, i);
    if (len < 2 || i + len > b.length) throw new NotJpeg(`a segment runs past the end of the file at ${start2}`);
    const body = b.subarray(i + 2, i + len);
    i += len;
    if (m === 222) hierarchical = true;
    if (isFrame(m)) {
      if (frameSeen && !hierarchical) throw new NotJpeg("a second frame header");
      frameSeen = true;
    }
    if (m === SOS) {
      if (!frameSeen) throw new NotJpeg("a scan before the frame header");
      for (; ; ) {
        if (i + 1 >= b.length) throw new NotJpeg("it ends inside the compressed picture");
        if (b[i] === 255) {
          const n = b[i + 1];
          if (n === 0 || n >= 208 && n <= 215) {
            i += 2;
            continue;
          }
          if (n === 255) {
            i++;
            continue;
          }
          break;
        }
        i++;
      }
    }
    out.push({ marker: m, start: start2, end: i, body });
  }
}
var hex2 = (n) => n.toString(16).toUpperCase().padStart(2, "0");
function readExif(body) {
  const none2 = { orientation: null, location: false, thumbnail: false };
  if (!ascii(body, 0, "Exif\0\0")) return none2;
  const t = body.subarray(6);
  if (t.length < 8) return none2;
  const le = t[0] === 73 && t[1] === 73;
  const be = t[0] === 77 && t[1] === 77;
  if (!le && !be) return none2;
  const r16 = (o) => o + 2 > t.length ? -1 : le ? t[o] | t[o + 1] << 8 : t[o] << 8 | t[o + 1];
  const r32 = (o) => o + 4 > t.length ? -1 : le ? (t[o] | t[o + 1] << 8 | t[o + 2] << 16 | t[o + 3] << 24) >>> 0 : (t[o] << 24 | t[o + 1] << 16 | t[o + 2] << 8 | t[o + 3]) >>> 0;
  if (r16(2) !== 42) return none2;
  const ifd0 = r32(4);
  const entries = (o) => {
    const n = r16(o);
    if (n < 0 || o + 2 + 12 * n + 4 > t.length) return null;
    const list3 = [];
    for (let k = 0; k < n; k++) {
      const at = o + 2 + 12 * k;
      list3.push({ tag: r16(at), type: r16(at + 2), count: r32(at + 4), at: at + 8 });
    }
    return { list: list3, next: r32(o + 2 + 12 * n) };
  };
  const first = entries(ifd0);
  if (!first) return none2;
  let orientation = null;
  let location = false;
  for (const e3 of first.list) {
    if (e3.tag === 274 && e3.type === 3 && e3.count === 1) orientation = r16(e3.at);
    if (e3.tag === 34853) location = true;
  }
  let thumbnail = false;
  if (first.next > 0 && first.next < t.length) {
    const second = entries(first.next);
    if (second) thumbnail = second.list.some((e3) => e3.tag === 513 || e3.tag === 273);
  }
  return { orientation, location, thumbnail };
}
function read(b) {
  const { segments: segs, end } = segments(b);
  const frame = segs.find((s) => isFrame(s.marker));
  if (frame.body.length < 6) throw new NotJpeg("a frame header too short");
  const precision = frame.body[0];
  let height = u16(frame.body, 1);
  const width = u16(frame.body, 3);
  const components = frame.body[5];
  if (frame.body.length !== 6 + 3 * components) throw new NotJpeg("a frame header of the wrong length");
  if (width === 0) throw new NotJpeg("a picture zero pixels wide");
  if (components === 0) throw new NotJpeg("a picture with no colour component");
  if (height === 0) {
    const dnl = segs.find((s) => s.marker === DNL);
    if (!dnl || dnl.body.length !== 2 || u16(dnl.body, 0) === 0) throw new NotJpeg("a picture of no height");
    height = u16(dnl.body, 0);
  }
  const carries = /* @__PURE__ */ new Set();
  let orientation = null;
  let exifSeen = false;
  let colourProfile = false;
  let adobe = false;
  let jfifSeen = false;
  for (const s of segs) {
    const m = s.marker;
    if (m === APP0) {
      if (isJfif(s.body) && !jfifSeen) {
        jfifSeen = true;
        if (s.body[12] * s.body[13] > 0) carries.add("jfif-thumbnail");
      } else if (ascii(s.body, 0, "JFIF\0")) carries.add("other-application-data");
      else if (ascii(s.body, 0, "JFXX\0")) carries.add("jfxx-thumbnail");
      else carries.add("other-application-data");
    } else if (m === APP1) {
      if (ascii(s.body, 0, "Exif\0\0")) {
        const e3 = readExif(s.body);
        if (!exifSeen) orientation = e3.orientation;
        exifSeen = true;
        if (e3.location) carries.add("location");
        if (e3.thumbnail) carries.add("exif-thumbnail");
        if (!isOnlyOrientation(s.body)) carries.add("exif");
      } else if (ascii(s.body, 0, "http://ns.adobe.com/xap/1.0/") || ascii(s.body, 0, "http://ns.adobe.com/xmp/")) {
        carries.add("xmp");
      } else carries.add("other-application-data");
    } else if (m === APP2) {
      if (ascii(s.body, 0, "ICC_PROFILE\0")) colourProfile = true;
      else if (ascii(s.body, 0, "MPF\0")) carries.add("multi-picture");
      else carries.add("other-application-data");
    } else if (m === APP13) {
      carries.add("iptc");
    } else if (m === APP14) {
      if (ascii(s.body, 0, "Adobe")) adobe = true;
      else carries.add("other-application-data");
    } else if (m > APP0 && m <= 239) {
      carries.add("other-application-data");
    } else if (m === COM) {
      carries.add("comment");
    }
  }
  if (end < b.length) carries.add("bytes-after-end");
  const o = orientation !== null && orientation >= 1 && orientation <= 8 ? orientation : 1;
  const turned = o >= 5;
  return {
    frame: frame.marker,
    process: PROCESS[frame.marker] ?? "unknown",
    precision,
    width,
    height,
    components,
    orientation: o,
    shownWidth: turned ? height : width,
    shownHeight: turned ? width : height,
    colourProfile,
    adobe,
    end,
    carries: [...carries],
    segments: segs
  };
}
function orientationExif(orientation) {
  if (!Number.isInteger(orientation) || orientation < 2 || orientation > 8) throw new Error("an orientation from 2 to 8");
  return Uint8Array.from([
    69,
    120,
    105,
    102,
    0,
    0,
    77,
    77,
    0,
    42,
    0,
    0,
    0,
    8,
    0,
    1,
    1,
    18,
    0,
    3,
    0,
    0,
    0,
    1,
    0,
    orientation,
    0,
    0,
    0,
    0,
    0,
    0
  ]);
}
function isJfif(body) {
  return ascii(body, 0, "JFIF\0") && body.length >= 14;
}
function isOnlyOrientation(body) {
  const e3 = readExif(body);
  if (e3.orientation === null || e3.orientation < 2 || e3.orientation > 8) return false;
  const want = orientationExif(e3.orientation);
  return body.length === want.length && body.every((x, i) => x === want[i]);
}
function strip(b) {
  const p = read(b);
  const parts = [Uint8Array.from([255, SOI])];
  const hasJfif = p.segments.some((s) => s.marker === APP0 && isJfif(s.body));
  if (!hasJfif && p.orientation !== 1) parts.push(segment(APP1, orientationExif(p.orientation)));
  let jfifDone = false;
  for (const s of p.segments) {
    const m = s.marker;
    if (m === EOI) break;
    if (m === APP0 && isJfif(s.body) && !jfifDone) {
      const body = s.body.slice(0, 14);
      body[12] = 0;
      body[13] = 0;
      parts.push(segment(APP0, body));
      jfifDone = true;
      if (p.orientation !== 1) parts.push(segment(APP1, orientationExif(p.orientation)));
      continue;
    }
    if (m >= APP0 && m <= 239) {
      if (m === APP2 && ascii(s.body, 0, "ICC_PROFILE\0")) parts.push(b.subarray(s.start, s.end));
      else if (m === APP14 && ascii(s.body, 0, "Adobe")) parts.push(b.subarray(s.start, s.end));
      continue;
    }
    if (m === COM) continue;
    parts.push(b.subarray(s.start, s.end));
  }
  parts.push(Uint8Array.from([255, EOI]));
  const bytes = concat(parts);
  const after = read(bytes);
  if (after.carries.length) throw new Error(`stripping left ${after.carries.join(", ")}`);
  return { bytes, removed: p.carries, picture: after };
}
function segment(marker, body) {
  const out = new Uint8Array(4 + body.length);
  out[0] = 255;
  out[1] = marker;
  out[2] = body.length + 2 >> 8;
  out[3] = body.length + 2 & 255;
  out.set(body, 4);
  return out;
}
function concat(parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

// ../../modules/video/src/video.ts
var NotFilm = class extends Error {
  constructor(kind, message5) {
    super(message5);
    this.kind = kind;
    this.name = "NotFilm";
  }
};
var MAX_BYTES = 64 * 1024 * 1024 - 16;
var MAX_SECONDS = 600;
var MAX_LONG_SIDE = 1920;
var MAX_SHORT_SIDE = 1080;
var MAX_RATE = 60;
var MAX_LEVEL = 42;
var MAX_SAMPLE_RATE = 48e3;
var CARRIED_WORDS = {
  metadata: "metadata (titles, dates, the device, comments, cover pictures)",
  location: "where it was filmed",
  dates: "when it was made (the dates in its headers)",
  names: "names written by the software that made it",
  free: "free space that can hold anything",
  unknown: "boxes of a kind no player reads (such as XMP)",
  "unused-media": "media data no sample uses",
  descriptor: "an MPEG-4 object descriptor (iods), not needed to play"
};
var ascii2 = (b, o, n) => String.fromCharCode(...b.subarray(o, o + n));
var Reader = class {
  constructor(b) {
    this.b = b;
    this.view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  }
  view;
  need(o, n, end, what) {
    if (o < 0 || n < 0 || o + n > end) throw new NotFilm("structure", `${what} runs past its box`);
  }
  u8 = (o) => this.b[o];
  u16 = (o) => this.view.getUint16(o);
  u32 = (o) => this.view.getUint32(o);
  i32 = (o) => this.view.getInt32(o);
  u64(o) {
    const hi = this.u32(o);
    if (hi > 2097151) throw new NotFilm("limits", "a 64-bit value beyond what a file of this size can hold");
    return hi * 2 ** 32 + this.u32(o + 4);
  }
  /** The boxes between `o` and `end`, which they must fill exactly. A size of 0 (to the end) only where `toEnd` allows. */
  boxes(o, end, toEnd = false) {
    const out = [];
    while (o < end) {
      if (end - o < 8) throw new NotFilm("structure", "bytes left over that are not a box");
      let size = this.u32(o);
      const type = ascii2(this.b, o + 4, 4);
      let body = o + 8;
      if (size === 1) {
        if (end - o < 16) throw new NotFilm("structure", `the box ${JSON.stringify(type)} runs past its parent`);
        size = this.u64(o + 8);
        body = o + 16;
      } else if (size === 0) {
        if (!toEnd) throw new NotFilm("structure", `the box ${JSON.stringify(type)} has no size`);
        size = end - o;
      }
      if (type === "uuid") body += 16;
      if (size < body - o || o + size > end) throw new NotFilm("structure", `the box ${JSON.stringify(type)} runs past its parent`);
      out.push({ type, start: o, body, end: o + size });
      o += size;
    }
    return out;
  }
};
var ASIDE = { udta: "metadata", meta: "metadata", free: "free", skip: "free", uuid: "unknown" };
function children(r, box2, allowed, carried, where, skip = 0) {
  const out = [];
  for (const c of r.boxes(box2.body + skip, box2.end)) {
    if (allowed.includes(c.type)) out.push(c);
    else if (c.type in ASIDE) {
      carried.add(ASIDE[c.type]);
      if (c.type === "udta" || c.type === "meta") inspectAside(r, c, carried);
    } else throw new NotFilm("refused", `a box of kind ${JSON.stringify(c.type)} in ${where}, which this Module does not read`);
  }
  return out;
}
function inspectAside(r, box2, carried) {
  let kids;
  try {
    kids = r.boxes(box2.body + (box2.type === "meta" ? 4 : 0), box2.end);
  } catch {
    try {
      kids = box2.type === "meta" ? r.boxes(box2.body, box2.end) : [];
    } catch {
      kids = [];
    }
  }
  for (const k of kids) {
    if (k.type === "loci" || k.type === "\xA9xyz") carried.add("location");
    if (k.type === "dinf") throw new NotFilm("refused", "a data reference inside the metadata, which could point outside the file");
    if (k.type === "meta" || k.type === "udta" || k.type === "ilst" || k.type === "keys") inspectAside(r, k, carried);
    if (k.type === "ilst" || k.type === "keys") {
      if (/location|©xyz/i.test(ascii2(r.b, k.body, k.end - k.body))) carried.add("location");
    }
  }
}
var one = (list3, type, where) => {
  const f = list3.filter((b) => b.type === type);
  if (f.length !== 1) throw new NotFilm("structure", `${where} has ${f.length ? "more than one" : "no"} ${JSON.stringify(type)}`);
  return f[0];
};
var maybe = (list3, type, where) => {
  const f = list3.filter((b) => b.type === type);
  if (f.length > 1) throw new NotFilm("structure", `${where} has more than one ${JSON.stringify(type)}`);
  return f[0] ?? null;
};
var Bits = class {
  constructor(b) {
    this.b = b;
  }
  bit = 0;
  u(n) {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const byte = this.bit >> 3;
      if (byte >= this.b.length) throw new NotFilm("structure", "the parameter set ends early");
      v = v * 2 + (this.b[byte] >> 7 - (this.bit & 7) & 1);
      this.bit++;
    }
    return v;
  }
  ue() {
    let zeros = 0;
    while (this.u(1) === 0) if (++zeros > 31) throw new NotFilm("structure", "the parameter set holds a number too large");
    return 2 ** zeros - 1 + this.u(zeros);
  }
  se() {
    const k = this.ue();
    return k & 1 ? (k + 1) / 2 : -k / 2;
  }
};
function unescape(nal) {
  const out = [];
  for (let i = 0; i < nal.length; i++) {
    if (i >= 2 && nal[i] === 3 && nal[i - 1] === 0 && nal[i - 2] === 0) continue;
    out.push(nal[i]);
  }
  return new Uint8Array(out);
}
var PROFILES = { 66: "Baseline", 77: "Main", 100: "High" };
function readSps(nal) {
  if (!nal.length || (nal[0] & 31) !== 7) throw new NotFilm("structure", "the H.264 configuration does not hold a sequence parameter set");
  const s = new Bits(unescape(nal.subarray(1)));
  const profile = s.u(8);
  s.u(8);
  const level = s.u(8);
  s.ue();
  if ([100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135].includes(profile)) {
    const chroma = s.ue();
    if (chroma !== 1) throw new NotFilm("refused", "H.264 with colour sampled otherwise than 4:2:0, which phones do not all play");
    if (s.ue() !== 0 || s.ue() !== 0) throw new NotFilm("refused", "H.264 with more than 8 bits a sample, which phones do not all play");
    s.u(1);
    if (s.u(1)) {
      for (let i = 0; i < 8; i++) {
        if (!s.u(1)) continue;
        const n = i < 6 ? 16 : 64;
        let last = 8;
        let next = 8;
        for (let j = 0; j < n && next !== 0; j++) {
          next = (last + s.se() + 256) % 256;
          last = next === 0 ? last : next;
        }
      }
    }
  }
  s.ue();
  const poc = s.ue();
  if (poc === 0) s.ue();
  else if (poc === 1) {
    s.u(1);
    s.se();
    s.se();
    const n = s.ue();
    if (n > 255) throw new NotFilm("structure", "the parameter set is not valid");
    for (let i = 0; i < n; i++) s.se();
  }
  s.ue();
  s.u(1);
  const wMbs = s.ue() + 1;
  const hMaps = s.ue() + 1;
  const frameOnly = s.u(1);
  if (!frameOnly) throw new NotFilm("refused", "interlaced H.264, which this Module does not play");
  s.u(1);
  let crop = [0, 0, 0, 0];
  if (s.u(1)) crop = [s.ue(), s.ue(), s.ue(), s.ue()];
  const width = wMbs * 16 - 2 * (crop[0] + crop[1]);
  const height = hMaps * 16 - 2 * (crop[2] + crop[3]);
  if (width <= 0 || height <= 0) throw new NotFilm("structure", "the parameter set crops away the whole picture");
  return { profile, level, width, height };
}
function readAvcC(r, box2) {
  const b = r.b;
  r.need(box2.body, 6, box2.end, "the H.264 configuration");
  if (b[box2.body] !== 1) throw new NotFilm("structure", "the H.264 configuration is not version 1");
  const profile = b[box2.body + 1];
  const compat = b[box2.body + 2];
  const level = b[box2.body + 3];
  if (![0, 1, 3].includes(b[box2.body + 4] & 3)) throw new NotFilm("structure", "the H.264 configuration names an invalid length size");
  let o = box2.body + 5;
  const nSps = b[o++] & 31;
  if (!nSps) throw new NotFilm("structure", "the H.264 configuration holds no sequence parameter set");
  let first = null;
  for (let i = 0; i < nSps; i++) {
    r.need(o, 2, box2.end, "the H.264 configuration");
    const n = r.u16(o);
    r.need(o + 2, n, box2.end, "a sequence parameter set");
    first ??= b.subarray(o + 2, o + 2 + n);
    o += 2 + n;
  }
  r.need(o, 1, box2.end, "the H.264 configuration");
  const nPps = b[o++];
  if (!nPps) throw new NotFilm("structure", "the H.264 configuration holds no picture parameter set");
  for (let i = 0; i < nPps; i++) {
    r.need(o, 2, box2.end, "the H.264 configuration");
    const n = r.u16(o);
    r.need(o + 2, n, box2.end, "a picture parameter set");
    o += 2 + n;
  }
  const sps = readSps(first);
  if (sps.profile !== profile || sps.level !== level) throw new NotFilm("structure", "the H.264 configuration and its parameter set disagree");
  return { profile, compat, level, width: sps.width, height: sps.height };
}
function descriptor(r, o, end) {
  r.need(o, 2, end, "a descriptor");
  const tag = r.b[o++];
  let len = 0;
  for (let i = 0; i < 4; i++) {
    r.need(o, 1, end, "a descriptor");
    const x = r.b[o++];
    len = len * 128 + (x & 127);
    if (!(x & 128)) break;
    if (i === 3) throw new NotFilm("structure", "a descriptor length is too long");
  }
  r.need(o, len, end, "a descriptor");
  return { tag, body: o, end: o + len };
}
function readEsds(r, box2) {
  const b = r.b;
  const es = descriptor(r, box2.body + 4, box2.end);
  if (es.tag !== 3) throw new NotFilm("structure", "the sound configuration has no elementary stream descriptor");
  r.need(es.body, 3, es.end, "the sound configuration");
  const flags = b[es.body + 2];
  let o = es.body + 3;
  if (flags & 128) o += 2;
  if (flags & 64) throw new NotFilm("refused", "the sound names a stream elsewhere (a URL), which a film may not");
  if (flags & 32) o += 2;
  const dc = descriptor(r, o, es.end);
  if (dc.tag !== 4) throw new NotFilm("structure", "the sound configuration has no decoder configuration");
  r.need(dc.body, 13, dc.end, "the decoder configuration");
  if (b[dc.body] !== 64 || b[dc.body + 1] >> 2 !== 5) throw new NotFilm("refused", "sound that is not MPEG-4 audio (AAC): only AAC-LC is played");
  const asc = descriptor(r, dc.body + 13, dc.end);
  if (asc.tag !== 5) throw new NotFilm("structure", "the sound configuration has no AAC configuration");
  const bits = new Bits(b.subarray(asc.body, asc.end));
  const aot = bits.u(5);
  if (aot !== 2) throw new NotFilm("refused", `AAC of another kind than AAC-LC (audio object type ${aot}), which this Module does not play`);
  const fi = bits.u(4);
  const RATES = [96e3, 88200, 64e3, 48e3, 44100, 32e3, 24e3, 22050, 16e3, 12e3, 11025, 8e3, 7350];
  const sampleRate = fi === 15 ? bits.u(24) : RATES[fi];
  if (!sampleRate) throw new NotFilm("structure", "the AAC configuration names no sampling rate");
  const channels = bits.u(4);
  if (channels !== 1 && channels !== 2) throw new NotFilm("refused", "sound with more than two channels, or channels set elsewhere: only mono and stereo are played");
  if (sampleRate > MAX_SAMPLE_RATE) throw new NotFilm("limits", `sound sampled at ${sampleRate} Hz, above ${MAX_SAMPLE_RATE}`);
  return { channels, sampleRate };
}
var MATRIX = {
  "65536,0,0,65536": 0,
  "0,65536,-65536,0": 90,
  "-65536,0,0,-65536": 180,
  "0,-65536,65536,0": 270
};
function rotationOf(r, o) {
  const m = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => r.i32(o + 4 * i));
  if (m[2] !== 0 || m[5] !== 0 || m[8] !== 1073741824) throw new NotFilm("refused", "a track matrix that is not a quarter turn");
  const rot = MATRIX[[m[0], m[1], m[3], m[4]].join(",")];
  if (rot === void 0) throw new NotFilm("refused", "a track matrix that is not a quarter turn (scaled, skewed or mirrored)");
  return rot;
}
function dates(r, box2, v) {
  const at = box2.body + 4;
  const n = v ? 16 : 8;
  return { at, n, set: r.b.subarray(at, at + n).some((x) => x !== 0) };
}
function version(r, box2, allowed) {
  r.need(box2.body, 4, box2.end, `the box ${box2.type}`);
  const v = r.b[box2.body];
  if (!allowed.includes(v)) throw new NotFilm("structure", `the box ${box2.type} has version ${v}`);
  return v;
}
function table(r, box2, entrySize, skip = 4) {
  r.need(box2.body, skip + 4, box2.end, `the table ${box2.type}`);
  const n = r.u32(box2.body + skip);
  const o = box2.body + skip + 4;
  if (n * entrySize > box2.end - o) throw new NotFilm("structure", `the table ${box2.type} runs past its box`);
  return { n, o };
}
var STBL = ["stsd", "stts", "ctts", "stss", "stsc", "stsz", "stco", "co64", "sdtp", "sgpd", "sbgp", "cslg", "stps"];
var VISUAL_EXTRAS = ["avcC", "btrt", "pasp", "colr", "clap", "fiel"];
var AUDIO_EXTRAS = ["esds", "btrt"];
function readTrack(r, trak, carried) {
  const kids = children(r, trak, ["tkhd", "edts", "mdia"], carried, "a track");
  const tkhd = one(kids, "tkhd", "a track");
  const tv = version(r, tkhd, [0, 1]);
  const matrixAt = tkhd.body + 4 + (tv ? 32 : 20) + 16;
  r.need(matrixAt, 36 + 8, tkhd.end, "the track header");
  const rotation = rotationOf(r, matrixAt);
  if (dates(r, tkhd, tv).set) carried.add("dates");
  const edts = maybe(kids, "edts", "a track");
  if (edts) for (const e3 of children(r, edts, ["elst"], carried, "an edit list")) version(r, e3, [0, 1]);
  const mdia = one(kids, "mdia", "a track");
  const mk = children(r, mdia, ["mdhd", "hdlr", "minf"], carried, "a track");
  const mdhd = one(mk, "mdhd", "a track");
  const mv = version(r, mdhd, [0, 1]);
  r.need(mdhd.body, mv ? 32 : 20, mdhd.end, "the media header");
  const timescale = r.u32(mdhd.body + (mv ? 20 : 12));
  if (!timescale) throw new NotFilm("structure", "a track with no timescale");
  if (dates(r, mdhd, mv).set) carried.add("dates");
  const hdlr = one(mk, "hdlr", "a track");
  r.need(hdlr.body, 24, hdlr.end, "the handler");
  const handler = ascii2(r.b, hdlr.body + 8, 4);
  if (handler !== "vide" && handler !== "soun") {
    throw new NotFilm("refused", `a track of kind ${JSON.stringify(handler)} (text, subtitles, timecode, metadata or hints): a film holds pictures and sound only`);
  }
  const named2 = hdlr.end - (hdlr.body + 24) > 1 || hdlr.end > hdlr.body + 24 && r.b[hdlr.body + 24] !== 0;
  const minf = one(mk, "minf", "a track");
  const nk = children(r, minf, ["vmhd", "smhd", "dinf", "stbl", "hdlr"], carried, "a track");
  one(nk, handler === "vide" ? "vmhd" : "smhd", "a track");
  const dinf = one(nk, "dinf", "a track");
  const dref = one(children(r, dinf, ["dref"], carried, "a data reference"), "dref", "a data reference");
  const refs = table(r, dref, 12);
  const entries = r.boxes(refs.o, dref.end);
  if (entries.length !== refs.n || refs.n !== 1) throw new NotFilm("refused", "a track whose data references are not exactly one");
  const ref = entries[0];
  if (ref.type !== "url " && ref.type !== "urn " || ref.end - ref.body < 4 || !(r.b[ref.body + 3] & 1)) {
    throw new NotFilm("refused", "a track whose samples are stored outside this file (a data reference to elsewhere)");
  }
  const stbl = one(nk, "stbl", "a track");
  const sk = children(r, stbl, STBL, carried, "a sample table");
  const stsd = one(sk, "stsd", "a sample table");
  const sd = table(r, stsd, 8);
  const descs = r.boxes(sd.o, stsd.end);
  if (sd.n !== 1 || descs.length !== 1) throw new NotFilm("refused", "a track with more than one sample description");
  const entry = descs[0];
  const t = { handler, timescale, mediaDuration: 0, samples: 0, chunks: [], rotation, names: named2 };
  if (handler === "vide") {
    if (entry.type !== "avc1") {
      const what = entry.type === "encv" ? "encrypted pictures" : entry.type === "avc3" ? "H.264 with its parameter sets in the stream (avc3)" : `pictures coded as ${JSON.stringify(entry.type)}, not H.264`;
      throw new NotFilm("refused", `${what}: only H.264 (avc1) is played`);
    }
    r.need(entry.body, 78, entry.end, "the picture description");
    if (r.b.subarray(entry.body + 42, entry.body + 74).some((x) => x !== 0)) t.names = true;
    const ex = children(r, { ...entry, body: entry.body + 78 }, VISUAL_EXTRAS, carried, "the picture description");
    const v = readAvcC(r, one(ex, "avcC", "the picture description"));
    if (!PROFILES[v.profile]) throw new NotFilm("refused", `H.264 profile ${v.profile}: only Baseline, Main and High are played`);
    t.video = v;
  } else {
    if (entry.type !== "mp4a") {
      throw new NotFilm("refused", `${entry.type === "enca" ? "encrypted sound" : `sound coded as ${JSON.stringify(entry.type)}`}: only AAC-LC (mp4a) is played`);
    }
    r.need(entry.body, 28, entry.end, "the sound description");
    if (r.u16(entry.body + 8) !== 0) throw new NotFilm("refused", "a QuickTime sound description (version 1 or 2), not MP4");
    const ex = children(r, { ...entry, body: entry.body + 28 }, AUDIO_EXTRAS, carried, "the sound description");
    t.audio = readEsds(r, one(ex, "esds", "the sound description"));
  }
  const stts = table(r, one(sk, "stts", "a sample table"), 8);
  let timed = 0;
  for (let i = 0; i < stts.n; i++) {
    const count2 = r.u32(stts.o + 8 * i);
    timed += count2;
    t.mediaDuration += count2 * r.u32(stts.o + 8 * i + 4);
  }
  const stsz = one(sk, "stsz", "a sample table");
  r.need(stsz.body, 12, stsz.end, "the sample sizes");
  const fixed = r.u32(stsz.body + 4);
  const count = r.u32(stsz.body + 8);
  if (!fixed && count * 4 > stsz.end - (stsz.body + 12)) throw new NotFilm("structure", "the sample sizes run past their box");
  const sizeOf = (i) => fixed ? fixed : r.u32(stsz.body + 12 + 4 * i);
  if (count !== timed) throw new NotFilm("structure", "a track whose sample count and timing disagree");
  if (!count) throw new NotFilm("structure", "a track with no samples");
  t.samples = count;
  const ctts = maybe(sk, "ctts", "a sample table");
  if (ctts) {
    const c = table(r, ctts, 8);
    let n = 0;
    for (let i = 0; i < c.n; i++) n += r.u32(c.o + 8 * i);
    if (n !== count) throw new NotFilm("structure", "a track whose composition offsets and samples disagree");
  }
  const stss = maybe(sk, "stss", "a sample table");
  if (stss) {
    const s = table(r, stss, 4);
    for (let i = 0; i < s.n; i++) {
      const k = r.u32(s.o + 4 * i);
      if (k < 1 || k > count) throw new NotFilm("structure", "a key picture that is not a sample");
    }
  }
  const stco = maybe(sk, "stco", "a sample table");
  const co64 = maybe(sk, "co64", "a sample table");
  if (!stco === !co64) throw new NotFilm("structure", "a track without exactly one chunk offset table");
  const co = table(r, stco ?? co64, stco ? 4 : 8);
  const offsets = Array.from({ length: co.n }, (_, i) => stco ? r.u32(co.o + 4 * i) : r.u64(co.o + 8 * i));
  const stsc = table(r, one(sk, "stsc", "a sample table"), 12);
  let sample = 0;
  for (let i = 0; i < stsc.n; i++) {
    const first = r.u32(stsc.o + 12 * i);
    const per = r.u32(stsc.o + 12 * i + 4);
    if (r.u32(stsc.o + 12 * i + 8) !== 1) throw new NotFilm("structure", "a chunk naming a sample description that is not there");
    const next = i + 1 < stsc.n ? r.u32(stsc.o + 12 * (i + 1)) : co.n + 1;
    if (first < 1 || next <= first || next > co.n + 1 || i === 0 && first !== 1) throw new NotFilm("structure", "the sample-to-chunk table is not in order");
    for (let c = first; c < next; c++) {
      let size = 0;
      for (let k = 0; k < per; k++) {
        if (sample >= count) throw new NotFilm("structure", "chunks hold more samples than the track has");
        size += sizeOf(sample++);
      }
      t.chunks.push({ offset: offsets[c - 1], size });
    }
  }
  if (sample !== count || t.chunks.length !== co.n) throw new NotFilm("structure", "chunks and samples disagree");
  return t;
}
var BRANDS = ["isom", "iso2", "iso3", "iso4", "iso5", "iso6", "mp41", "mp42", "avc1"];
function parse(bytes) {
  if (bytes.length > MAX_BYTES) throw new NotFilm("limits", `${bytes.length} bytes, above ${MAX_BYTES} (one media object of 64 MiB, locked)`);
  const r = new Reader(bytes);
  if (bytes.length < 8 || ascii2(bytes, 4, 4) !== "ftyp") throw new NotFilm("structure", "it does not begin with a file type box (ftyp)");
  const top2 = r.boxes(0, bytes.length, true);
  const carried = /* @__PURE__ */ new Set();
  const ftyp = top2[0];
  r.need(ftyp.body, 8, ftyp.end, "the file type");
  if ((ftyp.end - ftyp.body) % 4) throw new NotFilm("structure", "the file type box is not whole brands");
  const major = ascii2(bytes, ftyp.body, 4);
  const brands = [major];
  for (let o = ftyp.body + 8; o < ftyp.end; o += 4) brands.push(ascii2(bytes, o, 4));
  if (major === "qt  ") throw new NotFilm("refused", "a QuickTime file (.mov), not MP4: remux it as MP4 first");
  if (!brands.some((b) => BRANDS.includes(b))) throw new NotFilm("refused", `brands ${brands.join(", ")}: none is an MP4 brand`);
  const mdats = [];
  let moov = null;
  let indexFirst = false;
  for (const b of top2.slice(1)) {
    if (b.type === "moov") {
      if (moov) throw new NotFilm("structure", "more than one movie box (moov)");
      moov = b;
      indexFirst = !mdats.length;
    } else if (b.type === "mdat") mdats.push(b);
    else if (b.type === "ftyp") throw new NotFilm("structure", "more than one file type box");
    else if (["moof", "mfra", "sidx", "styp", "ssix", "emsg", "prft"].includes(b.type)) {
      throw new NotFilm("refused", "a fragmented MP4 (as a live stream writes): only a whole film with one index is played");
    } else if (b.type in ASIDE) {
      carried.add(ASIDE[b.type]);
      if (b.type === "udta" || b.type === "meta") inspectAside(r, b, carried);
    } else throw new NotFilm("refused", `a box of kind ${JSON.stringify(b.type)} at the top of the file, which this Module does not read`);
  }
  if (!moov) throw new NotFilm("structure", "no movie box (moov): the film has no index");
  const mk = children(r, moov, ["mvhd", "trak", "iods", "mvex"], carried, "the movie");
  if (mk.some((b) => b.type === "mvex")) throw new NotFilm("refused", "a fragmented MP4 (mvex): only a whole film with one index is played");
  if (mk.some((b) => b.type === "iods")) carried.add("descriptor");
  const mvhd = one(mk, "mvhd", "the movie");
  const mv = version(r, mvhd, [0, 1]);
  r.need(mvhd.body, mv ? 112 : 100, mvhd.end, "the movie header");
  const mScale = r.u32(mvhd.body + (mv ? 20 : 12));
  const mDur = mv ? r.u64(mvhd.body + 24) : r.u32(mvhd.body + 16);
  if (!mScale) throw new NotFilm("structure", "the movie has no timescale");
  if (dates(r, mvhd, mv).set) carried.add("dates");
  if (rotationOf(r, mvhd.body + (mv ? 48 : 36)) !== 0) throw new NotFilm("refused", "a movie matrix that is not the identity");
  const traks = mk.filter((b) => b.type === "trak");
  const tracks = traks.map((t) => readTrack(r, t, carried));
  const video = tracks.filter((t) => t.handler === "vide");
  const audio = tracks.filter((t) => t.handler === "soun");
  if (video.length !== 1) throw new NotFilm("refused", `${video.length || "no"} picture tracks: a film has exactly one`);
  if (audio.length > 1) throw new NotFilm("refused", `${audio.length} sound tracks: a film has one at most`);
  if (tracks.some((t) => t.names)) carried.add("names");
  const chunks = tracks.flatMap((t) => t.chunks).sort((a2, b) => a2.offset - b.offset);
  let used = 0;
  let prevEnd = 0;
  for (const c of chunks) {
    if (c.offset < prevEnd) throw new NotFilm("structure", "two chunks of samples overlap");
    if (!mdats.some((m) => c.offset >= m.body && c.offset + c.size <= m.end)) throw new NotFilm("structure", "a chunk of samples lies outside the media data");
    prevEnd = c.offset + c.size;
    used += c.size;
  }
  if (used < mdats.reduce((n, m) => n + (m.end - m.body), 0)) carried.add("unused-media");
  const v = video[0];
  const turned = v.rotation === 90 || v.rotation === 270;
  const vv = v.video;
  const long = Math.max(vv.width, vv.height);
  const short5 = Math.min(vv.width, vv.height);
  if (long > MAX_LONG_SIDE || short5 > MAX_SHORT_SIDE) throw new NotFilm("limits", `pictures of ${vv.width} x ${vv.height}, beyond ${MAX_LONG_SIDE} x ${MAX_SHORT_SIDE}`);
  if (vv.level > MAX_LEVEL) throw new NotFilm("limits", `H.264 level ${vv.level / 10}, above ${MAX_LEVEL / 10}`);
  const seconds = Math.max(mDur / mScale, ...tracks.map((t) => t.mediaDuration / t.timescale));
  if (seconds > MAX_SECONDS) throw new NotFilm("limits", `${Math.round(seconds)} seconds long, beyond ${MAX_SECONDS}`);
  const vSeconds = v.mediaDuration / v.timescale;
  const rate = vSeconds > 0 ? v.samples / vSeconds : Infinity;
  if (rate > MAX_RATE * 1.01) throw new NotFilm("limits", `${Math.round(rate)} pictures a second, beyond ${MAX_RATE}`);
  const hex22 = (n) => n.toString(16).padStart(2, "0");
  const vcodec = `avc1.${hex22(vv.profile)}${hex22(vv.compat)}${hex22(vv.level)}`;
  const a = audio[0];
  const film = {
    brand: major,
    duration: Math.round(seconds * 1e3) / 1e3,
    video: {
      codec: vcodec,
      profile: PROFILES[vv.profile],
      level: vv.level,
      width: vv.width,
      height: vv.height,
      rotation: v.rotation,
      shown: turned ? { width: vv.height, height: vv.width } : { width: vv.width, height: vv.height },
      samples: v.samples,
      rate: Math.round(rate * 1e3) / 1e3
    },
    audio: a ? { codec: "mp4a.40.2", channels: a.audio.channels, sampleRate: a.audio.sampleRate, samples: a.samples } : null,
    type: `video/mp4; codecs="${vcodec}${a ? ", mp4a.40.2" : ""}"`,
    indexFirst,
    carried: Object.keys(CARRIED_WORDS).filter((c) => carried.has(c))
  };
  return { film, ftyp, moov, tracks, traks };
}
function read2(bytes) {
  try {
    return parse(bytes).film;
  } catch (e3) {
    if (e3 instanceof NotFilm) throw e3;
    if (e3 instanceof RangeError) throw new NotFilm("structure", "a box runs past the end of the file");
    throw e3;
  }
}
function box(type, ...parts) {
  const n = 8 + parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(n);
  new DataView(out.buffer).setUint32(0, n);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  let o = 8;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
function concat2(parts) {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
function strip2(bytes) {
  const p = parse(bytes);
  return { bytes: stripped(bytes, p), removed: p.film.carried };
}
function stripped(bytes, p) {
  const r = new Reader(bytes);
  const keep = (b) => bytes.subarray(b.start, b.end);
  const undated = (b) => {
    const out = bytes.slice(b.start, b.end);
    const d = dates(r, b, bytes[b.body]);
    out.fill(0, d.at - b.start, d.at - b.start + d.n);
    return out;
  };
  const drop = (list3) => list3.filter((b) => !(b.type in ASIDE) && b.type !== "iods");
  const kids = (b, skip = 0) => drop(r.boxes(b.body + skip, b.end));
  const all = p.tracks.flatMap((t) => t.chunks).sort((a, b) => a.offset - b.offset);
  const placed = /* @__PURE__ */ new Map();
  let at = 0;
  for (const c of all) {
    placed.set(c, at);
    at += c.size;
  }
  const rebuild = (mdatBody2) => {
    const traks = p.traks.map((trak, ti) => {
      const track2 = p.tracks[ti];
      const parts = kids(trak).map((b) => {
        if (b.type === "tkhd") return undated(b);
        if (b.type !== "mdia") return b.type === "edts" ? box("edts", ...kids(b).map(keep)) : keep(b);
        return box(
          "mdia",
          ...kids(b).map((m) => {
            if (m.type === "hdlr") {
              const fixed = bytes.slice(m.body, m.body + 24);
              return box("hdlr", fixed, new Uint8Array(1));
            }
            if (m.type === "mdhd") return undated(m);
            if (m.type !== "minf") return keep(m);
            return box(
              "minf",
              ...kids(m).filter((n) => n.type !== "hdlr").map((n) => {
                if (n.type === "dinf") return box("dinf", ...kids(n).map(keep));
                if (n.type !== "stbl") return keep(n);
                return box(
                  "stbl",
                  ...kids(n).map((s) => {
                    if (s.type === "stsd") {
                      const entry = r.boxes(s.body + 8, s.end)[0];
                      const head = bytes.slice(entry.body, entry.body + (track2.handler === "vide" ? 78 : 28));
                      if (track2.handler === "vide") head.fill(0, 42, 74);
                      const extras = kids(entry, head.length).map(keep);
                      return box("stsd", bytes.subarray(s.body, s.body + 8), box(entry.type, head, ...extras));
                    }
                    if (s.type === "stco" || s.type === "co64") {
                      const w = s.type === "stco" ? 4 : 8;
                      const out = new Uint8Array(8 + w * track2.chunks.length);
                      const dv = new DataView(out.buffer);
                      dv.setUint32(4, track2.chunks.length);
                      track2.chunks.forEach((c, i) => {
                        const o = mdatBody2 + placed.get(c);
                        if (w === 4) dv.setUint32(8 + 4 * i, o);
                        else {
                          dv.setUint32(8 + 8 * i, Math.floor(o / 2 ** 32));
                          dv.setUint32(12 + 8 * i, o % 2 ** 32);
                        }
                      });
                      return box(s.type, out);
                    }
                    return keep(s);
                  })
                );
              })
            );
          })
        );
      });
      return box("trak", ...parts);
    });
    const mvhd = r.boxes(p.moov.body, p.moov.end).find((b) => b.type === "mvhd");
    return box("moov", undated(mvhd), ...traks);
  };
  const ftyp = keep(p.ftyp);
  const size = rebuild(0).length;
  const mdatBody = ftyp.length + size + 8;
  const moov = rebuild(mdatBody);
  const media = new Uint8Array(at);
  for (const c of all) media.set(bytes.subarray(c.offset, c.offset + c.size), placed.get(c));
  return concat2([ftyp, moov, box("mdat", media)]);
}

// ../../modules/audio/src/audio.ts
var NotSound = class extends Error {
  constructor(kind, message5) {
    super(message5);
    this.kind = kind;
    this.name = "NotSound";
  }
};
var MAX_BYTES2 = 64 * 1024 * 1024 - 16;
var MAX_SECONDS2 = 7200;
var CARRIED_WORDS2 = {
  metadata: "metadata (titles, the artist, the album, dates, the device, comments, cover pictures)",
  location: "where it was recorded",
  dates: "when it was made (the dates in its headers)",
  names: "names written by the software that made it",
  free: "free space that can hold anything",
  unknown: "boxes of a kind no player reads (such as XMP)",
  "unused-media": "media data no sample uses",
  descriptor: "an MPEG-4 object descriptor (iods), not needed to play"
};
var said = (message5) => message5.replace("which a film may not", "which a recording may not");
function handlerOf(r, trak) {
  try {
    const mdia = r.boxes(trak.body, trak.end).find((b) => b.type === "mdia");
    const hdlr = mdia && r.boxes(mdia.body, mdia.end).find((b) => b.type === "hdlr");
    if (!hdlr || hdlr.end - hdlr.body < 12) return null;
    return String.fromCharCode(...r.b.subarray(hdlr.body + 8, hdlr.body + 12));
  } catch {
    return null;
  }
}
var BRANDS2 = ["M4A ", "isom", "iso2", "iso3", "iso4", "iso5", "iso6", "mp41", "mp42"];
var FRAGMENTS = ["moof", "mfra", "sidx", "styp", "ssix", "emsg", "prft"];
var PICTURES = ["vide", "pict", "auxv"];
function parse2(bytes) {
  if (bytes.length > MAX_BYTES2) throw new NotSound("limits", `${bytes.length} bytes, above ${MAX_BYTES2} (one media object of 64 MiB, locked)`);
  const ascii3 = (o, n) => String.fromCharCode(...bytes.subarray(o, o + n));
  const r = new Reader(bytes);
  if (bytes.length < 8 || ascii3(4, 4) !== "ftyp") throw new NotSound("structure", "it does not begin with a file type box (ftyp)");
  const top2 = r.boxes(0, bytes.length, true);
  const carried = /* @__PURE__ */ new Set();
  const ftyp = top2[0];
  r.need(ftyp.body, 8, ftyp.end, "the file type");
  if ((ftyp.end - ftyp.body) % 4) throw new NotSound("structure", "the file type box is not whole brands");
  const major = ascii3(ftyp.body, 4);
  const brands = [major];
  for (let o = ftyp.body + 8; o < ftyp.end; o += 4) brands.push(ascii3(o, 4));
  if (major === "qt  ") throw new NotSound("refused", "a QuickTime file (.mov), not M4A: remux it as M4A first");
  if (!brands.some((b) => BRANDS2.includes(b))) throw new NotSound("refused", `brands ${brands.join(", ")}: none is an M4A or MP4 brand`);
  const mdats = [];
  let moov = null;
  let indexFirst = false;
  for (const b of top2.slice(1)) {
    if (b.type === "moov") {
      if (moov) throw new NotSound("structure", "more than one movie box (moov)");
      moov = b;
      indexFirst = !mdats.length;
    } else if (b.type === "mdat") mdats.push(b);
    else if (b.type === "ftyp") throw new NotSound("structure", "more than one file type box");
    else if (FRAGMENTS.includes(b.type)) {
      throw new NotSound("refused", "a fragmented file (as a live stream writes): only a whole recording with one index is played");
    } else if (b.type in ASIDE) {
      carried.add(ASIDE[b.type]);
      if (b.type === "udta" || b.type === "meta") inspectAside(r, b, carried);
    } else throw new NotSound("refused", `a box of kind ${JSON.stringify(b.type)} at the top of the file, which this Module does not read`);
  }
  if (!moov) throw new NotSound("structure", "no movie box (moov): the recording has no index");
  if (!mdats.length) throw new NotSound("structure", "no media data box (mdat): the recording has no sound");
  const mk = children(r, moov, ["mvhd", "trak", "iods", "mvex"], carried, "the movie");
  if (mk.some((b) => b.type === "mvex")) throw new NotSound("refused", "a fragmented file (mvex): only a whole recording with one index is played");
  if (mk.some((b) => b.type === "iods")) carried.add("descriptor");
  const mvhd = one(mk, "mvhd", "the movie");
  const mv = version(r, mvhd, [0, 1]);
  r.need(mvhd.body, mv ? 112 : 100, mvhd.end, "the movie header");
  const mScale = r.u32(mvhd.body + (mv ? 20 : 12));
  const mDur = mv ? r.u64(mvhd.body + 24) : r.u32(mvhd.body + 16);
  if (!mScale) throw new NotSound("structure", "the movie has no timescale");
  if (dates(r, mvhd, mv).set) carried.add("dates");
  if (rotationOf(r, mvhd.body + (mv ? 48 : 36)) !== 0) throw new NotSound("refused", "a movie matrix that is not the identity");
  const traks = mk.filter((b) => b.type === "trak");
  const kinds = traks.map((t2) => handlerOf(r, t2));
  const pictures = kinds.filter((k) => k !== null && PICTURES.includes(k)).length;
  if (pictures) throw new NotSound("refused", `${pictures === 1 ? "a picture track" : `${pictures} picture tracks`}: an M4A file holds sound only (a film is the video Module's)`);
  const other = kinds.find((k) => k !== null && k !== "soun");
  if (other) throw new NotSound("refused", `a track of kind ${JSON.stringify(other)} (text, chapters, timecode, metadata or hints): an M4A file holds one sound track only`);
  if (traks.length !== 1) throw new NotSound("refused", `${traks.length || "no"} sound tracks: an M4A file holds exactly one`);
  const tracks = [readTrack(r, traks[0], carried)];
  const t = tracks[0];
  if (t.rotation !== 0) throw new NotSound("refused", "a sound track whose header turns pictures (its matrix is not the identity)");
  if (t.names) carried.add("names");
  let used = 0;
  let prevEnd = 0;
  for (const c of [...t.chunks].sort((a, b) => a.offset - b.offset)) {
    if (c.offset < prevEnd) throw new NotSound("structure", "two chunks of samples overlap");
    if (!mdats.some((m) => c.offset >= m.body && c.offset + c.size <= m.end)) throw new NotSound("structure", "a chunk of samples lies outside the media data");
    prevEnd = c.offset + c.size;
    used += c.size;
  }
  if (used < mdats.reduce((n, m) => n + (m.end - m.body), 0)) carried.add("unused-media");
  const seconds = Math.max(mDur / mScale, t.mediaDuration / t.timescale);
  if (seconds > MAX_SECONDS2) throw new NotSound("limits", `${Math.round(seconds)} seconds long, beyond ${MAX_SECONDS2}`);
  const sound = {
    brand: major,
    duration: Math.round(seconds * 1e3) / 1e3,
    audio: { codec: "mp4a.40.2", channels: t.audio.channels, sampleRate: t.audio.sampleRate, samples: t.samples },
    type: 'audio/mp4; codecs="mp4a.40.2"',
    indexFirst,
    carried: Object.keys(CARRIED_WORDS2).filter((c) => carried.has(c))
  };
  return { sound, ftyp, moov, tracks, traks };
}
function checked(f) {
  try {
    return f();
  } catch (e3) {
    if (e3 instanceof NotSound) throw e3;
    if (e3 instanceof NotFilm) throw new NotSound(e3.kind, said(e3.message));
    if (e3 instanceof RangeError) throw new NotSound("structure", "a box runs past the end of the file");
    throw e3;
  }
}
function read3(bytes) {
  return checked(() => parse2(bytes).sound);
}
function strip3(bytes) {
  return checked(() => {
    const p = parse2(bytes);
    return { bytes: stripped(bytes, p), removed: p.sound.carried };
  });
}

// ../longform/src/specs.ts
var test2 = (s) => sha2562(s);
var LONGFORM_SPECS = {
  /** The Text MIR (`TEXT`). */
  text: SPECS.text,
  /** The long-form text format cMIP (cmips/cmip-long-form-draft-1.md). */
  longform: test2("long-form text format cMIP, draft 1, test value until publication")
};
var TEXT_ACT = 0;

// ../barebone/src/specs.ts
var test3 = (s) => sha2562(s);
var POST_SPECS = {
  /** The Text MIR (`TEXT`). */
  text: LONGFORM_SPECS.text,
  /** The Envelopes MIR (`ENVELOPES`). */
  envelopes: SPECS.envelopes,
  /** The Money MIR (`MONEY`): its price tags. */
  money: MIRS.money,
  /** The long-form text format cMIP: a post naming it is rendered with it. */
  longform: LONGFORM_SPECS.longform,
  /** The JPEG Module (modules/module-jpeg-draft-1.md). */
  jpeg: test3("JPEG Module, draft 1, test value until publication"),
  /** The video Module (modules/module-video-draft-1.md): a film, named by its test value until publication, as the JPEG Module is. */
  video: test3("video Module, draft 1, test value until publication"),
  /** The audio Module (modules/module-audio-draft-1.md): a recording, named by its test value until publication, as the video Module is. */
  audio: test3("audio Module, draft 1, test value until publication")
};
var TEXT_ACT2 = 0;
var BAKE = 0;

// ../barebone/src/corrections.ts
var CORRECTIONS_SPEC = sha2562("Corrections cMIP, draft 2, test value until publication");
var LONG_FORM_CORRECTION = sha2562("Long-form corrections cMIP, draft 1, test value until publication");
var isLongForm = (format) => format === POST_SPECS.longform || format === LONG_FORM_CORRECTION;
var correctionFormatFor = (corrected) => isLongForm(corrected) ? LONG_FORM_CORRECTION : CORRECTIONS_SPEC;
function formatOfPayload(payload) {
  if (!payload) return null;
  try {
    const f = cborDecode(payload).get(1);
    return f instanceof Uint8Array ? hex(f) : null;
  } catch {
    return null;
  }
}

// ../barebone/src/post.ts
async function carryChain(by, relays) {
  for (const hint of relays) {
    for (const a of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(a);
      } catch {
      }
    }
  }
}
async function publishPicture(by, jpeg, relays) {
  const s = strip(jpeg);
  const l = lockMedia(s.bytes);
  const payload = cborEncode(
    /* @__PURE__ */ new Map([
      [0, unhex(POST_SPECS.jpeg)],
      [1, unhex(l.workHash)],
      [2, unhex(l.lockedHash)],
      [3, s.bytes.length],
      [4, l.nonce],
      [5, l.key],
      [6, relays]
    ])
  );
  await carryChain(by, relays);
  const made = await by.publish(POST_SPECS.envelopes, BAKE, payload, { public: true, relays });
  for (const hint of relays) await relayAt(hint, by.via).putMedia(l.locked);
  return { id: made.id, act: made.act, removed: s.removed, picture: s.picture, work: l.workHash, size: s.bytes.length };
}
function textPayload(text3, format = null) {
  const m = /* @__PURE__ */ new Map([[0, text3]]);
  if (format) m.set(1, unhex(format));
  return cborEncode(m);
}
async function publishVideo(by, mp4, relays) {
  if (mp4.length > MAX_BYTES) throw new Error(`the film is ${mp4.length} bytes; the video Module takes at most ${MAX_BYTES}. Nothing was published.`);
  let s;
  let film;
  try {
    s = strip2(mp4);
    film = read2(s.bytes);
  } catch (e3) {
    if (e3 instanceof NotFilm) throw new Error(`not a film the video Module plays: ${e3.message}. Nothing was published.`);
    throw e3;
  }
  const l = lockMedia(s.bytes);
  const payload = cborEncode(
    /* @__PURE__ */ new Map([
      [0, unhex(POST_SPECS.video)],
      [1, unhex(l.workHash)],
      [2, unhex(l.lockedHash)],
      [3, s.bytes.length],
      [4, l.nonce],
      [5, l.key],
      [6, relays]
    ])
  );
  await carryChain(by, relays);
  const made = await by.publish(POST_SPECS.envelopes, BAKE, payload, { public: true, relays });
  for (const hint of relays) await relayAt(hint, by.via).putMedia(l.locked);
  return { id: made.id, act: made.act, removed: s.removed, film, work: l.workHash, size: s.bytes.length };
}
async function publishAudio(by, m4a, relays) {
  if (m4a.length > MAX_BYTES2) throw new Error(`the recording is ${m4a.length} bytes; the audio Module takes at most ${MAX_BYTES2}. Nothing was published.`);
  let s;
  let sound;
  try {
    s = strip3(m4a);
    sound = read3(s.bytes);
  } catch (e3) {
    if (e3 instanceof NotSound) throw new Error(`not a recording the audio Module plays: ${e3.message}. Nothing was published.`);
    throw e3;
  }
  const l = lockMedia(s.bytes);
  const payload = cborEncode(
    /* @__PURE__ */ new Map([
      [0, unhex(POST_SPECS.audio)],
      [1, unhex(l.workHash)],
      [2, unhex(l.lockedHash)],
      [3, s.bytes.length],
      [4, l.nonce],
      [5, l.key],
      [6, relays]
    ])
  );
  await carryChain(by, relays);
  const made = await by.publish(POST_SPECS.envelopes, BAKE, payload, { public: true, relays });
  for (const hint of relays) await relayAt(hint, by.via).putMedia(l.locked);
  return { id: made.id, act: made.act, removed: s.removed, sound, work: l.workHash, size: s.bytes.length };
}
async function post(by, opts) {
  const picture = opts.jpeg ? await publishPicture(by, opts.jpeg, opts.relays) : null;
  const film = opts.mp4 ? await publishVideo(by, opts.mp4, opts.relays) : null;
  const recording = opts.m4a ? await publishAudio(by, opts.m4a, opts.relays) : null;
  await carryChain(by, opts.relays);
  const refs = [...opts.corrects ? [opts.corrects] : [], ...picture ? [referenceTo(picture.act)] : [], ...film ? [referenceTo(film.act)] : [], ...recording ? [referenceTo(recording.act)] : [], ...opts.refs ?? []];
  const corrected = opts.corrects && opts.format === void 0 ? await fetchAct(typeof opts.corrects === "string" ? opts.corrects : opts.corrects[0], opts.relays, {}) : null;
  const format = opts.format !== void 0 ? opts.format : opts.corrects ? correctionFormatFor(corrected ? formatOfPayload(describeAct(corrected).payload) : null) : null;
  const made = await by.publish(POST_SPECS.text, TEXT_ACT2, textPayload(opts.text, format), {
    public: true,
    relays: opts.relays,
    refs: refs.length ? refs : void 0,
    to: opts.to?.length ? opts.to : void 0
  });
  return { id: made.id, act: made.act, picture, film, recording };
}
async function leaveInInbox(by, act, inbox) {
  const out = { left: [], failed: [] };
  for (const hint of inbox) {
    try {
      const r = relayAt(hint, by.via);
      for (const c of by.chainActs()) await r.putAct(c).catch(() => void 0);
      await r.putAct(act);
      out.left.push(hint);
    } catch (e3) {
      out.failed.push({ relay: hint, reason: e3 instanceof Error ? e3.message : String(e3) });
    }
  }
  return out;
}
async function fetchAct(id, hints, via) {
  return firstOf(hints.filter((h) => !cannotReach(h, via)), (h) => relayAt(h, via).getAct(id));
}
var Judge = class {
  constructor(hints, via) {
    this.hints = hints;
    this.via = via;
    this.v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  }
  v;
  /** Addresses not tried by any lookup, each with why. */
  notTried = [];
  looked = /* @__PURE__ */ new Map();
  async standing(act, id, signer) {
    let l = this.looked.get(signer);
    if (!l) {
      l = lookUp(signer, this.hints, this.via, this.v).then(async (x) => {
        for (const n of x.notTried) if (!this.notTried.some((y) => y.hint === n.hint)) this.notTried.push(n);
        await holdSequence(this.v, signer, x, this.hints, this.via);
      });
      this.looked.set(signer, l);
    }
    await l;
    this.v.add(act);
    return this.v.status(id);
  }
};

// ../barebone/src/clock.ts
var DUBSAR_CLOCK_ID = "1c743854ba1884b470f02221395d18d1abe977631bf86f0f221e32e6d83cf453";
var DUBSAR_CLOCK_NAME = "the Dubsar clock";
var named = DUBSAR_CLOCK_ID;
function dubsarClock() {
  return named ? { identity: named, name: DUBSAR_CLOCK_NAME } : null;
}
function timeWords(t) {
  const d = new Date(t * 1e3);
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  return `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}, ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
}
function byClock(t) {
  return `${timeWords(t)} \xB7 by the Dubsar clock`;
}
var stamps = /* @__PURE__ */ new Map();
var now = () => Math.floor(Date.now() / 1e3);
async function clockTimes(hints, via) {
  const c = dubsarClock();
  if (!c) return /* @__PURE__ */ new Map();
  const kept = stamps.get(c.identity);
  if (kept && kept.at + 60 > now()) return kept.earliest;
  try {
    let places = hints;
    try {
      const l = await lookUp(c.identity, hints, via);
      places = [.../* @__PURE__ */ new Set([...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r2) => r2.hints), ...hints])];
    } catch {
    }
    const r = await readStamps(c.identity, places, new Judge(places, via), via);
    stamps.set(c.identity, { at: now(), earliest: r.earliest });
    return r.earliest;
  } catch {
    return /* @__PURE__ */ new Map();
  }
}
async function clockWords(ids, hints, via) {
  const t = await clockTimes(hints, via);
  const out = {};
  for (const id of ids) if (t.has(id)) out[id] = byClock(t.get(id));
  return out;
}
function newestFirst(xs, times, o) {
  const at = new Map(xs.map((x, i) => [x, i]));
  const pos = (x) => o.position?.(x) ?? null;
  const eff = new Map(xs.map((x) => [x, times.get(o.id(x)) ?? Infinity]));
  const bySigner = /* @__PURE__ */ new Map();
  for (const x of xs) {
    const s = o.signer(x);
    if (s && pos(x) !== null) bySigner.set(s, [...bySigner.get(s) ?? [], x]);
  }
  for (const line of bySigner.values()) {
    line.sort((a, b) => pos(b) - pos(a));
    for (let i = 1; i < line.length; i++) eff.set(line[i], Math.min(eff.get(line[i]), eff.get(line[i - 1])));
  }
  const slot = new Map(at);
  for (const line of bySigner.values()) {
    const places = line.map((x) => at.get(x)).sort((a, b) => a - b);
    line.forEach((x, i) => slot.set(x, places[i]));
  }
  return [...xs].sort((a, b) => {
    const [ea, eb] = [eff.get(a), eff.get(b)];
    if (ea !== eb) return ea === Infinity ? -1 : eb === Infinity ? 1 : eb - ea;
    return slot.get(a) - slot.get(b);
  });
}

// src/cards.ts
var CARD_HEAD = "Dubsar Specification Card";
var LIMITS = { title: 120, summary: 600, releases: 16, vectors: 8 };
var CARDS_READ = 2e3;
var CARD_SAY = [
  "A specification card is a signed post saying what a specification is for and where its releases, test vectors and discussion are (the Dubsar Specification Card cMIP). Every app shows it, as the plain post it is.",
  "Only its creator\u2019s latest card speaks for the specification; anyone else\u2019s is shown as their own word. A card changes nothing in the specification, which stays as it was published.",
  "Cards are found by asking the relays you name: one on a relay not asked stays unseen."
];
var HEX64 = /^[0-9a-f]{64}$/;
var oneLine = (s) => s.replace(/\s+/g, " ").trim();
function readHex(typed, label, what) {
  const t = typed.trim();
  if (HEX64.test(t.toLowerCase())) return t.toLowerCase();
  try {
    return readForm(t, label).hex;
  } catch (e3) {
    throw new Error(`${what}: ${e3 instanceof Error ? e3.message : String(e3)}.`);
  }
}
function cardText2(c) {
  const title = oneLine(c.title);
  const summary = c.summary ? oneLine(c.summary) : "";
  if (!title) throw new Error("A card needs a title. Nothing was signed.");
  if (title.length > LIMITS.title) throw new Error(`A card\u2019s title is at most ${LIMITS.title} characters. Nothing was signed.`);
  if (summary.length > LIMITS.summary) throw new Error(`A card\u2019s summary is at most ${LIMITS.summary} characters. Nothing was signed.`);
  if (c.releases.length > LIMITS.releases) throw new Error(`A card names at most ${LIMITS.releases} releases. Nothing was signed.`);
  if (c.vectors.length > LIMITS.vectors) throw new Error(`A card names at most ${LIMITS.vectors} places for test vectors. Nothing was signed.`);
  const lines2 = [CARD_HEAD, `Specification: ${specForm(c.spec)}`, `Title: ${title}`];
  if (summary) lines2.push(`Summary: ${summary}`);
  for (const r of c.releases) lines2.push(`Release: ${actForm(r)}`);
  for (const v of c.vectors) lines2.push(`Vectors: ${HEX64.test(v) ? actForm(v) : v}`);
  if (c.discussion) lines2.push(`Discussion: ${actForm(c.discussion)}`);
  return lines2.join("\n");
}
function readCardText(text3) {
  const lines2 = text3.split("\n");
  if (lines2[0] !== CARD_HEAD) return null;
  const c = { spec: "", title: "", summary: null, releases: [], vectors: [], discussion: null };
  let specs = 0;
  let titles = 0;
  for (const l of lines2.slice(1)) {
    const m = /^([A-Za-z]+): (.+)$/.exec(l);
    if (!m) return null;
    const [, key, value] = m;
    try {
      if (key === "Specification") {
        c.spec = readHex(value, "mspec", "Specification");
        specs++;
      } else if (key === "Title") {
        c.title = value.slice(0, LIMITS.title);
        titles++;
      } else if (key === "Summary") c.summary = value.slice(0, LIMITS.summary);
      else if (key === "Release" && c.releases.length < LIMITS.releases) c.releases.push(readHex(value, "mact", "Release"));
      else if (key === "Vectors" && c.vectors.length < LIMITS.vectors) c.vectors.push(/^https:\/\//.test(value) ? value : readHex(value, "mact", "Vectors"));
      else if (key === "Discussion") c.discussion = readHex(value, "mact", "Discussion");
    } catch {
    }
  }
  return specs === 1 && titles === 1 ? c : null;
}
var discussionText = (title, spec) => `Discussion of ${oneLine(title)}
${specForm(spec)}`;
async function publishCard(me, c, o) {
  const text3 = cardText2(c);
  const refs = await cardRefs([...o.publication ? [o.publication] : [], ...c.releases, ...c.discussion ? [c.discussion] : []], [.../* @__PURE__ */ new Set([...o.relays, ...o.find ?? []])], o.via);
  const made = await post(me, { text: text3, relays: o.relays, refs });
  return { id: made.id, text: text3 };
}
async function cardRefs(ids, relays, via) {
  const out = [];
  for (const id of [...new Set(ids)]) {
    try {
      out.push((await referTo(id, relays, via)).ref);
    } catch {
      throw new Error(`The act ${actForm(id)} was not found on your relays: a card names only acts held, with their signers. Nothing was signed.`);
    }
  }
  return out;
}
async function publishDiscussion(me, a) {
  const refs = a.publication ? await cardRefs([a.publication], [.../* @__PURE__ */ new Set([...a.relays, ...a.find ?? []])], a.via) : [];
  const made = await post(me, { text: discussionText(a.title, a.spec), relays: a.relays, refs });
  return { id: made.id };
}
async function readCards(relays, via, signer) {
  const out = /* @__PURE__ */ new Map();
  for (const r of relays) {
    let after;
    let read4 = 0;
    try {
      for (; ; ) {
        const page = await relayAt(r, via).feed({ spec: POST_SPECS.text, type: TEXT_ACT2, signer, after });
        for (const it of page.items) {
          if (it.kind !== "act" || read4 >= CARDS_READ) continue;
          read4++;
          let d;
          try {
            d = describeAct(it.item);
          } catch {
            continue;
          }
          if (!d.public || !d.signer || !d.payload || out.has(d.id)) continue;
          const t = cborDecode(d.payload).get(0);
          const card2 = typeof t === "string" ? readCardText(t) : null;
          if (card2) out.set(d.id, { act: it.item, d, card: card2 });
        }
        if (!page.items.length || page.next === after || read4 >= CARDS_READ) break;
        after = page.next;
      }
    } catch {
    }
  }
  return [...out.values()];
}
async function prevLinks(signer, relays, via) {
  const links = /* @__PURE__ */ new Map();
  for (const r of relays) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(r, via).feed({ signer, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          try {
            const d = describeAct(it.item);
            if (d.signer === signer && !links.has(d.id)) links.set(d.id, d.prev ?? null);
          } catch {
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  return links;
}
function follows(links, later, earlier) {
  let at = links.get(later);
  for (let i = 0; at && i < 1e5; i++) {
    if (at === earlier) return true;
    at = links.get(at);
  }
  return false;
}
async function cardsFor(spec, creator, relays, via, times = /* @__PURE__ */ new Map(), o = {}) {
  const all = /* @__PURE__ */ new Map();
  const read4 = o.pre ?? [...creator ? await readCards(relays, via, creator) : [], ...o.onlyCreator ? [] : await readCards(relays, via)];
  for (const x of read4) if (x.card.spec === spec && (!o.onlyCreator || x.d.signer === creator)) all.set(x.d.id, x);
  const judge2 = new Judge(relays, via);
  const lines2 = [];
  const found = [];
  for (const { act, d, card: card2 } of all.values()) {
    let standing2 = "unknown";
    try {
      standing2 = await judge2.standing(act, d.id, d.signer);
    } catch (e3) {
      standing2 = `not checked: ${e3 instanceof Error ? e3.message : String(e3)}`;
    }
    if (standing2 !== "valid") {
      lines2.push({ text: `A card by ${d.signer.slice(0, 8)}\u2026 is ${standing2}, not valid for its signer\u2019s chain: not shown.`, tone: "warn" });
      continue;
    }
    found.push({ id: d.id, signer: d.signer, fields: card2, creators: creator !== null && d.signer === creator, superseded: false, standing: standing2, hint: d.hint ?? null });
  }
  const bySigner = /* @__PURE__ */ new Map();
  for (const c of found) bySigner.set(c.signer, [...bySigner.get(c.signer) ?? [], c]);
  for (const [signer, cs] of bySigner) {
    if (cs.length < 2) continue;
    const links = await prevLinks(signer, relays, via);
    for (const c of cs) if (cs.some((o2) => o2 !== c && follows(links, o2.id, c.id))) c.superseded = true;
    const tops = cs.filter((c) => !c.superseded);
    if (tops.length > 1) {
      const stamped = tops.filter((c) => times.has(c.id));
      if (stamped.length === tops.length) {
        const last = stamped.reduce((a, b) => times.get(b.id) > times.get(a.id) ? b : a);
        for (const c of tops) if (c !== last) c.superseded = true;
      } else lines2.push({ text: `${signer.slice(0, 8)}\u2026 signed cards for it on ${tops.length} lines, and no clock stamped them all: each line\u2019s latest is shown, and which is newer cannot be told.`, tone: "warn" });
    }
  }
  found.sort((a, b) => Number(b.creators) - Number(a.creators) || Number(a.superseded) - Number(b.superseded) || (times.get(b.id) ?? 0) - (times.get(a.id) ?? 0) || (a.id < b.id ? -1 : 1));
  return { cards: found, lines: lines2 };
}
var ownCard = (cards) => cards.find((c) => c.creators && !c.superseded) ?? null;
var MICS_HASH = "30add49a7b90d0ff98971b136706ee399e41941481998363bc54f2ad3bf6f646";
var SUITE_HASH = "4485bf65b1307db72ef37f2e33dfd60e8a3fd84c14ccf5216dfef8614be382d5";
var BUILT_IN = [
  { hash: MIRS.identity, title: "MIR: Identity", kind: "MIR", summary: "Who signs: identities, their keys, homes, rotations, receipts and succession." },
  { hash: MIRS.text, title: "MIR: Text", kind: "MIR", summary: "What a text act is, and canonical text: the words every act is written in." },
  { hash: MIRS.envelopes, title: "MIR: Envelopes", kind: "MIR", summary: "The shape of every act: public and private acts, sequences, references, bakes and vows, relays." },
  { hash: MIRS.money, title: "MIR: Money", kind: "MIR", summary: "Payments, claims and receipts, rails and units: how a payment is proven." },
  { hash: MIRS.agreements, title: "MIR: Agreements", kind: "MIR", summary: "Agreements, ownership, publications, collectives, splits, keepers and judgments." },
  { hash: MIRS.development, title: "MIR: Development", kind: "MIR", summary: "cMIPs and Modules: named by hash, frozen at publication, adopted by choice." },
  { hash: MICS_HASH, title: "The MICS: MOR Inscribed Core Spec", kind: "MICS document", summary: "The core in one document: what MOR is, its layers and the six MIRs it names." },
  { hash: SUITE_HASH, title: "MOR Freeze Test Suite", kind: "test suite", summary: "What must be tested before the freeze: every step, and what it shows." }
];
var BUILT_IN_SAY = "One of the core\u2019s texts: it names no creator, so no card speaks for it. Its title is its own first heading; these words are Ummia\u2019s. The front door to the frozen texts is dubsar.org\u2019s.";
var builtIn = (hash) => BUILT_IN.find((b) => b.hash === hash) ?? null;

// src/follows.ts
var FOLLOW_SAY = "One contacts list for every app: sealed to you at your homes, the same in Dub, Damgar, Edubba and Ummia, your nicknames seen by you alone. Here it points Look at the people you follow; muting is Dub\u2019s.";

// ../repo/src/manifest.ts
function validPath(p) {
  if (!p || p.startsWith("/") || p !== p.normalize("NFC")) return false;
  if (/[\\\u0000-\u001f\u007f]/.test(p)) return false;
  return p.split("/").every((s) => s !== "" && s !== "." && s !== "..");
}
var enc = new TextEncoder();
function byBytes(a, b) {
  const x = enc.encode(a);
  const y = enc.encode(b);
  for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i];
  return x.length - y.length;
}
function decodeManifest(bytes) {
  const m = cborDecode(bytes);
  if (!(m instanceof Map)) throw new Error("a manifest is a map");
  for (const k of m.keys()) if (typeof k !== "number" || k < 0 || k > 6) throw new Error(`manifest: unknown field ${k}`);
  const text3 = (v, w) => {
    if (typeof v !== "string") throw new Error(`manifest: ${w}`);
    return v;
  };
  const bytesOf = (v, n, w) => {
    if (!(v instanceof Uint8Array) || v.length !== n) throw new Error(`manifest: ${w}`);
    return v;
  };
  const list3 = (v, w) => {
    if (!Array.isArray(v)) throw new Error(`manifest: ${w}`);
    return v;
  };
  const prev = m.get(2);
  const files = list3(m.get(3), "files").map((x) => {
    const a = list3(x, "file");
    if (a.length !== 6) throw new Error("manifest: a file has six fields");
    const size = a[2];
    if (typeof size !== "number" || !Number.isSafeInteger(size) || size < 0) throw new Error("manifest: file size");
    return {
      path: text3(a[0], "file path"),
      work: hex(bytesOf(a[1], 32, "work hash")),
      size,
      locked: hex(bytesOf(a[3], 32, "locked hash")),
      nonce: bytesOf(a[4], 24, "nonce"),
      key: bytesOf(a[5], 32, "key")
    };
  });
  if (!files.length) throw new Error("manifest: no files");
  files.forEach((f, i) => {
    if (!validPath(f.path)) throw new Error(`manifest: not a valid path: ${JSON.stringify(f.path)}`);
    if (i && byBytes(files[i - 1].path, f.path) >= 0) throw new Error("manifest: paths sorted and unique");
  });
  const dependencies = list3(m.get(4), "dependencies").map((x) => {
    const a = list3(x, "dependency");
    if (a.length !== 4) throw new Error("manifest: a dependency has four fields");
    return {
      registry: text3(a[0], "registry"),
      name: text3(a[1], "dependency name"),
      version: text3(a[2], "dependency version"),
      checksum: text3(a[3], "dependency checksum")
    };
  });
  let impl;
  if (m.has(6)) {
    const entries = list3(m.get(6), "implements").map((e3) => {
      if (!Array.isArray(e3) || e3.length < 1 || e3.length > 2) throw new Error("manifest: an implemented specification is [spec, ? hint]");
      const spec = hex(bytesOf(e3[0], 32, "an implemented specification"));
      return e3.length === 2 ? { spec, hint: hex(bytesOf(e3[1], 32, "a publication hint")) } : { spec };
    });
    if (!entries.length) throw new Error("manifest: implements names at least one specification");
    entries.forEach((x, i) => {
      if (i && entries[i - 1].spec >= x.spec) throw new Error("manifest: implements sorted by spec hash and unique");
    });
    impl = entries;
  }
  return {
    name: text3(m.get(0), "name"),
    version: text3(m.get(1), "version"),
    previous: prev === null ? null : hex(bytesOf(prev, 32, "previous")),
    files,
    dependencies,
    source: m.has(5) ? text3(m.get(5), "source") : void 0,
    implements: impl
  };
}

// ../site/src/settings.ts
function relayAddress(s) {
  if (typeof s !== "string") return null;
  let u2;
  try {
    u2 = new URL(s);
  } catch {
    return null;
  }
  const local = u2.hostname === "127.0.0.1" || u2.hostname === "localhost" || u2.hostname === "[::1]";
  if (u2.protocol !== "https:" && !(u2.protocol === "http:" && local)) return null;
  if (u2.username || u2.password || u2.search || u2.hash) return null;
  return s.replace(/\/$/, "");
}

// ../site/src/specs.ts
var test4 = (s) => sha2562(s);
var SITE_SPECS = {
  identity: SPECS.identity,
  /** The Envelopes MIR (`ENVELOPES`): a version is a bake (an upload, Envelopes type 0; called a publication before F407). */
  envelopes: SPECS.envelopes,
  /** The Agreements MIR (`AGREEMENTS`): to judge a collective's site (website cMIP draft 12, rule 3). */
  agreements: test4("LAW, test value until the freeze"),
  /** The website cMIP (cmips/cmip-website-draft-4.md). Draft 3 adds the icon
   * (rule 16a), draft 4 films (rules 4, 6a, 12a); both leave the manifest's
   * format as it was, so the test value stays draft 2's: versions already
   * published still verify. */
  site: test4("website cMIP, draft 2, test value until publication")
};
var BAKE2 = 0;
var NUDGE = test4("nudge cMIP, draft 2, test value until publication");
var RELEASE_MANIFEST = test4("release manifest cMIP, draft 1, test value until publication");
var SITE_AGREEMENTS_SPECS = { ...MIRS, agreements: SITE_SPECS.agreements, extLayers: { [RELEASE_MANIFEST]: [] } };
var PAYMENT_CMIP = test4("payment cMIP, draft 2, test value until publication");

// ../site/src/listing.ts
var AGREEMENTS_TERMS = 0;
var AGREEMENTS_SIGNATURE = 1;
var KINDS = ["cMIP", "Module", "unit", "media type", "MIR", "signature scheme", "MICS document", "test suite", "MIP"];
var MIR = 4;
var MICS = 6;
var MIP = 8;
var LAYERS = {
  [MIRS.identity]: "Identity",
  [MIRS.text]: "Text",
  [MIRS.envelopes]: "Envelopes",
  [MIRS.money]: "Money",
  [MIRS.agreements]: "Agreements",
  [MIRS.development]: "Development"
};
var EXTENSION_LAYERS = ["Identity", "Text", "Envelopes", "Money", "Agreements"];
var TASKS = {
  1: ["Identity", "Identity proofs and credentials"],
  2: ["Identity", "Naming"],
  3: ["Identity", "Outside link proofs"],
  4: ["Text", "Text format"],
  5: ["Envelopes", "Media interpretation"],
  6: ["Money", "Payment"],
  7: ["Money", "Conversion"],
  8: ["Agreements", "Split"],
  9: ["Agreements", "Condition evaluation"],
  10: ["Agreements", "Time reference"],
  11: ["Envelopes", "Anchoring"],
  12: ["Agreements", "Grant limits"],
  13: ["Agreements", "Work claims"],
  14: ["Agreements", "Absence proof"]
};
var LISTING_READ = 5e3;
var message2 = (err) => err instanceof Error ? err.message : String(err);
var bytes32 = (x) => x instanceof Uint8Array && x.length === 32;
function concat3(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}
function specHash(content) {
  const tag = sha256(new TextEncoder().encode("MOR/spec"));
  return hex(sha256(concat3(tag, tag, content)));
}
function decodeSpec2(content) {
  let d;
  try {
    d = decodeSpec(content, PAYMENT_CMIP);
  } catch (e3) {
    throw new Error(message2(e3));
  }
  return {
    kind: d.kind,
    creator: d.creator ?? null,
    tasks: d.tasks,
    types: d.types.map(([type, name]) => ({ type, name })),
    dependencies: d.dependencies,
    implements: d.implements ?? null,
    rules: d.rules,
    fee: d.fee,
    predecessor: d.predecessor ?? null,
    text: d.text,
    layers: d.layers.length ? d.layers : null,
    rail: d.railKind ? { kind: d.railKind, binds: d.railBinds ?? [] } : null,
    checker: d.checksDelivery
  };
}
var isXtype = (s) => s.types.length > 0 && s.tasks.length === 0;
function nameOf(text3) {
  const line = text3.split("\n").map((l) => l.replace(/^#+\s*/, "").trim()).find((l) => /\p{L}/u.test(l)) ?? "(no name)";
  return line.length > 100 ? `${line.slice(0, 99)}\u2026` : line;
}
function mediaOf(d) {
  if (!d.public || !d.payload || d.type !== BAKE2 || d.spec !== SPECS.envelopes) return null;
  let m;
  try {
    m = cborDecode(d.payload);
  } catch {
    return null;
  }
  if (!(m instanceof Map)) return null;
  const [spec, work, locked, size, nonce, key, places] = [0, 1, 2, 3, 4, 5, 6].map((k) => m.get(k));
  if (!bytes32(spec) || !(work instanceof Uint8Array) || !(locked instanceof Uint8Array) || typeof size !== "number" || !(nonce instanceof Uint8Array)) return null;
  return {
    spec: hex(spec),
    work,
    locked,
    size,
    nonce,
    key: key instanceof Uint8Array ? key : null,
    places: Array.isArray(places) ? places.filter((p) => typeof p === "string") : []
  };
}
var Judge2 = class {
  constructor(places, via) {
    this.places = places;
    this.via = via;
  }
  v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  looked = /* @__PURE__ */ new Map();
  lookUp(identity) {
    let l = this.looked.get(identity);
    if (!l) {
      l = lookUp(identity, this.places, this.via, this.v);
      this.looked.set(identity, l);
    }
    return l;
  }
  /** Why the act is not valid for its signer's chain, or null when it is. */
  async problem(act, id, signer) {
    try {
      await holdSequence(this.v, signer, await this.lookUp(signer), this.places, this.via);
    } catch (e3) {
      return `its signer's identity chain could not be looked up: ${message2(e3)}`;
    }
    try {
      this.v.add(act);
    } catch (e3) {
      return `the act is not valid: ${message2(e3)}`;
    }
    const s = this.v.status(id);
    return s === "valid" ? null : `its standing is \u201C${s}\u201D, not valid, for its signer's identity chain`;
  }
};
async function openAt(m, places, via) {
  if (!m.key) return null;
  for (const h of places) {
    try {
      const locked = await relayAt(h, via).getMedia(hex(m.locked));
      if (!locked) continue;
      const plain = openMedia(locked, m.key, m.nonce);
      if (plain.length === m.size && workHash(plain) === hex(m.work)) return plain;
    } catch {
    }
  }
  return null;
}
function queriesOf(f) {
  return [{ spec: SPECS.envelopes, type: BAKE2, signer: f.signer }, { spec: MIRS.agreements, type: AGREEMENTS_TERMS }, { spec: MIRS.agreements, type: AGREEMENTS_SIGNATURE }];
}
async function readRelay(line, via, into, queries = [{}]) {
  for (const q of queries) {
    await readQuery(line, via, into, q);
    if (line.stopped || line.problem) return;
  }
}
async function readQuery(line, via, into, q) {
  let after;
  try {
    for (; ; ) {
      const page = await relayAt(line.address, via).feed({ ...q, after });
      for (const it of page.items) {
        if (line.read >= LISTING_READ) {
          line.stopped = true;
          return;
        }
        line.read++;
        if (it.kind !== "act") {
          line.private++;
          continue;
        }
        let d;
        try {
          d = describeAct(it.item);
        } catch {
          continue;
        }
        if (!d.public) line.private++;
        else if (d.spec === MIRS.agreements && d.type === AGREEMENTS_TERMS) line.terms++;
        if (!into.has(d.id)) into.set(d.id, { d, act: it.item });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  } catch (e3) {
    line.problem = message2(e3);
  }
}
async function readListing(relays, gatewayRelays, via = {}, filtered) {
  const lines2 = relays.map((r) => ({ ...r, asked: relayAddress(r.address) !== null, problem: null, read: 0, specs: 0, stopped: false, private: 0, terms: 0 }));
  const asked = lines2.filter((l) => l.asked).map((l) => relayAddress(l.address));
  for (const l of lines2) if (l.asked) l.address = relayAddress(l.address);
  const found = /* @__PURE__ */ new Map();
  const at = /* @__PURE__ */ new Map();
  for (const l of lines2.filter((x) => x.asked)) {
    const before = new Set(found.keys());
    await readRelay(l, via, found, filtered ? queriesOf(filtered) : void 0);
    for (const id of found.keys()) if (!before.has(id)) at.set(id, l.address);
  }
  const places = [.../* @__PURE__ */ new Set([...asked, ...gatewayRelays])];
  const judge2 = new Judge2(places, via);
  const pubs = [];
  const releases = [];
  for (const { d, act } of found.values()) {
    const m = mediaOf(d);
    if (!m) continue;
    if (m.spec === RELEASE_MANIFEST) {
      releases.push({ d, act, m });
      continue;
    }
    if (m.spec !== MIRS.development) continue;
    const l = lines2.find((x) => x.address === at.get(d.id));
    if (l) l.specs++;
    pubs.push({ id: d.id, signer: d.signer ?? "", problem: null, hash: null, spec: null, content: null });
  }
  await Promise.all(
    pubs.map(async (p) => {
      const { d, act } = found.get(p.id);
      const m = mediaOf(d);
      if (!d.signer) return void (p.problem = "it names no signer");
      const bad = await judge2.problem(act, d.id, d.signer);
      if (bad) return void (p.problem = bad);
      if (!m.key) return void (p.problem = "its content is locked: its key is not public");
      const content = await openAt(m, [...places, ...m.places.map(relayAddress).filter((x) => !!x)], via);
      if (!content) return void (p.problem = "its content was not found, or does not match its work hash and size");
      try {
        p.spec = decodeSpec2(content);
      } catch (e3) {
        return void (p.problem = `no specification (Development draft 10, F323): ${message2(e3)}`);
      }
      p.hash = specHash(content);
      p.content = content;
    })
  );
  const byHash = /* @__PURE__ */ new Map();
  for (const p of pubs.filter((x) => !x.problem)) {
    let l = byHash.get(p.hash);
    if (!l) {
      l = { hash: p.hash, spec: p.spec, name: nameOf(p.spec.text), publications: [], claimed: false, releases: [], use: null };
      byHash.set(p.hash, l);
    }
    l.publications.push(p);
  }
  for (const l of byHash.values()) {
    l.claimed = l.spec.creator !== null && l.publications.some((p) => p.signer === l.spec.creator);
    l.publications.sort((a, b) => Number(b.signer === l.spec.creator) - Number(a.signer === l.spec.creator) || (a.id < b.id ? -1 : 1));
  }
  const pubOf = /* @__PURE__ */ new Map();
  for (const l of byHash.values()) for (const p of l.publications) pubOf.set(p.id, l);
  const listedBy = (ids) => [...new Set(ids.map((r) => pubOf.get(r)).filter((x) => !!x))];
  await Promise.all(
    releases.map(async ({ d, act, m }) => {
      if (!d.signer || !byHash.size) return;
      const bad = await judge2.problem(act, d.id, d.signer);
      const plain = bad ? null : await openAt(m, [...places, ...m.places.map(relayAddress).filter((x) => !!x)], via);
      let man = null;
      try {
        const x = plain ? cborDecode(plain) : null;
        man = x instanceof Map && typeof x.get(0) === "string" && typeof x.get(1) === "string" ? x : null;
      } catch {
        man = null;
      }
      const field6 = implementsOf(man);
      let named2;
      let problem = bad;
      if (field6 === null) named2 = listedBy(d.refs ?? []);
      else if ("specs" in field6) named2 = [...new Set(field6.specs.map((h) => byHash.get(h)).filter((x) => !!x))];
      else {
        named2 = listedBy(field6.publications);
        problem ??= field6.problem;
      }
      if (!named2.length) return;
      const r = { id: d.id, signer: d.signer, collective: d.objects?.[0]?.[0] ?? null, name: null, version: null, problem, by: field6 ? "implements" : "reference" };
      if (!r.problem) {
        if (man) {
          r.name = man.get(0);
          r.version = man.get(1);
        } else r.problem = plain ? "its manifest does not read as one" : "its manifest was not found, or does not read as one";
      }
      for (const l of named2) l.releases.push(r);
    })
  );
  for (const l of byHash.values()) l.releases.sort((a, b) => Number(!!a.problem) - Number(!!b.problem) || (a.id < b.id ? -1 : 1));
  const { extensions, agreements } = await readExtensions(found, byHash, judge2, lines2.reduce((n, l) => n + l.private, 0));
  if (filtered) for (const x of [...byHash.values()].filter((l) => isXtype(l.spec))) for (const l of lines2.filter((y) => y.asked && !y.problem)) await readQuery(l, via, found, { spec: x.hash });
  const xtypes = await countUse(found, byHash, judge2);
  const all = [...byHash.values()];
  return {
    relays: lines2,
    extensions,
    agreements,
    // A MIP's predecessor is what it forks, shown in the MIPs' part, never as a line of drafts (draft 11, F325).
    lines: linesOf2(all.filter((l) => l.spec.kind !== MIP)),
    unverified: pubs.filter((p) => p.problem).sort((a, b) => a.id < b.id ? -1 : 1),
    xtypes,
    mips: mipsOf(all),
    versions: versionsOf(all)
  };
}
function implementsOf(man) {
  if (!man || !man.has(6)) return null;
  const v = man.get(6);
  const wrong = { publications: [], problem: "its manifest's \u201Cimplements\u201D (field 6) is not as release manifest cMIP draft 4 gives it: [spec, ? hint] entries, sorted by spec hash" };
  if (!Array.isArray(v) || !v.length) return wrong;
  if (v.every(bytes32)) {
    return { publications: v.map((h) => hex(h)), problem: "its manifest names publications in \u201Cimplements\u201D (field 6), as release manifest cMIP draft 3 did; under draft 4 it names spec hashes, so it is not a valid manifest" };
  }
  const specs = [];
  for (const e3 of v) {
    if (!Array.isArray(e3) || e3.length < 1 || e3.length > 2 || !e3.every(bytes32)) return wrong;
    const h = hex(e3[0]);
    if (specs.length && specs[specs.length - 1] >= h) return wrong;
    specs.push(h);
  }
  return { specs };
}
function mipsOf(all) {
  const byHash = new Map(all.map((l) => [l.hash, l]));
  const mips = all.filter((l) => l.spec.kind === MIP);
  const children2 = /* @__PURE__ */ new Map();
  for (const l of mips) {
    const p = l.spec.predecessor;
    if (p !== l.hash) children2.set(p, [...children2.get(p) ?? [], l]);
  }
  const order = (a, b) => b.total - a.total || b.direct - a.direct || (a.listed.name < b.listed.name ? -1 : a.listed.name > b.listed.name ? 1 : a.listed.hash < b.listed.hash ? -1 : 1);
  const placed = /* @__PURE__ */ new Set();
  const tree = (l) => {
    placed.add(l.hash);
    const forks = (children2.get(l.hash) ?? []).filter((c) => !placed.has(c.hash)).map(tree).sort(order);
    return { listed: l, direct: forks.length, total: forks.reduce((n, f) => n + 1 + f.total, 0), forks };
  };
  const byName = (a, b) => a.listed.name < b.listed.name ? -1 : a.listed.name > b.listed.name ? 1 : a.listed.hash < b.listed.hash ? -1 : 1;
  const roots = all.filter((l) => l.spec.kind === MIR || l.spec.kind === MICS).map(tree).sort(byName);
  const unrooted = /* @__PURE__ */ new Map();
  const top2 = (l) => {
    const seen = /* @__PURE__ */ new Set();
    let x = l;
    for (; ; ) {
      seen.add(x.hash);
      const p = byHash.get(x.spec.predecessor);
      if (!p || p.spec.kind !== MIP || seen.has(p.hash)) return x.hash;
      x = p;
    }
  };
  for (const l of mips.filter((x) => !placed.has(x.hash)).sort((a, b) => a.hash < b.hash ? -1 : 1)) {
    if (placed.has(l.hash)) continue;
    const head = byHash.get(top2(l));
    const leads = head.spec.predecessor;
    const u2 = unrooted.get(leads) ?? { hash: leads, kind: byHash.get(leads)?.spec.kind ?? null, forks: [] };
    u2.forks.push(tree(head));
    u2.forks.sort(order);
    unrooted.set(leads, u2);
  }
  return { roots, unrooted: [...unrooted.values()].sort((a, b) => a.hash < b.hash ? -1 : 1), count: mips.length };
}
function versionsOf(all) {
  const byText = /* @__PURE__ */ new Map();
  for (const l of all) byText.set(l.spec.text, [...byText.get(l.spec.text) ?? [], l]);
  const out = [];
  for (const group of byText.values()) {
    if (group.length < 2) continue;
    const fields = group.map((l) => {
      const c = l.publications.find((p) => p.content)?.content;
      const m = c ? cborDecode(c) : /* @__PURE__ */ new Map();
      return new Map([...m].map(([k, v]) => [k, hex(cborEncode(v))]));
    });
    const keys = [...new Set(fields.flatMap((f) => [...f.keys()]))].filter((k) => k !== 9).sort((a, b) => a - b);
    const versions = group.map((listed, i) => ({
      listed,
      differs: keys.filter((k) => fields.some((f, j) => j !== i && f.get(k) !== fields[i].get(k)))
    }));
    versions.sort((a, b) => a.listed.hash < b.listed.hash ? -1 : 1);
    out.push({ name: group[0].name, versions });
  }
  return out.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
}
async function countUse(found, byHash, judge2) {
  const xtypes = [...byHash.values()].filter((l) => isXtype(l.spec));
  for (const l of xtypes) l.use = { acts: 0, byType: l.spec.types.map((t) => ({ type: t.type, name: t.name, acts: 0 })), notValid: 0 };
  const of = new Map(xtypes.map((l) => [l.hash, l]));
  for (const { d, act } of found.values()) {
    const l = d.public && d.spec ? of.get(d.spec) : void 0;
    const t = l?.use.byType.find((x) => x.type === d.type);
    if (!l || !t) continue;
    if (!d.signer || await judge2.problem(act, d.id, d.signer)) {
      l.use.notValid++;
      continue;
    }
    t.acts++;
    l.use.acts++;
  }
  return xtypes.sort((a, b) => b.use.acts - a.use.acts || (a.name < b.name ? -1 : a.name > b.name ? 1 : a.hash < b.hash ? -1 : 1));
}
function linesOf2(all) {
  const byHash = new Map(all.map((l) => [l.hash, l]));
  const after = (l) => l.spec.predecessor && l.spec.predecessor !== l.hash ? byHash.get(l.spec.predecessor) ?? null : null;
  const children2 = /* @__PURE__ */ new Map();
  for (const l of all) {
    const p = after(l);
    if (p) children2.set(p.hash, [...children2.get(p.hash) ?? [], l]);
  }
  const order = (a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : a.hash < b.hash ? -1 : 1;
  for (const c of children2.values()) c.sort(order);
  const placed = /* @__PURE__ */ new Set();
  const out = [];
  const walk = (l, n, drafts) => {
    if (placed.has(l.hash)) return;
    placed.add(l.hash);
    const p = after(l);
    const siblings = p ? (children2.get(p.hash) ?? []).filter((x) => x !== l).map((x) => x.hash) : [];
    drafts.push({
      listed: l,
      number: n,
      after: p,
      afterMissing: !p && l.spec.predecessor ? l.spec.predecessor : null,
      otherCreator: !!p && p.spec.creator !== l.spec.creator,
      siblings
    });
    for (const c of children2.get(l.hash) ?? []) walk(c, n + 1, drafts);
  };
  const roots = all.filter((l) => !after(l)).sort(order);
  for (const r of roots) {
    const drafts = [];
    walk(r, 1, drafts);
    out.push({ drafts, newest: drafts[drafts.length - 1].listed });
  }
  for (const l of all.filter((x) => !placed.has(x.hash)).sort(order)) {
    const drafts = [];
    walk(l, 1, drafts);
    out.push({ drafts, newest: drafts[drafts.length - 1].listed });
  }
  return out.sort((a, b) => order(a.newest, b.newest));
}
function roleWords(l, all) {
  const s = l.spec;
  const kind = KINDS[s.kind];
  const role = [];
  const layers = /* @__PURE__ */ new Set();
  for (const [mir, n] of s.tasks) {
    const layer = LAYERS[mir];
    const known = TASKS[n];
    if (layer) layers.add(layer);
    if (known && layer === known[0]) role.push(`fills task ${n}, ${known[1]}`);
    else role.push(`fills task ${n}${layer ? ` of ${layer}` : ", of a MIR this listing does not know"}`);
  }
  if (s.implements && LAYERS[s.implements]) {
    role.push(`works under the ${LAYERS[s.implements]} MIR`);
    if (!s.tasks.length) layers.add(LAYERS[s.implements]);
  } else if (s.implements) {
    const under = all.get(s.implements);
    if (under && under.spec.kind === MIR) {
      role.push(`works under the MIR \u201C${under.name}\u201D`);
    } else if (under) {
      role.push(`works under the cMIP \u201C${under.name}\u201D`);
      if (!s.tasks.length) {
        for (const [mir] of under.spec.tasks) if (LAYERS[mir]) layers.add(LAYERS[mir]);
      }
    } else role.push(`works under a cMIP not found here (${s.implements.slice(0, 12)}\u2026)`);
  }
  if (s.types.length) {
    role.push(
      !s.tasks.length ? `an xtype: defines ${s.types.length === 1 ? "an act type" : `${s.types.length} act types`} (${s.types.map((t) => t.name).join(", ")}), filling no task` : `defines ${s.types.length === 1 ? "an act type" : `${s.types.length} act types`} (${s.types.map((t) => t.name).join(", ")})`
    );
  }
  if (s.layers) role.push(`declares, for use as an extension, the layers it acts on beyond Development: ${s.layers.map((n) => EXTENSION_LAYERS[n]).join(", ")}`);
  if (s.rail) role.push(`a rail Module: a ${s.rail.kind} rail, its proof binding ${s.rail.binds.length ? s.rail.binds.join(", ") : "nothing"}`);
  if (s.checker) role.push("checks proofs of proven deliveries (field 12)");
  if (s.kind === MIP) role.push(`a MIP: a proposal toward a successor protocol, not a rule of MOR; it forks ${all.get(s.predecessor) ? `\u201C${all.get(s.predecessor).name}\u201D` : `a specification not found here (${s.predecessor.slice(0, 12)}\u2026)`}`);
  if (!role.length) role.push(s.kind === 0 ? "names no task, defines no act type" : "declares nothing more");
  if (!layers.size && (s.types.length || s.layers || s.kind === 0 && !s.tasks.length)) layers.add("Development");
  return { kind, layer: [...layers].join(", ") || "not said", role };
}
async function readExtensions(found, byHash, judge2, privateActs) {
  const read4 = { terms: 0, counted: 0, proposed: 0, notCounted: [], private: privateActs };
  const terms = /* @__PURE__ */ new Map();
  const signatures = [];
  for (const { d, act } of found.values()) {
    if (!d.public || d.spec !== MIRS.agreements || !d.payload || !d.signer) continue;
    if (d.type === AGREEMENTS_SIGNATURE) signatures.push({ act, d });
    if (d.type !== AGREEMENTS_TERMS) continue;
    try {
      const fields = cborDecode(d.payload);
      if (fields instanceof Map) terms.set(d.id, { act, signer: d.signer, fields });
    } catch {
      read4.notCounted.push({ id: d.id, why: "its terms do not decode" });
    }
  }
  const parties = /* @__PURE__ */ new Set();
  for (const t of terms.values()) {
    parties.add(t.signer);
    for (const p of Array.isArray(t.fields.get(0)) ? t.fields.get(0) : []) if (bytes32(p)) parties.add(hex(p));
  }
  for (const s of signatures) parties.add(s.d.signer);
  await Promise.all([...parties].map((p) => judge2.lookUp(p).catch(() => null)));
  const valid = /* @__PURE__ */ new Set();
  for (const [id, t] of terms) {
    const bad = await judge2.problem(t.act, id, t.signer);
    if (bad) read4.notCounted.push({ id, why: bad });
    else valid.add(id);
  }
  for (const s of signatures) {
    try {
      judge2.v.add(s.act);
    } catch {
    }
  }
  read4.terms = valid.size;
  const named2 = (t) => Array.isArray(t.get(15)) ? t.get(15).filter(bytes32).map((h) => hex(h)) : [];
  const extLayers = {};
  for (const id of valid) for (const h of named2(terms.get(id).fields)) extLayers[h] = byHash.get(h)?.spec.layers ?? [];
  const specs = { ...MIRS, extLayers };
  const counts = /* @__PURE__ */ new Set();
  for (const id of valid) {
    try {
      const a = judge2.v.agreementsAgreement(specs, id);
      if (a.invalid) read4.notCounted.push({ id, why: `the core library finds these terms invalid: ${a.invalid}` });
      else if (a.exists === true || a.exists === null && a.ready) counts.add(id);
      else read4.proposed++;
    } catch (e3) {
      read4.notCounted.push({ id, why: `the core library could not judge it: ${message2(e3)}` });
    }
  }
  const first = (id) => {
    const seen = /* @__PURE__ */ new Set();
    let x = id;
    for (; ; ) {
      seen.add(x);
      const p = terms.get(x)?.fields.get(11);
      const ph = bytes32(p) ? hex(p) : null;
      if (!ph || !terms.has(ph) || seen.has(ph)) return x;
      x = ph;
    }
  };
  const byExt = /* @__PURE__ */ new Map();
  const agreementsCounted = /* @__PURE__ */ new Set();
  for (const id of [...counts].sort()) {
    const ag = first(id);
    agreementsCounted.add(ag);
    for (const h of new Set(named2(terms.get(id).fields))) {
      const m = byExt.get(h) ?? /* @__PURE__ */ new Map();
      m.set(ag, [...m.get(ag) ?? [], id]);
      byExt.set(h, m);
    }
  }
  read4.counted = agreementsCounted.size;
  read4.notCounted.sort((a, b) => a.id < b.id ? -1 : 1);
  const extensions = [...byExt].map(([hash, m]) => {
    const listed = byHash.get(hash) ?? null;
    return {
      hash,
      listed,
      agreements: [...m].map(([agreement, ids]) => ({ agreement, terms: ids })).sort((a, b) => a.agreement < b.agreement ? -1 : 1),
      layers: listed ? ["Development", ...(listed.spec.layers ?? []).map((n) => EXTENSION_LAYERS[n])] : null
    };
  });
  const name = (x) => x.listed?.name ?? `~${x.hash}`;
  extensions.sort((a, b) => b.agreements.length - a.agreements.length || (name(a) < name(b) ? -1 : name(a) > name(b) ? 1 : 0));
  return { extensions, agreements: read4 };
}

// src/track.ts
var LIMIT_SAY = [
  "Ummia sees public agreements only. A sealed agreement\u2019s use of a cMIP stays invisible unless someone publishes it.",
  "It is a plain look-up of the relays you name, asked with the filters relays already have (spec, type, signer). Nothing is indexed or kept: ask again to see what changed. Other relays may hold what these do not.",
  "The listing on dubsar.org reads the relays its page names: one source among any, never a registry. Name those relays here, or any others."
];
var flatten = (f) => f.flatMap((x) => [{ hash: x.listed.hash, name: x.listed.name, creator: x.listed.spec.creator, total: x.total }, ...flatten(x.forks)]);
async function track(relays, o = {}) {
  const listing = await readListing(
    relays.map((address) => ({ address, name: null })),
    [],
    o.via ?? {},
    { signer: o.signer || void 0 }
  );
  const all = /* @__PURE__ */ new Map();
  for (const l of listing.lines) for (const d of l.drafts) all.set(d.listed.hash, d.listed);
  for (const x of listing.xtypes) all.set(x.hash, x);
  const inAll = (f) => f.forEach((x) => (all.set(x.listed.hash, x.listed), inAll(x.forks)));
  for (const r of listing.mips.roots) all.set(r.listed.hash, r.listed), inAll(r.forks);
  for (const u2 of listing.mips.unrooted) inAll(u2.forks);
  const shown = (l, d) => {
    const w = roleWords(l, all);
    return {
      hash: l.hash,
      name: l.name,
      kind: KINDS[l.spec.kind] ?? `kind ${l.spec.kind}`,
      layer: w.layer,
      role: w.role,
      creator: l.spec.creator,
      claimed: l.claimed,
      publishers: [...new Set(l.publications.map((p) => p.signer))],
      publications: l.publications.map((p) => ({ id: p.id, signer: p.signer })),
      text: l.spec.text,
      agreements: listing.extensions.find((x) => x.hash === l.hash)?.agreements.length ?? 0,
      draft: d?.number ?? 1,
      after: d ? d.after?.hash ?? d.afterMissing : l.spec.predecessor,
      otherCreator: d?.otherCreator ?? false,
      releases: l.releases.map((r) => ({ id: r.id, name: r.name, version: r.version, problem: r.problem })),
      use: l.use
    };
  };
  const every = /* @__PURE__ */ new Map();
  for (const l of listing.lines) for (const d of l.drafts) every.set(d.listed.hash, shown(d.listed, d));
  for (const x of listing.xtypes) if (!every.has(x.hash)) every.set(x.hash, shown(x));
  const walk = (f) => {
    for (const x of f) {
      if (!every.has(x.listed.hash)) every.set(x.listed.hash, shown(x.listed));
      walk(x.forks);
    }
  };
  for (const r of listing.mips.roots) {
    if (!every.has(r.listed.hash)) every.set(r.listed.hash, shown(r.listed));
    walk(r.forks);
  }
  for (const u2 of listing.mips.unrooted) walk(u2.forks);
  return {
    specs: [...every.values()],
    relays: listing.relays.map((r) => ({ address: r.address, read: r.read, specs: r.specs, problem: r.asked ? r.problem : "not asked: an address a browser cannot reach", stopped: r.stopped })),
    lines: listing.lines.map((l) => l.drafts.map((d) => shown(d.listed, d))),
    xtypes: listing.xtypes.map((x) => shown(x)),
    extensions: listing.extensions.map((x) => ({ hash: x.hash, name: x.listed?.name ?? null, agreements: x.agreements.length, terms: x.agreements.flatMap((a) => a.terms), layers: x.layers })),
    agreements: { terms: listing.agreements.terms, counted: listing.agreements.counted, proposed: listing.agreements.proposed, notCounted: listing.agreements.notCounted.length, private: listing.agreements.private },
    mips: [
      ...listing.mips.roots.map((r) => ({ root: r.listed.hash, name: r.listed.name, forks: flatten(r.forks) })),
      ...listing.mips.unrooted.map((u2) => ({ root: u2.hash, name: u2.kind === null ? "not found on these relays" : `a ${KINDS[u2.kind] ?? "specification"}, which no MIP forks`, forks: flatten(u2.forks) }))
    ].filter((m) => m.forks.length || m.root),
    unverified: listing.unverified.map((u2) => ({ id: u2.id, signer: u2.signer, problem: u2.problem ?? "" })),
    limit: LIMIT_SAY
  };
}
async function actsOf(relays, q) {
  const via = q.via ?? {};
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const looked = /* @__PURE__ */ new Map();
  const acts2 = /* @__PURE__ */ new Map();
  const lines2 = [];
  for (const r of relays) {
    let after;
    let read4 = 0;
    try {
      for (; ; ) {
        const page = await relayAt(r, via).feed({ spec: q.spec, type: q.type, signer: q.signer || void 0, after });
        for (const it of page.items) {
          if (it.kind !== "act" || read4 >= 2e3) continue;
          read4++;
          const d = describeAct(it.item);
          if (!d.signer || acts2.has(d.id)) continue;
          let standing2 = "unknown";
          try {
            let l = looked.get(d.signer);
            if (!l) looked.set(d.signer, l = lookUp(d.signer, relays, via, v));
            await holdSequence(v, d.signer, await l, relays, via);
            v.add(it.item);
            standing2 = v.status(d.id);
          } catch (e3) {
            standing2 = `not checked: ${e3 instanceof Error ? e3.message : String(e3)}`;
          }
          acts2.set(d.id, { id: d.id, signer: d.signer, type: d.type ?? 0, standing: standing2, at: r });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
      lines2.push({ text: `${r}: ${read4} act${read4 === 1 ? "" : "s"} read.` });
    } catch (e3) {
      lines2.push({ text: `${r}: ${e3 instanceof Error ? e3.message : String(e3)}`, tone: "warn" });
    }
  }
  return { acts: [...acts2.values()], lines: lines2 };
}

// src/look.ts
var FILTERS = ["releases", "cmips", "modules", "xtypes", "extensions", "mips"];
async function manifestOf(d, places, via) {
  if (!d.payload) return null;
  const m = cborDecode(d.payload);
  if (!(m.get(0) instanceof Uint8Array) || hex(m.get(0)) !== REPO_SPECS.manifest || !(m.get(5) instanceof Uint8Array)) return null;
  for (const at of places) {
    try {
      const locked = await relayAt(at, via).getMedia(hex(m.get(2)));
      if (!locked) continue;
      const plain = openMedia(locked, m.get(5), m.get(4));
      if (workHash(plain) !== hex(m.get(1))) continue;
      return decodeManifest(plain);
    } catch {
    }
  }
  return null;
}
async function releasesAt(relays, via, judge2, signer) {
  const out = /* @__PURE__ */ new Map();
  for (const r of relays) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(r, via).feed({ spec: SPECS.envelopes, type: 0, signer, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          const d = describeAct(it.item);
          if (!d.public || !d.signer || out.has(d.id)) continue;
          const manifest = await manifestOf(d, [r, ...relays], via);
          if (!manifest) continue;
          let standing2 = "unknown";
          try {
            standing2 = await judge2.standing(it.item, d.id, d.signer);
          } catch (e3) {
            standing2 = `not checked: ${e3 instanceof Error ? e3.message : String(e3)}`;
          }
          out.set(d.id, { id: d.id, signer: d.signer, manifest, standing: standing2, hint: d.hint ?? null });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  return [...out.values()];
}
async function releaseById(id, relays, via, judge2) {
  for (const r of relays) {
    try {
      const act = await relayAt(r, via).getAct(id);
      if (!act) continue;
      const d = describeAct(act);
      const manifest = d.signer ? await manifestOf(d, [r, ...relays], via) : null;
      if (!manifest) return null;
      return { id, signer: d.signer, manifest, standing: await judge2.standing(act, id, d.signer).catch(() => "unknown"), hint: d.hint ?? null };
    } catch {
    }
  }
  return null;
}
var plural = (n, one2, many = `${one2}s`) => `${n} ${n === 1 ? one2 : many}`;
var short = (form2) => `${form2.slice(0, form2.indexOf("1") + 4)}\u2026${form2.slice(-3)}`;
function changedSince(m, before) {
  if (!m.previous) return null;
  if (!before) return "The release before it is not found on these relays: what changed cannot be said.";
  const was = new Map(before.files.map((f) => [f.path, f.work]));
  const now4 = new Map(m.files.map((f) => [f.path, f.work]));
  const changed = [...now4].filter(([p, w]) => was.has(p) && was.get(p) !== w).length;
  const added = [...now4.keys()].filter((p) => !was.has(p)).length;
  const removed = [...was.keys()].filter((p) => !now4.has(p)).length;
  const parts = [changed ? `${plural(changed, "file")} changed` : "", added ? `${added} added` : "", removed ? `${removed} removed` : ""].filter(Boolean);
  const impl = (m.implements ?? []).filter((i) => !(before.implements ?? []).some((b) => b.spec === i.spec)).map((i) => specForm(i.spec));
  const libs = m.dependencies.length !== before.dependencies.length || m.dependencies.some((d, i) => before.dependencies[i]?.version !== d.version || before.dependencies[i]?.name !== d.name);
  const said2 = [parts.length ? parts.join(", ") : "no file changed", ...libs ? ["its libraries changed"] : [], ...impl.length ? [`now implements ${impl.join(", ")}`] : []];
  return `What changed since ${before.version}: ${said2.join("; ")}.`;
}
function releaseItem(r, before) {
  const m = r.manifest;
  const changed = changedSince(m, before);
  return {
    id: r.id,
    signer: r.signer,
    kind: "release",
    filter: "releases",
    title: `${m.name} ${m.version}`,
    text: `${m.name} ${m.version} \xB7 ${plural(m.files.length, "file")}${changed ? `
${changed}` : ""}${m.implements?.length ? `
Implements ${m.implements.map((i) => specForm(i.spec)).join(", ")}.` : ""}`,
    hash: null,
    layer: null,
    labels: [],
    verified: r.standing === "valid",
    alarm: r.standing === "valid" ? null : `not valid for its signer\u2019s chain: ${r.standing}`,
    when: null,
    hint: r.hint,
    release: { name: m.name, version: m.version, files: m.files.length, previous: m.previous, changed, implements: (m.implements ?? []).map((i) => i.spec) }
  };
}
async function withBefore(rs, relays, via, judge2) {
  const byId = new Map(rs.map((r) => [r.id, r]));
  const out = [];
  for (const r of rs) {
    const p = r.manifest.previous;
    let before = p ? byId.get(p)?.manifest ?? null : null;
    if (p && !before) {
      const got = await releaseById(p, relays, via, judge2);
      if (got) byId.set(p, got);
      before = got?.manifest ?? null;
    }
    out.push(releaseItem(r, before));
  }
  return out;
}
var filterOf = (s) => s.kind === "MIP" ? "mips" : s.kind === "Module" ? "modules" : s.role.some((r) => r.startsWith("an xtype")) ? "xtypes" : "cmips";
function specItem(s, card2) {
  const pub = s.publications.find((p) => p.signer === s.creator) ?? s.publications[0];
  if (!pub) return null;
  const f = filterOf(s);
  const title = card2?.fields.title ?? s.name;
  const use = s.use ? `
Used: ${plural(s.use.acts, "public act")} of its types${s.use.notValid ? ` (${s.use.notValid} not valid, not counted)` : ""}.` : "";
  return {
    id: pub.id,
    signer: pub.signer,
    kind: f === "xtypes" ? "xtype" : s.kind,
    filter: f,
    title,
    text: `${title}${s.draft > 1 ? `, draft ${s.draft} in its line` : ""} \xB7 ${short(specForm(s.hash))}${card2?.fields.summary ? `
${card2.fields.summary}` : `
${s.role[0] ?? ""}`}${use}`,
    hash: s.hash,
    layer: s.layer,
    labels: [
      ...card2 ? [{ text: "its creator\u2019s card" }] : [],
      ...s.creator && !s.claimed ? [{ text: "unclaimed: its named creator never published it", tone: "warn" }] : [],
      ...s.otherCreator ? [{ text: "its creator is not its predecessor\u2019s", tone: "warn" }] : [],
      ...s.agreements ? [{ text: `named by ${plural(s.agreements, "public agreement")} as an extension` }] : []
    ],
    verified: true,
    alarm: null,
    when: null,
    hint: null
  };
}
function extensionItem(s, card2) {
  const base = specItem(s, card2);
  if (!base) return null;
  return { ...base, kind: "extension", filter: "extensions", text: `${base.title} \xB7 ${short(specForm(s.hash))}
Named as an extension by ${plural(s.agreements, "public agreement")}.` };
}
async function look(relays, q) {
  const via = q.via;
  const judge2 = new Judge(relays, via);
  const want = new Set(q.filters);
  const lines2 = [];
  const counts = [];
  let items = [];
  if (q.release) {
    const line = [];
    let at = q.release;
    for (let i = 0; at && i < 50; i++) {
      const r = await releaseById(at, relays, via, judge2);
      if (!r) {
        if (!line.length) lines2.push({ text: `The release ${actForm(at)} was not found on ${relays.join(", ")}.`, tone: "warn" });
        break;
      }
      line.push(r);
      at = r.manifest.previous;
    }
    items = await withBefore(line, relays, via, judge2);
  } else {
    const signers = q.signers?.length ? q.signers : [void 0];
    if (q.signers && !q.signers.length) lines2.push({ text: "Nobody to point at: your contacts are empty.", tone: "warn" });
    const tracked = [];
    for (const s of q.signers && !q.signers.length ? [] : signers) {
      const specsWanted = [...want].some((f) => f !== "releases");
      if (specsWanted) tracked.push(await track(relays, { signer: s, via }));
      if (want.has("releases")) items.push(...await withBefore(await releasesAt(relays, via, judge2, s), relays, via, judge2));
    }
    const seen = /* @__PURE__ */ new Set();
    const pre = tracked.length ? await readCards(relays, via) : [];
    for (const t of tracked) {
      for (const s of t.specs) {
        if (seen.has(s.hash)) continue;
        seen.add(s.hash);
        const pub = s.publications.find((p) => p.signer === s.creator);
        const cards = s.creator && pub ? (await cardsFor(s.hash, s.creator, relays, via, /* @__PURE__ */ new Map(), { pre, onlyCreator: true })).cards : [];
        const card2 = ownCard(cards);
        const item = specItem(s, card2);
        if (item) items.push(item);
        if (s.agreements && want.has("extensions")) {
          const x = extensionItem(s, card2);
          if (x) items.push({ ...x, id: x.id });
        }
      }
      for (const r of t.relays) counts.push({ text: `${r.address}: ${r.problem ? r.problem : `${r.read} acts read, ${plural(r.specs, "specification")}${r.stopped ? " (stopped: more than a look reads)" : ""}`}`, tone: r.problem ? "warn" : void 0 });
      counts.push({ text: `Public agreements counted: ${t.agreements.counted} (${t.agreements.proposed} proposed, not signed by every party; ${t.agreements.notCounted} not verified; ${t.agreements.private} private items unread).` });
      for (const x of t.extensions.filter((e3) => !e3.name)) counts.push({ text: `An extension not found on these relays, ${specForm(x.hash)}, named by ${plural(x.agreements, "public agreement")}.` });
      for (const u2 of t.unverified) lines2.push({ text: `Not verified: ${actForm(u2.id)}: ${u2.problem}`, tone: "warn" });
    }
    items = items.filter((x, i) => x.filter !== "extensions" || !items.some((y, j) => j !== i && y.id === x.id && y.filter !== "extensions" && want.has(y.filter)));
  }
  items = items.filter((x) => want.has(x.filter) && (!q.layer || (x.layer ?? "").split(", ").includes(q.layer)));
  const times = await clockTimes([...relays, ...q.hints ?? []], via);
  let placed = 0;
  for (const x of items) {
    const t = times.get(x.id);
    if (t !== void 0) {
      x.when = byClock(t);
      placed++;
    }
  }
  items = newestFirst(items, times, { id: (x) => x.id, signer: (x) => x.signer });
  return { items, lines: lines2, counts, ordered: { placed, shown: items.length } };
}
async function specPage(hash, relays, via, hints = []) {
  const t = await track(relays, { via });
  const s = t.specs.find((x) => x.hash === hash) ?? null;
  const b = builtIn(hash);
  const times = await clockTimes([...relays, ...hints], via);
  const { cards, lines: lines2 } = await cardsFor(hash, s?.creator ?? null, relays, via, times);
  const own = ownCard(cards);
  const ownAlso = cards.filter((c) => c.creators && !c.superseded && c !== own);
  const others = cards.filter((c) => !c.creators && !c.superseded);
  const judge2 = new Judge(relays, via);
  const releases = (s?.releases ?? []).map((r) => ({ id: r.id, name: r.name, version: r.version, signer: null, problem: r.problem, from: "manifest" }));
  for (const id of own?.fields.releases ?? []) {
    if (releases.some((r2) => r2.id === id)) continue;
    const r = await releaseById(id, relays, via, judge2);
    releases.push({ id, name: r?.manifest.name ?? null, version: r?.manifest.version ?? null, signer: r?.signer ?? null, problem: r ? r.standing === "valid" ? null : r.standing : "not found on these relays", from: "card" });
  }
  let discussion = null;
  const did = own?.fields.discussion ?? null;
  if (did) {
    discussion = { id: did, text: null, signer: null };
    for (const r of relays) {
      try {
        const a = await relayAt(r, via).getAct(did);
        if (!a) continue;
        const d = describeAct(a);
        const x = d.payload ? cborDecode(d.payload).get(0) : null;
        discussion = { id: did, text: typeof x === "string" ? x : null, signer: d.signer ?? null };
        break;
      } catch {
      }
    }
  }
  const pred = s?.after ? { hash: s.after, name: t.specs.find((x) => x.hash === s.after)?.name ?? builtIn(s.after)?.title ?? null, otherCreator: s.otherCreator } : null;
  const successors = t.specs.filter((x) => x.after === hash).map((x) => ({ hash: x.hash, name: x.name, otherCreator: !!s && x.creator !== s.creator }));
  const pub = s ? s.publications.find((p) => p.signer === s.creator) ?? s.publications[0] ?? null : null;
  if (!s && !b) lines2.unshift({ text: `No specification with this hash was found on ${relays.join(", ")}: what is shown below is only what others say of it. Other relays may hold it.`, tone: "warn" });
  return {
    hash,
    found: !!s || !!b,
    title: own?.fields.title ?? s?.name ?? b?.title ?? `A specification not found (${specForm(hash).slice(0, 12)}\u2026)`,
    name: s?.name ?? b?.title ?? null,
    kind: s?.kind ?? b?.kind ?? null,
    layer: s?.layer ?? null,
    role: s?.role ?? [],
    text: s?.text ?? null,
    creator: s?.creator ?? null,
    claimed: s?.claimed ?? false,
    publication: pub,
    builtIn: b ? { summary: b.summary, say: BUILT_IN_SAY } : null,
    own,
    ownAlso,
    superseded: cards.filter((c) => c.superseded).length,
    others,
    releases,
    vectors: own?.fields.vectors ?? [],
    discussion,
    agreements: s?.agreements ?? 0,
    predecessor: pred,
    successors,
    use: s?.use ?? null,
    lines: lines2
  };
}

// ../longform/src/act.ts
function textPayload2(text3, format = LONGFORM_SPECS.longform) {
  const m = /* @__PURE__ */ new Map([[0, text3]]);
  if (format) m.set(1, unhex(format));
  return cborEncode(m);
}
async function publishDocument(by, text3, relays) {
  for (const hint of relays) {
    for (const a of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(a);
      } catch {
      }
    }
  }
  const made = await by.publish(LONGFORM_SPECS.text, TEXT_ACT, textPayload2(text3), { public: true, relays });
  return { id: made.id };
}

// src/acting.ts
var short2 = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
function actors(held, collectives = []) {
  return [
    ...held.map((id) => ({ id, short: short2(id), kind: "self", available: true, why: null })),
    ...collectives.map((c) => ({ id: c.id, short: short2(c.id), kind: "collective", available: c.available, why: c.why }))
  ];
}
function chosen(all, wanted) {
  return all.find((a) => a.id === wanted && a.available) ?? all.find((a) => a.available) ?? null;
}

// ../damgar/src/messages.ts
var TYPES = { draft: 1, request: 2, invoiceRequest: 3, answer: 4, laneRequest: 5, sale: 6 };
var WHAT2 = { pay: 0, ask: 1, anchor: 2, confirm: 3 };
var amountValue = (a) => [unhex(a.unit), a.value];
var text = (v, what) => {
  if (typeof v !== "string" || v.length > 280 || /[\u0000-\u0009\u000b-\u001f]/.test(v)) throw new Error(`${what}: not a short text`);
  return v;
};
function draftPayload(d) {
  const m = /* @__PURE__ */ new Map([
    [0, WHAT2[d.what]],
    [1, unhex(d.other)],
    [2, amountValue(d.amount)]
  ]);
  if (d.whatFor) m.set(3, text(d.whatFor, "what for"));
  m.set(4, text(d.app, "the app"));
  if (d.what === "anchor") {
    if (!d.anchor) throw new Error("A draft paying for an anchor names the offer, the tier, the leaf and the tier\u2019s price tag.");
    m.set(5, [unhex(d.anchor.offer), d.anchor.tier, unhex(d.anchor.leaf), unhex(d.anchor.tag)]);
  }
  if (d.what === "confirm") {
    if (!d.confirm?.acks.length) throw new Error("A draft confirming a purchase names the claim and what it acknowledges.");
    m.set(6, [unhex(d.confirm.claim), d.confirm.acks.map(unhex)]);
  }
  return cborEncode(m);
}
async function sendDraft(me, d, opts) {
  return sendToSelf(me, TYPES.draft, draftPayload(d), opts);
}
async function sendToSelf(me, type, payload, opts) {
  const homes = me.f.homes.map((h) => h.hint);
  const look2 = await lookUp(me.id, homes, opts.via ?? {});
  if (!look2.encryptionKey) throw new Error("This identity publishes no encryption key, so nothing can be sealed to it: the draft cannot travel to Damgar. Nothing was signed.");
  if (!me.f.encryption.some((e3) => (e3.secret ? hex(xwingPublic(unhex(e3.secret))) : e3.public ?? "") === hex(look2.encryptionKey))) {
    throw new Error("The encryption key this identity publishes is not one this app holds: Damgar, holding the same words, could not open the draft either. Nothing was signed.");
  }
  let made;
  try {
    made = await me.signNow(MESSAGES_SPEC, type, payload, { public: false, to: [me.id], refs: opts.refs });
  } finally {
    await opts.save();
  }
  const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look2.encryptionKey }]);
  const left = [];
  for (const h of homes) {
    try {
      await relayAt(h, opts.via ?? {}).putSealed(sealed);
      left.push(h);
    } catch {
    }
  }
  await leaveAtHomes(me, made, { via: opts.via ?? {}, sealed: left.length > 0 });
  await opts.save();
  if (!left.length) throw new Error(`No home took the draft (${homes.join(", ")}). It was signed but went nowhere: prepare it again later.`);
  return { id: made.id, left };
}

// src/anchor.ts
var short3 = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
var message3 = (e3) => e3 instanceof Error ? e3.message : String(e3);
var ANCHOR_SAY = [
  "Optional. An anchor puts this release\u2019s fingerprint on the Bitcoin chain through a pooled anchoring service, so anyone can later see it existed by a given block.",
  "The service is sent a leaf: the release\u2019s id mixed with a random secret (the blind) Ummia keeps. It never learns the release. A lost blind loses the anchor\u2019s use.",
  "You pay the service\u2019s price in Damgar, following its standing offer: Ummia prepares the payment, sealed to you, and signs no money act. The service\u2019s ticket promises a batch and a deadline (a block).",
  "Round 1 runs on regtest, with a test anchoring service of ours, labelled: its coins are worth nothing."
];
async function placesOf(service, hints, via) {
  const l = await lookUp(service, hints, via);
  const places = [.../* @__PURE__ */ new Set([...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints), ...l.resolution.homes.map((h) => h.hint), ...hints])];
  return { l, places };
}
async function offers(service, hints, via = {}) {
  const { l, places } = await placesOf(service, hints, via);
  const pubs = /* @__PURE__ */ new Map();
  const tags = /* @__PURE__ */ new Map();
  for (const h of places) {
    try {
      for (const it of (await relayAt(h, via).feed({ signer: service, spec: MIRS.agreements })).items) if (it.kind === "act") pubs.set(describeAct(it.item).id, it.item);
      for (const it of (await relayAt(h, via).feed({ signer: service, spec: MIRS.money, type: 5 })).items) if (it.kind === "act") tags.set(describeAct(it.item).id, it.item);
    } catch {
    }
  }
  for (const a of [...pubs.values(), ...tags.values()]) {
    try {
      l.verifier.add(a);
    } catch {
    }
  }
  const valid = [...tags.entries()].filter(([id]) => l.verifier.status(id) === "valid").map(([, a]) => a);
  const out = /* @__PURE__ */ new Map();
  for (const a of pubs.values()) {
    try {
      const o = anchoringReadOffer(a, valid);
      if (l.verifier.status(o.id) === "valid") out.set(o.id, { act: o.id, tiers: o.tiers, unit: o.unit, network: o.network, words: o.words, tags: o.tags });
    } catch {
    }
  }
  return [...out.values()];
}
function tagFor(o, tier) {
  const t = o.tags.find((x) => x.tier === tier)?.tag;
  if (!t) throw new Error("The service signed no price tag for that tier: it cannot be bought (anchoring draft 7, one price tag per tier).");
  return t;
}
async function ask(me, a) {
  const tier = a.offer.tiers[a.tier];
  if (!tier) throw new Error("The offer has no such tier.");
  const blind = new Uint8Array(randomBytes(32));
  const leaf = anchoringLeaf(a.act, blind);
  const r = await sendDraft(me, { what: "anchor", other: a.service, amount: { unit: a.offer.unit, value: tier.price }, whatFor: `an anchor of ${a.label}`, app: "Ummia", anchor: { offer: a.offer.act, tier: a.tier, leaf, tag: tagFor(a.offer, a.tier) } }, { via: a.via, save: a.save });
  const asked = { act: a.act, label: a.label, blind: hex(blind), leaf, service: a.service, offer: a.offer.act, tier: a.tier, draft: r.id, at: Math.floor(Date.now() / 1e3) };
  return {
    asked,
    lines: [
      { text: `Asked: an anchor of ${a.label} (${a.act.slice(0, 8)}\u2026), by ${short3(a.service)}, tier ${a.tier} (within ${tier.blocks} blocks), for ${say({ unit: a.offer.unit, value: tier.price }, /* @__PURE__ */ new Set([a.offer.unit]))}.`, tone: "ok" },
      { text: `The payment is prepared, not signed: sealed to you at your homes (${r.left.join(", ")}), it waits in Damgar, in To sign. The blind is kept here.` }
    ]
  };
}
async function publication(x, hints, via) {
  const { l, places } = await placesOf(x.service, hints, via);
  for (const h of places) {
    try {
      for (const it of (await relayAt(h, via).feed({ signer: x.service, spec: SPEC.anchoring, type: 3 })).items) {
        if (it.kind !== "act") continue;
        const d = describeAct(it.item);
        if (d.spec !== SPEC.anchoring || d.type !== 3 || !d.payload) continue;
        l.verifier.add(it.item);
        if (l.verifier.status(d.id) !== "valid") continue;
        const p = anchoringReadPublication(d.payload);
        if (p && p.offer === x.offer && p.leaves.includes(x.leaf)) return p;
      }
    } catch {
    }
  }
  return null;
}
async function standing(x, hints, via, chain) {
  const shown = { act: x.act, label: x.label, service: x.service, tier: x.tier, state: "asked", lines: [] };
  try {
    const pub = await publication(x, hints, via);
    if (!pub) {
      shown.lines.push({ text: "Not in a published batch yet: paid in Damgar? The service publishes each batch it anchors." });
      return shown;
    }
    shown.state = "published";
    shown.lines.push({ text: `In the service\u2019s batch ${pub.batch}, published, its transaction ${pub.tx.slice(0, 12)}\u2026 (output ${pub.output}).`, tone: "ok" });
    if (!pub.key) {
      shown.state = "unknown";
      shown.lines.push({ text: "The publication does not name the key its output is tweaked from (F341): the anchor cannot be checked from the service\u2019s acts alone.", tone: "warn" });
      return shown;
    }
    if (!chain) {
      shown.state = "unknown";
      shown.lines.push({ text: "Ummia follows no chain here: the anchor cannot be checked against Bitcoin. On a computer, open Ummia with --regtest.", tone: "warn" });
      return shown;
    }
    const t = await chain.tx(hex(unhex(pub.tx).reverse()));
    const headers = await chain.headers();
    const batch = anchoringBatch(pub.leaves);
    const index = pub.leaves.indexOf(x.leaf);
    let block;
    if (t.block) block = { index: t.block.index, branch: merkleBranch(t.block.txids, t.block.index), headers: headers.headers.slice(t.block.height - headers.start, t.block.height - headers.start + 6) };
    const proof = batchAnchor({ blind: unhex(x.blind), index, count: batch.count, branch: batch.branches[index], key: pub.key, tx: t.raw, output: pub.output, block });
    const v = batchAnchorCheck(x.act, proof, headers);
    shown.state = v.answer === "valid" ? "anchored" : v.answer;
    shown.lines.push(v.answer === "valid" ? { text: `Anchored at block ${v.point}, on the chain followed (${chain.said}): checked by the Bitcoin clock Module\u2019s rule.`, tone: "ok" } : { text: `Not yet anchored: ${v.answer}, ${v.why}.`, tone: v.answer === "invalid" ? "bad" : "warn" });
  } catch (e3) {
    shown.state = "unknown";
    shown.lines.push({ text: message3(e3), tone: "warn" });
  }
  return shown;
}

// src/mips.ts
var FORKABLE = [
  { key: "identity", name: "Identity MIR", hash: MIRS.identity },
  { key: "envelopes", name: "Envelopes MIR", hash: MIRS.envelopes },
  { key: "text", name: "Text MIR", hash: MIRS.text },
  { key: "money", name: "Money MIR", hash: MIRS.money },
  { key: "agreements", name: "Agreements MIR", hash: MIRS.agreements },
  { key: "development", name: "Development MIR", hash: MIRS.development }
];
var SHAPE = ["Purpose", "What it changes", "Dependencies", "Words used in this MIP", "Rules", "Reasoning", "Freeze scenarios"];
var MIP_SAY = [
  "A MIP is a proposal toward MOR 2: a fork of one MIR (or of another MIP), or, for a new layer, of the MICS document. Anyone may fork a MIP; adoption, not authority, sorts the forks.",
  "Drafts are published for discussion as signed long-form documents, readable in the reader and answerable from Dub. They are not specifications: nothing names them by a spec hash.",
  "Only when you are ready is it published as a specification (a MIP, kind 8), naming you as its creator and what it would replace. That act is for good: a changed MIP is a new one, with a new hash."
];
function template(a) {
  const title = a.title.trim() || "A proposal";
  return [
    `# MIP: ${title}`,
    "",
    `*Draft 1, a proposal toward MOR 2, by ${a.creator}. It forks ${a.forks}.*`,
    "",
    ...SHAPE.flatMap((h) => [`## ${h}`, "", h === "Purpose" ? "What this proposal is for, in plain words." : h === "What it changes" ? "Each rule it adds, changes or removes, against the text it forks." : h === "Rules" ? "#### Rule 1. A name\n\nThe rule, as it would read." : "\u2026", ""])
  ].join("\n").trimEnd();
}
function shapeOf(text3) {
  const out = [];
  const first = text3.split("\n")[0] ?? "";
  out.push(/^# MIP: \S/.test(first) ? { text: `Its title: \u201C${first.slice(7)}\u201D.`, tone: "ok" } : { text: "Its first line should be its title, \u201C# MIP: \u2026\u201D, as a MIR\u2019s is \u201C# MIR: \u2026\u201D.", tone: "warn" });
  const heads = new Set(text3.split("\n").filter((l) => l.startsWith("## ")).map((l) => l.slice(3).trim()));
  const missing = SHAPE.filter((h) => !heads.has(h));
  out.push(missing.length ? { text: `Headings of the MIP shape not found: ${missing.join(", ")}.`, tone: "warn" } : { text: "Every heading of the MIP shape is there.", tone: "ok" });
  return out;
}
async function publishDraft(me, text3, relays) {
  return publishDocument(me, text3, relays);
}
async function replies(me, drafts, relays, via = {}) {
  const want = new Set(drafts);
  const out = /* @__PURE__ */ new Map();
  const lines2 = [];
  if (!want.size) return { replies: out, lines: lines2 };
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const mine = await lookUp(me.id, me.f.homes.map((h) => h.hint), via, v);
  const inbox = mine.inbox(SPECS.text) ?? [];
  const seen = /* @__PURE__ */ new Set();
  const take = async (act, d, key, sealed) => {
    if (!d.signer || seen.has(d.id) || d.spec !== LONGFORM_SPECS.text || d.type !== TEXT_ACT || !d.payload) return;
    const named2 = (d.refs ?? []).filter((r) => want.has(r));
    if (!named2.length) return;
    seen.add(d.id);
    let standing2 = "unknown";
    try {
      await lookUp(d.signer, [...relays, ...inbox], via, v);
      if (key) v.addWithKey(act, key);
      else v.add(act);
      standing2 = v.status(d.id);
    } catch (e3) {
      standing2 = `not checked: ${e3 instanceof Error ? e3.message : String(e3)}`;
    }
    const t = cborDecode(d.payload).get(0);
    for (const r of named2) out.set(r, [...out.get(r) ?? [], { id: d.id, signer: d.signer, text: typeof t === "string" ? t : "", standing: standing2, sealed }]);
  };
  const secrets = [...me.f.encryption].reverse().map((e3) => unhex(e3.secret));
  const asks = [...inbox.map((h) => ({ h, toMe: true })), ...relays.map((h) => ({ h, toMe: false }))];
  for (const { h, toMe } of asks) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via).feed(toMe ? { to: me.id, after } : { spec: SPECS.text, type: TEXT_ACT, after });
        for (const it of page.items) {
          if (it.kind === "act") {
            const d = describeAct(it.item);
            if (d.public) await take(it.item, d, void 0, false);
            continue;
          }
          for (const s of secrets) {
            try {
              const o = openSealed(it.item, me.id, s);
              await take(o.act, o.described, o.key, true);
              break;
            } catch {
            }
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e3) {
      lines2.push({ text: `${h}: ${e3 instanceof Error ? e3.message : String(e3)}`, tone: "warn" });
    }
  }
  return { replies: out, lines: lines2 };
}

// src/reports.ts
var REPORT_SAY = [
  "A report is public: signed by your identity, addressed to the reporting identity and left in its inbox, where anyone can read it. Never put a secret in it; to tell something privately, send a sealed message from Dub instead, which is never mirrored.",
  "Public reports are mirrored on GitHub as issues, with each answer as a comment, by the reports mirror, which the author runs by hand: it may take a while to appear there.",
  "Answers are the reporting identity\u2019s own public posts naming your report: Ummia looks for them at its relays."
];
async function send(me, a) {
  const l = await lookUp(a.to, [...a.relays, ...me.f.homes.map((h) => h.hint)], a.via);
  const inbox = l.inbox(SPECS.text) ?? [];
  if (!inbox.length) throw new Error("The reporting identity declares no inbox: no report can reach it. Nothing was signed.");
  let made;
  try {
    made = await post(me, { text: a.text, relays: a.relays, to: [a.to] });
  } finally {
    await a.save();
  }
  const left = await leaveInInbox(me, made.act, inbox);
  const title = a.text.split("\n")[0].slice(0, 120);
  return {
    sent: { id: made.id, to: a.to, title, at: Math.floor(Date.now() / 1e3), left: left.left },
    lines: [
      { text: `Sent: report ${made.id.slice(0, 12)}\u2026, public, signed by you.`, tone: "ok" },
      left.left.length ? { text: `Left in the reporting identity\u2019s inbox: ${left.left.join(", ")}.`, tone: "ok" } : { text: `No inbox relay took it: ${left.failed.map((f) => `${f.relay}: ${f.reason}`).join("; ")}. It is published on your relays all the same.`, tone: "warn" }
    ]
  };
}
async function answers(to, reports, places, via = {}) {
  const want = new Set(reports);
  const lines2 = [];
  const out = /* @__PURE__ */ new Map();
  if (!want.size) return { answers: [], lines: lines2 };
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let at = places;
  try {
    const l = await lookUp(to, places, via, v);
    const outbox = l.routes.routes.filter((r) => (r.kind ?? 0) === 0);
    const route = outbox.find((r) => r.scope === POST_SPECS.text) ?? outbox.find((r) => r.scope === null);
    at = [.../* @__PURE__ */ new Set([...route?.hints ?? [], ...places])];
  } catch (e3) {
    return { answers: [], lines: [{ text: `The reporting identity could not be looked up: ${e3 instanceof Error ? e3.message : String(e3)}.`, tone: "warn" }] };
  }
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via).feed({ signer: to, spec: POST_SPECS.text, type: TEXT_ACT2, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          const d = describeAct(it.item);
          if (!d.public || d.signer !== to || !d.payload || out.has(d.id)) continue;
          const named2 = (d.refs ?? []).find((r) => want.has(r));
          if (!named2) continue;
          v.add(it.item);
          const t = cborDecode(d.payload).get(0);
          out.set(d.id, { id: d.id, report: named2, text: typeof t === "string" ? t : "", standing: v.status(d.id) });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e3) {
      lines2.push({ text: `${h}: ${e3 instanceof Error ? e3.message : String(e3)}`, tone: "warn" });
    }
  }
  return { answers: [...out.values()], lines: lines2 };
}

// src/spec.ts
var MIR_OF_LAYER = Object.fromEntries(Object.entries(LAYERS).map(([hash, name]) => [name, hash]));
var HEX642 = /^[0-9a-f]{64}$/;
function readHash(s, what) {
  const h = s.replace(/\s+/g, "").toLowerCase();
  if (HEX642.test(h)) return h;
  try {
    return readForm(s, "mspec").hex;
  } catch (e3) {
    throw new Error(`${what}: ${e3 instanceof Error ? e3.message : String(e3)} (a spec hash is mspec1\u2026, or 64 hexadecimal characters).`);
  }
}
function specContent(f, creator) {
  const m = /* @__PURE__ */ new Map([[0, f.kind]]);
  if (![0, 1, 8].includes(f.kind)) throw new Error("Ummia publishes a cMIP, a Module or a MIP.");
  m.set(1, unhex(creator));
  const tasks = [...new Set(f.tasks ?? [])].sort((a, b) => a - b);
  if (tasks.length) {
    if (f.kind !== 0) throw new Error("Only a cMIP fills a task.");
    m.set(
      2,
      tasks.map((n) => {
        const t = TASKS[n];
        if (!t) throw new Error(`There is no task ${n}.`);
        return [unhex(MIR_OF_LAYER[t[0]]), n];
      })
    );
  }
  if (f.types?.length) m.set(3, [...f.types].sort((a, b) => a[0] - b[0]).map(([n, name, schema]) => [n, name, schema]));
  if (f.dependencies?.length) m.set(4, [...new Set(f.dependencies)].sort().map(unhex));
  if (f.kind === 1) {
    if (!f.implements) throw new Error("A Module names the cMIP it implements, or the MIR it works under (field 5).");
    m.set(5, unhex(f.implements));
  } else if (f.implements) throw new Error("Only a Module names what it implements (field 5).");
  if (f.predecessor) m.set(8, unhex(f.predecessor));
  else if (f.kind === 8) throw new Error("A MIP names the MIR or MIP it forks, or for a new layer the MICS document (field 8).");
  m.set(9, f.text);
  if (f.layers?.length) m.set(10, [...new Set(f.layers)].sort((a, b) => a - b));
  if (f.rail) {
    m.set(11, f.rail.kind);
    m.set(13, [...new Set(f.rail.binds)].sort((a, b) => a - b));
  }
  if (f.checker) m.set(12, true);
  return cborEncode(m);
}
function prepareSpec(f, creator) {
  const blocking = [];
  if (!f.text.trim()) blocking.push("Write the specification\u2019s text, or load it from a file.");
  try {
    checkText(f.text);
  } catch (e3) {
    blocking.push(`Its text is not canonical text (Text MIR), which field 9 must be: ${e3 instanceof Error ? e3.message : String(e3)}. A final line break or a space at the end of a line is the usual cause.`);
  }
  let content;
  try {
    content = specContent(f, creator);
  } catch (e3) {
    return { content: new Uint8Array(), hash: "", spec: null, name: nameOf(f.text), blocking: [...blocking, e3 instanceof Error ? e3.message : String(e3)] };
  }
  let spec = null;
  if (!blocking.length) {
    try {
      spec = decodeSpec2(content);
    } catch (e3) {
      blocking.push(`The core library reads it as no specification (Development, F323): ${e3 instanceof Error ? e3.message : String(e3)}.`);
    }
  }
  return { content, hash: specHash(content), spec, name: nameOf(f.text), blocking };
}
async function publishSpec(by, content, relays) {
  const lm = lockMedia(content);
  const payload = cborEncode(
    /* @__PURE__ */ new Map([
      [0, unhex(MIRS.development)],
      [1, unhex(lm.workHash)],
      [2, unhex(lm.lockedHash)],
      [3, content.length],
      [4, lm.nonce],
      [5, lm.key],
      [6, relays]
    ])
  );
  for (const r of relays) for (const a of by.chainActs()) await relayAt(r, by.via).putAct(a).catch(() => void 0);
  const made = await by.publish(SPECS.envelopes, 0, payload, { public: true, relays });
  const refused = [];
  for (const r of relays) {
    try {
      await relayAt(r, by.via).putMedia(lm.locked);
    } catch (e3) {
      refused.push(`${r}: ${e3 instanceof Error ? e3.message : String(e3)}`);
    }
  }
  return { id: made.id, act: made.act, refused };
}

// ../dub/src/names.ts
var NAMING_SPEC = sha2562("Naming cMIP, draft 1, test value until publication");
var NAME = 4;
var NAME_WITHDRAWAL = 5;
var MAX_NAME = 48;
var FORBIDDEN = new RegExp("[\\u0000-\\u001f\\u007f-\\u009f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069]", "u");
function nameProblem(name) {
  if (name !== name.normalize("NFC")) return "it is not canonical text (NFC)";
  if (!name.trim()) return "it is empty";
  if (/^\s|\s$/u.test(name)) return "it starts or ends with a space";
  if (FORBIDDEN.test(name)) return "it holds a line break, a control character or a direction override";
  if ([...name].length > MAX_NAME) return `it is longer than ${MAX_NAME} characters`;
  return null;
}
async function namesOf(identity, places, via = {}) {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const l = await lookUp(identity, places, via, v);
  const routed = l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
  const at = [.../* @__PURE__ */ new Set([...l.resolution.homes.map((h) => h.hint), ...routed, ...places])];
  await holdSequence(v, identity, l, at, via);
  const names = /* @__PURE__ */ new Map();
  const withdrawn = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via).feed({ signer: identity, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          let d;
          try {
            d = describeAct(it.item);
          } catch {
            continue;
          }
          if (seen.has(d.id) || d.spec !== SPECS.identity || d.signer !== identity) continue;
          if (d.type !== NAME && d.type !== NAME_WITHDRAWAL) continue;
          seen.add(d.id);
          v.add(it.item);
          if (v.status(d.id) !== "valid") continue;
          if (d.type === NAME_WITHDRAWAL) {
            for (const [chain, target] of d.objects ?? []) if (chain === target) withdrawn.add(target);
            continue;
          }
          const m = cborDecode(d.payload);
          const name = m.get(0);
          const cmip = m.get(1);
          if (typeof name !== "string" || !(cmip instanceof Uint8Array) || hex(cmip) !== NAMING_SPEC) continue;
          if (nameProblem(name)) continue;
          names.set(d.id, { act: d.id, name });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  return [...names.values()].filter((n) => !withdrawn.has(n.act)).sort((a, b) => a.act < b.act ? -1 : 1);
}

// ../kit/src/engine/people.ts
var heldSecrets = (me) => [...me.f.encryption].reverse().filter((x) => x.secret).map((x) => unhex(x.secret));
async function readContacts(me, open, via = {}) {
  if (!open || Array.isArray(open) && !open.length) return { contacts: [], version: 0, problem: "this app cannot open what is sealed to this identity, so its contacts cannot be read here" };
  const l = await readSealedList(me.id, open, me.f.homes.map((h) => h.hint), via);
  return { contacts: l.follows, version: l.version, problem: !l.act && l.problems.length ? `its homes did not answer (${l.problems.join("; ")})` : null };
}
function readNick(typed) {
  const n = (typed ?? "").normalize("NFC").trim();
  if (!n) return null;
  if ([...n].length > MAX_NAME) throw new Error(`A nickname is at most ${MAX_NAME} characters. Nothing was signed.`);
  if (/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(n)) throw new Error("A nickname holds no line break, control character or direction override. Nothing was signed.");
  return n;
}
async function changeContacts(me, change, o) {
  const via = o.via ?? {};
  if (!o.open || Array.isArray(o.open) && !o.open.length) throw new Error(`${o.app} cannot open what is sealed to this identity, so its contacts cannot be changed from here. Nothing was signed.`);
  const homes = me.f.homes.map((h) => h.hint);
  const found = await readSealedList(me.id, o.open, homes, via);
  if (!found.act && found.problems.length >= homes.length) throw new Error(`The contacts could not be read: its homes did not answer (${found.problems.join("; ")}). Nothing was signed.`);
  const next = change(found.follows.map((f) => ({ ...f })));
  if (!next) return [{ text: "Nothing changed.", tone: "ok" }];
  const look2 = await lookUp(me.id, homes, via);
  if (!look2.encryptionKey) throw new Error("This identity publishes no encryption key: its contacts cannot be sealed to it. Nothing was signed.");
  if (Array.isArray(o.open) && !me.f.encryption.some((x) => x.secret && hex(xwingPublic(unhex(x.secret))) === hex(look2.encryptionKey))) throw new Error(`The encryption key this identity publishes is not one ${o.app} holds: its contacts cannot be sealed from here. Nothing was signed.`);
  let made;
  try {
    made = await me.signNow(PEOPLE_SPEC, SEALED_LIST, sealedListPayload({ version: found.version + 1, previous: found.act, follows: next }), { public: false, to: [me.id] });
  } finally {
    await o.save?.();
  }
  const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look2.encryptionKey }]);
  let left = 0;
  for (const h of homes) {
    try {
      await relayAt(h, via).putSealed(sealed);
      left++;
    } catch {
    }
  }
  await leaveAtHomes(me, made, { via, sealed: left > 0 });
  await o.save?.();
  const said2 = [];
  if (found.forked) said2.push({ text: "Your contacts were forked at your homes: two apps changed them at once. The longer branch was continued.", tone: "warn" });
  said2.push(left ? { text: `Your contacts are sealed to you and kept at your homes (version ${found.version + 1}): every app holding this identity reads them.`, tone: "ok" } : { text: "No home took your contacts: nothing changed there. Try again.", tone: "warn" });
  return said2;
}
var addContact = (me, who2, o) => changeContacts(
  me,
  (now4) => {
    if (who2.id === me.id) throw new Error("That is this identity itself. Nothing was signed.");
    const nick = readNick(who2.nick);
    const had = now4.find((f) => f.id === who2.id);
    if (had && (!nick || had.name === nick)) return null;
    if (had) had.name = nick;
    else now4.push({ id: who2.id, name: nick });
    return now4;
  },
  o
);
var setNick = (me, who2, o) => changeContacts(
  me,
  (now4) => {
    const nick = readNick(who2.nick);
    const had = now4.find((f) => f.id === who2.id);
    if (!had) {
      if (who2.id === me.id) throw new Error("That is this identity itself. Nothing was signed.");
      now4.push({ id: who2.id, name: nick });
      return now4;
    }
    if ((had.name ?? null) === nick) return null;
    had.name = nick;
    return now4;
  },
  o
);
var removeContact = (me, id, o) => changeContacts(me, (now4) => now4.some((f) => f.id === id) ? now4.filter((f) => f.id !== id) : null, o);

// ../dub/src/appended.ts
var APPENDED_FORMAT = sha2562("Appended collective cMIP, draft 1, test value until publication");

// ../desk/src/memory.ts
var MEMORY_SPEC = sha2562("Agent memory cMIP, draft 1, test value until publication");
var WORDS = new Set(ENGLISH);

// ../dub/src/notes.ts
var NOTES_FORMAT = sha2562("Notes cMIP, draft 1, test value until publication");

// ../kit/src/engine/rules.ts
var MEMBER_KEYS_SPEC = sha2562("Member keys cMIP, draft 1, test value until publication");
var holds = (r, set) => r.hashes.every((h) => set.has(h));
async function readRules(app2, runs, me, here, o = {}) {
  const open = heldSecrets(me).length ? heldSecrets(me) : o.open ?? null;
  const listed = /* @__PURE__ */ new Set();
  let problem = null;
  if (!open || Array.isArray(open) && !open.length) problem = `${app2} cannot open what is sealed to this identity, so its list of rules cannot be read here: only what you approved in ${app2} counts`;
  else {
    try {
      const l = await readAccepted(me.id, open, me.f.homes.map((h) => h.hint), o.via ?? {});
      for (const h of l.entries.keys()) listed.add(h);
      if (!l.tips.length && l.problems.length) problem = `its homes did not answer (${l.problems.join("; ")})`;
    } catch (e3) {
      problem = e3 instanceof Error ? e3.message : String(e3);
    }
  }
  const hereSet = new Set(here);
  const followed = /* @__PURE__ */ new Set([...listed, ...hereSet]);
  const rules = runs.map((r) => ({ key: r.key, name: r.name, kind: r.kind, does: r.does, text: r.text, on: holds(r, listed) ? "list" : holds(r, hereSet) ? "here" : null }));
  return { shown: { app: app2, rules, missing: rules.filter((r) => !r.on).map((r) => r.name), problem }, followed };
}
async function approveRules(app2, runs, me, a, o) {
  const chosen2 = a.keys.map((k) => {
    const r2 = runs.find((x) => x.key === k);
    if (!r2) throw new Error(`${app2} runs no rule called ${k}. Nothing was changed.`);
    return r2;
  });
  const names = chosen2.map((r2) => r2.name).join(", ");
  const hashes = chosen2.flatMap((r2) => r2.hashes);
  if (a.where === "here") {
    const here = a.remove ? a.here.filter((h) => !hashes.includes(h)) : [.../* @__PURE__ */ new Set([...a.here, ...hashes])];
    return { here, lines: [a.remove ? { text: `${names}: no longer followed in ${app2} only.` } : { text: `${names}: followed in ${app2} only. Your list is unchanged, so the other apps still ask.`, tone: "ok" }] };
  }
  const r = await changeAccepted(
    me,
    (entries) => {
      for (const x of chosen2) for (const h of x.hashes) a.remove ? entries.delete(h) : entries.has(h) || entries.set(h, x.name);
    },
    { via: o.via ?? {}, save: o.save, check: o.check ?? (async () => {
    }), open: o.open ?? null }
  );
  const lines2 = [];
  if (r.list.merged.length) lines2.push({ text: `Two apps had changed your list at once. Both changes were merged: ${r.list.merged.join(" ")}`, tone: "warn" });
  lines2.push(
    r.written ? { text: a.remove ? `${names}: removed from your list. Every app holding this identity reads the change.` : `${names}: added to your list, sealed to this identity at its homes. Every app holding it reads it.`, tone: "ok" } : { text: "Nothing changed: your list already said so." }
  );
  return { here: a.remove ? a.here : a.here.filter((h) => !hashes.includes(h)), lines: lines2 };
}
var money = (key, does) => {
  const a = acceptable(key);
  return { key, name: a.name, kind: a.kind, hashes: a.hashes, does, text: a.text };
};
var SUITE_RULES = {
  payment: money("payment", "Paying and being paid: a request, its claim and its receipt."),
  messages: money("messages", "The messages between apps and people about money: a draft for Damgar, a lane asked, a sale told to your own app."),
  "grant-limits": money("grant-limits", "A lane\u2019s limits: how much one payment under it may move, and until when."),
  people: { key: "people", name: "People", kind: "cMIP", hashes: [PEOPLE_SPEC, PEOPLE_SPEC_1], does: "Your contacts and their nicknames, sealed to yourself at your homes; the people you mute.", text: "cmips/cmip-people-draft-2.md" },
  naming: { key: "naming", name: "Naming", kind: "cMIP", hashes: [NAMING_SPEC], does: "Display names: the name an identity publishes for itself, shown beside its ID.", text: "cmips/cmip-naming-draft-1.md" },
  corrections: { key: "corrections", name: "Corrections", kind: "cMIP", hashes: [CORRECTIONS_SPEC], does: "A post corrected by its author: the correction shown in its place, the earlier text kept beneath it.", text: "cmips/cmip-corrections-draft-2.md" },
  appended: { key: "appended", name: "Appended collective", kind: "cMIP", hashes: [APPENDED_FORMAT], does: "A collective\u2019s posts whose members append, each signed by its member.", text: "cmips/cmip-appended-collective-draft-1.md" },
  "member-keys": { key: "member-keys", name: "Member keys", kind: "cMIP", hashes: [MEMBER_KEYS_SPEC], does: "Retired: there are no member keys now. A member acts for a collective with their own key, naming the collective.", text: "cmips/cmip-member-keys-draft-1.md" },
  "agent-memory": { key: "agent-memory", name: "Agent memory", kind: "cMIP", hashes: [MEMORY_SPEC], does: "What an agent keeps between its sessions, sealed to its owner.", text: "cmips/cmip-agent-memory-draft-2.md" },
  notes: { key: "notes", name: "Notes", kind: "cMIP", hashes: [NOTES_FORMAT], does: "Your notes: private text sealed to yourself at your homes, each change a new version, the earlier ones kept.", text: "cmips/cmip-notes-draft-1.md" },
  "long-form": { key: "long-form", name: "Long form", kind: "cMIP", hashes: [LONGFORM_SPECS.longform], does: "Long documents with headings: drafts of MIPs, and their replies.", text: "cmips/cmip-long-form-draft-1.md" },
  "release-manifest": { key: "release-manifest", name: "Release manifest", kind: "cMIP", hashes: [REPO_SPECS.manifest], does: "A release of an app: its files, their fingerprints, and who signed it.", text: "cmips/cmip-release-manifest-draft-4.md" }
};
var rulesOf = (...keys) => keys.map((k) => SUITE_RULES[k]);

// ../kit/src/engine/names.ts
var now2 = () => Date.now();
var NameReader = class {
  /** `keep`: how long a name read (or none) is kept, in milliseconds; a name not reached is asked again after a tenth of it. */
  constructor(o = {}) {
    this.o = o;
  }
  kept = /* @__PURE__ */ new Map();
  reading = /* @__PURE__ */ new Map();
  /** Its published name, as its homes give it; `fresh` asks again whatever was kept. */
  read(id, places, fresh = false) {
    const keep = this.o.keep ?? 3e5;
    const k = this.kept.get(id);
    if (k && !fresh && now2() - k.at < (k.shown.state === "unreached" ? keep / 10 : keep)) return Promise.resolve(k.shown);
    const r = this.reading.get(id);
    if (r && !fresh) return r;
    const p = (async () => {
      let shown;
      try {
        const found = await namesOf(id, places, this.o.via ?? {});
        const name = found.map((x) => x.name).pop();
        shown = name ? { state: "name", name } : { state: "none" };
      } catch {
        shown = { state: "unreached" };
      }
      this.kept.set(id, { shown, at: now2() });
      this.reading.delete(id);
      return shown;
    })();
    this.reading.set(id, p);
    return p;
  }
  /** Several at once, by ID. */
  async many(ids, places, fresh = false) {
    const out = {};
    await Promise.all([...new Set(ids)].filter((x) => /^[0-9a-f]{64}$/.test(x)).map(async (id) => out[id] = await this.read(id, places, fresh)));
    return out;
  }
  /** What is kept of it now, without asking: "Loading…" where nothing is. */
  now(id) {
    return this.kept.get(id)?.shown ?? { state: "loading" };
  }
  /** Forget what was kept of one (its name was just changed here). */
  forget(id) {
    this.kept.delete(id);
  }
};

// ../kit/src/engine/known.ts
var HEX2 = /^[0-9a-f]{64}$/;
var Known = class {
  /** `app`: this app's name, as said ("Damgar"). */
  constructor(app2, o = {}) {
    this.app = app2;
    this.names = new NameReader({ via: o.via });
  }
  names;
  lists = /* @__PURE__ */ new Map();
  /** The contacts sealed to the identity, read again at most once a minute (or now, `fresh`). */
  async followed(me, open, via = {}, fresh = false) {
    const c = this.lists.get(me.id);
    if (c && !fresh && c.at + 6e4 > Date.now()) return c;
    let r;
    try {
      r = await readContacts(me, open, via);
    } catch (e3) {
      r = { contacts: c?.contacts ?? [], problem: e3 instanceof Error ? e3.message : String(e3) };
    }
    this.lists.set(me.id, { ...r, at: Date.now() });
    return r;
  }
  /** The names of these identities: the nickname given (none for oneself), and the name each published, read at `places` and its own homes. */
  async named(me, open, ids, places, o = {}) {
    const want = [...new Set(ids.filter((x) => HEX2.test(x)))].slice(0, 200);
    const [{ contacts }, published] = await Promise.all([this.followed(me, open, o.via), this.names.many(want, places, !!o.fresh)]);
    return Object.fromEntries(want.map((id) => [id, { nick: id === me.id ? null : contacts.find((f) => f.id === id)?.name ?? null, published: published[id] }]));
  }
  /** The list, each contact with its names (its published name read, or its state). */
  async contacts(me, open, places, o = {}) {
    const { contacts, problem } = await this.followed(me, open, o.via, o.fresh);
    const published = await this.names.many(contacts.map((c) => c.id), places);
    return { contacts: contacts.map((c) => ({ id: c.id, form: idForm(c.id), name: c.name, named: { nick: c.name, published: published[c.id] } })), problem };
  }
  /** Add a contact, with a nickname if given; set or take away a nickname; take a contact out. Each sealed as the people cMIP keeps the list. */
  async change(me, a, o) {
    const id = HEX2.test(a.id) ? a.id : readIdWhere(a.id.trim()).id;
    a = { ...a, id };
    const opts = { open: o.open, via: o.via, app: this.app, save: o.save };
    const said2 = a.op === "add" ? await addContact(me, { id: a.id, nick: a.nick ?? null }, opts) : a.op === "nick" ? await setNick(me, { id: a.id, nick: a.nick ?? null }, opts) : await removeContact(me, a.id, opts);
    this.lists.delete(me.id);
    return said2;
  }
  /** Forget what was kept for an identity (it was removed, or its key changed). */
  forget(id) {
    this.lists.delete(id);
    this.names.forget(id);
  }
};

// src/ummia.ts
var UMMIA_RULES = rulesOf("long-form", "release-manifest", "naming");
var LINE_SAY = "Ummia keeps its own line of acts for this identity (its specifications, releases, drafts, reports, and the sealed acts it sends to itself). If the signing key is ever changed with the chain key, in Ki\u0161ib, that change must keep this line, or every act signed here becomes void. Some of its acts are sealed, so give Ki\u0161ib this line\u2019s card, shown in the identity window.";
var SPENT_SAY = "This identity\u2019s signing key was changed elsewhere, with its chain key, so the signing key\u2019s words Ummia holds no longer count. Nothing was signed. To go on here, give Ummia the new signing key\u2019s words.";
var RUNNER_OLD_KEY_SAY = "This identity\u2019s keys were changed with its chain key, and Ki\u0161ib\u2019s runner still holds the old signing key: nothing was signed. Give the runner the new signing key\u2019s words, in Ki\u0161ib (Runner, Identities held here). Ummia then goes on, in new lines.";
var RUNNER_HOLDS_SAY = "Ki\u0161ib\u2019s runner holds this identity\u2019s signing key, on this Mac; Ummia holds none of its keys. Every act Ummia would sign for it is shown first in Ki\u0161ib\u2019s panel, inside Ummia\u2019s window. What is sealed to it (the accepted list, the follow list) does not open here.";
var NO_KEY_SAY = "Ummia holds no encryption key for this identity, so nothing sealed to it opens here and nothing can be sealed to it from here: the accepted list cannot be read or changed, and an anchor\u2019s payment cannot be prepared for Damgar.";
var CONTACTS_NO_KEY_SAY = "Ummia holds no encryption key of this identity, so its contacts, sealed to it at its homes, do not open here";
var CONTACTS_RUNNER_SAY = "Ki\u0161ib\u2019s runner holds this identity\u2019s keys and Ummia none, so its contacts, sealed to it at its homes, do not open in Ummia: see and change them in Dub";
var ACCEPTED_SAY = [
  "One list of the cMIPs and Modules you accept, sealed to your identity and kept at its homes: every app holding the identity reads the same list, each the part it understands (Damgar the payment specifications, Edubba the agreements\u2019 and splits\u2019, Dub the formats it shows). Here it is shown whole.",
  "A change is written on the latest version read, and the list is read again just before sending. Where two apps changed it at once, both changes are merged, never one dropped.",
  "Private by default; publishing it is the other choice."
];
var NO_BOOK = () => ({ releases: [], specs: [], mips: [], reports: [], anchors: [], listPublished: null });
var list = (xs) => [...new Set(xs.map((s) => s.trim().replace(/\/$/, "")).filter(Boolean))];
var message4 = (e3) => e3 instanceof Error ? e3.message : String(e3);
var short4 = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
var now3 = () => Math.floor(Date.now() / 1e3);
var PLAN_FOR = 15 * 60 * 1e3;
async function releaseArea(collective, places, via) {
  const r = await areaReaching(collective, places, { spec: SPECS.envelopes, type: 0 }, via).catch(() => null);
  return r?.area ? { name: r.area.layer ? "the Envelopes layer" : r.area.name, holders: r.area.holders, number: r.area.number } : null;
}
var Ummia = class {
  /** `web`: the web client. `releases`: the program's (a folder). `chain`: the chain followed (program only). */
  constructor(store, opts = {}) {
    this.store = store;
    this.opts = opts;
  }
  /** This app's line as the homes hold it, for its card (H80's question 2). */
  line = lineReader("Ummia");
  /** Who is known (H96, H100): the one contacts list and the names identities published, read as every app reads them. */
  known = new Known("Ummia");
  /** This app's line: what waits sent first, in its own turn (the file read again there, the key checked first), then read back. Null where the homes could not be read. */
  async lineNow(me, via) {
    if (Object.keys(me.f.unsent ?? {}).length) {
      await this.serial(async () => {
        const f = await this.store.identity(me.id);
        if (!f) return;
        await this.current(f);
        await sendWaiting(f, via);
        await this.store.saveIdentity(f);
        me.f.unsent = f.f.unsent;
      }).catch(() => void 0);
    }
    return this.line(me, via).catch(() => null);
  }
  queue = Promise.resolve();
  plans = /* @__PURE__ */ new Map();
  serial(f) {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => void 0);
    return next;
  }
  /** An identity held here; one used through Kišib's runner signs by it, Ummia holding no key (the Dubsar runner cMIP). */
  async load(id) {
    const me = await this.store.identity(id);
    if (me && !me.f.signingSecret && this.opts.runner) me.signer = this.opts.runner.signer();
    return me;
  }
  async ctx() {
    const active = await this.store.active();
    const me = active ? await this.load(active) : null;
    if (!me) throw new Error("No identity in use: bring one by its signing key\u2019s words.");
    const s = { relays: [], track: [], reports: null, via: {}, ...await this.store.read(me.id, "settings") ?? {} };
    const book = { ...NO_BOOK(), ...await this.store.read(me.id, "book") ?? {} };
    return { me, s, book, hints: [.../* @__PURE__ */ new Set([...me.f.homes.map((h) => h.hint), ...s.relays])] };
  }
  saveBook(id, book) {
    return this.store.write(id, "book", book);
  }
  /** Who acts, from the chooser: oneself, or a collective this identity acts for, with this identity's own key, naming the collective (rule 58: a collective has no key, its members no member keys). */
  async acting(me, s) {
    const who2 = chosen(actors(await this.store.held(), s.collectives ?? []), s.acting ?? me.id);
    if (!who2) throw new Error("Choose who acts.");
    if (who2.kind === "self") {
      if (who2.id !== me.id) throw new Error("Choose who acts: yourself, or a collective you act for.");
      return { kind: "self" };
    }
    const places = await this.placesOf(who2.id, [...me.f.homes.map((h) => h.hint), ...s.relays, ...s.track], s.via);
    return { kind: "collective", id: who2.id, places };
  }
  async placesOf(id, hints, via) {
    try {
      const l = await lookUp(id, hints, via);
      return [.../* @__PURE__ */ new Set([...hints, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)])];
    } catch {
      return hints;
    }
  }
  /**
   * Act for a collective here (round 2, F353), by its ID: kept where this
   * identity holds a box in the area, or the Envelopes layer's rule,
   * reaching its releases (a release is a bake, Envelopes type 0; rule 60).
   * It acts with its own key, naming the collective (rule 58).
   */
  collectiveAdd(typed) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const id = readId(typed);
      const places = await this.placesOf(id, [...hints, ...s.track], s.via);
      const area = await releaseArea(id, places, s.via);
      let why = null;
      if (!area) why = "Its agreement in force names nobody who uploads for it (no rule for its Envelopes layer, nor an area reaching bakes).";
      else if (!area.holders.includes(me.id)) why = `You hold no box in the area reaching its releases (\u201C${area.name}\u201D).`;
      if (why) throw new Error(`${why} Nothing was kept.`);
      s.collectives = [...(s.collectives ?? []).filter((c) => c.id !== id), { id, available: true, why: null }];
      await this.store.write(me.id, "settings", s);
      return { lines: [{ text: `Ummia acts for ${short4(id)} with your own identity\u2019s key, naming the collective: its releases go through \u201C${area.name}\u201D, ${area.number} signature${area.number === 1 ? "" : "s"} of ${area.holders.length}.`, tone: "ok" }] };
    });
  }
  // ------------------------------------------------------------ the identity
  /**
   * Bring an identity by its ID and its signing key's words (the carry
   * Module, section 4): kept only if the words give its current signing
   * key; its encryption key where the words carry it. Ummia starts its own
   * line. One already held takes the new words instead.
   */
  bring(a) {
    return this.serial(async () => {
      const via = a.via ?? {};
      let id;
      let seed;
      try {
        id = readId(a.id);
        seed = fromWords(a.words);
      } catch (e3) {
        if (e3 instanceof Refused) throw new Error(`${e3.message}. Nothing was kept.`);
        throw e3;
      }
      if ((await this.store.held()).includes(id)) return this.renewHeld(id, seed);
      const address = a.address.trim();
      if (!/^https?:\/\//.test(address)) throw new Error("Give an address where this identity is found (one of its homes), starting with https://.");
      const look2 = await lookCurrent(id, seed, [address], via);
      const r = look2.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await servedChain(id, r.homes, via);
      const named2 = list(look2.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named2.length ? named2 : list(a.relays ?? []);
      if (!relays.length) throw new Error("This identity names no relays. Give one or more relay addresses, and bring it again.");
      const enc2 = carriedKey(look2, seed);
      const f = {
        label: TEST_LABEL,
        identity: id,
        position: binding.position,
        binding: binding.act,
        signingSecret: hex(seed),
        safety: { scheme: 0, seeds: "" },
        chain: chain.map(base64),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: enc2 ? [enc2] : [],
        pending: null
      };
      await this.store.write(id, "settings", { relays, track: relays, reports: null, via, acting: id });
      await this.store.saveIdentity(new TestIdentity(f, via));
      await this.store.setActive(id);
      return {
        lines: [
          { text: "Its current signing key matches the words.", tone: "ok" },
          enc2 ? { text: "Its encryption key is the one the words carry: its accepted list opens here.", tone: "ok" } : { text: NO_KEY_SAY, tone: "warn" },
          { text: LINE_SAY, tone: "warn" }
        ]
      };
    });
  }
  /** The new signing key's words, after a rotation made elsewhere counts (the carry Module, 4.6). */
  renew(words) {
    return this.serial(async () => {
      const active = await this.store.active();
      if (!active) throw new Error("No identity in use.");
      let seed;
      try {
        seed = fromWords(words);
      } catch (e3) {
        if (e3 instanceof Refused) throw new Error(`${e3.message}. Nothing was kept.`);
        throw e3;
      }
      return this.renewHeld(active, seed);
    });
  }
  async renewHeld(id, seed) {
    const me = await this.store.identity(id);
    const s = await this.store.read(id, "settings") ?? { relays: [], track: [], reports: null, via: {} };
    if (hex(seed) === me.f.signingSecret) throw new Error("These are the signing key\u2019s words Ummia already holds, and they still count: nothing to change.");
    const look2 = await lookCurrent(id, seed, [.../* @__PURE__ */ new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via);
    const r = look2.resolution;
    const binding = r.links[r.links.length - 1];
    me.f.chain = (await servedChain(id, r.homes, s.via)).map(base64);
    me.f.position = binding.position;
    me.f.binding = binding.act;
    me.f.signingSecret = hex(seed);
    me.f.homes = r.homes;
    me.f.rule = r.rule ?? null;
    me.f.pending = null;
    freshLines(me.f);
    me.f.routes = null;
    const carried = carriedKey(look2, seed);
    if (carried && !me.f.encryption.some((e3) => e3.act === carried.act)) me.f.encryption.push(carried);
    await this.store.saveIdentity(me);
    return {
      lines: [
        { text: "The new signing key\u2019s words give its current signing key. Ummia signs with them from now on, in a new line.", tone: "ok" },
        carried ? { text: "Its encryption key is the one the new words carry.", tone: "ok" } : { text: NO_KEY_SAY, tone: "warn" },
        { text: LINE_SAY, tone: "warn" }
      ]
    };
  }
  async use(id) {
    if (!(await this.store.held()).includes(id)) throw new Error("Ummia does not hold that identity.");
    await this.store.setActive(id);
  }
  async leave() {
    await this.store.setActive(null);
  }
  /** Forget an identity here: its keys and its book go. What it signed stays where it was sent. */
  forget(id) {
    return this.serial(async () => {
      if (!(await this.store.held()).includes(id)) throw new Error("Ummia does not hold that identity.");
      const was = await this.store.active();
      await this.store.forget(id);
      if (was === id) await this.store.setActive((await this.store.held())[0] ?? null);
    });
  }
  /** The signing key's words, on request: the way back if this app's storage is lost. */
  async carry() {
    const { me } = await this.ctx();
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)) };
  }
  /** Whether the signing key Ummia holds still counts. */
  async check() {
    const { me } = await this.ctx();
    try {
      await this.current(me);
      return { current: true, say: null };
    } catch (e3) {
      if (message4(e3) === SPENT_SAY) return { current: false, say: SPENT_SAY };
      throw e3;
    }
  }
  async current(me) {
    const look2 = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look2.resolution;
    if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing was signed.");
    if (!me.f.signingSecret) {
      const binding = r.links[r.links.length - 1];
      if (!binding || binding.act === me.f.binding) return;
      const p = await this.opts.runner?.paired().catch(() => null);
      const k = p?.identities.find((x) => x.id === me.id);
      if (!k || k.binding !== binding.act || !r.signingKey || hex(r.signingKey) !== k.key) throw new Error(RUNNER_OLD_KEY_SAY);
      me.f.chain = (await servedChain(me.id, r.homes, me.via)).map(base64);
      me.f.position = binding.position;
      me.f.binding = binding.act;
      me.f.homes = r.homes;
      me.f.rule = r.rule ?? null;
      freshLines(me.f);
      me.f.routes = null;
      await this.store.saveIdentity(me);
      return;
    }
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) throw new Error(SPENT_SAY);
  }
  /** Who acts: chosen with the chooser. */
  setActing(id) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const who2 = actors(await this.store.held(), s.collectives ?? []).find((a) => a.id === id && a.available);
      if (!who2) throw new Error("That one cannot act here.");
      if (who2.kind === "collective") {
        await this.store.write(me.id, "settings", { ...s, acting: who2.id });
        return { lines: [{ text: `Acting for the collective ${who2.short}, with your own key for it.`, tone: "ok" }] };
      }
      if (who2.id !== me.id) await this.store.setActive(who2.id);
      const target = who2.id === me.id ? s : { relays: [], track: [], reports: null, via: {}, ...await this.store.read(who2.id, "settings") ?? {} };
      await this.store.write(who2.id, "settings", { ...target, acting: who2.id });
      return { lines: [{ text: `Acting as yourself, ${who2.short}.`, tone: "ok" }] };
    });
  }
  /** Settings: where this identity's acts go, the relays tracking asks, the reporting identity. */
  setSettings(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const next = { ...s };
      if (a.relays) {
        if (!list(a.relays).length) throw new Error("Name at least one relay its acts go to.");
        next.relays = list(a.relays);
      }
      if (a.track) next.track = list(a.track);
      if (a.reports !== void 0) {
        const t = a.reports.trim();
        next.reports = t ? readId(t) : null;
      }
      await this.store.write(me.id, "settings", next);
      return { lines: [{ text: "Saved.", tone: "ok" }] };
    });
  }
  // ------------------------------------------------------------ state
  async state() {
    const active = await this.store.active();
    const heldIds = await this.store.held();
    const held = await Promise.all(
      heldIds.map(async (id) => {
        const f = await this.store.identity(id);
        const hs = { relays: [], track: [], reports: null, via: {}, ...await this.store.read(id, "settings") ?? {} };
        const homes = f?.f.homes.map((h) => h.hint) ?? [];
        const published = f ? await this.known.names.read(id, this.namePlaces(f, hs)) : { state: "unreached" };
        const link = idWhere(id, [...homes.slice(0, 1), ...hs.relays.filter((r) => !homes.includes(r)).slice(0, 1)]);
        return { id, grouped: groupId(id), short: short4(id), form: idForm(id), link, named: { nick: null, published }, active: id === active, runner: !f?.f.signingSecret };
      })
    );
    const me = active ? await this.load(active) : null;
    const out = {
      web: !!this.opts.web,
      stage: "identity",
      held,
      identity: null,
      actors: actors(heldIds),
      acting: null,
      settings: { relays: [], track: [], reports: null },
      saved: [],
      releases: !!this.opts.releases,
      counts: { specs: 0, releases: 0, mips: 0, reports: 0, cards: 0, anchors: 0 }
    };
    if (!me) return out;
    const s = { relays: [], track: [], reports: null, via: {}, ...await this.store.read(me.id, "settings") ?? {} };
    const book = { ...NO_BOOK(), ...await this.store.read(me.id, "book") ?? {} };
    const line = await this.lineNow(me, s.via);
    out.stage = "ready";
    out.identity = {
      id: me.id,
      grouped: groupId(me.id),
      short: short4(me.id),
      form: idForm(me.id),
      link: held.find((h) => h.id === me.id).link,
      named: held.find((h) => h.id === me.id).named,
      homes: me.f.homes.map((h) => h.hint),
      relays: s.relays,
      encryption: me.f.encryption.length > 0,
      line: line ?? noLine(me.f),
      runner: !me.f.signingSecret
    };
    out.actors = actors(heldIds, s.collectives ?? []);
    out.acting = chosen(out.actors, s.acting ?? me.id)?.id ?? null;
    const cs = out.actors.filter((x) => x.kind === "collective").map((x) => x.id);
    out.names = cs.length ? await this.known.named(me, this.opener(me).open, cs, this.namePlaces(me, s), { via: s.via }).catch(() => ({})) : {};
    out.settings = { relays: s.relays, track: s.track, reports: s.reports };
    out.saved = s.saved ?? [];
    out.rules = await this.rulesNow(me, s);
    out.counts = { specs: book.specs.length, releases: book.releases.length + (book.collectiveReleases?.length ?? 0), mips: book.mips.length, reports: book.reports.length, cards: (book.cards?.length ?? 0) + (book.discussions?.length ?? 0), anchors: book.anchors.length };
    return out;
  }
  // ------------------------------------------------------------ reviews
  plan(identity, p) {
    const id = sha2562(`${p.digest}${Math.random()}${Date.now()}`).slice(0, 32);
    this.plans.set(id, { ...p, identity, expires: Date.now() + PLAN_FOR });
    return id;
  }
  /** Carry out a review exactly as shown: only with its digest, within 15 minutes, once, never with reasons not to sign. */
  confirm(planId, digest) {
    return this.serial(async () => {
      const { me } = await this.ctx();
      const p = this.plans.get(planId);
      if (!p || p.expires < Date.now() || p.identity !== me.id) throw new Error("This review has expired or was already used. Review it again. Nothing was signed.");
      if (p.digest !== digest) throw new Error("The digest does not match what was shown. Nothing was signed.");
      if (p.blocking.length) throw new Error(`${p.blocking.join(" ")} Nothing was signed.`);
      this.plans.delete(planId);
      await this.current(me);
      return p.run();
    });
  }
  cancel(planId) {
    this.plans.delete(planId);
    this.opts.releases?.cancel(planId);
  }
  // ------------------------------------------------------------ specifications
  /** What a specification form needs: the kinds, the tasks, what a MIP may fork. */
  specChoices() {
    return {
      kinds: [
        { kind: 0, name: KINDS[0] },
        { kind: 1, name: KINDS[1] }
      ],
      tasks: Object.entries(TASKS).map(([n, [layer, name]]) => ({ n: Number(n), layer, name })),
      forkable: FORKABLE
    };
  }
  /** A specification made and read back, its hash shown; nothing signed until confirmed. */
  async prepareSpec(f) {
    const { me, s } = await this.ctx();
    if ((await this.acting(me, s)).kind === "collective") throw new Error("A specification is published as yourself: choose yourself under Who acts. A collective acts here for its releases.");
    const actor = me;
    const form2 = {
      ...f,
      implements: f.implements ? readHash(f.implements, "What it implements") : null,
      predecessor: f.predecessor ? readHash(f.predecessor, "Its predecessor") : null,
      dependencies: (f.dependencies ?? []).map((d) => readHash(d, "A dependency"))
    };
    const p = prepareSpec(form2, actor.id);
    const blocking = [...p.blocking];
    if (!s.relays.length) blocking.push("Name at least one relay its acts go to, under Settings.");
    const sp = p.spec;
    const fields = sp ? [
      { text: `Kind: ${KINDS[sp.kind]}. Its creator: you, ${short4(actor.id)} (field 1): its hash covers your identity, so it is \u201Cthis specification, by this identity\u201D.` },
      ...sp.tasks.map(([, n]) => ({ text: `Fills task ${n}: ${TASKS[n][1]} (${TASKS[n][0]}).` })),
      ...sp.types.map((t) => ({ text: `Defines act type ${t.type}, \u201C${t.name}\u201D (field 3, for discovery).` })),
      ...sp.types.length && !sp.tasks.length ? [{ text: "Act types and no task: an xtype (Development rule 18)." }] : [],
      ...sp.implements ? [{ text: `Works under ${sp.implements} (field 5).` }] : [],
      ...sp.predecessor ? [{ text: `${sp.kind === 8 ? "Forks" : "Replaces, for its users,"} ${sp.predecessor} (field 8).` }] : [],
      ...sp.layers ? [{ text: `As an extension, acts on the layers ${sp.layers.join(", ")} beyond Development (field 10).` }] : [],
      ...sp.rail ? [{ text: `A ${sp.rail.kind} rail, its proof binding ${sp.rail.binds.join(", ") || "nothing"} (fields 11 and 13).` }] : [],
      ...sp.checker ? [{ text: "Checks proofs of delivery (field 12)." }] : [],
      ...sp.dependencies.map((d) => ({ text: `Depends on ${d} (field 4, for discovery).` }))
    ] : [];
    const digest = sha2562(new TextEncoder().encode(`MOR Ummia specification, version 1
${actor.id}
${p.hash}
${s.relays.join("\n")}`));
    const plan = this.plan(me.id, {
      digest,
      blocking,
      run: async () => {
        let out;
        try {
          out = await publishSpec(me, p.content, s.relays);
        } finally {
          await this.store.saveIdentity(me);
        }
        const book = { ...NO_BOOK(), ...await this.store.read(me.id, "book") ?? {} };
        book.specs.push({ id: out.id, hash: p.hash, name: p.name, kind: KINDS[form2.kind], at: now3() });
        if (form2.kind === 8) {
          const m = book.mips.find((x) => x.text === form2.text && !x.published);
          if (m) m.published = { id: out.id, hash: p.hash };
        }
        await this.saveBook(me.id, book);
        return {
          title: `${p.name} is published`,
          hash: p.hash,
          acts: [out.id],
          lines: [
            { text: `Its spec hash: ${p.hash}. Agreements and acts name it by this hash, wherever it is published.`, tone: "ok" },
            { text: `Its publication: ${out.id}, on ${s.relays.join(", ")}.`, tone: "ok" },
            ...out.refused.map((r) => ({ text: `Its content was refused by ${r}`, tone: "warn" }))
          ]
        };
      }
    });
    return {
      plan,
      digest,
      hash: p.hash,
      title: `Publish ${form2.kind === 8 ? "the MIP" : `the ${KINDS[form2.kind] ?? "specification"}`} \u201C${p.name}\u201D`,
      summary: [
        `Its spec hash will be ${p.hash || "(none: it is not yet in the format)"}. The hash covers its content (the fields below and its text), never the act that publishes it.`,
        "Published for good: a changed specification is a new one, with a new hash, naming this one as its predecessor if you wish (Development rule 4).",
        "Nothing is signed until you press Sign and publish."
      ],
      sections: [
        { heading: "What it carries", lines: fields },
        { heading: "Who signs, and where it goes", lines: [{ text: `A public publication signed by you, its content on ${s.relays.join(", ") || "(no relay yet)"}: anyone can fetch it by its hash, and adopt it, or not.` }] },
        { heading: "A reading of the publishing rule (F322)", lines: [{ text: "Ummia writes the fields the kind requires, and only the optional fields you filled. Fill only what your text says: two publications of one text that differ in an optional field are two specifications, with two hashes." }] }
      ],
      blocking
    };
  }
  /** The specifications published from here. */
  async specs() {
    const { book } = await this.ctx();
    return [...book.specs].reverse();
  }
  // ------------------------------------------------------------ tracking
  /** A plain look-up of the relays named (or tracking's own), with the filters relays have. */
  async track(a = {}) {
    const { s } = await this.ctx();
    const relays = a.relays?.length ? list(a.relays) : s.track;
    if (!relays.length) throw new Error("Name the public relays to ask, under Settings or here.");
    return track(relays, { signer: a.signer ? readId(a.signer) : void 0, via: s.via });
  }
  /** The public acts of one specification (an xtype, say), by the feed's `spec`, `type` and `signer` filters. */
  async actsOf(a) {
    const { s } = await this.ctx();
    const relays = a.relays?.length ? list(a.relays) : s.track;
    if (!relays.length) throw new Error("Name the public relays to ask, under Settings or here.");
    return actsOf(relays, { spec: readHash(a.spec, "The specification"), type: a.type ?? void 0, signer: a.signer ? readId(a.signer) : void 0, via: s.via });
  }
  limit() {
    return LIMIT_SAY;
  }
  // ------------------------------------------------------------ the accepted list (F340)
  secrets(me) {
    return [...me.f.encryption].reverse().map((e3) => unhex(e3.secret));
  }
  layerCache = null;
  /** Each specification's layer, as tracking reads it from its own fields, on the relays tracking asks: read again at most once a minute. */
  async layersOf(hashes) {
    if (!hashes.length) return /* @__PURE__ */ new Map();
    if (this.layerCache && this.layerCache.at + 60 > now3() && hashes.every((h) => this.layerCache.layers.has(h))) return this.layerCache.layers;
    try {
      const { s } = await this.ctx();
      const t = await track(this.lookRelays(s), { via: s.via });
      this.layerCache = { at: now3(), layers: new Map(t.specs.map((x) => [x.hash, x.layer])) };
      return this.layerCache.layers;
    } catch {
      return /* @__PURE__ */ new Map();
    }
  }
  /** Ummia's own rules (H93), held against the list and what was approved in Ummia only: read again at most once a minute. */
  rulesRead = /* @__PURE__ */ new Map();
  async rulesNow(me, s, fresh = false) {
    const c = this.rulesRead.get(me.id);
    if (c && !fresh && c.at + 60 > now3()) return c.shown;
    const { shown } = await readRules("Ummia", UMMIA_RULES, me, s.rulesHere ?? [], { open: this.secrets(me), via: me.via });
    this.rulesRead.set(me.id, { shown, at: now3() });
    return shown;
  }
  async rules() {
    const { me, s } = await this.ctx();
    return this.rulesNow(me, s, true);
  }
  /** Approve rules Ummia runs, in Ummia only or added to the list; or stop following one in Ummia only. */
  approveRules(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const keys = a.keys.includes("*") ? (await this.rulesNow(me, s, true)).rules.filter((r2) => !r2.on).map((r2) => r2.key) : a.keys;
      if (!keys.length) return { lines: [{ text: "Every rule Ummia runs is followed already." }], rules: await this.rulesNow(me, s) };
      const r = await approveRules("Ummia", UMMIA_RULES, me, { keys, where: a.where, remove: a.remove, here: s.rulesHere ?? [] }, { via: me.via, save: () => this.store.saveIdentity(me), check: () => this.current(me) });
      const next = { ...s, rulesHere: r.here };
      await this.store.write(me.id, "settings", next);
      return { lines: r.lines, rules: await this.rulesNow(me, next, true) };
    });
  }
  /** The whole list, as every app reads it: each entry, its label, and whose part it is where known. */
  async accepted() {
    const { me, book } = await this.ctx();
    const l = await readAccepted(me.id, this.secrets(me), me.f.homes.map((h) => h.hint), me.via);
    const layers = await this.layersOf([...l.entries.keys()].filter((h) => !OURS.has(h) && !builtIn(h)));
    const entries = [...l.entries.entries()].map(([hash, label]) => ({ hash, label: label ?? labelOf(hash) ?? builtIn(hash)?.title ?? null, part: OURS.has(hash) ? "Money: Damgar\u2019s part" : "Read by the apps that know it", layer: OURS.has(hash) ? "Money" : builtIn(hash)?.title.replace(/^MIR: /, "") ?? layers.get(hash) ?? null })).sort((a, b) => a.part < b.part ? -1 : a.part > b.part ? 1 : (a.label ?? a.hash) < (b.label ?? b.hash) ? -1 : 1);
    return {
      entries,
      version: l.version,
      forked: l.tips.length > 1,
      merged: l.merged,
      published: !!book.listPublished && !book.listPublished.withdrawn,
      problems: [...me.f.encryption.length ? [] : [NO_KEY_SAY], ...l.problems],
      say: ACCEPTED_SAY
    };
  }
  /** Change the list: add (with a label) and remove entries, every other entry kept as found; merged where forked. */
  changeAccepted(a) {
    return this.serial(async () => {
      const { me } = await this.ctx();
      await this.current(me);
      if (!me.f.encryption.length) throw new Error(NO_KEY_SAY);
      const add = (a.add ?? []).map((x) => ({ hash: readHash(x.hash, "A specification to accept"), label: x.label?.trim().slice(0, 120) || null }));
      const remove = (a.remove ?? []).map((h) => readHash(h, "A specification to remove"));
      const r = await changeAccepted(
        me,
        (entries) => {
          for (const x of add) entries.set(x.hash, x.label ?? entries.get(x.hash) ?? labelOf(x.hash) ?? null);
          for (const h of remove) entries.delete(h);
        },
        { via: me.via, save: () => this.store.saveIdentity(me), check: () => this.current(me) }
      );
      const lines2 = [];
      if (r.list.merged.length) lines2.push({ text: `Two apps had changed the accepted list at once. Both changes were merged: ${r.list.merged.join(" ")}`, tone: "warn" });
      lines2.push(r.written ? { text: `Sealed to this identity and kept at its homes (version ${r.list.version}): every app holding it reads the change.`, tone: "ok" } : { text: "Nothing changed." });
      return { lines: lines2 };
    });
  }
  /** The other choice (F59): publish the accepted list, or withdraw it. */
  publishList(on) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      const l = await readAccepted(me.id, this.secrets(me), me.f.homes.map((h) => h.hint), me.via);
      const id = await publishAccepted(me, l, s.relays, book.listPublished ? { act: book.listPublished.act, version: book.listPublished.version } : null, !on, () => this.store.saveIdentity(me));
      book.listPublished = { act: id, version: (book.listPublished?.version ?? 0) + 1, withdrawn: !on };
      await this.saveBook(me.id, book);
      return { lines: [on ? { text: `Published at ${s.relays.join(", ")}: anyone can read which specifications you accept.`, tone: "warn" } : { text: "Withdrawn: it is private again. Earlier versions stay readable as acts.", tone: "ok" }] };
    });
  }
  // ------------------------------------------------------------ MIPs
  async mips() {
    const { book } = await this.ctx();
    return { drafts: book.mips, say: MIP_SAY, forkable: FORKABLE };
  }
  /** Start a MIP in the MIP shape: what it forks, by name (a MIR) or by spec hash (a MIP, the MICS document). */
  newMip(a) {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      const named2 = FORKABLE.find((f) => f.key === a.forks);
      const forks = named2 ? named2.hash : readHash(a.forks, "What it forks");
      const forksName = named2 ? named2.name : `the specification ${short4(forks)}`;
      const text3 = template({ title: a.title, forks: `${forksName} (${forks})`, creator: short4(me.id) });
      const key = sha2562(`${me.id}${a.title}${Date.now()}${Math.random()}`).slice(0, 16);
      book.mips.push({ key, title: a.title.trim() || "A proposal", forks, forksName, drafts: [], text: text3, published: null });
      await this.saveBook(me.id, book);
      return { key, text: text3 };
    });
  }
  /** Keep the text as written here (nothing signed), with the shape checked. */
  saveMip(key, text3) {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      const m = book.mips.find((x) => x.key === key);
      if (!m) throw new Error("No such draft here.");
      if (m.published) throw new Error("This MIP is published as a specification: a changed MIP is a new one. Start a new draft.");
      m.text = text3;
      await this.saveBook(me.id, book);
      return { lines: [{ text: "Kept here: nothing is signed or sent.", tone: "ok" }, ...shapeOf(text3)] };
    });
  }
  /** Publish a draft for discussion: a signed long-form document, public; not a specification. */
  publishMipDraft(key) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      if ((await this.acting(me, s)).kind === "collective") throw new Error("A MIP draft is published as yourself: choose yourself under Who acts.");
      const m = book.mips.find((x) => x.key === key);
      if (!m) throw new Error("No such draft here.");
      if (!s.relays.length) throw new Error("Name at least one relay its acts go to, under Settings. Nothing was signed.");
      let id;
      try {
        ({ id } = await publishDraft(me, m.text, s.relays));
      } finally {
        await this.store.saveIdentity(me);
      }
      m.drafts.push({ id, at: now3(), name: m.text.split("\n")[0].replace(/^#+\s*/, "").slice(0, 120) });
      await this.saveBook(me.id, book);
      return {
        title: `Draft ${m.drafts.length} is published for discussion`,
        acts: [id],
        lines: [
          { text: `A signed long-form document, public: ${id}. It can be opened in the reader by its id, and answered from Dub.`, tone: "ok" },
          { text: "It is not a specification: nothing names it by a spec hash. Publish the MIP as a specification only when you are ready." },
          ...shapeOf(m.text)
        ]
      };
    });
  }
  /** The replies to a MIP's drafts. */
  async mipReplies(key) {
    const { me, s, book } = await this.ctx();
    const m = book.mips.find((x) => x.key === key);
    if (!m) throw new Error("No such draft here.");
    const r = await replies(me, m.drafts.map((d) => d.id), [.../* @__PURE__ */ new Set([...s.relays, ...s.track])], s.via);
    return { replies: Object.fromEntries(r.replies), lines: r.lines };
  }
  /** Ready: the MIP as a specification (kind 8), naming its creator and what it would replace. Read back first, as any specification. */
  prepareMip(key) {
    return this.ctx().then(({ book }) => {
      const m = book.mips.find((x) => x.key === key);
      if (!m) throw new Error("No such draft here.");
      if (m.published) throw new Error("This MIP is published already.");
      return this.prepareSpec({ kind: 8, text: m.text, predecessor: m.forks });
    });
  }
  // ------------------------------------------------------------ reports
  async reports() {
    const { s, book } = await this.ctx();
    const sent = [...book.reports].reverse();
    if (!s.reports) return { sent, answers: [], lines: [], say: REPORT_SAY, to: null };
    const r = await answers(s.reports, sent.map((x) => x.id), [.../* @__PURE__ */ new Set([...s.relays, ...s.track])], s.via);
    return { sent, answers: r.answers, lines: r.lines, say: REPORT_SAY, to: s.reports };
  }
  /** Send a report from one's own identity to the reporting identity (F287). */
  sendReport(text3) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      if ((await this.acting(me, s)).kind === "collective") throw new Error("A report is sent as yourself: choose yourself under Who acts.");
      if (!s.reports) throw new Error("Give the reporting identity\u2019s ID under Settings first. Nothing was signed.");
      if (!text3.trim()) throw new Error("Write the report first. Nothing was signed.");
      if (!s.relays.length) throw new Error("Name at least one relay its acts go to, under Settings. Nothing was signed.");
      const r = await send(me, { to: s.reports, text: text3.trim(), relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me) });
      book.reports.push(r.sent);
      await this.saveBook(me.id, book);
      return { title: "The report is sent", acts: [r.sent.id], lines: r.lines };
    });
  }
  // ------------------------------------------------------------ releases (on a computer)
  releasesHere() {
    if (!this.opts.releases) throw new Error("Releases are made from a folder on a computer: in Ummia on the Mac or Linux, not in the web client.");
    return this.opts.releases;
  }
  /** This identity's releases: those made here, then those found on its relays (a line begun in Edubba before F339 goes on here). */
  async ownReleases(me, book, hints, via) {
    const here = new Set(book.releases.map((r) => r.id));
    const found = this.opts.releases ? await this.opts.releases.found(me.id, hints, via) : [];
    return [...found.filter((r) => !here.has(r.id)), ...book.releases];
  }
  async releases() {
    const { me, book, hints, s } = await this.ctx();
    const anchors = [];
    for (const x of book.anchors) anchors.push(await standing(x, [...hints, ...s.track], s.via, this.opts.chain ?? null));
    const acting = s.collectives?.some((c) => c.id === s.acting) ? s.acting : null;
    if (acting) {
      const places = await this.placesOf(acting, [...hints, ...s.track], s.via);
      const own2 = await this.collectiveReleases(acting, book, places, s.via);
      return { releases: [...own2].reverse().map(({ id, name, version: version2, folder }) => ({ id, name, version: version2, folder, collective: acting })), anchors, anchorSay: ANCHOR_SAY };
    }
    const own = this.opts.releases ? await this.ownReleases(me, book, hints, s.via) : book.releases;
    return { releases: [...own].reverse().map(({ id, name, version: version2, folder }) => ({ id, name, version: version2, folder })), anchors, anchorSay: ANCHOR_SAY };
  }
  async suggestRelease(folder) {
    const { me, book, hints, s } = await this.ctx();
    return this.releasesHere().suggest(await this.ownReleases(me, book, hints, s.via), folder);
  }
  /** A collective's releases: those made here for it, then those found on its places. */
  async collectiveReleases(c, book, places, via) {
    const here = (book.collectiveReleases ?? []).filter((r) => r.collective === c);
    const ids = new Set(here.map((r) => r.id));
    const found = this.opts.releases ? await this.opts.releases.found(c, places, via) : [];
    return [...found.filter((r) => !ids.has(r.id)), ...here];
  }
  async prepareRelease(a) {
    const { me, s, book, hints } = await this.ctx();
    const who2 = await this.acting(me, s);
    if (who2.kind === "collective") {
      const area = await releaseArea(who2.id, who2.places, s.via);
      return this.releasesHere().prepare(me, await this.collectiveReleases(who2.id, book, who2.places, s.via), { ...a, relays: [.../* @__PURE__ */ new Set([...s.relays, ...who2.places])], via: s.via, as: { collective: who2.id, area } });
    }
    return this.releasesHere().prepare(me, await this.ownReleases(me, book, hints, s.via), { ...a, relays: s.relays, via: s.via });
  }
  confirmRelease(plan, digest) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      const who2 = await this.acting(me, s);
      if (who2.kind === "collective") return this.confirmCollectiveRelease(me, s, book, who2, plan, digest);
      let r;
      try {
        r = await this.releasesHere().confirm(me, await this.ownReleases(me, book, [.../* @__PURE__ */ new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via), plan, digest, s.relays, s.via);
      } finally {
        await this.store.saveIdentity(me);
      }
      book.releases.push(r.release);
      await this.saveBook(me.id, book);
      return r.done;
    });
  }
  /**
   * A collective's release, as reviewed (round 2, F339, F353): the
   * publication signed as the collective with this member's own key; where
   * the area reaching it asks more keys, its other holders are asked, each
   * sent a negotiation message naming it, sealed to them, to sign in their
   * own app; then how it stands, as anyone reads it.
   */
  async confirmCollectiveRelease(me, s, book, who2, plan, digest) {
    const relays = [.../* @__PURE__ */ new Set([...s.relays, ...who2.places])];
    const at = await chainFor(who2.id, who2.places, s.via);
    const sign = async (payload) => {
      const made = await signAsMember(who2.id, me, at, { spec: SPECS.envelopes, type: 0, payload, public: true });
      if (!(await publishAt([made.act], relays, s.via)).length) throw new Error("No relay took the release. Nothing counts: try again.");
      return { id: made.id };
    };
    const r = await this.releasesHere().confirm(me, await this.collectiveReleases(who2.id, book, who2.places, s.via), plan, digest, relays, s.via, sign);
    const area = await releaseArea(who2.id, who2.places, s.via);
    const asked = [];
    const lines2 = [...r.done.lines];
    if (area && area.number > 1) {
      for (const h of area.holders.filter((x) => x !== me.id)) {
        try {
          const l = await lookUp(h, who2.places, s.via);
          const inbox = l.inbox(REPO_SPECS.agreements) ?? l.routes.routes.flatMap((x) => x.hints);
          if (!l.encryptionKey || !inbox?.length) throw new Error("no inbox");
          await negotiate(me, { id: h, key: l.encryptionKey, inbox }, { text: `A release of the collective ${short4(who2.id)}, ${r.release.name} ${r.release.version}: its area \u201C${area.name}\u201D asks ${area.number} keys. Read it in your Signing tab, check its files, then sign it with your own key for the collective.`, refs: [[r.release.id, who2.id], [who2.id, who2.id]] });
          asked.push(h);
        } catch {
          lines2.push({ text: `${short4(h)} could not be reached to sign it (no inbox or encryption key found).`, tone: "warn" });
        }
      }
      await this.store.saveIdentity(me);
      if (asked.length) lines2.push({ text: `Asked for their key: ${asked.map(short4).join(", ")}.` });
    }
    const st = (await judgeCollective(who2.id, [r.release.id], who2.places, s.via)).get(r.release.id);
    lines2.push(st?.met ? { text: "It counts as the collective\u2019s release: its area is met.", tone: "ok" } : { text: `It does not count yet: ${st?.areas.map((x) => `${x.signers.length} of ${x.needed} keys`).join("; ") ?? "not read"}.`, tone: "warn" });
    book.collectiveReleases = [...book.collectiveReleases ?? [], { ...r.release, collective: who2.id, asked }];
    await this.saveBook(me.id, book);
    return { ...r.done, title: `${r.release.name} ${r.release.version} is published for the collective`, lines: lines2 };
  }
  /** Where a collective's release stands, as anyone reads it: the keys its area asks, and who signed with their own. */
  async collectiveReleaseStanding(id) {
    const { me, s, book } = await this.ctx();
    const r = (book.collectiveReleases ?? []).find((x) => x.id === id);
    if (!r) throw new Error("No release of a collective made here has that id.");
    const places = await this.placesOf(r.collective, [...me.f.homes.map((h) => h.hint), ...s.relays, ...s.track], s.via);
    const st = (await judgeCollective(r.collective, [id], places, s.via)).get(id);
    return {
      met: !!st?.met,
      lines: st?.met ? [{ text: `It counts as the collective\u2019s release: ${st.areas.map((x) => `${x.signers.length} of ${x.needed} signatures, each with its member\u2019s own key`).join("; ")}.`, tone: "ok" }] : [{ text: `It does not count yet: ${st?.areas.map((x) => `${x.signers.length} of ${x.needed} keys`).join("; ") ?? st?.reason ?? "not read"}.`, tone: "warn" }]
    };
  }
  /** Check it as anyone would: the release fetched by its id from the relays alone, every file checked. */
  async checkRelease(id) {
    const { s, hints } = await this.ctx();
    return this.releasesHere().check(readHash(id, "The release"), [.../* @__PURE__ */ new Set([...hints, ...s.track])], s.via);
  }
  // ------------------------------------------------------------ anchoring a release (optional; paid in Damgar)
  async anchorOffers(service) {
    const { s, hints } = await this.ctx();
    return offers(readId(service), [...hints, ...s.track], s.via);
  }
  anchorRelease(a) {
    return this.serial(async () => {
      const { me, s, book, hints } = await this.ctx();
      await this.current(me);
      const own = [...await this.ownReleases(me, book, hints, s.via).catch(() => book.releases), ...book.collectiveReleases ?? []].find((x) => x.id === a.release);
      if (!own) {
        const id = readActId(a.release);
        const held = await referTo(id, [.../* @__PURE__ */ new Set([...hints, ...s.relays, ...s.track])], s.via).catch(() => null);
        if (!held?.public) throw new Error("That is neither one of your releases nor a public act found on your relays. Nothing was prepared.");
      }
      const rel = own ?? { id: readActId(a.release), name: "the act", version: short4(readActId(a.release)) };
      const service = readId(a.service);
      const offer = (await offers(service, [...hints, ...s.track], s.via)).find((o) => o.act === a.offer);
      if (!offer) throw new Error("No such standing offer of that service was found under the anchoring cMIP.");
      const r = await ask(me, { act: rel.id, label: own ? `the release ${rel.name} ${rel.version}` : `the act ${rel.version}`, service, offer, tier: a.tier, hints, via: s.via, save: () => this.store.saveIdentity(me) });
      book.anchors.push(r.asked);
      await this.saveBook(me.id, book);
      return { title: "An anchor asked", acts: [r.asked.draft], lines: r.lines };
    });
  }
  // ------------------------------------------------------------ Look: one feed (decided), and a page per specification
  /** The relays Look asks: those named for tracking, else this identity's own. */
  lookRelays(s, typed) {
    const r = typed?.trim() ? list([typed]) : s.track.length ? s.track : s.relays;
    if (!r.length) throw new Error("Name the public relays to ask: in the identity panel, Relays, or point at one here.");
    return r;
  }
  /**
   * The feed, pointed at a relay, a single ID, your contacts or a release,
   * filtered by kind and layer (decided). Nothing is kept: ask again to see
   * what changed.
   */
  async look(a) {
    const { me, s, hints } = await this.ctx();
    const kind = ["relay", "id", "contacts", "release"].find((k) => k === a.point?.kind) ?? "relay";
    const value = (a.point?.value ?? "").trim();
    const filters = (a.filters ?? [...FILTERS].filter((f) => f !== "mips")).filter((f) => FILTERS.includes(f));
    const layer = a.layer || null;
    let out;
    let said2;
    if (kind === "relay") {
      const relays = this.lookRelays(s, value);
      said2 = relays.join(", ");
      out = await look(relays, { filters, layer, via: s.via, hints });
    } else if (kind === "id") {
      if (!value) throw new Error("Point at an identity by its ID (mid1\u2026, or hexadecimal).");
      const id = readId(value);
      said2 = idForm(id);
      out = await look(this.lookRelays(s), { signers: [id], filters, layer, via: s.via, hints });
    } else if (kind === "contacts") {
      const { open, problem } = this.opener(me);
      const c = await this.known.followed(me, open, s.via, true);
      said2 = `your contacts (${c.contacts.length})`;
      out = await look(this.lookRelays(s), { signers: c.contacts.map((f) => f.id), filters, layer, via: s.via, hints });
      if (problem ?? c.problem) out.lines.unshift({ text: `Your contacts could not be read: ${problem ?? c.problem}.`, tone: "warn" });
    } else {
      if (!value) throw new Error("Point at a release by its act ID (mact1\u2026, or hexadecimal).");
      const id = readActId(value);
      said2 = `the release ${short4(id)} and its line`;
      out = await look(this.lookRelays(s), { release: id, filters: ["releases"], via: s.via, hints });
    }
    return { ...out, point: { kind, value, said: said2 }, limit: LIMIT_SAY };
  }
  /** A specification's page: everything that can be tied to it, from the relays named (decided 23 October 2026). */
  async specPage(a) {
    const { me, s, hints } = await this.ctx();
    const hash = readHash(a.hash, "The specification");
    const p = await specPage(hash, this.lookRelays(s), s.via, hints);
    return { ...p, mine: p.creator === me.id, say: CARD_SAY };
  }
  /** The Dubsar clock's time on each act it stamped, in words (decided 23 October 2026). */
  async clockWords(ids) {
    const { s, hints } = await this.ctx();
    return clockWords(ids.slice(0, 500), [.../* @__PURE__ */ new Set([...s.relays, ...s.track, ...hints])], s.via);
  }
  // ------------------------------------------------------------ saved points and contacts (the same follow list, here it filters)
  savedAdd(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const kind = ["relay", "id", "contacts", "release"].find((k) => k === a.point.kind);
      if (!kind) throw new Error("A saved point points at a relay, an ID, your contacts or a release.");
      const label = a.label.trim().slice(0, 60) || a.point.value.slice(0, 24) || "A point";
      const filters = a.filters.filter((f) => FILTERS.includes(f));
      const key = sha2562(`${kind} ${a.point.value} ${filters.join(",")}`).slice(0, 12);
      s.saved = [...(s.saved ?? []).filter((x) => x.key !== key), { key, label, point: { kind, value: a.point.value.trim() }, filters }];
      await this.store.write(me.id, "settings", s);
      return { lines: [{ text: `Saved in Look: \u201C${label}\u201D. Kept in this app only, never published.`, tone: "ok" }] };
    });
  }
  savedRemove(key) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      s.saved = (s.saved ?? []).filter((x) => x.key !== key);
      await this.store.write(me.id, "settings", s);
      return { lines: [{ text: "Removed from Look\u2019s saved points.", tone: "ok" }] };
    });
  }
  // ------------------------------------------------------------ who is known (H96, H100, H106, H109, H119)
  /**
   * How Ummia opens what is sealed to an identity (its contacts): with the
   * encryption keys it holds. One used through Kišib's runner, or brought
   * without its encryption key, has none here: `open` is null and `problem`
   * says so, plainly.
   */
  opener(me) {
    const keys = heldSecrets(me);
    if (keys.length) return { open: keys, problem: null };
    return { open: null, problem: me.f.signingSecret ? CONTACTS_NO_KEY_SAY : CONTACTS_RUNNER_SAY };
  }
  /** Where an identity's names are read: its homes, the relays its acts go to, the relays Look asks. */
  namePlaces(me, s) {
    return list([...me.f.homes.map((h) => h.hint), ...s.relays, ...s.track]);
  }
  /**
   * The names of these identities, for the page (the kit's `attachIds`;
   * H96, H106): the nickname given in the one contacts list (the people
   * cMIP's, sealed) and the name each published (the naming cMIP's), read
   * by the kit's one name reader. `fresh`: asked again (a retry).
   */
  async names(a) {
    if (!await this.store.active()) {
      const published = await this.known.names.many(a.ids.slice(0, 200), [], !!a.fresh);
      return Object.fromEntries(Object.entries(published).map(([id, p]) => [id, { nick: null, published: p }]));
    }
    const { me, s } = await this.ctx();
    return this.known.named(me, this.opener(me).open, a.ids, this.namePlaces(me, s), { via: s.via, fresh: !!a.fresh });
  }
  /** The one contacts list (H100), each with its names: the same list Dub, Damgar and Edubba read, sealed to the identity at its homes. Read again each time it is asked for. */
  async contacts() {
    const { me, s } = await this.ctx();
    const { open, problem } = this.opener(me);
    const r = await this.known.contacts(me, open, this.namePlaces(me, s), { via: s.via, fresh: true });
    return { ...r, problem: problem ?? r.problem, say: FOLLOW_SAY };
  }
  /** The contacts list changed (H109): a contact added (with a nickname, where given), its nickname set or taken away, or taken out. */
  contactChange(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const { open, problem } = this.opener(me);
      if (!open) throw new Error(`${problem}. Nothing was signed.`);
      await this.current(me);
      const said2 = await this.known.change(me, a, { open, via: s.via, save: () => this.store.saveIdentity(me) });
      return { lines: said2.map((x) => ({ text: x.text, tone: x.tone })) };
    });
  }
  /** Follow: add to contacts, with a nickname where given (H109): the one list, as Contacts top left adds to it. */
  async follow(a) {
    const r = await this.contactChange({ op: "add", id: readId(a.id), nick: a.name?.trim() || null });
    if (r.lines[0]?.text === "Nothing changed.") return { lines: [{ text: "Already in your contacts: nothing to change.", tone: "ok" }] };
    return { lines: [{ text: "Added to your contacts.", tone: "ok" }, ...r.lines] };
  }
  /** Follow their releases (decided: "the same follow list, but here it filters"): added to contacts, and a saved point of Look showing their releases. */
  async followReleases(a) {
    const id = readId(a.id);
    const f = await this.follow({ id, name: a.name });
    const label = `${a.name?.trim() || short4(id)}\u2019s releases`;
    const saved = await this.savedAdd({ label, point: { kind: "id", value: id }, filters: ["releases"] });
    return { lines: [...f.lines, ...saved.lines] };
  }
  // ------------------------------------------------------------ specification cards (the Dubsar Specification Card cMIP)
  /** The specification a card would name: its creator's publication where one is found, or one of the core's texts. */
  async specFound(hash, s, book) {
    const here = book.specs.find((x2) => x2.hash === hash);
    if (here) return { publication: here.id, creator: null, name: here.name };
    const b = builtIn(hash);
    if (b) return { publication: null, creator: null, name: b.title };
    const t = await track(this.lookRelays(s), { via: s.via });
    const x = t.specs.find((y) => y.hash === hash);
    if (!x) throw new Error("No specification with this hash was found on your relays: a card names one Ummia can find. Nothing was signed.");
    const pub = x.publications.find((p) => p.signer === x.creator) ?? x.publications[0];
    return { publication: pub?.id ?? null, creator: x.creator, name: x.name };
  }
  /**
   * A card (and, where asked, a discussion thread naming the specification),
   * read back exactly as it would be signed; nothing signed until confirmed.
   * As yourself only: a card speaks for its signer.
   */
  async prepareCard(a) {
    const { me, s, book } = await this.ctx();
    if ((await this.acting(me, s)).kind === "collective") throw new Error("A card is signed as yourself: choose yourself in the identity panel.");
    const hash = readHash(a.spec, "The specification");
    const found = await this.specFound(hash, s, book);
    const newThread = a.discussion === "new";
    const fields = {
      spec: hash,
      title: a.title,
      summary: a.summary?.trim() || null,
      releases: (a.releases ?? []).map((r) => readActId(r.trim())),
      vectors: (a.vectors ?? []).map((v) => /^https:\/\//.test(v.trim()) ? v.trim() : readActId(v.trim())),
      discussion: newThread || !a.discussion?.trim() ? null : readActId(a.discussion.trim())
    };
    const blocking = [];
    let text3 = "";
    try {
      text3 = cardText2({ ...fields, discussion: newThread ? "0".repeat(64) : fields.discussion });
    } catch (e3) {
      blocking.push(message4(e3).replace(/ Nothing was signed\.$/, ""));
    }
    if (!s.relays.length) blocking.push("Name at least one relay its acts go to, in the identity panel, Relays.");
    const core = !!builtIn(hash);
    const creators = !core && (found.creator === me.id || found.creator === null && book.specs.some((x) => x.hash === hash));
    const shown = newThread ? text3.replace(`Discussion: ${actForm("0".repeat(64))}`, "Discussion: (the thread signed just before it)") : text3;
    const digest = sha2562(new TextEncoder().encode(`MOR Ummia specification card, version 1
${me.id}
${newThread ? "with a new thread\n" : ""}${text3}
${s.relays.join("\n")}`));
    const plan = this.plan(me.id, {
      digest,
      blocking,
      run: async () => {
        const acts2 = [];
        const lines2 = [];
        try {
          if (newThread) {
            const d = await publishDiscussion(me, { title: fields.title, spec: hash, publication: found.publication, relays: s.relays, find: s.track, via: s.via });
            fields.discussion = d.id;
            acts2.push(d.id);
            lines2.push({ text: `A discussion thread is published, naming it: ${actForm(d.id)}. Replies to it come from Dub, or from Discuss here.`, tone: "ok" });
          }
          const c = await publishCard(me, fields, { publication: found.publication, relays: s.relays, find: s.track, via: s.via });
          acts2.push(c.id);
          lines2.push({ text: `Its card is published: ${actForm(c.id)}, a plain post every app shows.`, tone: "ok" });
          const b = { ...NO_BOOK(), ...await this.store.read(me.id, "book") ?? {} };
          b.cards = [...b.cards ?? [], { id: c.id, spec: hash, title: fields.title, at: now3() }];
          if (newThread) b.discussions = [...b.discussions ?? [], { id: fields.discussion, spec: hash, title: fields.title, at: now3() }];
          await this.saveBook(me.id, b);
        } finally {
          await this.store.saveIdentity(me);
        }
        lines2.push(creators ? { text: "Signed by its creator: the latest card in your own sequence is the one that counts; a later card replaces this one.", tone: "ok" } : { text: "You are not its creator: your card is shown as your word, never as the specification\u2019s own.", tone: "warn" });
        return { title: `The card of \u201C${fields.title}\u201D is published`, acts: acts2, hash, lines: lines2 };
      }
    });
    return {
      plan,
      digest,
      hash,
      title: `Sign the card of \u201C${found.name}\u201D`,
      summary: [
        creators ? "You are its creator: this card speaks for it until you sign a later one." : core ? "One of the core\u2019s texts: it names no creator, so your card is shown as your word, never as the text\u2019s own." : "You are not its creator: this card is shown as your word, beside its creator\u2019s.",
        "A plain post, public, signed by you, readable by every app (Dub shows it as a post). It changes nothing in the specification.",
        "Nothing is signed until you press Sign and publish."
      ],
      sections: [
        { heading: "The card, exactly as it is signed", lines: shown.split("\n").map((t) => ({ text: t })) },
        ...newThread ? [{ heading: "Signed just before it", lines: [{ text: `A discussion thread: \u201CDiscussion of ${fields.title.trim()}\u201D, naming the specification${found.publication ? " (its publication, with its signer)" : ""}.` }] }] : [],
        { heading: "Where it goes", lines: [{ text: s.relays.join(", ") || "(no relay yet)" }] }
      ],
      blocking
    };
  }
  /** The cards and threads signed here, newest first (Publish › Published here). */
  async publishedHere() {
    const { book } = await this.ctx();
    return { specs: [...book.specs].reverse(), cards: [...book.cards ?? []].reverse(), discussions: [...book.discussions ?? []].reverse(), limits: LIMITS };
  }
  // ------------------------------------------------------------ Discuss: discussions, a reply as a signed document
  /** The discussion threads started here, and the MIP drafts published, each with its replies. */
  async discussions() {
    const { me, s, book } = await this.ctx();
    const threads = [
      ...(book.discussions ?? []).map((d) => ({ id: d.id, title: `Discussion of ${d.title}`, spec: d.spec, kind: "thread" })),
      ...book.mips.flatMap((m) => m.drafts.map((d, i) => ({ id: d.id, title: `${m.title}, draft ${i + 1}`, spec: null, kind: "draft" })))
    ];
    if (!threads.length) return { threads: [], lines: [] };
    const r = await replies(me, threads.map((t) => t.id), [.../* @__PURE__ */ new Set([...s.relays, ...s.track])], s.via);
    return { threads: threads.map((t) => ({ ...t, replies: (r.replies.get(t.id) ?? []).filter((x) => !readCardText(x.text)).map((x) => ({ ...x, mine: x.signer === me.id })) })), lines: r.lines };
  }
  /** A reply as a signed document (decided on the mockups: "Reply, as a signed document"): a long-form text act naming the act it answers. */
  reply(a) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      if ((await this.acting(me, s)).kind === "collective") throw new Error("A reply is signed as yourself: choose yourself in the identity panel.");
      const text3 = a.text.trim();
      if (!text3) throw new Error("Write the reply first. Nothing was signed.");
      if (!s.relays.length) throw new Error("Name at least one relay its acts go to, in the identity panel, Relays. Nothing was signed.");
      const to = readActId(a.to);
      let ref;
      let author;
      try {
        const r = await referTo(to, [.../* @__PURE__ */ new Set([...s.relays, ...s.track])], s.via);
        ref = r.ref;
        author = r.signer;
      } catch {
        throw new Error("The act it answers was not found on your relays: a reply names only an act held. Nothing was signed.");
      }
      let id;
      try {
        for (const hint of s.relays) for (const c of me.chainActs()) await relayAt(hint, s.via).putAct(c).catch(() => void 0);
        const made = await me.publish(LONGFORM_SPECS.text, TEXT_ACT, textPayload2(text3), { public: true, relays: s.relays, refs: [ref] });
        id = made.id;
        if (author !== me.id) {
          const l = await lookUp(author, [...s.relays, ...s.track], s.via).catch(() => null);
          const inbox = l?.inbox(SPECS.text) ?? [];
          if (inbox.length) await leaveInInbox(me, made.act, inbox).catch(() => void 0);
        }
      } finally {
        await this.store.saveIdentity(me);
      }
      book.replies = [...book.replies ?? [], { id, to, at: now3() }];
      await this.saveBook(me.id, book);
      return { title: "Your reply is published", acts: [id], lines: [{ text: `A signed document, public, answering ${actForm(to)}: ${actForm(id)}.`, tone: "ok" }] };
    });
  }
  // ------------------------------------------------------------ the act menu: Rely on it (in every app, decided)
  /**
   * Rely on an act shown: the witness act (Identity type 15) signed once
   * RELY is typed, as everywhere, its key checked first (H80); through
   * Kišib's panel where the identity is used through it. It keeps that act
   * visible as disputed should its author ever disown it.
   */
  rely(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (a.typed.trim() !== "RELY") throw new Error("Type RELY to sign the witness act. Nothing was signed.");
      const id = readActId(a.id);
      if (me.f.sequence.includes(id)) throw new Error("It is this identity\u2019s own act: a witness act names other identities\u2019 acts. Nothing was signed.");
      await this.current(me);
      let made;
      try {
        made = await me.witness([id], { shown: WITNESS_EXPLANATION, relays: s.relays });
      } finally {
        await this.store.saveIdentity(me);
      }
      if (!made.sent.some((x) => x.result)) throw new Error(`No home took the witness act: ${made.sent.map((x) => `${x.home}: ${x.error}`).join("; ")}. It is signed here, not published.`);
      return { lines: [{ text: `You rely on ${short4(id)}: witness act ${short4(made.id)}, public at this identity\u2019s homes and relays. It keeps that act visible as disputed should its author ever disown it.`, tone: "ok" }] };
    });
  }
  // ------------------------------------------------------------ an identity used through Kišib (the Dubsar runner cMIP)
  runner() {
    if (!this.opts.runner) throw new Error("Ki\u0161ib\u2019s runner is in the computer\u2019s program only, never the web client: bring the identity with its signing key\u2019s words instead.");
    return this.opts.runner;
  }
  /** Where the pairing with Kišib stands, and the identities it lets Ummia use. */
  async runnerState() {
    if (!this.opts.runner) return { available: false, origin: null, state: null, code: null, identities: [], problem: null };
    const held = await this.store.held();
    try {
      const p = await this.opts.runner.paired();
      return { available: true, origin: this.opts.runner.origin(), state: p?.state ?? null, code: p?.code ?? null, identities: (p?.identities ?? []).map((x) => ({ id: x.id, form: idForm(x.id), name: x.name, held: held.includes(x.id) })), problem: null };
    } catch (e3) {
      return { available: true, origin: this.opts.runner.origin(), state: null, code: this.opts.runner.code(), identities: [], problem: message4(e3) };
    }
  }
  runnerPair() {
    return this.runner().pair();
  }
  /** Use an identity Kišib's runner holds and lets Ummia use: no key of it kept here; every act shows Kišib's panel inside Ummia's window. */
  runnerTake(a) {
    return this.serial(async () => {
      const p = await this.runner().paired();
      if (!p || p.state !== "approved") throw new Error(p?.state === "waiting" ? "Ki\u0161ib has not approved Ummia yet: approve it in Ki\u0161ib (Runner, Apps), comparing the code." : "Ummia is not paired with Ki\u0161ib\u2019s runner: pair it first.");
      const k = p.identities.find((x) => x.id === a.id);
      if (!k) throw new Error("Ki\u0161ib does not let Ummia use this identity: choose it for Ummia in Ki\u0161ib (Runner, Apps).");
      if ((await this.store.held()).includes(k.id)) {
        await this.store.setActive(k.id);
        return { lines: [{ text: "Ummia already uses this identity: it is the one in use now.", tone: "ok" }] };
      }
      const look2 = await lookUp(k.id, k.homes, {});
      const r = look2.resolution;
      if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): Ummia cannot use it until they agree.");
      const binding = r.links[r.links.length - 1];
      if (!r.signingKey || hex(r.signingKey) !== k.key) throw new Error(RUNNER_OLD_KEY_SAY);
      const chain = await servedChain(k.id, r.homes, {});
      const named2 = list(look2.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named2.length ? named2 : r.homes.map((h) => h.hint);
      const f = {
        label: TEST_LABEL,
        identity: k.id,
        position: binding.position,
        binding: binding.act,
        // No key of it is held here: Kišib's runner signs (the Dubsar runner cMIP, 3.2).
        signingSecret: "",
        safety: { scheme: 0, seeds: "" },
        chain: chain.map(base64),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: [],
        pending: null
      };
      await this.store.write(k.id, "settings", { relays, track: relays, reports: null, via: {}, acting: k.id });
      await this.store.saveIdentity(new TestIdentity(f, {}));
      await this.store.setActive(k.id);
      return {
        lines: [
          { text: `Ummia uses ${k.name ?? short4(k.id)} through Ki\u0161ib\u2019s runner: Ki\u0161ib holds its signing key, Ummia none. Every act is shown by Ki\u0161ib, in its panel here, before it is signed.`, tone: "ok" },
          { text: RUNNER_HOLDS_SAY, tone: "warn" },
          { text: LINE_SAY, tone: "warn" }
        ]
      };
    });
  }
  /** The request waiting for the person now, for the page to draw Kišib's panel. Not serial: it is asked while an act waits. */
  async runnerAsking() {
    const r = this.opts.runner;
    return { asking: r?.asking ?? null, origin: r?.origin() ?? null };
  }
  async runnerDrop(a) {
    this.opts.runner?.drop(a.request);
  }
  async runnerUnpair() {
    await this.runner().unpair();
  }
};

// src/ops.ts
var text2 = (v) => typeof v === "string" ? v : "";
var list2 = (v) => Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : typeof v === "string" ? v.split(/[\s,]+/).filter(Boolean) : [];
var nums = (v) => list2(v).map(Number).filter((n) => Number.isInteger(n) && n >= 0);
function formOf(a) {
  const types = text2(a.types).split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = /^(\d+)\s+(\S+)\s*(.*)$/.exec(l);
    if (!m) throw new Error(`An act type is written \u201Cnumber name schema\u201D, as \u201C0 note note = tstr\u201D, not \u201C${l}\u201D.`);
    return [Number(m[1]), m[2], m[3] || `${m[2]} = any`];
  });
  const railKind = text2(a.railKind);
  return {
    kind: Number(a.kind ?? 0),
    text: text2(a.text),
    tasks: nums(a.tasks),
    types,
    dependencies: list2(a.dependencies),
    implements: text2(a.implements).trim() || null,
    predecessor: text2(a.predecessor).trim() || null,
    layers: nums(a.layers),
    rail: railKind === "" ? null : { kind: Number(railKind), binds: nums(a.railBinds) },
    checker: a.checker === true
  };
}
async function run(u2, op, a) {
  switch (op) {
    case "state":
      return u2.state();
    case "rules":
      return u2.rules();
    case "rules approve":
      return u2.approveRules({ keys: list2(a.keys), where: a.where === "list" ? "list" : "here", remove: a.remove === true });
    case "bring":
      return u2.bring({ id: text2(a.id), words: text2(a.words), address: text2(a.address), relays: list2(a.relays) });
    case "renew":
      return u2.renew(text2(a.words));
    case "use":
      return u2.use(text2(a.id));
    case "leave":
      return u2.leave();
    case "forget":
      return u2.forget(text2(a.id));
    case "carry":
      return u2.carry();
    case "check":
      return u2.check();
    case "acting":
      return u2.setActing(text2(a.id));
    case "collective add":
      return u2.collectiveAdd(text2(a.id));
    case "collective release standing":
      return u2.collectiveReleaseStanding(text2(a.id));
    case "settings":
      return u2.setSettings({ relays: a.relays === void 0 ? void 0 : list2(a.relays), track: a.track === void 0 ? void 0 : list2(a.track), reports: a.reports === void 0 ? void 0 : text2(a.reports) });
    case "confirm":
      return u2.confirm(text2(a.plan), text2(a.digest));
    case "cancel":
      return u2.cancel(text2(a.plan));
    case "spec choices":
      return u2.specChoices();
    case "spec prepare":
      return u2.prepareSpec(formOf(a));
    case "specs":
      return u2.specs();
    case "track":
      return u2.track({ relays: list2(a.relays), signer: text2(a.signer).trim() || void 0 });
    case "acts of":
      return u2.actsOf({ spec: text2(a.spec), type: text2(a.type).trim() === "" ? null : Number(a.type), signer: text2(a.signer).trim() || void 0, relays: list2(a.relays) });
    case "accepted":
      return u2.accepted();
    case "accepted change":
      return u2.changeAccepted({
        add: Array.isArray(a.add) ? a.add.map((x) => ({ hash: text2(x.hash), label: text2(x.label) || null })) : [],
        remove: list2(a.remove)
      });
    case "accepted publish":
      return u2.publishList(a.on === true);
    case "mips":
      return u2.mips();
    case "mip new":
      return u2.newMip({ title: text2(a.title), forks: text2(a.forks) });
    case "mip save":
      return u2.saveMip(text2(a.key), text2(a.text));
    case "mip draft":
      return u2.publishMipDraft(text2(a.key));
    case "mip replies":
      return u2.mipReplies(text2(a.key));
    case "mip prepare":
      return u2.prepareMip(text2(a.key));
    case "reports":
      return u2.reports();
    case "report send":
      return u2.sendReport(text2(a.text));
    case "releases":
      return u2.releases();
    case "release suggest":
      return u2.suggestRelease(text2(a.folder));
    case "release prepare":
      return u2.prepareRelease({ folder: text2(a.folder), name: text2(a.name), version: text2(a.version), previous: text2(a.previous) || null, implements: list2(a.implements) });
    case "release confirm":
      return u2.confirmRelease(text2(a.plan), text2(a.digest));
    case "release check":
      return u2.checkRelease(text2(a.id));
    case "anchor offers":
      return u2.anchorOffers(text2(a.service));
    case "anchor ask":
      return u2.anchorRelease({ release: text2(a.release), service: text2(a.service), offer: text2(a.offer), tier: Number(a.tier ?? 0) });
    case "look":
      return u2.look({ point: a.point ?? {}, filters: a.filters === void 0 ? void 0 : list2(a.filters), layer: text2(a.layer) || null });
    case "spec page":
      return u2.specPage({ hash: text2(a.hash) });
    case "clock words":
      return u2.clockWords(list2(a.ids));
    case "saved add":
      return u2.savedAdd({ label: text2(a.label), point: { kind: text2(a.point?.kind), value: text2(a.point?.value) }, filters: list2(a.filters) });
    case "saved remove":
      return u2.savedRemove(text2(a.key));
    case "names":
      return u2.names({ ids: list2(a.ids), fresh: a.fresh === true });
    case "contacts":
      return u2.contacts();
    case "contact add":
      return u2.contactChange({ op: "add", id: text2(a.id), nick: text2(a.nick) || null });
    case "contact nick":
      return u2.contactChange({ op: "nick", id: text2(a.id), nick: text2(a.nick) || null });
    case "contact remove":
      return u2.contactChange({ op: "remove", id: text2(a.id) });
    case "follow":
      return u2.follow({ id: text2(a.id), name: text2(a.name) || null });
    case "follow releases":
      return u2.followReleases({ id: text2(a.id), name: text2(a.name) || null });
    case "card prepare":
      return u2.prepareCard({ spec: text2(a.spec), title: text2(a.title), summary: text2(a.summary), releases: list2(a.releases), vectors: list2(a.vectors), discussion: text2(a.discussion) });
    case "published here":
      return u2.publishedHere();
    case "discussions":
      return u2.discussions();
    case "reply":
      return u2.reply({ to: text2(a.to), text: text2(a.text) });
    case "rely":
      return u2.rely({ id: text2(a.id), typed: text2(a.typed) });
    case "runner":
      return u2.runnerState();
    case "runner pair":
      return u2.runnerPair();
    case "runner take":
      return u2.runnerTake({ id: text2(a.id) });
    case "runner asking":
      return u2.runnerAsking();
    case "runner drop":
      return u2.runnerDrop({ request: text2(a.request) });
    case "runner unpair":
      return u2.runnerUnpair();
    default:
      throw new Error(`unknown operation ${op}`);
  }
}

// ../kit/src/style.ts
var APPS = {
  kishib: { name: "Ki\u0161ib", colour: "#8ec5f0", pastel: "#cfe5f7", wash: "rgba(207,229,247,.075)", wash2: "rgba(207,229,247,.15)" },
  dub: { name: "Dub", colour: "#e9dfcd", pastel: "#efe8dc", wash: "rgba(239,232,220,.06)", wash2: "rgba(239,232,220,.13)" },
  damgar: { name: "Damgar", colour: "#e8b33a", pastel: "#f2d89c", wash: "rgba(242,216,156,.07)", wash2: "rgba(242,216,156,.15)" },
  edubba: { name: "Edubba", colour: "#48c08c", pastel: "#a9e3c7", wash: "rgba(169,227,199,.07)", wash2: "rgba(169,227,199,.15)" },
  ummia: { name: "Ummia", colour: "#ee8b74", pastel: "#f7c4b7", wash: "rgba(247,196,183,.07)", wash2: "rgba(247,196,183,.15)" }
};
var tints = Object.keys(APPS).map((a) => `.k-${a}{--k-c:${APPS[a].colour};--k-p:${APPS[a].pastel};--k-wash:${APPS[a].wash};--k-wash2:${APPS[a].wash2}}`).join("\n");
var KIT_STYLE = `@font-face{font-family:"Atkinson Hyperlegible Next";font-style:normal;font-weight:200 800;font-display:swap;src:url(atkinson_next.woff2) format("woff2")}
@font-face{font-family:"Atkinson Hyperlegible Mono";font-style:normal;font-weight:200 800;font-display:swap;src:url(atkinson_mono.woff2) format("woff2")}
@font-face{font-family:"Gentium Book Plus";font-style:italic;font-weight:400;font-display:swap;src:url(gentium_book_plus_italic.woff2) format("woff2")}
:root{color-scheme:dark;--k-bg:#06080c;--k-raise:#0d1017;--k-raise2:#131720;--k-pop:#0f131a;--k-line:#232a35;--k-edge:#323a47;--k-text:#d6dae1;--k-soft:#8a919d;--k-faint:#4f5663;--k-ink:#0a0c10;--k-bad:#c4645f;--k-id:#9aa8b8;--k-c:#e9dfcd;--k-p:#efe8dc;--k-wash:rgba(239,232,220,.06);--k-wash2:rgba(239,232,220,.13)}
${tints}
.k-page,.k-page *{box-sizing:border-box}
html:has(.k-page),body:has(.k-page){margin:0;height:100%;background:var(--k-bg);color:var(--k-text);overflow:hidden}
.k-page{font:300 15px/1.5 "Atkinson Hyperlegible Next",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--k-text);background:var(--k-bg);position:relative;display:flex;flex-direction:column;height:100vh;height:100dvh;max-width:none;margin:0;padding:0}
:where(.k-page) button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
:where(.k-page) button:disabled{opacity:.45;cursor:default}
:where(.k-page) :is(h1,h2,h3,h4){font-weight:300;margin:0;letter-spacing:.005em}
:where(.k-page) p{margin:6px 0}
:where(.k-page) a{color:var(--k-text);text-decoration:underline;text-decoration-color:var(--k-faint);text-underline-offset:3px}
:where(.k-page) :is(input,textarea,select){font:inherit;font-size:15px;color:var(--k-text);background:var(--k-raise);border:1px solid var(--k-edge);border-radius:10px;padding:8px 11px;width:100%}
:where(.k-page) :is(input,textarea,select):focus{outline:none;border-color:var(--k-p)}
:where(.k-page) input:is([type=checkbox],[type=radio]){width:auto;accent-color:var(--k-p)}
:where(.k-page) label{display:block;margin:10px 0 4px;font-size:13px;color:var(--k-soft)}
.k-page [hidden]{display:none!important}
.k-mono,:where(.k-page) code{font:12.5px/1.4 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace}
.k-soft{color:var(--k-soft)}.k-faint{color:var(--k-faint)}.k-small{font-size:13px}
.k-grow{flex:1}
.k-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0}
.k-bad{color:var(--k-bad)}
.k-offscreen{position:fixed;left:-9999px;top:0;opacity:0}

/* the top of every window: the app (or Contacts) left, a switch or tabs in the middle, the identity right */
.k-top{display:flex;align-items:center;gap:14px;height:56px;padding:0 20px;border-bottom:1px solid var(--k-line);flex:none;position:relative;z-index:5;background:var(--k-bg)}
.k-app{display:flex;align-items:center;gap:10px;font-size:16px;letter-spacing:.04em}
.k-app .k-nm,.k-appname{font-family:"Gentium Book Plus",Georgia,serif;font-style:italic;font-weight:400;letter-spacing:.01em;font-size:1.12em}
.k-app img{width:26px;height:26px;border-radius:6px}
.k-menu-btn{display:flex;align-items:center;gap:8px;color:var(--k-soft);font-size:14px;padding:6px 10px;border:1px solid var(--k-line);border-radius:10px}
.k-menu-btn:hover{color:var(--k-text)}
.k-switch{display:flex;border:1px solid var(--k-edge);border-radius:999px;padding:3px;gap:2px}
.k-switch button{padding:5px 18px;border-radius:999px;color:var(--k-soft);font-size:14px;display:flex;align-items:center;gap:6px}
.k-switch button.k-on{background:var(--k-p);color:var(--k-ink);font-weight:400}
.k-count{display:inline-block;min-width:1.4em;padding:0 6px;border-radius:999px;background:var(--k-edge);color:var(--k-text);font-size:11px;line-height:1.6;text-align:center}
.k-count:empty{display:none}
.k-on .k-count{background:var(--k-ink);color:var(--k-p)}
.k-me{display:flex;align-items:center;gap:10px;padding:4px 6px 4px 12px;border:1px solid var(--k-line);border-radius:999px;max-width:42%}
.k-me .k-n{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.k-me .k-s{font:11.5px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-faint);white-space:nowrap}
.k-dot{width:26px;height:26px;border-radius:50%;background:var(--k-p);color:var(--k-ink);display:grid;place-items:center;font-size:12px;font-weight:400;flex:none}
.k-dot.k-c{border-radius:7px}
.k-dot.k-alt{background:var(--k-raise2);color:var(--k-text);border:1px solid var(--k-edge)}
.k-body{flex:1;min-height:0;display:flex;position:relative}
.k-tabs{display:flex;gap:4px}
.k-tab{padding:6px 14px;border-radius:999px;color:var(--k-soft);font-size:14px;display:flex;align-items:center;gap:8px}
.k-tab.k-on{background:var(--k-p);color:var(--k-ink);font-weight:400}

/* tiles: big, an icon and words, danger marks; the edge thickens with the level; never red but for an alarm */
.k-home{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(2,minmax(min-content,1fr));gap:18px;padding:24px 28px 12px;overflow:auto}
.k-tile{position:relative;border-radius:22px;background:linear-gradient(160deg,var(--k-wash2),var(--k-wash) 55%,rgba(255,255,255,.015));border:1px solid var(--k-line);padding:26px 28px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;text-align:left}
.k-tile:hover,.k-tile:focus-visible{outline:1px solid var(--k-p);outline-offset:-1px}
/* the icon in the tile's own flow, at its top, the words at its bottom: they never overlap, at any width (H105); a short tile grows */
.k-tile .k-ic{flex:none;width:58px;height:58px;color:var(--k-p);margin:-2px 0 auto;padding-bottom:10px;box-sizing:content-box}
.k-tile h2{font-size:34px;letter-spacing:.01em;color:var(--k-p)}
.k-tile p{color:var(--k-soft);font-size:14.5px;max-width:36em}
.k-tile .k-dm{position:absolute;right:24px;top:26px}
.k-tile.k-d2{border-color:rgba(255,255,255,.14);border-width:1.5px}
.k-tile.k-d3{border-color:rgba(255,255,255,.24);border-width:2.5px}
.k-tile.k-alarm{border-color:var(--k-bad)}
.k-tile .k-alert{position:absolute;right:24px;bottom:24px;color:var(--k-bad);font-size:13px;border:1px solid var(--k-bad);border-radius:999px;padding:2px 10px}
.k-dm{display:inline-flex;align-items:flex-end;gap:3px;height:20px}
.k-dm i{display:block;width:5px;border-radius:2px;background:var(--k-edge)}
.k-dm i:nth-child(1){height:8px}.k-dm i:nth-child(2){height:13px}.k-dm i:nth-child(3){height:19px}
.k-dm.k-l1 i:nth-child(1),.k-dm.k-l2 i:nth-child(-n+2),.k-dm.k-l3 i{background:var(--k-p)}

/* a tile opened: its column on the left, the part on the right; on a phone the column folds away once a part is chosen */
.k-col{width:248px;flex:none;border-right:1px solid var(--k-line);padding:18px 12px;display:flex;flex-direction:column;gap:2px;overflow:auto}
.k-col h3{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--k-faint);margin:14px 10px 6px}
.k-col h3:first-child{margin-top:0}
.k-col button{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;color:var(--k-soft);font-size:14.5px;text-align:left;width:100%}
.k-col button.k-on{background:var(--k-wash2);color:var(--k-text)}
.k-col button.k-on::before{content:"";width:3px;height:16px;border-radius:2px;background:var(--k-p);margin-left:-4px}
.k-col button .k-k{margin-left:auto;font-size:12px;color:var(--k-faint)}
.k-col .k-sep{height:1px;background:var(--k-line);margin:10px 8px}
.k-pane{flex:1;min-width:0;padding:22px 30px;overflow:auto;display:flex;flex-direction:column}
.k-pane>h2{font-size:24px;margin-bottom:4px}
.k-back{display:none;align-items:center;gap:6px;color:var(--k-soft);font-size:14px;margin:0 0 8px}

/* the feed box: fills its space and scrolls inside, never the page */
.k-feedwrap{flex:1;min-height:0;display:flex;flex-direction:column}
.k-controls{display:flex;align-items:center;gap:6px;margin:0 0 10px;flex-wrap:wrap}
.k-lens{padding:5px 14px;border-radius:999px;font-size:14px;color:var(--k-soft);border:1px solid var(--k-line);white-space:nowrap;display:inline-flex;gap:6px;align-items:center}
.k-lens.k-on{background:var(--k-p);color:var(--k-ink);border-color:var(--k-p)}
.k-point{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 8px;font-size:13px;color:var(--k-soft)}
.k-point .k-lbl{color:var(--k-faint);min-width:5.5em}
.k-feed{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;border:1px solid var(--k-line);border-radius:16px;padding:6px 14px;background:#080a0f;position:relative}
.k-feed::-webkit-scrollbar{width:8px}.k-feed::-webkit-scrollbar-thumb{background:var(--k-edge);border-radius:4px}.k-feed::-webkit-scrollbar-track,.k-feed::-webkit-scrollbar-corner{background:transparent}.k-feed::-webkit-scrollbar-button{display:none;height:0}
.k-empty{padding:28px 0;color:var(--k-faint);font-size:14px;text-align:center}
.k-clock{font-size:12px;color:var(--k-faint);margin:6px 2px 0}

/* the act card, the same in every app: the signer top left, the act bottom right, each its own menu */
.k-act{position:relative;padding:12px 2px 10px;border-bottom:1px solid var(--k-line)}
.k-act:last-child{border-bottom:0}
.k-act .k-signer{display:inline-flex;align-items:baseline;gap:9px;padding:2px 8px 2px 0;border-radius:8px;max-width:100%;flex-wrap:wrap;text-align:left}
.k-act .k-sid,.k-act .k-actid{font:12px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-id)}
.k-act .k-nm{font-size:15px;font-weight:400;color:var(--k-text)}
.k-act .k-dn{font-size:12.5px;color:var(--k-soft)}
.k-act .k-of{font-size:12.5px;color:var(--k-soft);border:1px solid var(--k-edge);border-radius:999px;padding:0 8px}
.k-act .k-hint,.k-act .k-unstamped{font-size:12px;color:var(--k-faint);margin:4px 0 0}
.k-act .k-when{float:right;font-size:12px;color:var(--k-faint)}
.k-act .k-txt{margin:4px 0 6px;font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.k-act .k-label{font-size:12.5px;color:var(--k-soft);margin:2px 0}
.k-act .k-label.k-warn{color:var(--k-c)}
.k-act .k-label.k-bad{color:var(--k-bad)}
.k-act .k-kind{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--k-soft);border:1px solid var(--k-line);border-radius:5px;padding:1px 6px;margin-right:6px}
.k-act .k-foot{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--k-faint);flex-wrap:wrap}
.k-act .k-actid{margin-left:auto;padding:2px 0 2px 8px;border-radius:8px}
.k-act .k-v{color:var(--k-p);font-size:12px}
.k-act .k-alarmline{color:var(--k-bad);font-size:12.5px}
.k-act .k-signer.k-open,.k-act .k-actid.k-open{background:var(--k-wash2);outline:1px solid var(--k-p)}
.k-act.k-sel{background:var(--k-wash);border-radius:12px;padding-left:10px;padding-right:10px;border-bottom-color:transparent}
.k-act figure{margin:8px 0 4px}
.k-act img,.k-act video{display:block;max-width:100%;max-height:60vh;height:auto;border-radius:12px;image-orientation:from-image}
.k-act audio{display:block;width:100%;margin:6px 0}
.k-act .k-doc{display:block;border:1px solid var(--k-line);border-radius:10px;padding:8px 12px;margin:6px 0;font-size:14px;text-decoration:none}
.k-act .k-box{border:1px solid var(--k-line);border-radius:10px;padding:8px 12px;margin:6px 0}
.k-act .k-corrected{display:inline-block;margin:0 0 0 8px;font-size:11.5px;letter-spacing:.04em;color:var(--k-p);border:1px solid var(--k-edge);border-radius:999px;padding:0 8px;vertical-align:2px}
.k-act .k-corrected.k-on{background:var(--k-wash2)}
.k-earlier{border-left:2px solid var(--k-edge);margin:0 0 8px;padding:0 0 0 10px;opacity:.82}
.k-earlier .k-act{border-bottom:1px dashed var(--k-line)}
.k-earlier-say{font-size:11.5px;color:var(--k-faint);margin:4px 0 0}

/* an identity wherever its ID is shown (H96, H121): its names, the nickname first, the published name small and faint; its short ID under, a button */
.k-who{display:inline-flex;flex-direction:column;align-items:flex-start;gap:1px;vertical-align:top;max-width:100%;min-width:0}
.k-who.k-inline{display:inline;vertical-align:baseline}
.k-who.k-inline>.k-idbtn{margin-left:6px}
.k-who.k-inline .k-names{display:inline}
.k-who.k-inline .k-names>*+*{margin-left:6px}
.k-names{display:inline-flex;align-items:baseline;gap:6px;flex-wrap:wrap;min-width:0}
.k-nick{font-weight:400;color:var(--k-text);overflow-wrap:anywhere}
.k-pub{font-size:.82em;color:var(--k-faint);overflow-wrap:anywhere}
.k-pub.k-state{font-style:italic}
.k-you{font-size:12px;color:var(--k-soft)}
.k-retry{font-size:12px;color:var(--k-soft);text-decoration:underline;text-underline-offset:2px}
.k-idbtn{font:11.5px/1.4 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-id);border-radius:6px;padding:0 2px;text-align:left}
.k-idbtn:hover,.k-idbtn:focus-visible{background:var(--k-wash);outline:none}
.k-idbtn.k-whole{overflow-wrap:anywhere;word-break:break-all;white-space:normal;background:var(--k-wash);color:var(--k-text);user-select:all;-webkit-user-select:all}
.k-idbtn[data-k-copied]{color:var(--k-p)}
.k-picker{min-width:280px}
.k-picker input[type=search]{margin:4px 0 6px}
.k-picker button{display:flex;align-items:center;gap:10px}
.k-picker .k-names{flex:1}

/* menus: what you take above a line, what changes something below */
.k-pop{position:fixed;z-index:40;min-width:236px;max-width:min(320px,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto;background:var(--k-pop);border:1px solid var(--k-edge);border-radius:14px;padding:6px;box-shadow:0 16px 40px rgba(0,0,0,.6)}
.k-pop .k-t{font:11.5px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-faint);padding:6px 10px 4px;overflow-wrap:anywhere}
.k-pop button{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;font-size:14px;color:var(--k-text);width:100%;text-align:left}
.k-pop button:hover,.k-pop button:focus-visible{background:var(--k-wash);outline:none}
.k-pop button:disabled{color:var(--k-faint);opacity:1}
.k-pop button .k-k{margin-left:auto;font-size:11.5px;color:var(--k-faint)}
.k-pop hr{border:0;border-top:1px solid var(--k-edge);margin:5px 4px}
.k-pop.k-anchored{position:absolute;left:8px;right:auto;top:auto;bottom:calc(100% + 6px);max-height:min(320px,40vh)}
.k-pop .k-own{font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--k-p);padding:4px 10px 2px;opacity:.75}

/* the typing box: always in the same place, the bottom */
.k-typing{flex:none;display:flex;flex-direction:column;gap:6px;border:1px solid var(--k-edge);border-radius:16px;padding:10px 12px;margin-top:12px;background:var(--k-raise);position:relative}
.k-typing .k-line{display:flex;align-items:flex-end;gap:10px}
.k-typing textarea{flex:1;border:0;background:none;padding:2px 0;min-height:24px;max-height:30vh;resize:none;font-size:15px}
.k-typing .k-tools{display:flex;gap:8px;align-items:center;color:var(--k-soft);font-size:13px}
.k-typing .k-tools button,.k-typing .k-tools label{color:var(--k-soft);font-size:13px;margin:0;cursor:pointer;display:inline-flex;align-items:center}
.k-typing .k-tools button:hover,.k-typing .k-tools label:hover{color:var(--k-text)}
.k-typing input[type=file]{display:none}
.k-typing .k-opts{display:flex;gap:8px;flex-wrap:wrap}
.k-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border:1px solid var(--k-edge);border-radius:999px;font-size:14px;color:var(--k-text)}
.k-btn.k-p{background:var(--k-p);border-color:var(--k-p);color:var(--k-ink);font-weight:400}
.k-btn.k-q{border-color:transparent;color:var(--k-soft)}
.k-btn.k-alarm{border-color:var(--k-bad);color:var(--k-bad)}
.k-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 11px;border-radius:999px;border:1px solid var(--k-edge);font-size:13px;color:var(--k-soft)}
.k-chip.k-on{background:var(--k-wash2);border-color:transparent;color:var(--k-text)}
.k-chip .k-x{color:var(--k-faint)}

/* overlays: the pop-up thread, panels, frames */
.k-shade{position:fixed;inset:0;background:rgba(3,4,6,.66);z-index:30}
.k-shade.k-light{background:rgba(3,4,6,.45)}
.k-modal{position:fixed;z-index:31;left:50%;top:50%;transform:translate(-50%,-50%);width:min(600px,calc(100% - 28px));max-height:calc(100% - 60px);display:flex;flex-direction:column;background:#0b0e14;border:1px solid var(--k-edge);border-radius:18px;padding:16px 18px;box-shadow:0 24px 60px rgba(0,0,0,.7)}
.k-modal .k-mh{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.k-modal .k-mh h3{font-size:17px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.k-round{font-size:18px;color:var(--k-soft);width:30px;height:30px;border:1px solid var(--k-line);border-radius:50%;display:grid;place-items:center;flex:none}
.k-modal .k-mbody{min-height:0;overflow:auto;display:flex;flex-direction:column}
.k-modal .k-feed{max-height:60vh;flex:none}
.k-panel{position:fixed;z-index:32;right:16px;top:62px;width:360px;max-height:calc(100% - 78px);overflow:auto;background:#0e1118;border:1px solid var(--k-edge);border-radius:16px;padding:10px;box-shadow:0 20px 50px rgba(0,0,0,.7)}
.k-panel.k-left{left:16px;right:auto}
.k-panel h4{font-size:16px;font-weight:300}
.k-ph{display:flex;align-items:center;gap:10px;padding:2px 2px 6px 8px}
.k-panel .k-ph .k-round{width:28px;height:28px;font-size:16px}
.k-confirm{width:min(440px,calc(100% - 28px))}
.k-confirm .k-mh{margin-bottom:0}
.k-confirm .k-box{margin:0;border:0;padding:0 4px 4px}
.k-alarm-modal{border-color:var(--k-bad)}
.k-keychanged h4{font-size:17px;margin:0 0 6px}
.k-keychanged textarea{min-height:70px}
.k-reminder{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:6px 20px;border-bottom:1px solid var(--k-bad);font-size:13px;color:var(--k-text);background:rgba(196,100,95,.08);flex:none}
.k-reminder span{flex:1;min-width:12em}
.k-reminder.k-rules-ask{border-bottom-color:var(--k-edge);background:var(--k-wash)}
.k-rule-list{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:10px}
.k-rule{border:1px solid var(--k-line);border-radius:10px;padding:10px 12px}
.k-rule p{margin:4px 0}
.k-rule-not{border-color:var(--k-edge)}
.k-rule-not .k-rule-on{font-weight:600}
.k-rules-all{margin:10px 0 0}
.k-idrow{display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;width:100%;text-align:left}
.k-idrow.k-on{background:var(--k-wash2)}
.k-idrow .k-n{font-size:14.5px}
.k-idrow .k-s{font:11.5px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-faint)}
.k-idrow .k-tagc{font-size:11px;color:var(--k-soft);border:1px solid var(--k-line);border-radius:999px;padding:0 7px;margin-left:4px}
.k-idrow.k-sub{margin-left:26px;width:calc(100% - 26px)}
.k-idline{display:flex;align-items:center;gap:4px}
.k-idline>.k-idrow{flex:1;min-width:0}
.k-more{color:var(--k-soft);width:28px;height:28px;border-radius:8px;display:grid;place-items:center;border:1px solid var(--k-line);flex:none}
.k-more:hover{color:var(--k-text)}
.k-ownid{margin:2px 4px 8px 44px}
.k-ownid .k-row{margin:6px 0 0;gap:6px}
.k-idwhole{display:block;font-size:12px;color:var(--k-text);overflow-wrap:anywhere;word-break:break-all;user-select:all;-webkit-user-select:all}
.k-sepline{height:1px;background:var(--k-line);margin:6px 4px}
.k-foot-note{font-size:12.5px;color:var(--k-faint);padding:6px 8px}
.k-panel .k-pane-in{padding:4px 6px}

/* the slot: another app's panel, drawn by that app in a frame this app cannot read or change */
.k-frame{position:fixed;z-index:50;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,calc(100% - 28px));border-radius:20px;padding:4px;background:repeating-linear-gradient(45deg,var(--k-fc) 0 10px,var(--k-fc2) 10px 20px)}
.k-frame .k-by{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--k-ink);padding:4px 10px 6px;font-weight:400}
.k-frame iframe{display:block;width:100%;height:min(420px,70vh);border:0;border-radius:16px;background:#090c11}
.k-frame.k-kishib{--k-fc:#cfe5f7;--k-fc2:#9fc9ea}
.k-frame.k-damgar{--k-fc:#f2d89c;--k-fc2:#d9b55e}
.k-frame.k-edubba{--k-fc:#a9e3c7;--k-fc2:#76c9a0}
.k-frame.k-ummia{--k-fc:#f7c4b7;--k-fc2:#e99a86}
.k-frame.k-dub{--k-fc:#efe8dc;--k-fc2:#cfc4b0}

/* a disclaimer in one line; the "?" opens the rest */
.k-say{font-size:12.5px;color:var(--k-faint);margin:6px 0}
.k-say>summary{list-style:none;cursor:pointer;display:inline}
.k-say>summary::-webkit-details-marker{display:none}
.k-help{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;border:1px solid var(--k-edge);color:var(--k-soft);font-size:11px;margin-left:6px;vertical-align:1px}
.k-say[open]>summary .k-help{background:var(--k-wash2);color:var(--k-text)}
.k-mor{display:inline-block;margin-left:10px;font-size:12px;color:var(--k-soft);text-decoration:underline;text-decoration-color:var(--k-faint);text-underline-offset:3px;white-space:nowrap}
a.k-mor:hover{color:var(--k-text)}
.k-more-text .k-mor{margin-left:0;white-space:normal}
/* a line opening a panel to work in (H99): a chevron, turning down when open */
.k-fold{margin:8px 0;font-size:13.5px}
.k-fold>summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;color:var(--k-soft)}
.k-fold>summary::-webkit-details-marker{display:none}
.k-fold>summary:hover{color:var(--k-text)}
.k-chev{display:inline-grid;place-items:center;width:17px;height:17px;font-size:15px;line-height:1;color:var(--k-soft);transition:transform .15s}
.k-fold[open]>summary .k-chev{transform:rotate(90deg)}
.k-fold-body{margin:8px 0 2px}
.k-say .k-more-text{margin:6px 0 2px;color:var(--k-soft);font-size:13px;max-width:48em}
.k-say .k-more-text p{margin:4px 0}
.k-alarmbox{border:1px solid var(--k-bad);border-radius:12px;padding:10px 12px;margin:8px 0;color:var(--k-text);font-size:14px}

/* notes the app says: done, error */
.k-note{margin:8px 0;padding:8px 12px;border-left:2px solid var(--k-line);font-size:14px;color:var(--k-soft)}
.k-note.k-done{border-left-color:var(--k-p);color:var(--k-text)}
.k-note.k-error{border-left-color:var(--k-bad);color:var(--k-text)}
.k-note ul{margin:4px 0 0;padding-left:1.1em}
.k-note li.k-bad,.k-note li.bad{color:var(--k-bad)}
.k-status{position:fixed;z-index:900;left:50%;top:64px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));max-height:40vh;overflow:auto;background:var(--k-pop);border:1px solid var(--k-edge);border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,.6)}
.k-status:empty{display:none}
.k-status .k-note{margin:0;border-left:0;padding:10px 40px 10px 14px}
.k-status .k-close{position:absolute;right:8px;top:8px}

/* the profile page: light and friendly */
.k-prof{max-width:760px;width:100%;margin:0 auto;flex:1;display:flex;flex-direction:column;min-height:0}
.k-prof .k-hero{display:flex;gap:18px;align-items:center;padding:8px 0 12px;flex-wrap:wrap}
.k-prof .k-hero .k-dot{width:64px;height:64px;font-size:26px;font-weight:300}
.k-prof .k-hero h2{font-size:30px;overflow-wrap:anywhere}
.k-prof .k-own-name{color:var(--k-soft);font-size:14px}

/* lists, words */
.k-list{border-top:1px solid var(--k-line)}
.k-list>div,.k-list>li{display:flex;align-items:center;gap:12px;padding:11px 2px;border-bottom:1px solid var(--k-line);font-size:14.5px;list-style:none}
.k-list .k-r{margin-left:auto;color:var(--k-soft);font-size:13px}
.k-words{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 16px;padding:14px 18px;border:1px solid var(--k-edge);border-radius:14px;font:14.5px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;margin:10px 0;background:var(--k-raise)}
.k-words b{display:inline-block;min-width:2em;color:var(--k-faint);font-weight:400}
.k-box{border:1px solid var(--k-line);border-radius:14px;padding:14px 16px;margin:10px 0}
.k-box.k-fill{background:var(--k-wash);border-color:transparent}
.k-facts{display:grid;grid-template-columns:max-content 1fr;gap:6px 18px;font-size:14px;margin:6px 0}
.k-facts dt{color:var(--k-faint)}.k-facts dd{margin:0;color:var(--k-soft);overflow-wrap:anywhere}

/* phone: one column; the column becomes the first screen and folds away once a part is chosen */
@media (max-width:600px){
  .k-top{height:52px;padding:0 10px;gap:8px}
  .k-app .k-nm,.k-hide-phone{display:none!important}
  .k-me{padding:3px;border:0}
  .k-me .k-n,.k-me .k-s{display:none}
  .k-menu-btn .k-l{display:none}
  .k-switch button{padding:4px 11px}
  .k-home{grid-template-columns:1fr;grid-template-rows:repeat(4,minmax(min-content,1fr));gap:10px;padding:12px}
  .k-tile{padding:16px 18px;border-radius:18px}
  .k-tile .k-ic{width:40px;height:40px;padding-bottom:8px}
  .k-tile h2{font-size:24px}
  .k-tile p{font-size:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .k-tile .k-dm{right:16px;top:18px}
  .k-opened .k-col{width:100%;border-right:0;padding:12px}
  .k-opened .k-pane{display:none;padding:12px}
  .k-opened.k-chosen .k-col{display:none}
  .k-opened.k-chosen .k-pane{display:flex}
  .k-opened.k-chosen .k-back{display:inline-flex}
  .k-pane{padding:12px}
  .k-words{grid-template-columns:repeat(3,1fr);font-size:12.5px;padding:10px 12px;gap:4px 10px}
  .k-panel{left:8px;right:8px;width:auto;top:56px}
  .k-pop:not([data-k-suggest]){left:8px!important;right:8px!important;top:auto!important;bottom:8px!important;max-width:none;width:auto;min-width:0;border-radius:16px}
  .k-modal{padding:12px;width:calc(100% - 16px);max-height:calc(100% - 24px)}
  .k-act .k-when{float:none;display:block;margin:0 0 2px}
  .k-feed{padding:4px 10px}
}
`;

// ../kit/src/html.ts
var e = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function shortForm(form2) {
  const one2 = form2.indexOf("1");
  if (one2 < 0 || form2.length < one2 + 10) return form2;
  return `${form2.slice(0, one2 + 4)}\u2026${form2.slice(-3)}`;
}
var initial = (name, id) => (name?.trim()?.[0] ?? id.replace(/^m\w*1/, "")[0] ?? "?").toUpperCase();
var NAME_WORDS = { loading: "Loading\u2026", none: "No name published", unreached: "Name not reached" };
function nameOf2(n) {
  return n?.nick?.trim() || (n?.published?.state === "name" ? n.published.name : null);
}
function namesHtml(n, o = {}) {
  const nick = n?.nick?.trim() || null;
  const p = n?.published ?? { state: "loading" };
  const pub = p.state === "name" ? p.name : null;
  const state = p.state === "name" ? "" : `<span class="k-pub k-state" data-k-name-state="${p.state}">${NAME_WORDS[p.state]}</span>${p.state === "unreached" && o.retry !== false ? '<button type="button" class="k-retry" data-k-name-retry>Ask again</button>' : ""}`;
  if (nick) return `<span class="k-nick" dir="auto">${e(nick)}</span>${pub && pub !== nick ? ` <span class="k-pub" dir="auto">${e(pub)}</span>` : ""}`;
  if (pub) return `<span class="k-nick" dir="auto">${e(pub)}</span>`;
  return state;
}
var NOT_STAMPED = "not yet stamped by the Dubsar clock";
function namedOf(w) {
  if (w.named) return w.named;
  const nick = w.name && w.ownName && w.name !== w.ownName ? w.name : null;
  const pub = w.ownName ?? (nick ? null : w.name ?? null);
  return { nick, published: pub ? { state: "name", name: pub } : { state: "none" } };
}
function card(a, o = {}) {
  const s = a.signer;
  const named2 = namedOf(s);
  const names = !nameOf2(named2) && s.collective && named2.published?.state === "none" ? '<span class="k-nick">a collective</span>' : namesHtml(named2, { retry: false });
  const signer = `<button type="button" class="k-signer" data-k-menu="signer" aria-haspopup="menu"><span class="k-names k-nm">${names}</span>${a.of ? `<span class="k-of" dir="auto">of ${e(a.of)}</span>` : ""}${s.me ? '<span class="k-dn">you</span>' : ""}<span class="k-sid">${e(shortForm(s.form))}</span></button>`;
  const labels = (a.labels ?? []).map((l) => `<div class="k-label${l.tone === "bad" ? " k-bad" : l.tone === "warn" ? " k-warn" : ""}">${l.html ?? e(l.text)}</div>`).join("");
  const kind = a.kind ? `<span class="k-kind">${e(a.kind)}</span>` : "";
  const text3 = a.text || kind ? `<div class="k-txt" dir="auto">${kind}${e(a.text ?? "")}</div>` : "";
  const foot = `<div class="k-foot">${a.verified && !a.alarm ? '<span class="k-v" title="verified">\u2713</span>' : ""}${a.alarm ? `<span class="k-alarmline">${e(a.alarm)}</span>` : ""}<button type="button" class="k-actid" data-k-menu="act" aria-haspopup="menu">${e(shortForm(a.form))}</button></div>`;
  const hint = (!a.when && a.unstamped ? `<div class="k-unstamped">${e(a.unstamped)}</div>` : "") + (!a.when && a.hint ? `<div class="k-hint" title="Written by the signer when signing: not checked by anyone, and not used to order anything" dir="auto">the signer\u2019s own hint: ${e(a.hint)}</div>` : "");
  const earlier = a.earlier?.length ? `<div class="k-earlier" data-k-earlier hidden><div class="k-earlier-say">${a.earlier.length === 1 ? "The original, as signed" : `The original and ${a.earlier.length - 1} earlier correction${a.earlier.length > 2 ? "s" : ""}, as signed, oldest first`}</div>${a.earlier.map((x) => card(x)).join("")}</div>` : "";
  const corrected = a.earlier?.length ? `<button type="button" class="k-corrected" data-k-corrected aria-expanded="false">Corrected</button>` : "";
  return `<article class="k-act${o.selected ? " k-sel" : ""}${a.earlier?.length ? " k-is-corrected" : ""}" data-k-act="${e(a.id)}" data-k-signer="${e(s.id)}">${earlier}${a.when ? `<span class="k-when">${e(a.when)}</span>` : ""}${signer}${corrected}${labels}${text3}${a.html ?? ""}${hint}${foot}</article>`;
}
function signerMenu(app2, w, own) {
  const below = w.me ? own : [w.followed ? { key: "unfollow", label: "Following: remove from contacts" } : { key: "follow", label: "Follow: add to contacts" }, ...own, w.muted ? { key: "unmute", label: "Unmute" } : { key: "mute", label: "Mute" }];
  const n = nameOf2(namedOf(w));
  return menu(`${n ? `${n} \xB7 ` : ""}${shortForm(w.form)}`, [
    { key: "copy-id", label: "Copy ID" },
    { key: "copy-link", label: "Copy ID link" },
    { key: "profile", label: "Open profile" }
  ], app2, below);
}
function actMenu(app2, a, own, signs = true) {
  const opens = a.corrects ? "Open what it corrects" : "Open what it answers";
  const every = signs ? [{ key: "rely", label: "Rely on it" }, { key: "anchor", label: "Anchor it" }, ...a.own ? [{ key: "correct", label: "Correct it" }] : []] : [];
  return menu(shortForm(a.form), [
    { key: "copy-act", label: "Copy act ID" },
    { key: "open", label: opens, disabled: !a.answers && !a.corrects, hint: !a.answers && !a.corrects ? "nothing" : void 0 },
    { key: "why", label: "Why it\u2019s valid" }
  ], app2, [...own.before, ...every, ...own.after]);
}
function menu(title, take, app2, below) {
  const item = (m) => `${m.line ? "<hr>" : ""}<button type="button" role="menuitem" data-k-item="${e(m.key)}"${m.disabled ? " disabled" : ""}>${e(m.label)}${m.hint ? `<span class="k-k">${e(m.hint)}</span>` : ""}</button>`;
  return `<div class="k-pop" role="menu"><div class="k-t">${e(title)}</div>${take.map(item).join("")}${below.length ? `<hr><div class="k-own">${e(app2)}\u2019s own</div>${below.map(item).join("")}` : ""}</div>`;
}
function top(o) {
  return `<header class="k-top">${o.left}<span class="k-grow"></span>${o.center ?? ""}<span class="k-grow"></span>${o.right}</header>`;
}
function appMark(name, icon) {
  return `<div class="k-app">${icon ? `<img src="${e(icon)}" alt="">` : ""}<span class="k-nm">${e(name)}</span></div>`;
}
function meButton(o) {
  const shown = o.as ?? o;
  const n = namedOf(shown);
  const label = nameOf2(n) ?? NAME_WORDS[n.published?.state === "name" ? "none" : n.published?.state ?? "loading"];
  return `<button type="button" class="k-me" data-k-open="identity" aria-haspopup="dialog" title="Identities"><span class="k-n">${e(label)}</span><span class="k-s">${e(shortForm(shown.form))}</span>${o.as ? `<span class="k-dot k-c k-alt">${e(initial(o.as.name, o.as.form))}</span>` : ""}<span class="k-dot">${e(initial(o.name, o.form))}</span></button>`;
}
function contactsButton(label = "Contacts") {
  return `<button type="button" class="k-menu-btn" data-k-open="contacts" aria-haspopup="dialog"><span aria-hidden="true">\u2630</span><span class="k-l">${e(label)}</span></button>`;
}
var danger = (l) => `<span class="k-dm k-l${l}" title="danger ${l} of 3" aria-label="danger ${l} of 3"><i></i><i></i><i></i></span>`;
function tiles(ts) {
  return `<div class="k-home">${ts.map((t) => `<button type="button" class="k-tile k-d${t.danger}${t.alert ? " k-alarm" : ""}" data-k-tile="${e(t.key)}">${ICONS[t.icon]}${danger(t.danger)}<h2>${e(t.name)}</h2><p>${e(t.say)}</p>${t.alert ? `<span class="k-alert">${e(t.alert)}</span>` : ""}</button>`).join("")}</div>`;
}
function opened(column2, on, pane) {
  const col = column2.map((c) => c === "-" ? '<div class="k-sep"></div>' : typeof c === "string" ? `<h3>${e(c)}</h3>` : `<button type="button" data-k-col="${e(c.key)}" class="${c.key === on ? "k-on" : ""}">${e(c.label)}${c.k != null ? `<span class="k-k">${e(c.k)}</span>` : ""}</button>`).join("");
  return `<div class="k-body k-opened${on ? " k-chosen" : ""}"><aside class="k-col">${col}</aside><section class="k-pane"><button type="button" class="k-back" data-k-back="column">\u2190 Back</button>${pane}</section></div>`;
}
function pointRow(label, chips, name = "point") {
  return `<div class="k-point"><span class="k-lbl">${e(label)}</span>${chips.map((c) => `<button type="button" class="k-chip${c.on ? " k-on" : ""}" data-k-${name}="${e(c.key)}" aria-pressed="${!!c.on}">${e(c.label)}</button>`).join("")}</div>`;
}
function feedBox(o) {
  return `${o.above ?? ""}<div class="k-feedwrap"><div class="k-feed" id="${e(o.id)}" tabindex="0">${o.cards || `<p class="k-empty">${e(o.empty ?? "Nothing yet.")}</p>`}</div>${o.below ?? ""}</div>`;
}
function say2(line, more, o = {}) {
  const rest = Array.isArray(more) ? more.map((m) => `<p>${e(m)}</p>`).join("") : more;
  const mor = o.mor ? o.mor() : "";
  return `<details class="k-say"><summary>${e(line)}<span class="k-help" aria-label="more">?</span>${mor}</summary><div class="k-more-text">${rest}${o.mor ? `<p>${o.mor(true)}</p>` : ""}</div></details>`;
}
var MOR_HOME = "https://dubsar.org/";
function whatIsMor(long = false) {
  return `<a class="k-mor" data-k-mor href="${MOR_HOME}" target="_blank" rel="noopener noreferrer">${long ? "What is MOR? dubsar.org\u2019s front page, in a new tab" : "What is MOR?"}</a>`;
}
function fold(line, body, o = {}) {
  return `<details class="k-fold"${o.open ? " open" : ""}${o.attrs ? ` ${o.attrs}` : ""}><summary>${e(line)}<span class="k-chev" aria-hidden="true">\u203A</span></summary><div class="k-fold-body">${body}</div></details>`;
}
var note = (kind, html) => `<div class="k-note${kind ? ` k-${kind}` : ""}" role="status">${html}</div>`;
function identityPanel(o) {
  const row = (x, sub, owner, why) => `<div class="k-idline"><button type="button" class="k-idrow${x.on ? " k-on" : ""}${sub ? " k-sub" : ""}" data-k-use="${e(x.id)}"${sub ? ` data-k-under="${e(owner)}"` : ""}${x.on ? ' aria-current="true"' : ""}${why ? " disabled" : ""}><span class="k-dot${sub ? " k-c" : ""}${x.on ? "" : " k-alt"}">${e(initial(x.name, x.form))}</span><span><span class="k-n k-names" dir="auto">${namesHtml(namedOf(x), { retry: false })}${sub ? '<span class="k-tagc">collective</span>' : ""}</span><br><span class="k-s">${e(shortForm(x.form))}</span>${why ? `<br><span class="k-small k-faint">${e(why)}</span>` : ""}</span></button>${sub ? "" : `<button type="button" class="k-more" data-k-idmenu="${e(x.id)}" aria-haspopup="menu" title="Its settings" aria-label="Its settings">${GEAR}</button>`}</div>`;
  const ids = o.ids.map((x) => row(x, false, x.id) + (x.on ? ownId({ form: x.form, link: x.link ?? x.form }) : "") + x.collectives.map((c) => row(c, true, x.id, c.why)).join("")).join("");
  const add = `<button type="button" class="k-idrow${o.adding ? " k-on" : ""}" data-k-add="toggle"><span class="k-soft">+ Add</span></button>${o.adding ? `<div class="k-pane-in">${o.add.map((a) => `<button type="button" class="k-idrow" data-k-add="${e(a.key)}"${a.empty ? " disabled" : ""}><span><span class="k-n">${e(a.label)}</span><br><span class="k-small k-soft">${e(a.say)}</span></span></button>`).join("")}</div>` : ""}`;
  return `<div class="k-panel" role="dialog" aria-label="Identities" data-k-panel="identity"><div class="k-ph"><h4>Identities</h4><span class="k-grow"></span>${CLOSE_X}</div>${ids || '<p class="k-small k-soft">No identity here yet.</p>'}${add}<div class="k-sepline"></div><div class="k-foot-note">${o.foot}</div>${o.inside ? `<div class="k-pane-in" data-k-inside>${o.inside}</div>` : ""}</div>`;
}
var CLOSE_X = '<button type="button" class="k-round k-x" data-k-close aria-label="Close">\xD7</button>';
var GEAR = '<svg class="k-gear" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
function ownId(o) {
  return `<div class="k-ownid" data-k-ownid><span class="k-mono k-idwhole">${e(o.form)}</span><div class="k-row"><button type="button" class="k-btn k-small" data-k-copy-id="${e(o.form)}">Copy ID</button><button type="button" class="k-btn k-small" data-k-share="${e(o.link)}">Share your ID link</button></div></div>`;
}
function removeSaid(app2, name) {
  return `<div class="k-box" data-k-remove><h4>Remove ${e(name)} from ${e(app2)}?</h4><p class="k-small k-soft">${e(app2)} forgets ${e(name)}\u2019s signing words, and what it kept about it, on this device. ${e(name)} itself is not touched: its acts, its homes and the other apps keep it. To use it here again, bring it with its words.</p><div class="k-row"><button type="button" class="k-btn k-p" data-k-remove-yes>Remove it</button><button type="button" class="k-btn k-q" data-k-remove-no>Keep it</button></div></div>`;
}
function labelOf2(c) {
  return (c.named ? nameOf2(c.named) : null) ?? c.name ?? c.names?.[0] ?? shortForm(c.form);
}
function contactsPanel(o) {
  const rows = o.contacts.map((c) => {
    const n = c.named ?? namedOf({ name: c.name, ownName: c.names?.[0] ?? null });
    const words = [labelOf2(c), n.nick ?? "", n.published?.state === "name" ? n.published.name : "", ...c.names ?? [], c.form].join(" ").toLowerCase();
    return `<div class="k-idline" data-k-contact="${e(c.id)}" data-k-name="${e(words)}"><button type="button" class="k-idrow" data-k-contact-open="${e(c.id)}"><span class="k-dot${c.collective ? " k-c" : ""} k-alt">${e(initial(labelOf2(c), c.form))}</span><span><span class="k-n k-names" dir="auto">${namesHtml(n, { retry: false })}${c.collective ? '<span class="k-tagc">collective</span>' : ""}</span><br><span class="k-s">${e(shortForm(c.form))}</span></span></button>${o.nick ? `<button type="button" class="k-btn k-q k-small" data-k-nick="${e(c.id)}" title="Your own name for it, sealed: only you see it">Nickname\u2026</button>` : ""}${o.action ? `<button type="button" class="k-btn k-q k-small" data-k-contact-do="${e(c.id)}">${e(o.action)}</button>` : ""}</div>`;
  }).join("");
  return `<div class="k-panel k-left" role="dialog" aria-label="Contacts" data-k-panel="contacts"><div class="k-ph"><h4>Contacts</h4><span class="k-grow"></span><span class="k-small k-soft">${o.contacts.length}</span>${CLOSE_X}</div><input type="search" data-k-find placeholder="Find by nickname or name\u2026" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Find a contact">${rows || '<p class="k-small k-soft">Nobody yet.</p>'}<div class="k-sepline"></div>${o.below}</div>`;
}
var SVG = (d) => `<svg class="k-ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
var ICONS = {
  identities: SVG('<circle cx="24" cy="17" r="8"/><path d="M9 41c2-9 8-13 15-13s13 4 15 13"/>'),
  // The runner: the seal of Kišib's menu bar (H111), as its state shows it there: hollow while off, filled while on, a padlock while locked.
  runner: SVG('<path d="M24 8.5Q29 5.2 31.8 10.6Q37.8 10.2 37.4 16.2Q42.8 19 39.5 24Q42.8 29 37.4 31.8Q37.8 37.8 31.8 37.4Q29 42.8 24 39.5Q19 42.8 16.3 37.4Q10.2 37.8 10.6 31.8Q5.2 29 8.5 24Q5.2 19 10.6 16.2Q10.2 10.2 16.2 10.6Q19 5.2 24 8.5Z"/>'),
  runnerOn: SVG('<path d="M24 8.5Q29 5.2 31.8 10.6Q37.8 10.2 37.4 16.2Q42.8 19 39.5 24Q42.8 29 37.4 31.8Q37.8 37.8 31.8 37.4Q29 42.8 24 39.5Q19 42.8 16.3 37.4Q10.2 37.8 10.6 31.8Q5.2 29 8.5 24Q5.2 19 10.6 16.2Q10.2 10.2 16.2 10.6Q19 5.2 24 8.5Z" fill="currentColor" fill-opacity=".85"/>'),
  runnerLocked: SVG('<rect x="13" y="22" width="22" height="17" rx="3.5"/><path d="M17.5 22v-5a6.5 6.5 0 0 1 13 0v5"/><circle cx="24" cy="30.5" r="2"/>'),
  paper: SVG('<path d="M13 6h16l8 8v28H13z"/><path d="M29 6v8h8M18 22h14M18 28h14M18 34h9"/>'),
  collectives: SVG('<circle cx="16" cy="18" r="5.5"/><circle cx="32" cy="18" r="5.5"/><circle cx="24" cy="12" r="5"/><path d="M6 38c1-7 5-10 10-10s7 2 8 5c1-3 3-5 8-5s9 3 10 10"/>'),
  waiting: SVG('<path d="M14 6h20M14 42h20M16 6c0 10 16 12 16 18S16 32 16 42M32 6c0 10-16 12-16 18s16 8 16 18"/>'),
  account: SVG('<rect x="8" y="9" width="32" height="30" rx="4"/><path d="M8 17h32M15 25h8M15 31h12M31 25h3M31 31h3"/>'),
  lanes: SVG('<path d="M14 42 19 6M34 42 29 6M24 10v4M24 21v5M24 33v6"/>'),
  settings: SVG('<path d="M10 14h28M10 24h28M10 34h28"/><circle cx="18" cy="14" r="3.5"/><circle cx="31" cy="24" r="3.5"/><circle cx="22" cy="34" r="3.5"/>'),
  agents: SVG('<rect x="10" y="12" width="28" height="24" rx="7"/><circle cx="19" cy="24" r="2.4"/><circle cx="29" cy="24" r="2.4"/><path d="M24 6v6M6 22v6M42 22v6"/>'),
  publishing: SVG('<path d="M8 30v8h32v-8M24 30V8M15 17l9-9 9 9"/>'),
  vows: SVG('<circle cx="24" cy="22" r="12"/><path d="M18 22l4 4 8-8M17 33l-3 9 10-5 10 5-3-9"/>'),
  look: SVG('<path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="6"/>'),
  discuss: SVG('<path d="M6 10h24v16H16l-6 6v-6H6z"/><path d="M34 18h8v16h-4v6l-6-6H22v-4"/>'),
  publish: SVG('<path d="M10 40h28M24 32V8M15 17l9-9 9 9"/>'),
  choose: SVG('<path d="M8 12l3 3 6-6M8 24l3 3 6-6M8 36l3 3 6-6M22 12h18M22 24h18M22 36h18"/>')
};
function slotWords(by, host) {
  return `Drawn by ${by} \xB7 ${host} cannot read or change this frame`;
}
function rulesPart(o) {
  const missing = o.rules.filter((r) => !r.on);
  const both = (key) => `<button type="button" class="k-btn k-p k-small" data-k-rule="${e(key)}" data-k-rule-where="list">Add to my list</button><button type="button" class="k-btn k-small" data-k-rule="${e(key)}" data-k-rule-where="here">In ${e(o.app)} only</button>`;
  const row = (r) => {
    const state = r.on === "list" ? "On your list: every app follows it" : r.on === "here" ? `In ${o.app} only: the other apps still ask` : `Not followed yet: its acts are unknown here, and ${o.app} signs nothing under it`;
    const acts2 = r.on === "list" ? "" : r.on === "here" ? `<button type="button" class="k-btn k-p k-small" data-k-rule="${e(r.key)}" data-k-rule-where="list">Add to my list</button><button type="button" class="k-btn k-q k-small" data-k-rule-stop="${e(r.key)}">Stop following in ${e(o.app)}</button>` : both(r.key);
    return `<li class="k-rule${r.on ? "" : " k-rule-not"}" data-k-rule-row="${e(r.key)}"><div class="k-rule-head"><b>${e(r.name)}</b> <span class="k-tagc">${e(r.kind)}</span></div><p class="k-small k-soft">${e(r.does)}</p>${r.text ? `<p class="k-small k-faint k-mono">${e(r.text)}</p>` : ""}<p class="k-small k-rule-on">${e(state)}</p>${acts2 ? `<div class="k-row">${acts2}</div>` : ""}</li>`;
  };
  return `<section class="k-rules" data-k-rules-part>${say2(`The rules ${o.app} runs, and whether you follow them.`, [
    `A rule here is a cMIP or a Module: a specification anyone may write, which ${o.app} carries in its build. You choose which you follow.`,
    `Add to my list: kept on your list of rules, sealed to this identity at its homes, and every app holding it reads it. In ${o.app} only: kept by ${o.app}; your list is unchanged, so the other apps still ask.`,
    `Until you follow a rule, what others did under it is shown unknown here, and ${o.app} signs nothing under it (Development rule 10).`
  ])}${o.problem ? `<p class="k-small k-soft">${e(o.problem)}.</p>` : ""}${missing.length > 1 ? `<div class="k-row k-rules-all"><span class="k-small">${missing.length} not followed yet:</span>${both("*")}</div>` : ""}<ul class="k-rule-list">${o.rules.map(row).join("")}</ul>${o.manage ? `<p class="k-small k-soft">${e(o.manage)}</p>` : ""}</section>`;
}

// ../kit/src/dom.ts
async function copy(text3) {
  try {
    await navigator.clipboard.writeText(text3);
    return true;
  } catch {
    try {
      const t = document.createElement("textarea");
      t.value = text3;
      t.setAttribute("readonly", "");
      t.className = "k-offscreen";
      document.body.append(t);
      t.select();
      const ok = document.execCommand("copy");
      t.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
var openMenu = null;
function closeMenu() {
  if (!openMenu) return;
  openMenu.pop.remove();
  openMenu.button.classList.remove("k-open");
  openMenu.button.setAttribute("aria-expanded", "false");
  openMenu.done?.();
  openMenu = null;
}
function place(pop, button, prefer) {
  if (pop.classList.contains("k-anchored")) return;
  const r = button.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vv = window.visualViewport;
  const top2 = vv ? vv.offsetTop : 0;
  const bottom = vv ? vv.offsetTop + vv.height : document.documentElement.clientHeight;
  pop.style.maxHeight = "";
  const w = pop.offsetWidth;
  let h = pop.offsetHeight;
  let left = prefer === "above" ? r.right - w : r.left;
  left = Math.max(8, Math.min(left, vw - w - 8));
  const roomAbove = r.top - 6 - (top2 + 8);
  const roomBelow = bottom - 8 - (r.bottom + 6);
  const above = prefer === "above" ? roomAbove >= h || roomAbove >= roomBelow : !(roomBelow >= h || roomBelow >= roomAbove);
  const room = Math.max(above ? roomAbove : roomBelow, 80);
  if (h > room) {
    pop.style.maxHeight = `${Math.floor(room)}px`;
    h = pop.offsetHeight;
  }
  let at = above ? r.top - 6 - h : r.bottom + 6;
  at = Math.max(top2 + 8, Math.min(at, bottom - h - 8));
  pop.style.left = `${Math.round(left)}px`;
  pop.style.top = `${Math.round(at)}px`;
}
function popAt(button, html, prefer, pick, done) {
  closeMenu();
  const holder = document.createElement("div");
  holder.innerHTML = html;
  const pop = holder.firstElementChild;
  (button.closest(".k-page") ?? document.body).append(pop);
  pop.style.zIndex = String(LAYER_BASE + stack.length * 2 + 2);
  place(pop, button, prefer);
  button.classList.add("k-open");
  button.setAttribute("aria-expanded", "true");
  const again = () => place(pop, button, prefer);
  window.visualViewport?.addEventListener("resize", again);
  window.visualViewport?.addEventListener("scroll", again);
  openMenu = {
    pop,
    button,
    done: () => {
      window.visualViewport?.removeEventListener("resize", again);
      window.visualViewport?.removeEventListener("scroll", again);
      done?.();
    }
  };
  pop.addEventListener("click", (ev) => {
    const item = ev.target.closest("button[data-k-item]");
    if (!item || item.disabled) return;
    ev.stopPropagation();
    pick(item.dataset.kItem, item);
  });
  pop.querySelector("button:not([disabled])")?.focus({ preventScroll: true });
  return pop;
}
async function copied(item, text3) {
  const ok = await copy(text3);
  const k = document.createElement("span");
  k.className = "k-k";
  k.textContent = ok ? "copied" : "select it: copying refused";
  item.querySelector(".k-k")?.remove();
  item.append(k);
  item.dataset.kCopied = ok ? "yes" : "no";
  setTimeout(closeMenu, ok ? 450 : 2400);
}
function attachCards(root, host) {
  const actOf = (card2) => {
    const own = host.act(card2.dataset.kAct);
    if (own) return own;
    const outer = card2.parentElement?.closest("[data-k-act]");
    return outer ? (actOf(outer)?.earlier ?? []).find((x) => x.id === card2.dataset.kAct) : void 0;
  };
  root.addEventListener("click", (ev) => {
    const fold2 = ev.target.closest("[data-k-corrected]");
    if (fold2) {
      ev.stopPropagation();
      const box2 = fold2.closest("[data-k-act]")?.querySelector(":scope > [data-k-earlier]");
      if (box2) {
        box2.hidden = !box2.hidden;
        fold2.setAttribute("aria-expanded", String(!box2.hidden));
        fold2.classList.toggle("k-on", !box2.hidden);
      }
      return;
    }
    const b = ev.target.closest("[data-k-menu]");
    if (!b) return;
    const card2 = b.closest("[data-k-act]");
    if (!card2) return;
    ev.stopPropagation();
    if (openMenu?.button === b) return closeMenu();
    const a = actOf(card2);
    if (!a) return;
    const which = b.dataset.kMenu;
    card2.classList.add("k-sel");
    const html = which === "signer" ? signerMenu(host.app, a.signer, host.signerItems(a)) : actMenu(host.app, a, host.actItems(a), host.signs !== false);
    popAt(
      b,
      html,
      which === "signer" ? "below" : "above",
      (key, item) => {
        if (key === "copy-id") return void copied(item, a.signer.form);
        if (key === "copy-link") return void copied(item, a.signer.link);
        if (key === "copy-act") return void copied(item, a.form);
        closeMenu();
        host.choose(key, a, card2);
      },
      () => card2.classList.remove("k-sel")
    );
  });
}
function attachClosing(doc = document) {
  if (attached.has(doc)) return;
  attached.add(doc);
  doc.addEventListener("click", (ev) => {
    const t = ev.target;
    const x = t.closest("[data-k-status-close]");
    if (x) {
      const st = x.closest(".k-status");
      if (st) st.innerHTML = "";
      return;
    }
    const cid = t.closest("[data-k-copy-id]");
    const share2 = t.closest("[data-k-share]");
    if (cid || share2) {
      const b = cid ?? share2;
      const text3 = cid ? cid.dataset.kCopyId : share2.dataset.kShare;
      void (async () => {
        let said2 = "";
        if (share2 && typeof navigator.share === "function") {
          try {
            await navigator.share({ title: "My ID on MOR", text: text3 });
            return;
          } catch (err) {
            if (err.name === "AbortError") return;
          }
        }
        said2 = await copy(text3) ? share2 ? "Copied: paste it where you share it" : "Copied" : "Select it and copy it";
        const was = b.textContent;
        b.textContent = said2;
        setTimeout(() => {
          if (b.isConnected) b.textContent = was;
        }, 1600);
      })();
      return;
    }
    if (!openMenu) return;
    if (openMenu.pop.contains(t) || openMenu.button.contains(t)) return;
    closeMenu();
  });
  doc.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    if (openMenu) return closeMenu();
    const top2 = stack[stack.length - 1];
    if (top2) return void leave(top2);
    for (const st of doc.querySelectorAll(".k-status")) st.innerHTML = "";
  });
  const closeable = (root) => {
    for (const st of root.querySelectorAll(".k-status")) {
      if (st.firstElementChild && !st.querySelector(":scope > [data-k-status-close], :scope > .k-close")) {
        const b = doc.createElement("button");
        b.type = "button";
        b.className = "k-round k-close";
        b.dataset.kStatusClose = "";
        b.setAttribute("aria-label", "Close");
        b.textContent = "\xD7";
        st.append(b);
      }
    }
  };
  new MutationObserver(() => closeable(doc)).observe(doc.documentElement, { childList: true, subtree: true });
}
var attached = /* @__PURE__ */ new WeakSet();
var LAYER_BASE = 30;
var stack = [];
function restack() {
  stack.forEach((l, i) => {
    l.shade.style.zIndex = String(LAYER_BASE + i * 2);
    l.box.style.zIndex = String(LAYER_BASE + i * 2 + 1);
    l.box.toggleAttribute("data-k-under", i < stack.length - 1);
  });
}
function pushLayer(box2, shade, close) {
  closeMenu();
  const l = { box: box2, shade, close, dirty: false };
  stack.push(l);
  shade.addEventListener("click", () => {
    if (stack[stack.length - 1] === l) void leave(l);
  });
  box2.addEventListener("input", (ev) => {
    const t = ev.target;
    if ((t.tagName === "TEXTAREA" || t.tagName === "INPUT" && !/^(checkbox|radio|file|hidden|search)$/.test(t.type)) && t.value.trim()) l.dirty = true;
  });
  box2.addEventListener("submit", () => l.dirty = false, true);
  box2.addEventListener("click", (ev) => {
    const t = ev.target;
    if (t.closest("[data-k-close]")?.closest("[data-k-stack]") === box2) l.close();
    else if (t.closest("[data-k-remove-no]") && box2.matches("[data-k-confirm]")) l.close();
  });
  box2.dataset.kStack = "";
  restack();
  return l;
}
function popLayer(box2) {
  const i = stack.findIndex((l) => l.box === box2);
  if (i < 0) return;
  const above = stack.splice(i);
  for (const l of above.slice(1).reverse()) l.close();
  restack();
}
async function leave(l) {
  if (l.dirty && !await askLeave(l.box.closest(".k-page") ?? document.body)) return;
  l.close();
}
function askLeave(page) {
  return new Promise((done) => {
    const c = openConfirm(page, '<div class="k-box" data-k-leave><h4>Close it?</h4><p class="k-small k-soft">What you typed there is not kept.</p><div class="k-row"><button type="button" class="k-btn k-p" data-k-leave-yes>Close it</button><button type="button" class="k-btn k-q" data-k-leave-no>Keep writing</button></div></div>', () => done(false));
    c.box.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t.closest("[data-k-leave-yes]")) {
        c.close(true);
        done(true);
      } else if (t.closest("[data-k-leave-no]")) c.close();
    });
  });
}
function openConfirm(page, html, gone) {
  const shade = document.createElement("div");
  shade.className = "k-shade k-light";
  const box2 = document.createElement("div");
  box2.className = "k-modal k-confirm";
  box2.setAttribute("role", "alertdialog");
  box2.setAttribute("aria-modal", "true");
  box2.dataset.kConfirm = "";
  box2.innerHTML = `<div class="k-mh"><span class="k-grow"></span><button type="button" class="k-round" data-k-close aria-label="Close">\xD7</button></div><div class="k-mbody">${html}</div>`;
  page.append(shade, box2);
  let answered = false;
  const close = (a = false) => {
    answered ||= a;
    if (!box2.isConnected) return;
    box2.remove();
    shade.remove();
    popLayer(box2);
    if (!answered) gone?.();
  };
  pushLayer(box2, shade, () => close());
  box2.querySelector(".k-mbody button")?.focus({ preventScroll: true });
  return { box: box2, close };
}
var panel = null;
function openPanel(page, html, done) {
  closePanel();
  const shade = document.createElement("div");
  shade.className = "k-shade k-light";
  const holder = document.createElement("div");
  holder.innerHTML = html;
  const el = holder.firstElementChild;
  page.append(shade, el);
  panel = { el, shade, done };
  pushLayer(el, shade, () => closePanel());
  const find = el.querySelector("[data-k-find]");
  find?.addEventListener("input", () => {
    const q = find.value.trim().toLowerCase();
    el.querySelectorAll("[data-k-contact]").forEach((r) => r.hidden = !!q && !r.dataset.kName.includes(q));
  });
  return el;
}
function redrawPanel(html) {
  if (!panel) return null;
  const holder = document.createElement("div");
  holder.innerHTML = html;
  const el = holder.firstElementChild;
  panel.el.replaceChildren(...el.childNodes);
  for (const a of [...el.attributes]) if (a.name !== "style") panel.el.setAttribute(a.name, a.value);
  return panel.el;
}
function closePanel() {
  if (!panel) return;
  closeMenu();
  const p = panel;
  panel = null;
  popLayer(p.el);
  p.el.remove();
  p.shade.remove();
  p.done?.();
}
var panelOpen = () => panel?.el ?? null;
var Popup = class {
  constructor(page, drawn = () => void 0) {
    this.page = page;
    this.drawn = drawn;
  }
  stack = [];
  shade = null;
  box = null;
  scroll = [];
  get open() {
    return !!this.box;
  }
  /** Open with this content, or, when open, put it in place of what is shown (Back returns). */
  show(title, html) {
    if (!this.box) {
      for (const st of this.page.querySelectorAll(".k-status")) if (st.querySelector(".k-done")) st.innerHTML = "";
      this.scroll = [...this.page.querySelectorAll(".k-feed")].map((el) => ({ el, top: el.scrollTop }));
      this.shade = document.createElement("div");
      this.shade.className = "k-shade";
      this.box = document.createElement("div");
      this.box.className = "k-modal";
      this.box.setAttribute("role", "dialog");
      this.box.setAttribute("aria-modal", "true");
      this.box.addEventListener("click", (ev) => {
        const t = ev.target;
        if (t.closest('[data-k-popup="back"]')) this.back();
        else if (t.closest('[data-k-popup="close"]')) this.close();
      });
      this.page.append(this.shade, this.box);
      popup = this;
      pushLayer(this.box, this.shade, () => this.close());
    }
    this.stack.push({ title, html });
    return this.draw();
  }
  /** Replace what is shown now, without a new step (content read late). */
  replace(html) {
    if (!this.box || !this.stack.length) return null;
    this.stack[this.stack.length - 1].html = html;
    return this.draw();
  }
  back() {
    if (this.stack.length <= 1) return this.close();
    this.stack.pop();
    this.draw();
  }
  close() {
    closeMenu();
    if (this.box) popLayer(this.box);
    this.box?.remove();
    this.shade?.remove();
    this.box = this.shade = null;
    this.stack = [];
    for (const s of this.scroll) s.el.scrollTop = s.top;
    if (popup === this) popup = null;
  }
  draw() {
    const now4 = this.stack[this.stack.length - 1];
    const back = this.stack.length > 1 ? '<button type="button" class="k-round" data-k-popup="back" aria-label="Back">\u2190</button>' : "";
    this.box.innerHTML = `<div class="k-mh">${back}<h3 dir="auto">${escapeText(now4.title)}</h3><button type="button" class="k-round" data-k-popup="close" aria-label="Close">\xD7</button></div><div class="k-mbody">${now4.html}</div>`;
    const body = this.box.querySelector(".k-mbody");
    this.drawn(body);
    return body;
  }
};
var popup = null;
var escapeText = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function cardsUntimed(root) {
  return [...root.querySelectorAll("article.k-act[data-k-act]")].filter((a) => !a.querySelector(".k-when")).map((a) => a.dataset.kAct);
}
function stampCards(root, words) {
  for (const a of root.querySelectorAll("article.k-act[data-k-act]")) {
    const w = words[a.dataset.kAct ?? ""];
    if (!w || a.querySelector(".k-when")) continue;
    const s = document.createElement("span");
    s.className = "k-when";
    s.textContent = w;
    a.prepend(s);
    a.querySelectorAll(".k-hint, .k-unstamped").forEach((h) => h.remove());
  }
}
function attachColumn(root, chose) {
  root.addEventListener("click", (ev) => {
    const t = ev.target;
    const c = t.closest("[data-k-col]");
    const opened2 = t.closest(".k-opened");
    if (c && opened2) {
      opened2.querySelectorAll("[data-k-col]").forEach((x) => x.classList.toggle("k-on", x === c));
      opened2.classList.add("k-chosen");
      chose(c.dataset.kCol);
      return;
    }
    if (t.closest('[data-k-back="column"]') && opened2) opened2.classList.remove("k-chosen");
  });
}
function openSlot(page, o) {
  let url;
  try {
    url = new URL(o.src);
  } catch {
    throw new Error(`Not an address: ${o.src}. Nothing was opened.`);
  }
  if (!o.allowed.includes(url.origin)) throw new Error(`${url.origin} is not ${o.by}\u2019s, as this app knows it. Nothing was opened.`);
  const shade = document.createElement("div");
  shade.className = "k-shade";
  const box2 = document.createElement("div");
  box2.className = `k-frame k-${o.app}`;
  box2.setAttribute("role", "dialog");
  const by = document.createElement("div");
  by.className = "k-by";
  by.textContent = slotWords(o.by, o.host);
  const close = document.createElement("button");
  close.type = "button";
  close.className = "k-round";
  close.setAttribute("aria-label", "Close");
  close.textContent = "\xD7";
  const grow = document.createElement("span");
  grow.className = "k-grow";
  by.append(grow, close);
  const frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-scripts allow-forms");
  frame.setAttribute("referrerpolicy", "no-referrer");
  frame.setAttribute("allow", "");
  frame.setAttribute("title", `${o.by}\u2019s panel`);
  frame.src = url.href;
  box2.append(by, frame);
  page.append(shade, box2);
  pushLayer(box2, shade, () => {
    slot.close();
    o.closed?.();
  });
  const listen = (ev) => {
    if (ev.source === frame.contentWindow) o.message?.(ev.data);
  };
  window.addEventListener("message", listen);
  const slot = {
    frame,
    close() {
      window.removeEventListener("message", listen);
      popLayer(box2);
      box2.remove();
      shade.remove();
    }
  };
  close.addEventListener("click", () => {
    slot.close();
    o.closed?.();
  });
  return slot;
}
var keyWarned = /* @__PURE__ */ new Set();
var keyBox = null;
function keyChanged(page, w) {
  if (keyBox && keyBox.id !== w?.id) {
    keyBox.close(true);
    keyBox = null;
  }
  for (const r of page.querySelectorAll("[data-k-keychanged]")) if (r.dataset.kKeychanged !== w?.id) r.remove();
  if (!w) return;
  const remind = () => {
    if (page.querySelector(`[data-k-keychanged="${CSS.escape(w.id)}"]`)) return;
    const line = document.createElement("div");
    line.className = "k-reminder";
    line.dataset.kKeychanged = w.id;
    line.setAttribute("role", "alert");
    const text3 = document.createElement("span");
    text3.textContent = `${w.name}\u2019s signing key was changed elsewhere: this app signs nothing more with the old one.`;
    const again = document.createElement("button");
    again.type = "button";
    again.className = "k-btn k-small";
    again.textContent = "Give the new words";
    again.addEventListener("click", () => {
      keyWarned.delete(w.id);
      keyChanged(page, w);
    });
    line.append(text3, again);
    (page.querySelector(".k-top") ?? page.firstElementChild)?.after(line);
  };
  if (keyWarned.has(w.id)) return remind();
  if (keyBox?.id === w.id) return;
  const c = openConfirm(page, `<div class="k-keychanged" data-k-keychanged-box><h4>${escapeText(w.name)}: a signing key changed elsewhere</h4><p class="k-small">${escapeText(w.say)}</p>${w.form}</div>`, () => {
    keyBox = null;
    keyWarned.add(w.id);
    remind();
  });
  c.box.classList.add("k-alarm-modal");
  keyBox = { id: w.id, close: c.close };
}
function ask2(page, o) {
  return new Promise((done) => {
    const c = openConfirm(
      page,
      `<div class="k-box" data-k-ask><h4>${escapeText(o.title)}</h4><p class="k-small k-soft">${escapeText(o.text)}</p><div class="k-row"><button type="button" class="k-btn ${o.alarm ? "k-alarm" : "k-p"}" data-k-ask-yes>${escapeText(o.yes)}</button><button type="button" class="k-btn k-q" data-k-ask-no>${escapeText(o.no ?? "Not now")}</button></div></div>`,
      () => done(false)
    );
    c.box.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t.closest("[data-k-ask-yes]")) {
        c.close(true);
        done(true);
      } else if (t.closest("[data-k-ask-no]")) c.close();
    });
  });
}
function askNick(page, o) {
  return new Promise((done) => {
    const c = openConfirm(
      page,
      `<form class="k-box" data-k-nick-form><h4>${escapeText(o.title)}</h4><label>A nickname (optional): only you see it, sealed to you</label><input name="nick" maxlength="48" autocomplete="off" autocapitalize="words" spellcheck="false" value="${escapeText(o.current ?? "")}"><div class="k-row"><button type="submit" class="k-btn k-p">${escapeText(o.yes ?? "Save")}</button><button type="button" class="k-btn k-q" data-k-nick-skip>${escapeText(o.skip ?? "Skip")}</button></div></form>`,
      () => done(void 0)
    );
    const f = c.box.querySelector("form");
    f.querySelector("input").focus();
    f.addEventListener("submit", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const v = f.elements.namedItem("nick").value.trim();
      c.close(true);
      done(v || null);
    });
    c.box.querySelector("[data-k-nick-skip]").addEventListener("click", () => {
      c.close(true);
      done(o.current ? o.current ?? null : null);
    });
  });
}
function rulesAsk(page, w) {
  for (const r of page.querySelectorAll("[data-k-rules-ask]")) if (!w || !w.missing.length || r.dataset.kRulesAsk !== w.id) r.remove();
  if (!w || !w.missing.length) return;
  const words = `${w.app} runs ${w.missing.length === 1 ? "a rule" : `${w.missing.length} rules`} you have not approved: ${w.missing.join(", ")}. Until then, what was done under ${w.missing.length === 1 ? "it" : "them"} is unknown here.`;
  let line = page.querySelector(`[data-k-rules-ask="${CSS.escape(w.id)}"]`);
  if (line) {
    line.querySelector("span").textContent = words;
    return;
  }
  line = document.createElement("div");
  line.className = "k-reminder k-rules-ask";
  line.dataset.kRulesAsk = w.id;
  line.setAttribute("role", "status");
  const text3 = document.createElement("span");
  text3.textContent = words;
  const look2 = document.createElement("button");
  look2.type = "button";
  look2.className = "k-btn k-small";
  look2.textContent = "Rules I follow";
  look2.addEventListener("click", () => w.open());
  line.append(text3, look2);
  (page.querySelector(".k-top") ?? page.firstElementChild)?.after(line);
}
function attachRules(root, o) {
  root.addEventListener("click", (ev) => {
    const t = ev.target.closest("[data-k-rule], [data-k-rule-stop]");
    if (!t || !root.contains(t)) return;
    if (t.dataset.kRuleStop) o.stop(t.dataset.kRuleStop);
    else o.approve(t.dataset.kRule, t.dataset.kRuleWhere === "list" ? "list" : "here");
  });
}

// ../kit/src/ids.ts
function idForm2(hex3, label = "mid") {
  if (!/^[0-9a-f]{64}$/.test(hex3)) return hex3;
  const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const bytes = hex3.match(/../g).map((b) => parseInt(b, 16));
  const data = [];
  let acc = 0;
  let bits = 0;
  for (const b of bytes) {
    acc = (acc << 8 | b) & 65535;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      data.push(acc >> bits & 31);
    }
  }
  if (bits) data.push(acc << 5 - bits & 31);
  const polymod = (v) => {
    const G = [996825010, 642813549, 513874426, 1027748829, 705979059];
    let chk = 1;
    for (const x of v) {
      const top2 = chk >> 25;
      chk = (chk & 33554431) << 5 ^ x;
      for (let i = 0; i < 5; i++) if (top2 >> i & 1) chk ^= G[i];
    }
    return chk;
  };
  const hrp = [...label].map((c) => c.charCodeAt(0));
  const pm = polymod([...hrp.map((c) => c >> 5), 0, ...hrp.map((c) => c & 31), ...data, 0, 0, 0, 0, 0, 0]) ^ 734539939;
  const check = [0, 1, 2, 3, 4, 5].map((i) => pm >> 5 * (5 - i) & 31);
  return `${label}1${[...data, ...check].map((d) => CHARSET[d]).join("")}`;
}
function who(o) {
  const form2 = o.form ?? idForm2(o.id, "mid");
  return `<span class="k-who${o.inline ? " k-inline" : ""}" data-k-who="${e(o.id)}"${o.named ? ' data-k-named=""' : ""}><span class="k-names">${namesHtml(o.named ?? null)}${o.me ? '<span class="k-you">you</span>' : ""}${o.collective ? '<span class="k-tagc">collective</span>' : ""}</span>${idButton(form2, { person: o.id })}</span>`;
}
function idButton(form2, o = {}) {
  return `<button type="button" class="k-idbtn" data-k-idform="${e(form2)}"${o.person ? ` data-k-person="${e(o.person)}"` : ""}${o.act ? ` data-k-act-id="${e(o.act)}"` : ""}${o.expand ? ' data-k-expand=""' : ""} title="Tap to show it whole">${e(shortForm(form2))}</button>`;
}
var actId2 = (id, o = {}) => idButton(idForm2(id, "mact"), { act: id, expand: o.expand });
var hosts = /* @__PURE__ */ new WeakMap();
function attachIds(root, host) {
  hosts.set(root, host);
  root.addEventListener("click", async (ev) => {
    const t = ev.target;
    const retry = t.closest("[data-k-name-retry]");
    if (retry) {
      ev.stopPropagation();
      const w = retry.closest("[data-k-who]");
      if (w) await fillNames(root, [w], true);
      return;
    }
    const prof = t.closest("[data-k-open-profile]");
    if (prof) {
      ev.stopPropagation();
      return host.profile?.(prof.dataset.kOpenProfile);
    }
    const b = t.closest(".k-idbtn");
    if (!b || !root.contains(b)) return;
    ev.stopPropagation();
    ev.preventDefault();
    closeMenu();
    if (b.dataset.kExpand !== void 0 && b.dataset.kActId && host.act) return host.act(b.dataset.kActId, b);
    const form2 = b.dataset.kIdform;
    if (!b.classList.contains("k-whole")) {
      b.classList.add("k-whole");
      b.textContent = form2;
      b.title = "Tap again to copy it";
      if (b.dataset.kPerson && host.profile && !b.nextElementSibling?.matches("[data-k-open-profile]")) b.insertAdjacentHTML("afterend", `<button type="button" class="k-btn k-q k-small" data-k-open-profile="${e(b.dataset.kPerson)}">Open profile</button>`);
      return;
    }
    const ok = await copy(form2);
    b.textContent = ok ? "Copied" : "Select it: copying refused";
    b.dataset.kCopied = ok ? "yes" : "no";
    setTimeout(() => {
      if (b.isConnected) b.textContent = form2;
    }, 1200);
  });
  let queued = false;
  const ask4 = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(async () => {
      queued = false;
      const ws = [...root.querySelectorAll("[data-k-who]:not([data-k-named])")];
      if (ws.length) await fillNames(root, ws, false);
    });
  };
  new MutationObserver(ask4).observe(root, { childList: true, subtree: true });
  ask4();
}
async function fillNames(root, ws, fresh) {
  const host = hosts.get(root);
  for (const w of ws) w.dataset.kNamed = "";
  if (!host?.names) {
    for (const w of ws) w.querySelector(".k-names").innerHTML = namesHtml({ published: { state: "unreached" } }, { retry: false });
    return;
  }
  if (fresh) for (const w of ws) w.querySelector(".k-names").innerHTML = namesHtml({ published: { state: "loading" } });
  const ids = [...new Set(ws.map((w) => w.dataset.kWho))];
  let got = {};
  try {
    got = await host.names(ids, fresh);
  } catch {
  }
  for (const w of ws) {
    if (!w.isConnected) continue;
    const box2 = w.querySelector(".k-names");
    const extra = [...box2.querySelectorAll(".k-you, .k-tagc")].map((x) => x.outerHTML).join("");
    box2.innerHTML = namesHtml(got[w.dataset.kWho] ?? { published: { state: "unreached" } }) + extra;
  }
}
var contactsButtonFor = (field) => `<button type="button" class="k-btn k-q k-small k-pick" data-k-pick-for="${e(field)}" aria-haspopup="dialog">Contacts</button>`;
function attachContactsButtons(root, contacts, picked) {
  root.addEventListener("click", async (ev) => {
    const b = ev.target.closest("[data-k-pick-for]");
    if (!b) return;
    ev.preventDefault();
    ev.stopPropagation();
    const scope = b.closest("form") ?? root;
    const key = b.dataset.kPickFor;
    const field = scope.querySelector(`[name="${CSS.escape(key)}"], #${CSS.escape(key)}`);
    if (!field) return;
    const list3 = await contacts();
    const byForm = new Map(list3.map((c) => [c.form ?? idForm2(c.id, "mid"), c]));
    const row = (c) => {
      const form2 = c.form ?? idForm2(c.id, "mid");
      const words = [c.named.nick ?? "", c.named.published?.state === "name" ? c.named.published.name : "", form2].join(" ").toLowerCase();
      return `<button type="button" role="option" data-k-picked="${e(form2)}" data-k-words="${e(words)}"><span class="k-names">${namesHtml(c.named, { retry: false })}${c.collective ? '<span class="k-tagc">collective</span>' : ""}</span><span class="k-k">${e(shortForm(form2))}</span></button>`;
    };
    const pop = popAt(
      b,
      `<div class="k-pop k-picker" role="listbox" data-k-picker><div class="k-t">Contacts</div><input type="search" data-k-pick-find placeholder="Find by nickname or name\u2026" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Find a contact">${list3.map(row).join("") || '<p class="k-small k-soft">No contacts yet: add one by its ID in Contacts, top left.</p>'}</div>`,
      "below",
      () => void 0
    );
    const find = pop.querySelector("[data-k-pick-find]");
    find.focus({ preventScroll: true });
    find.addEventListener("input", () => {
      const q = find.value.trim().toLowerCase();
      pop.querySelectorAll("[data-k-picked]").forEach((x) => x.hidden = !!q && !x.dataset.kWords.includes(q));
    });
    pop.addEventListener("click", (e22) => {
      const p = e22.target.closest("[data-k-picked]");
      if (!p) return;
      e22.stopPropagation();
      const form2 = p.dataset.kPicked;
      if (picked?.(field, byForm.get(form2))) {
        closeMenu();
        return;
      }
      if (field.tagName === "TEXTAREA" || field.dataset.kSeveral !== void 0) {
        const have = field.value.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
        if (!have.includes(form2)) field.value = [...have, form2].join("\n");
      } else field.value = form2;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      closeMenu();
      field.focus({ preventScroll: true });
    });
  });
}
function attachContacts(page, host) {
  let list3 = [];
  let problem = null;
  const below = () => `<form data-k-contact-add class="k-contact-add"><div class="k-row"><input name="contact-id" data-k-id-field autocomplete="off" spellcheck="false" placeholder="+ Add by ID (mid1\u2026, or an ID link)" required aria-label="Add by ID"></div><input name="contact-nick" autocomplete="off" placeholder="Your nickname for it (only you see it)" aria-label="Your nickname for it"><div class="k-row"><button type="submit" class="k-btn">Add to contacts</button></div></form>${problem ? `<p class="k-small k-soft">${e(problem)}.</p>` : '<p class="k-small k-soft">Sealed to you at your homes: every app holding this identity reads the same list. Your nicknames are seen by you alone.</p>'}`;
  const html = () => host.readOnly ? contactsPanel({ contacts: list3.map((c) => ({ id: c.id, form: c.form, name: c.name, named: c.named })), below: `${problem ? `<p class="k-small k-soft">${e(problem)}.</p>` : ""}<p class="k-small k-soft">${e(host.readOnly)}</p>` }) : contactsPanel({ contacts: list3.map((c) => ({ id: c.id, form: c.form, name: c.name, named: c.named })), nick: true, action: "Remove", below: below() });
  const refresh = async (fresh = false) => {
    try {
      const r = await host.ask("contacts", fresh ? { fresh: true } : {});
      list3 = r.contacts;
      problem = r.problem;
    } catch (err) {
      problem = err instanceof Error ? err.message : String(err);
    }
  };
  const open = async () => {
    await refresh(true);
    if (panelOpen()?.dataset.kPanel === "contacts") redrawPanel(html());
    else openPanel(page, html());
  };
  const changed = async (op, a, done) => {
    try {
      const r = await host.ask(op, a);
      host.said("done", `<strong>${e(done)}</strong>${r.lines?.length ? ` ${r.lines.map((l) => e(l.text)).join(" ")}` : ""}`);
      await open();
    } catch (err) {
      host.said("error", e(err instanceof Error ? err.message : String(err)));
    }
  };
  page.addEventListener("click", async (ev) => {
    const t = ev.target;
    if (t.closest('[data-k-open="contacts"]')) return void open();
    const panel2 = t.closest('[data-k-panel="contacts"]');
    if (!panel2) return;
    const opened2 = t.closest("[data-k-contact-open]");
    if (opened2 && host.profile) return host.profile(opened2.dataset.kContactOpen);
    const nickB = t.closest("[data-k-nick]");
    if (nickB) {
      const c = list3.find((x) => x.id === nickB.dataset.kNick);
      const nick = await askNick(page, { title: `Nickname for ${c?.named.published?.state === "name" ? c.named.published.name : shortForm(c?.form ?? "")}`, current: c?.name ?? null, yes: "Save", skip: "Keep it as it is" });
      if (nick === void 0 || nick === (c?.name ?? null)) return;
      return changed("contact nick", { id: nickB.dataset.kNick, nick: nick ?? "" }, nick ? "Nickname saved." : "Nickname taken away.");
    }
    const rm = t.closest("[data-k-contact-do]");
    if (rm) {
      const c = list3.find((x) => x.id === rm.dataset.kContactDo);
      if (!await ask2(page, { title: `Remove ${c?.name ?? shortForm(c?.form ?? "")} from your contacts?`, text: "Taken out of the one list, in every app holding this identity. Nobody is told.", yes: "Remove", no: "Keep it" })) return;
      return changed("contact remove", { id: rm.dataset.kContactDo }, "Removed from your contacts.");
    }
  });
  page.addEventListener("submit", (ev) => {
    const f = ev.target.closest("form[data-k-contact-add]");
    if (!f) return;
    ev.preventDefault();
    ev.stopPropagation();
    const d = new FormData(f);
    void changed("contact add", { id: String(d.get("contact-id") ?? "").trim(), nick: String(d.get("contact-nick") ?? "").trim() }, "Added to your contacts.");
  });
  attachContactsButtons(page, async () => {
    if (!list3.length) await refresh();
    return list3.map((c) => ({ id: c.id, form: c.form, named: c.named }));
  });
  return { open, list: () => list3, refresh: () => refresh(true) };
}

// ../genesis/src/card-words.ts
function cardWords(l, app2, e3) {
  const n = `${l.acts} act${l.acts === 1 ? "" : "s"}`;
  if (!l.latest) return n;
  const missing = l.missing ? ` ${l.missing === 1 ? "One act" : `${l.missing} acts`} of this line ${l.missing === 1 ? "is" : "are"} not at your homes, and ${app2} no longer holds ${l.missing === 1 ? "it" : "them"}: no reader can follow this line past ${l.missing === 1 ? "it" : "them"}, so a change of keys may lose what lives on it (a member key, notes, a list). Ki\u0161ib says so in red.` : "";
  if (l.card) return `${n}: ${l.card.includes(";") ? "its cards" : "its card"}, for Ki\u0161ib, <code class="card-line">${e3(l.card)}</code>${missing ? `<br>${e3(missing)}` : ""}`;
  if (l.atHomes === false) return `${n}: its latest act (<code>${e3(l.latest)}</code>) is not at your homes yet, so there is no card for Ki\u0161ib: ${e3(app2)} sends it again each time this window is read. Do not change your keys until the card shows.${missing ? `<br>${e3(missing)}` : ""}`;
  return `${n}: your homes did not answer, so there is no card for Ki\u0161ib now (latest <code>${e3(l.latest)}</code>). Look again before changing your keys.`;
}

// ../dub/src/page/family.ts
var TEST_ONLY = "Test identities only, until MOR is frozen";
var WEB_BANNER = `<div class="banner" id="for-testing-only" role="note"><p><strong>For testing only.</strong> ${TEST_ONLY}. Two risks, in plain words:</p>
<ol><li>Whoever serves this page's code at the moment an identity is made here could copy its keys.</li>
<li>This browser's storage, where the identity's signing key is kept, can be lost, or read by what runs in this page.</li></ol>
<p>An identity that is to hold anything of value is made with a downloaded app, or with a chain key kept offline: never here.</p></div>`;
var STYLE = `@font-face{font-family:"Atkinson Hyperlegible Next";font-style:normal;font-weight:200 800;font-display:swap;src:url(atkinson_next.woff2) format("woff2")}
@font-face{font-family:"Atkinson Hyperlegible Mono";font-style:normal;font-weight:200 800;font-display:swap;src:url(atkinson_mono.woff2) format("woff2")}
@font-face{font-family:"Gentium Book Plus";font-style:italic;font-weight:400;font-display:swap;src:url(gentium_book_plus_italic.woff2) format("woff2")}
:root{color-scheme:dark;--bg:#06080c;--raise:#0f131b;--line:#2a313d;--edge:#3a4250;--text:#d6dae1;--soft:#7f8794;--faint:#4c5360;--identity:#8394a8;--envelopes:#9a92ad;--bad:#b4615f;--ok:#7f8794}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--text)}
body{font:300 15px/1.55 "Atkinson Hyperlegible Next",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:600px;margin:0 auto;padding:0 16px 64px}
a{color:var(--text);text-decoration:underline;text-decoration-color:var(--faint);text-underline-offset:3px}
h1,h2,h3{font-weight:400;letter-spacing:.01em;margin:0}
h2{font-size:17px;margin:28px 0 10px}
h3{font-size:15px;margin:0 0 6px}
p{margin:8px 0}
code,.mono{font:13px/1.4 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace}
.small{font-size:13px;color:var(--soft)}
button{font:inherit;font-size:14px;color:var(--text);background:none;border:1px solid var(--edge);border-radius:999px;padding:5px 14px;cursor:pointer}
button:hover{border-color:var(--faint)}
button:disabled{opacity:.45;cursor:default}
button.primary{background:var(--text);color:var(--bg);border-color:var(--text);font-weight:400}
button.quiet,.acts button{border:none;padding:4px 0;color:var(--soft);border-radius:0}
button.quiet:hover,.acts button:hover{color:var(--text)}
input,textarea{font:inherit;color:var(--text);background:var(--raise);border:1px solid var(--edge);border-radius:10px;padding:8px 10px;width:100%}
input:focus,textarea:focus{outline:none;border-color:var(--faint)}
textarea{min-height:3.2em;resize:vertical}
select{font:inherit;color:var(--text);background:var(--raise);border:1px solid var(--edge);border-radius:10px;padding:8px 10px}
label{display:block;margin:12px 0 4px;font-size:13px;color:var(--soft)}
.row{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:10px 0}
.grow{flex:1}
.row.tight{margin:0}
input.pet{max-width:14em}
label.check{margin:0;display:flex;gap:8px;align-items:center}
label.check input{width:auto}
.bar{position:sticky;top:0;z-index:2;background:var(--bg);display:flex;align-items:center;gap:12px;padding:14px 0 10px;border-bottom:1px solid var(--line)}
.mark{font-weight:400;letter-spacing:.06em;font-size:15px}
.tabs{display:flex;gap:4px;margin:0 auto}
.tab{border:none;border-radius:999px;color:var(--soft);padding:5px 14px}
.tab.on{color:var(--text);background:var(--raise)}
.count{display:inline-block;min-width:1.5em;margin-left:6px;padding:0 6px;border-radius:999px;background:var(--line);color:var(--text);font-size:12px;line-height:1.6;text-align:center}
.count:empty{display:none}
.me{border:none;padding:4px 0;color:var(--soft);max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fp{font:12px/1.4 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--identity)}
.who{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;font-size:14px}
.who .name{color:var(--text);font-weight:400}
.who .dn{color:var(--soft)}
.who .you{color:var(--faint);font-size:12px}
.compose{padding:12px 14px;margin:14px 0;border:1px solid var(--edge);border-radius:12px;background:var(--raise)}
.compose textarea{border:none;background:none;padding:4px 0;font-size:16px;min-height:2.6em}
.compose .row{margin:6px 0 0}
.compose input[type=file]{display:none}
.compose .to{display:none}
.compose.addressed .to{display:block}
.chip{display:inline-flex;gap:8px;align-items:baseline;font-size:13px;color:var(--soft);border:1px solid var(--edge);border-radius:999px;padding:2px 10px}
.chip button{border:none;padding:0;color:var(--soft)}
.filters{display:flex;gap:6px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}
.filters .tab{font-size:13px}
.post,.msg{padding:12px 14px;margin:10px 0;border:1px solid var(--edge);border-radius:12px;background:var(--raise)}
.post .text,.msg .text{margin:6px 0 2px;white-space:pre-wrap;overflow-wrap:anywhere}
.post figure{margin:10px 0 4px}
.post img{display:block;max-width:100%;height:auto;border-radius:10px;image-orientation:from-image}
.post .acts{border-top:1px solid var(--line);padding-top:6px}
.post figcaption,.re{font-size:12px;color:var(--faint)}
.re{margin-top:2px}
.doc{display:block;margin:8px 0 2px;padding:10px 12px;border:1px solid var(--edge);background:var(--bg);border-radius:10px;text-decoration:none}
.doc .small{display:block}
.acts{display:flex;gap:22px;margin-top:6px}
.acts button{font-size:13px}
.flag{font-size:12px;color:var(--soft)}
.flag.bad{color:var(--bad)}
.msg.out{margin-left:28px;background:none}
.msg .sealed{color:var(--envelopes);font-size:12px}
div.vow-post{border:1px solid var(--edge);border-radius:6px;padding:8px 10px;margin:6px 0}
img.sealed-picture{display:block;max-width:100%;height:auto;margin:6px 0;border-radius:4px}
.note{margin:10px 0;padding:10px 12px;border-left:2px solid var(--line);font-size:14px;color:var(--soft)}
.note.error{border-left-color:var(--bad);color:var(--text)}
.note.done{border-left-color:var(--faint);color:var(--text)}
.note.spent{border-left-color:var(--bad);color:var(--text)}
.note ul{margin:6px 0 0;padding-left:1.1em}
.note li.bad{color:var(--bad)}
.empty{padding:28px 0;color:var(--faint);font-size:14px;text-align:center}
.card{border:1px solid var(--edge);border-radius:14px;padding:14px 16px;margin:12px 0}
details{margin:10px 0}
details>summary{cursor:pointer;color:var(--soft);font-size:14px;list-style:none}
details>summary::-webkit-details-marker{display:none}
details>summary::before{content:"+ ";color:var(--faint)}
details[open]>summary::before{content:"\u2212 "}
.people{padding:6px 0 10px;border-bottom:1px solid var(--line)}
.people li{display:flex;gap:10px;align-items:baseline;justify-content:space-between;padding:6px 0;list-style:none}
.people ul{margin:0;padding:0}
.words{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5em,1fr));gap:6px 14px;margin:14px 0;padding:14px;border:1px solid var(--edge);border-radius:12px;font:15px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace}
.words span{white-space:nowrap}
.words b{display:inline-block;min-width:2em;color:var(--faint);font-weight:400}
.say{padding-left:1.1em;color:var(--soft);font-size:14px}
.say li{margin:4px 0}
.label{display:inline-block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--soft);margin:0 0 4px}
.typed{display:flex;flex-wrap:wrap;gap:10px}
.typed label{margin:0}
.typed input{width:10em}
.id{font:13px/1.5 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--identity);overflow-wrap:anywhere}
dl.facts{display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;font-size:13px;margin:8px 0}
dl.facts dt{color:var(--faint)}
dl.facts dd{margin:0;color:var(--soft);overflow-wrap:anywhere}
.held li{list-style:none;display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}
.held ul{padding:0;margin:0}
.banner{margin:12px 0;padding:10px 12px;border:1px solid var(--edge);border-radius:10px;color:var(--soft);font-size:13px}
.banner p,.banner ol{margin:4px 0}
.banner ol{padding-left:1.4em}
#for-testing-only{max-width:568px;margin:12px auto 0}
@media (max-width:600px){#for-testing-only{margin:12px 16px 0}}
[hidden]{display:none!important}
.experimental{margin:10px 0;padding:10px 12px;border:1px solid var(--bad);border-radius:10px;color:var(--soft);font-size:13px}
.experimental strong{color:var(--text);font-weight:400}
.proposal{border:1px solid var(--edge);border-radius:12px;background:var(--raise);padding:12px 14px;margin:12px 0}
.proposal h3{margin:0 0 6px;font-weight:400;font-size:15px}
.proposal h4{margin:12px 0 4px;font-weight:400;font-size:13px;color:var(--soft)}
.proposal ul{margin:4px 0;padding-left:1.1em;font-size:14px}
.proposal .plain{border:1px solid var(--edge);border-radius:10px;padding:8px 10px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;max-height:18em;overflow:auto;background:var(--bg)}
.proposal .state{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--soft)}
.share-number{font-size:15px;margin:8px 0}
.post.act{padding:8px 14px}
.post.act .acts{border-top:none;padding-top:0;margin-top:2px}
details.fold>summary{font-size:15px;color:var(--text);margin:14px 0 4px}`;
var TINT = { layer: "#e9dfcd", line: "#383736", edge: "#4a4946", accent: "#8e8980" };
var PAGE_STYLE = `${STYLE}
:root{--line:${TINT.line};--edge:${TINT.edge};--tint:${TINT.accent}}
button:hover,.door:hover{border-color:var(--tint)}
input:focus,textarea:focus{border-color:var(--tint)}
details>summary::before{color:var(--tint)}
.bar{border-bottom-color:var(--edge)}
.correction strong{font-weight:400;color:var(--text)}`;

// ../dub/src/page/view.ts
var TEST_ONLY2 = "Test identities only, until MOR is frozen";
var TINT2 = { layer: APPS.dub.colour, pastel: APPS.dub.pastel };
var WEB_BANNER2 = `<details class="k-say dub-banner" id="for-testing-only" role="note"><summary><strong>For testing only.</strong> ${TEST_ONLY2}.<span class="k-help" aria-label="more">?</span>${whatIsMor()}</summary><div class="k-more-text"><p>Two risks, in plain words:</p>
<ol><li>Whoever serves this page\u2019s code at the moment an identity is made here could copy its keys.</li>
<li>This browser\u2019s storage, where the identity\u2019s signing key is kept, can be lost, or read by what runs in this page.</li></ol>
<p>An identity that is to hold anything of value is made with a downloaded app, or with a chain key kept offline: never here.</p></div></details>`;
var PAGE_STYLE2 = `${KIT_STYLE}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.dub-banner{flex:none;margin:0;padding:6px 16px;border-bottom:1px solid var(--k-line);background:var(--k-bg);font:300 12.5px/1.5 "Atkinson Hyperlegible Next",system-ui,sans-serif;color:var(--k-soft)}
.dub-banner strong{font-weight:400;color:var(--k-text)}
.dub-banner ol{margin:4px 0;padding-left:1.4em}
.dub-center{max-width:820px;margin:0 auto;width:100%}
.dub-first{max-width:640px;margin:0 auto;width:100%;overflow:auto;padding:24px 20px 40px}
.dub-first h2{font-size:24px;margin:8px 0 4px}
.dub-first form{margin:6px 0}
.dub-picked{font-size:12.5px;color:var(--k-soft)}
.dub-code{font-size:22px;letter-spacing:.14em;color:var(--k-text);margin:6px 0}
.dub-film{display:flex;align-items:center;gap:10px;border:1px solid var(--k-line);border-radius:12px;padding:10px 12px;margin:6px 0;font-size:14px;color:var(--k-soft)}
.dub-sealed{border:1px solid var(--k-line);border-radius:12px;padding:8px 12px;margin:6px 0}
.dub-sealed img{margin:6px 0}
.dub-convs{width:300px;flex:none;border-right:1px solid var(--k-line);display:flex;flex-direction:column;min-height:0}
#private-notes{padding:0 14px 10px}
.dub-convs .dub-find{margin:12px;width:calc(100% - 24px)}
.dub-convs .dub-list{overflow:auto;flex:1;min-height:0}
.dub-conv{display:flex;gap:10px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--k-line);width:100%;text-align:left}
.dub-conv.k-on{background:var(--k-wash2)}
.dub-conv .k-n{font-size:14.5px}
.dub-conv .dub-l{font-size:13px;color:var(--k-soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;display:block}
.dub-conv .dub-w{margin-left:auto;font-size:11.5px;color:var(--k-faint);align-self:flex-start;white-space:nowrap}
.dub-conv .k-count{background:var(--k-p);color:var(--k-ink);margin-left:6px}
.dub-thread{flex:1;min-width:0;display:flex;flex-direction:column;padding:14px 22px 16px;min-height:0}
.dub-notes .dub-thread{overflow:auto}
.dub-pad{padding:10px 14px}
.dub-note-text{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5}
.dub-note-latest{border:1px solid var(--k-line);border-radius:12px;padding:12px 14px;margin:0 0 10px}
.dub-note-draft{border-top:1px solid var(--k-line);padding:8px 0}
.dub-note-form textarea{width:100%;min-height:220px}
.dub-thread .dub-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.dub-thread .dub-head h2{font-size:20px}
.dub-cc{font-size:12.5px;color:var(--k-soft)}
#ccs{display:contents}
#ccs .k-chip{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ccs .k-chip .k-x{margin-left:4px;flex:none}
.dub-field{display:flex;gap:8px;align-items:center}
.dub-field input{flex:1}
.dub-modal-form textarea{min-height:5em}
.dub-ways{border-top:1px solid var(--k-line);margin:8px 0}
.dub-ways label{display:flex;gap:10px;align-items:flex-start;padding:10px 6px;border-bottom:1px solid var(--k-line);margin:0;color:var(--k-text);font-size:14.5px;cursor:pointer}
.dub-ways label.dub-closed{color:var(--k-faint);cursor:default}
.dub-ways input{margin-top:4px}
.dub-ways .k-small{display:block}
.dub-hand{width:100%;min-height:6em;font:12px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace}
.dub-note-line{font-size:13px;color:var(--k-soft);margin:0 0 8px}
@media (max-width:600px){
  .dub-banner{padding:5px 10px}
  .dub-private .dub-convs{width:100%;border-right:0}
  .dub-private .dub-thread{display:none;padding:10px 12px}
  .dub-private.k-chosen .dub-convs{display:none}
  .dub-private.k-chosen .dub-thread{display:flex}
  .dub-private .k-back{display:inline-flex}
  .dub-first{padding:16px 14px 30px}
  .k-typing .dub-l{display:none}
}
.dub-film .k-btn{white-space:nowrap}
@media (min-width:601px){.dub-private .k-back{display:none}}`;
function actFormOf(hex3, label = "mact") {
  if (!/^[0-9a-f]{64}$/.test(hex3)) return hex3;
  const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const bytes = hex3.match(/../g).map((b) => parseInt(b, 16));
  const data = [];
  let acc = 0;
  let bits = 0;
  for (const b of bytes) {
    acc = acc << 8 | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      data.push(acc >> bits & 31);
    }
  }
  if (bits) data.push(acc << 5 - bits & 31);
  const polymod = (v) => {
    const G = [996825010, 642813549, 513874426, 1027748829, 705979059];
    let chk = 1;
    for (const x of v) {
      const top2 = chk >> 25;
      chk = (chk & 33554431) << 5 ^ x;
      for (let i = 0; i < 5; i++) if (top2 >> i & 1) chk ^= G[i];
    }
    return chk;
  };
  const hrp = [...label].map((c) => c.charCodeAt(0));
  const pm = polymod([...hrp.map((c) => c >> 5), 0, ...hrp.map((c) => c & 31), ...data, 0, 0, 0, 0, 0, 0]) ^ 734539939;
  const check = [0, 1, 2, 3, 4, 5].map((i) => pm >> 5 * (5 - i) & 31);
  return `${label}1${[...data, ...check].map((d) => CHARSET[d]).join("")}`;
}

// src/page/view.ts
var NAME2 = "Ummia";
var TEST_ONLY3 = "Test identities only, until MOR is frozen";
var TINT3 = { layer: APPS.ummia.colour, pastel: APPS.ummia.pastel };
var WEB_BANNER3 = `<details class="k-say ummia-banner" id="for-testing-only" role="note"><summary><strong>For testing only.</strong> ${TEST_ONLY3}.<span class="k-help" aria-label="more">?</span>${whatIsMor()}</summary><div class="k-more-text"><p>The risks, in plain words:</p>
<ol><li>Whoever serves this page\u2019s code at the moment you bring an identity here could copy its signing key: with it, publish specifications, MIP drafts and reports as you, and read your accepted list.</li>
<li>This browser\u2019s storage, where that key is kept, can be lost, or read by what runs in this page.</li>
<li>What you publish here is public and for good: a specification is never updated, only succeeded. This page reads no folder, so it makes no release, and follows no chain, so it checks no anchor: use Ummia on a computer for those.</li></ol>
<p>Never bring a real identity here.</p></div></details>`;
var STYLE2 = `${KIT_STYLE}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.ummia-banner{flex:none;margin:0;padding:6px 16px;border-bottom:1px solid var(--k-line);background:var(--k-bg);font:300 12.5px/1.5 "Atkinson Hyperlegible Next",system-ui,sans-serif;color:var(--k-soft)}
.ummia-banner strong{font-weight:400;color:var(--k-text)}
.ummia-banner ol{margin:4px 0;padding-left:1.4em}
.ummia-foot{flex:none;padding:0 28px 10px}
.ummia-first{max-width:640px;margin:0 auto;width:100%;overflow:auto;padding:24px 20px 40px}
.ummia-first h2{font-size:24px;margin:8px 0 4px}
.ummia-pane{max-width:900px;width:100%}
.ummia-pane h2{font-size:24px;margin:2px 0 4px}
.ummia-pane h3{font-size:16px;margin:16px 0 4px;font-weight:400}
.ummia-pane .k-feed{flex:none;max-height:none}
.ummia-look{display:flex;flex-direction:column;min-height:0;flex:1}
.ummia-look .k-feedwrap{min-height:240px}
.ummia-pane textarea{min-height:76px}
.ummia-pane textarea.ummia-code{min-height:220px;font:13px/1.5 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace}
.ummia-lines{margin:4px 0;padding-left:1.1em;font-size:14px}
.ummia-lines li{margin:3px 0}
li.bad{color:var(--k-bad)}
li.warn{color:var(--k-soft)}
.ummia-hash{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0}
.ummia-hash .k-mono{color:var(--k-p);overflow-wrap:anywhere}
.ummia-hash .ummia-big{font-size:15px}
.ummia-files{max-height:320px;overflow:auto;border-top:1px solid var(--k-line);margin-top:6px;font-size:12px}
.ummia-files div{display:flex;gap:10px;justify-content:space-between;border-bottom:1px solid var(--k-line);padding:3px 0}
.ummia-files code{overflow-wrap:anywhere}
.ummia-ticks{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:2px 12px}
.ummia-ticks label{font-size:13px;color:var(--k-soft);display:flex;gap:6px;align-items:center}
.ummia-picker{border:1px solid var(--k-line);border-radius:12px;padding:8px 12px;margin:8px 0}
.ummia-picker button{margin:2px 4px 2px 0}
.ummia-blocking{border:1px solid var(--k-bad);border-radius:14px;padding:10px 16px;margin:10px 0}
.ummia-v{font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;padding:1px 8px;border-radius:999px;border:1px solid var(--k-edge);color:var(--k-soft)}
.ummia-v.valid{color:var(--k-text);border-color:var(--k-p)}
.ummia-v.bad{color:var(--k-bad);border-color:var(--k-bad)}
.ummia-who{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0 10px}
.ummia-list{list-style:none;padding:0;margin:0}
.ummia-list>li{display:flex;gap:10px;align-items:center;flex-wrap:wrap;border-bottom:1px solid var(--k-line);padding:9px 2px}
.ummia-list>li .k-grow{min-width:180px}
.ummia-tick{color:var(--k-p)}
.ummia-cardsay{border-left:2px solid var(--k-p);padding:2px 0 2px 12px;margin:8px 0}
.ummia-word{border-left:2px solid var(--k-edge);padding:2px 0 2px 12px;margin:8px 0}
.k-act .ummia-acts{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0 2px}
@media (max-width:600px){
  .k-top .k-tabs{display:none}
  .ummia-foot{padding:0 12px 8px}
}`;
var lines = (ls) => ls.length ? `<ul class="ummia-lines">${ls.map((l) => `<li class="${e(l.tone ?? "")}">${e(l.text)}</li>`).join("")}</ul>` : "";
var says = (xs) => xs.map((x) => `<p class="k-small k-soft">${e(x)}</p>`).join("");
var formOf2 = actFormOf;
var specFormOf = (hex3) => /^[0-9a-f]{64}$/.test(hex3) ? specBech(hex3) : hex3;
function specBech(hex3) {
  const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const bytes = hex3.match(/../g).map((b) => parseInt(b, 16));
  const data = [];
  let acc = 0;
  let bits = 0;
  for (const b of bytes) {
    acc = acc << 8 | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      data.push(acc >> bits & 31);
    }
  }
  if (bits) data.push(acc << 5 - bits & 31);
  const hrp = "mspec";
  const polymod = (v) => {
    const G = [996825010, 642813549, 513874426, 1027748829, 705979059];
    let chk = 1;
    for (const x of v) {
      const top2 = chk >> 25;
      chk = (chk & 33554431) << 5 ^ x;
      for (let i = 0; i < 5; i++) if (top2 >> i & 1) chk ^= G[i];
    }
    return chk;
  };
  const expand = [...[...hrp].map((c) => c.charCodeAt(0) >> 5), 0, ...[...hrp].map((c) => c.charCodeAt(0) & 31)];
  const mod = polymod([...expand, ...data, 0, 0, 0, 0, 0, 0]) ^ 734539939;
  const check = [0, 1, 2, 3, 4, 5].map((i) => mod >> 5 * (5 - i) & 31);
  return `${hrp}1${[...data, ...check].map((d) => CHARSET[d]).join("")}`;
}
var hashCopy = (hex3, big = false, label = "") => `<span class="ummia-hash">${label ? `<span class="k-small k-soft">${e(label)}</span>` : ""}${big ? `<span class="k-mono ummia-big" title="${e(specFormOf(hex3))}">${e(specFormOf(hex3))}</span><button type="button" class="k-btn k-q k-small" data-copy="${e(specFormOf(hex3))}">Copy</button>` : idButton(specFormOf(hex3))}</span>`;
var actCopy = (hex3, label = "") => `<span class="ummia-hash">${label ? `<span class="k-small k-soft">${e(label)}</span>` : ""}${actId2(hex3)}</span>`;
var idCopy = (hex3, o = {}) => who({ id: hex3, form: formOf2(hex3, "mid"), ...o });
var labelOf3 = (named2, instead) => nameOf2(named2) ?? instead;
var TILES = [
  { key: "look", name: "Look", say: "One feed: point at a relay, an ID, your contacts or a release; filter by releases, cMIPs, Modules, xtypes, extensions.", icon: "look", danger: 1 },
  { key: "discuss", name: "Discuss", say: "MIP drafts, their discussion, bug reports and answers.", icon: "discuss", danger: 1 },
  { key: "publish", name: "Publish", say: "Releases of code, cMIPs and Modules, the hash first, and their cards; anchoring, paid in Damgar.", icon: "publish", danger: 2 },
  { key: "choose", name: "Choose", say: "The accepted list, by layer: what every app may use.", icon: "choose", danger: 2 }
];
function actingOf(s) {
  return s.actors.find((a) => a.id === s.acting && a.kind === "collective") ?? null;
}
function topBar(s, tab) {
  const i = s.identity;
  const tabs = tab ? `<nav class="k-tabs" aria-label="Ummia">${TILES.map((t) => `<button type="button" class="k-tab${t.key === tab ? " k-on" : ""}" data-tab="${t.key}"${t.key === tab ? ' aria-current="page"' : ""}>${e(t.name)}</button>`).join("")}</nav>` : "";
  const c = actingOf(s);
  const shownName = i && !nameOf2(i.named) && i.runner ? "via Ki\u0161ib" : null;
  const cn = c ? s.names?.[c.id] : null;
  const me = i ? meButton({
    name: shownName ?? nameOf2(i.named),
    form: i.form,
    named: shownName ? null : i.named,
    as: c ? nameOf2(cn) ? { name: nameOf2(cn), form: formOf2(c.id, "mid"), named: cn } : { name: "Collective", form: formOf2(c.id, "mid") } : null
  }) : "";
  return top({ left: `<div class="k-row">${contactsButton()}<button type="button" class="k-btn k-q" data-action="home-tiles" title="The four tiles">${appMark(NAME2, "icon.png")}</button></div>${tabs}`, right: me });
}
function home(s, web) {
  return `${topBar(s, null)}<div id="spent-at"></div><div class="k-body k-col-flex">${tiles(TILES)}</div>
<div class="ummia-foot">${say2(TEST_ONLY3, [web ? "The web client is for testing only: the banner above says its risks." : "The signing key is held in software in this program\u2019s folder: a prototype, never for a real identity."], { mor: whatIsMor })}</div>`;
}
function column(tab, s, k) {
  switch (tab) {
    case "look":
      return [
        { key: "feed", label: "The feed" },
        { key: "page", label: "A specification\u2019s page" },
        { key: "acts", label: "One specification\u2019s acts" },
        "-",
        "Saved",
        ...s.saved.map((x) => ({ key: `saved:${x.key}`, label: x.label })),
        ...s.saved.length ? [] : [{ key: "saved-none", label: "None yet" }]
      ];
    case "discuss":
      return [{ key: "mips", label: "MIP drafts", k: k.mips }, { key: "threads", label: "Discussions", k: k.threads }, { key: "reports", label: "Bug reports", k: k.reports }, "-", { key: "mip-new", label: "+ Start a MIP" }];
    case "publish":
      return [{ key: "release", label: "A release" }, { key: "spec", label: "A cMIP or Module" }, { key: "anchoring", label: "Anchoring", k: k.anchors }, "-", { key: "published", label: "Published here", k: k.published }];
    case "choose":
      return [{ key: "every", label: "Every layer" }, ...LAYERS2.map((l) => ({ key: `layer:${l}`, label: l })), "-", { key: "accept-hash", label: "+ Accept by hash" }, "-", { key: "ummia-rules", label: "Ummia\u2019s own rules", k: s.rules?.missing.length || void 0 }];
  }
}
var LAYERS2 = ["Identity", "Text", "Envelopes", "Money", "Agreements", "Development"];
var firstPart = (tab) => ({ look: "feed", discuss: "mips", publish: "release", choose: "every" })[tab];
function tabPage(s, tab, part, k) {
  return `${topBar(s, tab)}<div id="spent-at"></div>${opened(column(tab, s, k), part, `<div class="ummia-pane${tab === "look" && part !== "page" && part !== "acts" ? " ummia-look" : ""}" id="pane"><p class="k-empty">Reading\u2026</p></div><div id="status" class="k-status"></div>`)}`;
}
function pairing() {
  return `<div class="ummia-first">${appMark(NAME2, "icon.png")}<h2>Pair this browser</h2>
<p class="k-small k-soft">This page acts for the Ummia program running on this machine, which holds the keys. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="k-row"><input id="pair-code" class="k-grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit" class="k-btn k-p">Pair</button></form><div id="pair-status"></div></div>`;
}
var alone = (html) => `<div class="ummia-first">${appMark(NAME2, "icon.png")}${html}</div>`;
var top0 = (web = false) => alone(web ? '<p class="k-small k-soft">The web client, for testing only.</p>' : "");
var runnerSay = (web) => web ? "through Ki\u0161ib\u2019s runner, in the computer\u2019s program only: never in the web client" : "through Ki\u0161ib\u2019s runner, on this Mac: Ummia holds no key, and Ki\u0161ib\u2019s panel asks for every act";
var ADD = (web) => [
  { key: "bring", label: "Bring one", say: "its ID and its signing key\u2019s words (Ummia never makes one)" },
  { key: "kishib", label: "Use one from Ki\u0161ib", say: runnerSay(web), empty: web }
];
function firstScreen(web, part = "bring") {
  return `<div class="ummia-first">${appMark(NAME2, "icon.png")}<h2>First, an identity</h2>
<p class="k-soft">Ummia never makes an identity and never holds a chain key. Bring one you have, by its ID and its signing key\u2019s words, as Dub, Edubba or Ki\u0161ib show them; or, on the Mac, use one Ki\u0161ib holds.</p>
<div class="k-row">${ADD(web).map((a) => `<button type="button" class="k-btn${a.key === part ? " k-p" : ""}" data-add="${a.key}"${a.empty ? " disabled" : ""}>${e(a.label)}</button>`).join("")}</div>
<div id="first-part">${part === "kishib" ? '<p class="k-small k-soft">Reading Ki\u0161ib\u2019s runner\u2026</p>' : bringForm()}</div>
<div id="status" class="k-status"></div></div>`;
}
function bringForm() {
  return `<form id="bring"><p class="k-small k-soft">By its ID and its signing key\u2019s words (never the chain key\u2019s).</p>
<label>Its ID (mid1\u2026, or its hexadecimal)</label><input name="id" autocomplete="off" spellcheck="false" required>
<label>Its signing key\u2019s 24 words</label><textarea name="words" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" placeholder="https://" required>
<label>Relays, one per line, if it names none</label><textarea name="relays"></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Bring it</button></div></form>`;
}
function runnerForm(r) {
  if (!r.available) return `<p class="k-small k-soft">Ki\u0161ib\u2019s runner is in the computer\u2019s program only, on the Mac: never in the web client. Bring the identity here by its words instead.</p>`;
  const ids = r.identities.length ? `<div class="k-list">${r.identities.map((x) => `<div>${who({ id: x.id, form: x.form, named: x.name ? { nick: null, published: { state: "name", name: x.name } } : null })}<button type="button" class="k-btn k-small k-r" data-runner-take="${e(x.id)}">${x.held ? "Use it" : "Use it here"}</button></div>`).join("")}</div>` : "";
  return `${r.problem ? note("error", e(r.problem)) : ""}
${say2("Ki\u0161ib keeps the identity\u2019s signing key on this Mac; Ummia holds none.", ["Pairing starts here and is approved in Ki\u0161ib (Runner, Apps), comparing the code. Then every act Ummia would sign is a request to Ki\u0161ib, and Ki\u0161ib\u2019s panel appears inside Ummia\u2019s window. What is sealed to the identity (the accepted list, the follow list) does not open in Ummia."])}
${r.state === "approved" ? `<p class="k-small">Ki\u0161ib approved Ummia (code ${e(r.code ?? "")}). The identities it lets Ummia use:</p>${ids || '<p class="k-small k-soft">None yet: choose some for Ummia in Ki\u0161ib.</p>'}` : r.state === "waiting" ? `<p>Approve Ummia in Ki\u0161ib (Runner, Apps), comparing this code: <span class="k-mono">${e(r.code ?? "")}</span></p><div class="k-row"><button type="button" class="k-btn" data-action="runner-look">I approved it in Ki\u0161ib</button></div>` : `<div class="k-row"><button type="button" class="k-btn k-p" data-action="runner-pair">Ask Ki\u0161ib to pair</button></div>`}`;
}
var IDENTITY_MENU = [
  ["words", "Words", ""],
  ["line", "Line and homes", ""],
  ["renew", "New words from Ki\u0161ib", "after a change of keys"],
  ["collective", "A collective under it", ""],
  ["remove", "Remove from Ummia\u2026", ""]
];
function wordsShown(c) {
  return `<p class="k-small k-soft">With the ID, they bring this identity into Ummia, Dub, Damgar or Edubba on another device. Whoever holds them can publish as this identity and open what is sealed to it. They are not the chain key\u2019s words.</p>
<p class="k-mono">${e(c.grouped)}</p><div class="k-words">${c.words.map((w, i) => `<span><b>${i + 1}</b>${e(w)}</span>`).join("")}</div>`;
}
function lineShown(s) {
  const i = s.identity;
  return `<dl class="k-facts"><dt>ID</dt><dd>${ownId({ form: i.form, link: i.link })}</dd><dt>Homes</dt><dd>${e(i.homes.join(", "))}</dd><dt>Relays</dt><dd>${e(i.relays.join(", "))}</dd><dt>Ummia\u2019s line</dt><dd>${cardWords(i.line, "Ummia", e)}</dd></dl>
${say2("Give Ki\u0161ib this card at a change of keys.", ["Some of Ummia\u2019s acts are sealed (your accepted list, the follow list, an anchor\u2019s payment for Damgar), so Ki\u0161ib cannot read its line from the homes: when the signing key is changed there, give Ki\u0161ib this card (latest act, position, summary), or every act signed here becomes void."])}
${i.encryption || i.runner ? "" : note("error", "Ummia holds no encryption key for this identity: its accepted list cannot be read or changed here.")}`;
}
function renewForm() {
  return `<form id="renew"><p class="k-small k-soft">Its signing key was changed elsewhere (in Ki\u0161ib): give the new signing key\u2019s words, and Ummia signs with them, in a new line.</p><label>The new signing key\u2019s 24 words</label><textarea name="words" required autocomplete="off" autocapitalize="off" spellcheck="false"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Use the new words</button></div></form>`;
}
function collectiveForm(s) {
  const cs = s.actors.filter((a) => a.kind === "collective");
  return `<p class="k-small k-soft">A collective whose area reaching its releases you hold a box in: Ummia acts for it with your own key for it, sealed to you when you signed its founding or a member change. Then choose it under this identity in the panel: Publish signs its releases.</p>
${cs.length ? `<div class="k-list">${cs.map((c) => `<div>${who({ id: c.id, form: formOf2(c.id, "mid"), named: s.names?.[c.id] ?? null, collective: true })}<span class="k-small k-soft">${c.available ? "can act" : e(c.why ?? "")}</span></div>`).join("")}</div>` : ""}
<form id="collective-add" class="k-row"><input name="collective" class="k-grow" placeholder="A collective\u2019s ID (mid1\u2026 or hex)" autocomplete="off" spellcheck="false" required data-k-id-field>${contactsButtonFor("collective")}<button type="submit" class="k-btn k-p">Act for it</button></form>`;
}
function relaysForm(s) {
  return `<form id="relays"><label>Relays your acts go to (specifications, releases, cards, drafts, reports), one per line</label><textarea name="relays" spellcheck="false">${e(s.settings.relays.join("\n"))}</textarea>
<label>Public relays Look asks, one per line</label><textarea name="track" spellcheck="false">${e(s.settings.track.join("\n"))}</textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Save</button></div></form>
<dl class="k-facts"><dt>Homes</dt><dd>${e(s.identity?.homes.join(", ") ?? "")} (the identity\u2019s chain names them; changed in Ki\u0161ib)</dd></dl>`;
}
function review(r, confirmAction = "confirm") {
  const files = r.files ? `<details open><summary>Its files (${r.files.length}), each with its size and fingerprint</summary><div class="ummia-files">${r.files.map((f) => `<div><span>${e(f.path)}</span><span>${f.size} bytes</span><code>${e(f.fingerprint)}</code></div>`).join("")}</div></details>${r.skipped?.length ? `<p class="k-small k-soft">Left out: ${e(r.skipped.join("; "))}</p>` : ""}
<details><summary>The libraries it depends on (${r.dependencies?.length ?? 0})</summary>${r.dependencies?.length ? `<div class="ummia-files">${r.dependencies.map((d) => `<div><span>${e(d.registry)}</span><span>${e(d.name)}</span><span>${e(d.version)}</span></div>`).join("")}</div>` : '<p class="k-small k-soft">None: it names no lock file (Cargo.lock, package-lock.json).</p>'}</details>` : "";
  return `<div class="k-box k-fill review" data-plan="${e(r.plan)}"><h3>${e(r.title)}</h3>
${r.hash ? `<p class="k-small k-soft">Its hash, first</p><div id="review-hash">${hashCopy(r.hash, true)}</div><p class="k-small k-faint">In hexadecimal: ${e(r.hash)}</p>` : ""}
${says(r.summary)}
${r.sections.map((x) => `<p class="k-small"><b>${e(x.heading)}</b></p>${lines(x.lines)}`).join("")}
${files}
${r.blocking.length ? `<div class="ummia-blocking"><b>It cannot be signed as it is</b>${lines(r.blocking.map((t) => ({ text: t, tone: "bad" })))}</div>` : ""}
<p class="k-small k-faint">The digest of exactly what is signed: <code>${e(r.digest)}</code></p>
<div class="k-row">${r.blocking.length ? "" : `<button type="button" class="k-btn k-p" data-action="${e(confirmAction)}" data-plan="${e(r.plan)}" data-digest="${e(r.digest)}">Sign and publish</button>`}<button type="button" class="k-btn k-q" data-action="cancel" data-plan="${e(r.plan)}">Leave it</button></div></div>`;
}
var POINT_KINDS = [
  { key: "relay", label: "a relay" },
  { key: "id", label: "a single ID" },
  { key: "contacts", label: "my contacts" },
  { key: "release", label: "a release" }
];
var FILTER_CHIPS = [
  { key: "releases", label: "releases" },
  { key: "cmips", label: "cMIPs" },
  { key: "modules", label: "Modules" },
  { key: "xtypes", label: "xtypes" },
  { key: "extensions", label: "extensions" },
  { key: "mips", label: "MIPs" }
];
function lookHead(at, s, saved) {
  const relays = s.settings.track.length ? s.settings.track : s.settings.relays;
  const field = at.point.kind === "relay" ? `<select name="value" class="k-grow">${relays.map((r) => `<option${r === at.point.value ? " selected" : ""}>${e(r)}</option>`).join("")}<option value="">every relay Look asks</option></select>` : at.point.kind === "contacts" ? '<span class="k-small k-soft k-grow">the people you follow (the one contacts list, the same in every app)</span>' : `<input name="value" class="k-grow" value="${e(at.point.value)}" placeholder="${at.point.kind === "id" ? "Their ID: mid1\u2026" : "The release\u2019s act ID: mact1\u2026"}" autocomplete="off" spellcheck="false"${at.point.kind === "id" ? " data-k-id-field" : ""}>${at.point.kind === "id" ? contactsButtonFor("value") : ""}`;
  return `${saved ? `<div class="k-row"><h2 class="k-grow">${e(saved.label)}</h2><button type="button" class="k-btn k-q k-small" data-saved-remove="${e(saved.key)}">Remove this point</button></div>` : ""}
${pointRow("Point at", POINT_KINDS.map((p) => ({ key: p.key, label: p.key === "relay" && at.point.kind === "relay" && (at.point.value || relays.length === 1) ? (at.point.value || relays[0]).replace(/^https?:\/\//, "") : p.label, on: p.key === at.point.kind })), "point")}
${pointRow("Filter by", FILTER_CHIPS.map((f) => ({ key: f.key, label: f.label, on: at.filters.includes(f.key) })), "filter")}
${pointRow("Layer", [{ key: "", label: "any", on: !at.layer }, ...LAYERS2.map((l) => ({ key: l, label: l, on: at.layer === l }))], "layer")}
<form id="look" class="k-row">${field}<button type="submit" class="k-btn k-p">Look</button>${saved ? "" : '<button type="button" class="k-btn k-q" data-action="save-point">Save this point</button>'}</form>`;
}
function lookFoot(limit, counts, placed) {
  return `${placed ? `<p class="k-clock">${placed.placed ? `Ordered by the Dubsar clock${placed.placed < placed.shown ? `; ${placed.shown - placed.placed} not stamped, kept after` : ""}.` : "The Dubsar clock stamped none of these: in each signer\u2019s own order, not a time."}</p>` : ""}${say2("Public agreements only, as the relays answer", [...limit.map((x) => `<p>${e(x)}</p>`), counts.length ? `<p><b>What the relays answered</b></p>${lines(counts)}` : ""].join(""))}`;
}
function specPagePane(p, whoOf) {
  const card2 = (c, own2) => `<div class="${own2 ? "ummia-cardsay" : "ummia-word"}" data-card="${e(c.id)}"><p class="k-small k-soft">${own2 ? "Its creator\u2019s card" : `${whoOf(c.signer)}\u2019s card: their word, not the specification\u2019s`}</p><h3>${e(c.fields.title)}</h3>${c.fields.summary ? `<p>${e(c.fields.summary)}</p>` : ""}${actCopy(c.id, "the card")}</div>`;
  const head = `<div class="k-row"><button type="button" class="k-btn k-q k-small" data-action="look-back">\u2190 The feed</button></div>
<h2 id="spec-title">${e(p.title)}</h2>
${hashCopy(p.hash, true)}
<p class="k-small k-soft">${[e(p.kind), e(p.layer), p.creator ? `by ${whoOf(p.creator)}${p.claimed ? "" : " (unclaimed: its creator never published it)"}` : p.builtIn ? "no creator: one of the core\u2019s texts" : ""].filter(Boolean).join(" \xB7 ")}</p>
${lines(p.lines)}`;
  const own = p.own ? card2(p.own, true) : p.builtIn ? `<div class="ummia-cardsay" data-builtin><p class="k-small k-soft">Ummia\u2019s own words, built in</p><h3>${e(p.title)}</h3><p>${e(p.builtIn.summary)}</p><p class="k-small k-faint">${e(p.builtIn.say)}</p></div>` : p.found ? '<p class="k-small k-soft">Its creator has signed no card for it yet: its title is its own first line.</p>' : "";
  const also = p.ownAlso.length ? `<p class="k-small k-soft">Its creator also signed, on another line:</p>${p.ownAlso.map((c) => card2(c, true)).join("")}` : "";
  const sect = (h, body) => `<h3>${e(h)}</h3>${body}`;
  return `${head}${own}${also}${p.superseded ? `<p class="k-small k-faint">${p.superseded} earlier card${p.superseded === 1 ? "" : "s"}, superseded by a later one in its signer\u2019s own sequence.</p>` : ""}
${p.mine || !p.creator && p.found || !p.found ? "" : ""}<div class="k-row">${p.found ? `<button type="button" class="k-btn${p.mine ? " k-p" : ""}" data-action="card-new" data-hash="${e(p.hash)}" data-title="${e(p.own?.fields.title ?? p.name ?? "")}">${p.mine ? "Sign a later card" : "Write a card of your own"}</button>` : ""}<button type="button" class="k-btn k-q" data-action="accept-hash" data-hash="${e(p.hash)}" data-label="${e((p.name ?? p.title).slice(0, 120))}">Add to accepted list</button></div>
${sect("Its text", p.text ? `<details><summary>${e(p.name ?? "")}</summary><pre class="k-small">${e(p.text)}</pre></details>${lines(p.role.map((t) => ({ text: t })))}` : p.builtIn ? '<p class="k-small k-soft">The frozen texts are dubsar.org\u2019s front door.</p>' : '<p class="k-empty">Not found on the relays asked.</p>')}
${sect("Releases implementing it", p.releases.length ? `<ul class="ummia-list">${p.releases.map((r) => `<li><span class="k-grow">${e(r.name ?? "a release")} ${e(r.version ?? "")}${r.problem ? ` <span class="k-small k-soft">(${e(r.problem)})</span>` : ""}${r.from === "card" ? ' <span class="k-small k-faint">named by its card</span>' : ""}</span>${actCopy(r.id)}<button type="button" class="k-btn k-q k-small" data-point-release="${e(r.id)}">Its line</button></li>`).join("")}</ul>` : '<p class="k-empty">None found.</p>')}
${sect("Its test vectors", p.vectors.length ? `<ul class="ummia-list">${p.vectors.map((v) => `<li>${/^https:\/\//.test(v) ? `<span class="k-mono k-grow">${e(v)}</span><button type="button" class="k-btn k-q k-small" data-copy="${e(v)}">Copy</button>` : actCopy(v)}</li>`).join("")}</ul>` : '<p class="k-empty">None named by its card.</p>')}
${sect("Its discussion", p.discussion ? `<p>${e(p.discussion.text?.split("\n")[0] ?? "Its thread")}</p>${actCopy(p.discussion.id, "the thread")} <button type="button" class="k-btn k-q k-small" data-action="reply-open" data-to="${e(p.discussion.id)}">Reply, as a signed document</button>` : '<p class="k-empty">No thread named by its card.</p>')}
${sect("Public agreements naming it", `<p class="k-small">${p.agreements ? `${p.agreements} public agreement${p.agreements === 1 ? "" : "s"} name${p.agreements === 1 ? "s" : ""} it as an extension.` : "None found."}</p>`)}
${p.use ? sect("Its use", `<p class="k-small">${p.use.acts} public act${p.use.acts === 1 ? "" : "s"} of its types (${p.use.byType.map((t) => `${e(t.name)} ${t.acts}`).join(", ")})${p.use.notValid ? `; ${p.use.notValid} not valid, not counted` : ""}.</p>`) : ""}
${sect("Its drafts", `${p.predecessor ? `<p class="k-small">After ${e(p.predecessor.name ?? "a specification not found here")}${p.predecessor.otherCreator ? ' <span class="k-small">(its creator is not its predecessor\u2019s)</span>' : ""}</p>${hashCopy(p.predecessor.hash)} <button type="button" class="k-btn k-q k-small" data-spec="${e(p.predecessor.hash)}">Its page</button>` : '<p class="k-small k-soft">It names no predecessor.</p>'}${p.successors.map((x) => `<p class="k-small">Followed by ${e(x.name)}${x.otherCreator ? " \u2014 by another creator than this one\u2019s" : ""}</p>${hashCopy(x.hash)} <button type="button" class="k-btn k-q k-small" data-spec="${e(x.hash)}">Its page</button>`).join("")}`)}
${p.others.length ? sect("Others\u2019 cards", p.others.map((c) => card2(c, false)).join("")) : ""}
${say2("What a card is", p.say)}`;
}
function pageForm() {
  return `<h2>A specification\u2019s page</h2><p class="k-small k-soft">Everything that can be tied to one specification, from the relays Look asks: its text, its creator\u2019s card, others\u2019 cards as their word, its releases, vectors, discussion, the agreements naming it, its drafts.</p>
<form id="page" class="k-row"><input name="hash" class="k-grow" placeholder="Its hash: mspec1\u2026, or hexadecimal" spellcheck="false" autocomplete="off" required><button type="submit" class="k-btn k-p">Open its page</button></form><div id="page-out"></div>`;
}
function actsForm() {
  return `<h2>One specification\u2019s acts</h2><p class="k-small k-soft">The public acts of one specification on the relays Look asks, by the filters relays already have: its spec hash, and an act type and a signer where given. Each judged through its signer\u2019s chain.</p>
<form id="acts"><label>Its spec hash</label><input name="spec" spellcheck="false" required><label>An act type (optional)</label><input name="type" inputmode="numeric"><label>A signer (optional)</label><div class="k-row"><input name="signer" class="k-grow" spellcheck="false" data-k-id-field>${contactsButtonFor("signer")}</div>
<div class="k-row"><button type="submit" class="k-btn k-p">Look</button></div></form><div id="acts-out"></div>`;
}
function acts(r) {
  return `${lines(r.lines)}${r.acts.length ? `<ul class="ummia-list">${r.acts.map((a) => `<li><span class="k-grow">type ${a.type} \xB7 by ${who({ id: a.signer, inline: true })} \xB7 <span class="ummia-v${a.standing === "valid" ? " valid" : ""}">${e(a.standing)}</span></span>${actCopy(a.id)}</li>`).join("")}</ul>` : '<p class="k-empty">No public act of it found.</p>'}`;
}
function mipsPane(m, open) {
  const one2 = (d) => `<div class="k-box mip" data-key="${e(d.key)}"><div class="k-row"><h3 class="k-grow">${e(d.title)}</h3><span class="k-chip">${d.published ? "published as a MIP" : d.drafts.length ? "draft \xB7 discussed" : "draft \xB7 kept here"}</span></div>
<p class="k-small k-soft">Forks ${e(d.forksName)} \xB7 ${d.drafts.length} draft${d.drafts.length === 1 ? "" : "s"} published for discussion${d.published ? "" : " \xB7 kept here until you publish it"}</p>
${d.drafts.map((x, i) => `<div>${actCopy(x.id, `draft ${i + 1}`)}</div>`).join("")}
${d.published ? hashCopy(d.published.hash, false, "its hash") : `${fold("Write it", `<form class="mip-text" data-key="${e(d.key)}"><textarea class="ummia-code" name="text" spellcheck="false">${e(d.text)}</textarea><div class="k-row"><button type="submit" class="k-btn">Keep it here (nothing is sent)</button></div></form>`, { open: open === d.key })}
<div class="k-row"><button type="button" class="k-btn" data-action="mip draft" data-key="${e(d.key)}">Publish this draft for discussion</button><button type="button" class="k-btn k-q" data-action="mip replies" data-key="${e(d.key)}">Replies</button><button type="button" class="k-btn k-q" data-action="mip prepare" data-key="${e(d.key)}">I am ready: publish it as a MIP\u2026</button></div>`}
<div id="mip-out-${e(d.key)}"></div></div>`;
  return `<h2>MIP drafts</h2>${say2("A MIP is a proposal toward MOR 2, drafted and discussed before it is published.", m.say)}${m.drafts.length ? m.drafts.map(one2).join("") : '<p class="k-empty">No MIP drafted here yet: + Start a MIP.</p>'}`;
}
function mipNew(forkable) {
  return `<h2>Start a MIP</h2><form id="mip-new"><label>Its title</label><input name="title" required><label>What it forks</label><select name="forks">${forkable.map((f) => `<option value="${e(f.key)}">${e(f.name)}</option>`).join("")}<option value="">A MIP, or the MICS document (for a new layer), by its spec hash:</option></select><input name="hash" spellcheck="false" placeholder="a spec hash, where chosen above">
<div class="k-row"><button type="submit" class="k-btn k-p">Start it in the MIP shape</button></div></form>`;
}
function reportsPane(r) {
  const sent = r.sent.length ? r.sent.map((s) => {
    const as = r.answers.filter((a) => a.report === s.id);
    return `<div class="k-box"><h3>${e(s.title)}</h3>${actCopy(s.id)}${as.length ? as.map((a) => `<p class="k-small">Answered (<span class="ummia-v${a.standing === "valid" ? " valid" : ""}">${e(a.standing)}</span>): ${e(a.text)}</p>`).join("") : '<p class="k-small k-soft">No answer yet.</p>'}</div>`;
  }).join("") : '<p class="k-empty">No report sent from here.</p>';
  return `<h2>Bug reports</h2>${say2("A report is public, signed by you, left in the reporting identity\u2019s inbox.", r.say)}
${r.to ? `<p class="k-small k-soft">Reports go to ${who({ id: r.to, inline: true })}</p>` : ""}<form id="reporting" class="k-row"><label class="k-grow">The reporting identity<input name="reports" spellcheck="false" value="${e(r.to ? formOf2(r.to, "mid") : "")}" placeholder="Its ID: mid1\u2026" data-k-id-field></label>${contactsButtonFor("reports")}<button type="submit" class="k-btn">Save</button></form>
${r.to ? `<form id="report"><label>The report: its first line is its title</label><textarea name="text" required></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Sign and send it</button></div></form>` : note("", "Give the reporting identity\u2019s ID first.")}
${lines(r.lines)}<h3>Sent from here</h3>${sent}`;
}
function replyForm(to, title) {
  return `<form id="reply" data-to="${e(to)}"><p class="k-small k-soft">Answering ${e(title)}: a long-form document, public, signed by you, naming it.</p><textarea name="text" required placeholder="Reply, as a signed document\u2026"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Sign and send</button></div></form>`;
}
function whoActs(s) {
  if (s.actors.length < 2) return "";
  const unnamed = s.actors.filter((a) => a.kind === "collective" && !nameOf2(s.names?.[a.id]));
  const label = (a) => a.kind === "self" ? "You" : nameOf2(s.names?.[a.id]) ?? `Collective${unnamed.length > 1 ? ` ${unnamed.indexOf(a) + 1}` : ""}`;
  return `<div class="ummia-who"><span class="k-small k-soft">Who acts</span>${s.actors.map((a) => `<button type="button" class="k-chip${a.id === s.acting ? " k-on" : ""}" data-acting="${e(a.id)}"${a.available ? "" : " disabled"} aria-pressed="${a.id === s.acting}">${e(label(a))}</button>`).join("")}</div>`;
}
function releasePane(s, r) {
  if (!s.releases) return `<h2>A release</h2>${note("", "Releases are made from a folder on a computer: in Ummia on the Mac or Linux. This web client reads no folder, so it makes no release.")}`;
  const list3 = r?.releases ?? [];
  const opts = list3.map((x) => `<option value="${e(x.id)}">${e(x.name)} ${e(x.version)} (${e(x.folder)})</option>`).join("");
  const forCollective = !!actingOf(s);
  const rows = list3.length ? list3.map(
    (x) => `<div class="k-box" data-release="${e(x.id)}"><div class="k-row"><h3 class="k-grow">${e(x.name)} ${e(x.version)}</h3>${actCopy(x.id)}</div><p class="k-small k-soft">from ${e(x.folder)}</p>
<div class="k-row"><button type="button" class="k-btn" data-action="release check" data-id="${e(x.id)}">Check it as anyone would</button>${x.collective ? `<button type="button" class="k-btn" data-action="release standing" data-id="${e(x.id)}">Does it count for the collective?</button>` : ""}<button type="button" class="k-btn k-q" data-action="anchor open" data-id="${e(x.id)}">Anchor it on Bitcoin (optional)</button></div><div id="check-${e(x.id)}"></div><div id="anchor-${e(x.id)}"></div></div>`
  ).join("") : '<p class="k-empty">No release from here yet.</p>';
  return `<h2>A release</h2>${whoActs(s)}
${say2(forCollective ? "Signed with your own key for the collective: it counts once the area reaching its releases is met." : "A release of code under your own name, from a folder, checked as anyone would.", [forCollective ? "Where its area asks more keys, its other holders are asked, and sign in their own app." : "A collective\u2019s releases are made here too: choose it in the identity panel, under your identity.", "A git folder gives what git tracks; a plain folder every file but hidden ones; links are never followed. Every file is listed with its size and fingerprint before anything is signed."])}
<form id="release"><label>The folder</label>
<div class="k-row"><input name="folder" class="k-grow" autocomplete="off" spellcheck="false" placeholder="~/code/my-module"><button type="button" class="k-btn" data-action="folders">Choose a folder\u2026</button></div>
<div id="picker"></div><p class="k-small k-soft" id="folder-said"></p>
<label>Its name (the folder\u2019s, by default)</label><input name="name" autocomplete="off">
<label>Its version</label><input name="version" autocomplete="off" placeholder="1.0">
<label>The release before it</label><select name="previous"><option value="">None: a new release line</option>${opts}</select>
<label>Specifications it implements (optional): their publications\u2019 act ids, one per line</label><textarea name="implements" spellcheck="false"></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back</button></div></form>
<div id="release-review"></div>
<h3>${forCollective ? "The collective\u2019s releases" : "Your releases"}</h3>${rows}`;
}
function picker(l) {
  return `<div class="ummia-picker"><p class="k-small">${e(l.path)}</p>
<div>${l.places.map((p) => `<button type="button" class="k-btn k-q k-small" data-action="folders" data-path="${e(p.path)}">${e(p.name)}</button>`).join("")}${l.parent ? `<button type="button" class="k-btn k-q k-small" data-action="folders" data-path="${e(l.parent)}">Up</button>` : ""}<button type="button" class="k-btn k-p k-small" data-action="folder use" data-path="${e(l.path)}">Use this folder</button></div>
${l.problem ? note("", e(l.problem)) : ""}
<div>${l.folders.map((f) => `<button type="button" class="k-btn k-small" data-action="folders" data-path="${e(f.path)}">${e(f.name)}${f.git ? " \xB7 git" : ""}${f.spaced ? ` (${e(f.spaced)})` : ""}</button>`).join("")}</div>${l.hidden ? `<p class="k-small k-soft">${l.hidden} hidden folder${l.hidden === 1 ? "" : "s"} not shown.</p>` : ""}</div>`;
}
function checked2(c) {
  return `<div class="${c.ok ? "" : "ummia-blocking"}">${lines(c.lines)}</div>`;
}
function anchorForm(release, offers2, sayIt) {
  const choose = offers2 ? offers2.length ? `<label>Its standing offer, and a tier</label><select name="choice">${offers2.flatMap((o, n) => o.tiers.map((t, i) => `<option value="${e(o.act)} ${i}">offer ${n + 1}, tier ${i}: within ${t.blocks} blocks, ${t.price} (its unit)</option>`)).join("")}</select><div class="k-row"><button type="submit" class="k-btn k-p">Prepare the payment for Damgar</button></div>` : note("", "No standing offer of that service was found under the anchoring cMIP.") : '<div class="k-row"><button type="submit" class="k-btn">Read its offer</button></div>';
  return `<form class="anchor" data-release="${e(release)}">${say2("Anchoring is optional: offered by a service, its tier chosen here, prepared for Damgar and paid there.", sayIt)}<label>The anchoring service\u2019s ID</label><div class="k-row"><input name="service" class="k-grow" autocomplete="off" spellcheck="false" required data-k-id-field>${contactsButtonFor("service")}</div>${choose}</form>`;
}
var TASK_TICKS = (tasks) => `<div class="ummia-ticks">${tasks.map((t) => `<label><input type="checkbox" name="tasks" value="${t.n}"> ${t.n}. ${e(t.name)} (${e(t.layer)})</label>`).join("")}</div>`;
function specPane(s, choices) {
  return `<h2>A cMIP or Module</h2>${whoActs(s)}
${say2("Its hash first: read back before anything is signed. Published for good.", ["A cMIP or a Module, published as its act and named by its spec hash. A changed specification is a new one. A MIP is drafted under Discuss. A specification is published as yourself: a collective acts here for its releases.", "Right after it is signed, Ummia offers its card (title, summary, links) and a discussion thread naming it, so there is somewhere to go from day one."])}
<form id="spec"><label>Its kind</label><select name="kind"><option value="0">cMIP: a specification for a task, an extension, or new act types (an xtype)</option><option value="1">Module: an implementation or extension under a cMIP, or under a MIR</option></select>
<label>Its text (canonical text: no space at the end of a line, no final line break)</label><textarea class="ummia-code" name="text" spellcheck="false" placeholder="# cMIP: \u2026"></textarea>
<input type="file" id="spec-file" accept=".md,.txt,text/plain,text/markdown"><span class="k-small k-soft"> or load it from a file</span>
<p class="k-small k-soft">Fill below only what your text says.</p>
${fold("A cMIP: the tasks it fills (field 2)", `${TASK_TICKS(choices.tasks)}`)}
${fold("Act types it defines (field 3): one per line, \u201Cnumber name schema\u201D", `<textarea name="types" spellcheck="false" placeholder="0 note note = tstr"></textarea>`)}
${fold("A Module: the cMIP it implements, or the MIR it works under (field 5)", `<input name="implements" spellcheck="false" placeholder="a spec hash">`)}
${fold("A rail Module: its kind and what its proof binds (fields 11 and 13)", `<select name="railKind"><option value="">Not a rail</option><option value="0">a request rail</option><option value="1">a push rail</option></select>
<div class="ummia-ticks"><label><input type="checkbox" name="railBinds" value="0"> the payee</label><label><input type="checkbox" name="railBinds" value="1"> the purpose</label><label><input type="checkbox" name="railBinds" value="2"> the previous hop</label></div>`)}
${fold("As an extension, the layers it acts on (field 10)", `<div class="ummia-ticks">${["Identity", "Envelopes and Text", "Money", "Agreements"].map((l, i) => `<label><input type="checkbox" name="layers" value="${i}"> ${l}</label>`).join("")}</div>`)}
${fold("Its predecessor (field 8), dependencies (field 4), a proof-of-delivery checker (field 12)", `<label>The specification it replaces, for its users</label><input name="predecessor" spellcheck="false" placeholder="a spec hash">
<label>Specifications it depends on, one per line</label><textarea name="dependencies" spellcheck="false"></textarea>
<label><input type="checkbox" name="checker"> It checks proofs of delivery of proven offers</label>`)}
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back, with its hash</button></div></form>
<div id="spec-review"></div>`;
}
function cardForm(c) {
  return `<div class="k-box k-fill" id="card-offer"><h3>${c.later ? "A later card" : "Its card"}</h3>${hashCopy(c.hash, false, "for")}
${say2("A card says what it is for and where to go next: a plain post, signed by you.", ["Every app shows it as the post it is. The latest card in your own sequence is the one that counts: sign a later one whenever a release, its vectors or its discussion arrive. Read back before it is signed."])}
<form id="card" data-hash="${e(c.hash)}"><label>Its title</label><input name="title" maxlength="${c.limits.title}" value="${e(c.title)}" required>
<label>A short summary: what it is for, in plain words</label><textarea name="summary" maxlength="${c.limits.summary}">${e(c.summary ?? "")}</textarea>
<label>Releases implementing it: their act IDs, one per line (optional)</label><textarea name="releases" spellcheck="false"></textarea>
<label>Its test vectors: act IDs or https addresses, one per line (optional)</label><textarea name="vectors" spellcheck="false"></textarea>
${c.discussion ? `<input type="hidden" name="discussion" value="${e(c.discussion)}"><p class="k-small k-soft">Its discussion: the thread already named.</p>` : `<label class="k-row"><input type="checkbox" name="thread" checked> Start a discussion thread naming it, signed just before the card</label>`}
<div class="k-row"><button type="submit" class="k-btn k-p">Read it back</button><button type="button" class="k-btn k-q" data-action="card-skip">Not now</button></div></form><div id="card-review"></div></div>`;
}
function anchoringPane(anchors, sayIt, web) {
  return `<h2>Anchoring</h2>${say2("Optional: a release\u2019s fingerprint on Bitcoin, through a pooled anchoring service, paid in Damgar.", sayIt)}
<p class="k-small k-soft">Ask from a release (A release \u203A Anchor it on Bitcoin), or from any card\u2019s act menu (Anchor it).${web ? " The web client follows no chain: anchors are shown asked, never checked here." : ""}</p>
<h3>Anchors asked</h3>${anchors.length ? anchors.map((a) => `<div class="k-box"><div class="k-row"><h3 class="k-grow">${e(a.label)}</h3><span class="ummia-v${a.state === "anchored" ? " valid" : a.state === "invalid" ? " bad" : ""}">${e(a.state)}</span></div>${actCopy(a.act)}<p class="k-small k-soft">tier ${a.tier} \xB7 by ${who({ id: a.service, inline: true })}</p>${lines(a.lines)}</div>`).join("") : '<p class="k-empty">None asked yet.</p>'}`;
}
function choosePane(a, layer) {
  const shown = layer ? a.entries.filter((x) => (x.layer ?? "").split(", ").includes(layer)) : a.entries;
  return `<h2>Rules I follow${layer ? ` \xB7 ${e(layer)}` : ""}</h2>${say2("Sealed to you, read by every app", a.say)}
${a.problems.length ? note("", lines(a.problems.map((t) => ({ text: t, tone: "warn" })))) : ""}
${a.forked ? note("", `Two apps changed it at once. Shown merged, nothing dropped: ${lines(a.merged.map((t) => ({ text: t })))} Your next change writes the merge.`) : ""}
<p class="k-small k-soft">${a.version ? `Version ${a.version}.` : "Nothing accepted yet: the default, under which no app signs anything under any specification."}</p>
${shown.length ? `<ul class="ummia-list" id="accepted">${shown.map((x) => `<li data-hash="${e(x.hash)}"><span class="ummia-tick">\u2713</span><span class="k-grow"><span>${e(x.label ?? "A specification with no label")}</span><br><span class="k-small k-soft">${e(x.layer ?? "layer not found on your relays")} \xB7 ${e(x.part)}</span></span>${hashCopy(x.hash)}<button type="button" class="k-btn k-q k-small" data-action="accepted remove" data-hash="${e(x.hash)}">Remove</button><button type="button" class="k-btn k-q k-small" data-spec="${e(x.hash)}">Its page</button></li>`).join("")}</ul>` : `<p class="k-empty">${layer ? `Nothing accepted in ${e(layer)}.` : "Nothing accepted."}</p>`}
<div class="k-row"><button type="button" class="k-btn" data-action="accept-hash-open">+ Accept by hash</button><span class="k-grow"></span><span class="k-small k-soft">${a.published ? "Published: anyone can read it." : "Private: sealed to yourself (the default)."}</span><button type="button" class="k-btn k-q" data-action="accepted publish" data-on="${a.published ? "false" : "true"}">${a.published ? "Make it private again" : "Publish it"}</button></div>`;
}
function acceptForm(hash = "", label = "") {
  return `<form id="accept-add"><label>Its spec hash</label><input name="hash" spellcheck="false" required value="${e(hash)}"><label>Its label (its name and draft)</label><input name="label" maxlength="120" value="${e(label)}">
<div class="k-row"><button type="submit" class="k-btn k-p">Accept it</button></div></form>`;
}
function relyForm(id) {
  return `<form id="rely" data-id="${e(id)}">${say2("Relying on an act keeps it visible as disputed should its author ever disown it.", ["A witness act (Identity type 15), public at your homes and relays, naming the act: it relies on it, it pays nothing. Signed with your key, checked first; through Ki\u0161ib\u2019s panel where Ki\u0161ib holds this identity."])}${actCopy(id)}<label>Type RELY to sign the witness act</label><input name="typed" autocomplete="off" autocapitalize="characters" spellcheck="false" required><div class="k-row"><button type="submit" class="k-btn k-p">Sign the witness act</button></div></form>`;
}

// src/page/ui.ts
var errorOf = (err) => err instanceof Error ? err.message : String(err);
var TABS = ["look", "discuss", "publish", "choose"];
var EVERY = ["releases", "cmips", "modules", "xtypes", "extensions"];
function mount(app2, b) {
  const $ = (id) => document.getElementById(id);
  app2.classList.add("k-page", "k-ummia");
  let state = null;
  let tab = null;
  let part = "";
  let at = { point: { kind: "relay", value: "" }, filters: [...EVERY], layer: null };
  let page = null;
  let openMip = null;
  let counts = { mips: 0, threads: 0, reports: 0, anchors: 0, published: 0 };
  let reviewing = null;
  const popup2 = new Popup(app2);
  attachClosing();
  try {
    const kept = JSON.parse(sessionStorage.getItem("ummia:at") ?? "null");
    if (kept && TABS.includes(kept.tab)) [tab, part] = [kept.tab, kept.part];
  } catch {
  }
  const keepAt = () => {
    try {
      sessionStorage.setItem("ummia:at", JSON.stringify(tab ? { tab, part } : null));
    } catch {
    }
  };
  function say3(kind, html) {
    let s = $("status");
    if (!s) {
      app2.insertAdjacentHTML("beforeend", '<div id="status" class="k-status"></div>');
      s = $("status");
    }
    s.innerHTML = `${note(kind, html)}<button type="button" class="k-round k-close" data-action="status-close" aria-label="Close">\xD7</button>`;
  }
  const spentShown = (m) => {
    const i = state?.identity;
    keyChanged(app2, m && i ? { id: i.id, name: labelOf3(i.named, "This identity"), say: m, form: renewForm() } : null);
  };
  const fail = (err) => {
    if (b.unpaired?.(err)) {
      app2.innerHTML = pairing();
      return;
    }
    const m = errorOf(err);
    if (/^This identity’s signing key was changed elsewhere/.test(m)) spentShown(m);
    say3("error", e(m));
  };
  const done = (r) => {
    if (r?.lines?.length) say3("done", `${r.title ? `<b>${e(r.title)}</b>` : ""}${lines(r.lines)}`);
  };
  async function act(f) {
    const was = [...app2.querySelectorAll("button")].map((x) => [x, x.disabled]);
    app2.querySelectorAll("button").forEach((x) => x.disabled = true);
    try {
      return await f();
    } catch (err) {
      fail(err);
      return void 0;
    } finally {
      for (const [x, d] of was) if (x.isConnected) x.disabled = d;
    }
  }
  let slot = null;
  const raw = b.ask.bind(b);
  const NOT_WATCHED = /* @__PURE__ */ new Set(["runner asking", "runner", "state", "runner drop", "look", "spec page", "clock words", "check", "accepted", "published here", "discussions", "releases", "mips", "reports", "contacts", "names"]);
  b.ask = async (op, a) => {
    if (b.web || NOT_WATCHED.has(op) || !state?.identity?.runner) return raw(op, a);
    let over = false;
    const watch = (async () => {
      while (!over) {
        await new Promise((r) => setTimeout(r, 300));
        if (over) break;
        const w = await raw("runner asking").catch(() => null);
        if (over || !w?.asking || !w.origin || slot?.request === w.asking.request) continue;
        const asked = w.asking;
        slot?.close();
        try {
          const s = openSlot(app2, {
            app: "kishib",
            by: "Ki\u0161ib",
            host: "Ummia",
            src: asked.panel,
            allowed: [w.origin, w.origin.replace("127.0.0.1", "localhost")],
            closed: () => {
              slot = null;
              void raw("runner drop", { request: asked.request }).catch(() => void 0);
            }
          });
          slot = { close: () => s.close(), request: asked.request };
        } catch (e3) {
          say3("error", e(errorOf(e3)));
        }
      }
    })();
    try {
      return await raw(op, a);
    } finally {
      over = true;
      await watch;
      slot?.close();
      slot = null;
    }
  };
  const known = /* @__PURE__ */ new Map();
  const contacts = attachContacts(app2, {
    app: "Ummia",
    ask: (op, a) => b.ask(op, a),
    profile: (id) => profileOf(id),
    said: (kind, html) => {
      known.clear();
      say3(kind, html);
    }
  });
  attachIds(app2, { names: (ids, fresh) => b.ask("names", { ids, fresh: !!fresh }), profile: (id) => profileOf(id) });
  async function nameCards(root) {
    const arts = [...root.querySelectorAll(".k-act[data-k-signer]")];
    const ids = [...new Set(arts.map((a) => a.dataset.kSigner))].filter((id) => !known.has(id) && /^[0-9a-f]{64}$/.test(id));
    if (ids.length) {
      try {
        for (const [id, n] of Object.entries(await b.ask("names", { ids }))) known.set(id, n);
      } catch {
      }
    }
    for (const a of arts) {
      if (!a.isConnected) continue;
      const n = known.get(a.dataset.kSigner) ?? { published: { state: "unreached" } };
      const box2 = a.querySelector(":scope > .k-signer .k-names");
      if (box2) box2.innerHTML = namesHtml(n, { retry: false });
      const d = drawn.get(a.dataset.kAct);
      if (d) d.act.signer.named = n;
    }
  }
  const ownIdNow = () => state?.identity ? `<p class="k-small k-soft">Its ID, to give to whoever may write to it:</p>${ownId({ form: state.identity.form, link: state.identity.link })}` : "";
  async function show(s) {
    state = s;
    closePanel();
    if (s.stage === "identity") {
      app2.innerHTML = firstScreen(b.web);
      return;
    }
    await draw();
    void b.ask("check").then((c) => spentShown(c.current ? null : c.say)).catch(() => void 0);
    void readCounts();
  }
  async function draw() {
    keepAt();
    if (!tab) {
      app2.innerHTML = home(state, b.web);
      askRules();
      return;
    }
    app2.innerHTML = tabPage(state, tab, part, counts);
    askRules();
    await fill();
  }
  function askRules() {
    const s = state;
    rulesAsk(app2, s?.identity && s.rules ? { id: s.identity.id, app: "Ummia", missing: s.rules.missing, open: () => void go("choose", "ummia-rules") } : null);
  }
  const rulesHtml = () => `<h2>Ummia\u2019s own rules</h2>${rulesPart({ app: "Ummia", rules: state?.rules?.rules ?? [], problem: state?.rules?.problem ?? null, manage: "Every layer, above: your whole list, every app\u2019s part of it." })}`;
  async function rulesChosen(key, where, remove = false) {
    try {
      const r = await b.ask("rules approve", { keys: [key], where, remove });
      if (!state) return;
      state.rules = r.rules;
      if (tab === "choose") await draw();
      say3("done", lines(r.lines));
    } catch (err) {
      fail(err);
    }
  }
  attachRules(app2, { approve: (key, where) => void rulesChosen(key, where), stop: (key) => void rulesChosen(key, "here", true) });
  async function readCounts() {
    const s = state;
    if (!s?.identity) return;
    const m = await b.ask("mips").catch(() => null);
    counts = {
      mips: m?.drafts.length ?? s.counts.mips,
      threads: s.counts.cards ? (await b.ask("published here").catch(() => ({ discussions: [] }))).discussions.length + (m?.drafts.reduce((n2, d) => n2 + d.drafts.length, 0) ?? 0) : m?.drafts.reduce((n2, d) => n2 + d.drafts.length, 0) ?? 0,
      reports: s.counts.reports,
      anchors: s.counts.anchors,
      published: s.counts.specs + s.counts.releases
    };
    const col = app2.querySelector(".k-col");
    if (!col) return;
    const n = { mips: counts.mips, threads: counts.threads, reports: counts.reports, anchoring: counts.anchors, published: counts.published };
    for (const [k, x] of Object.entries(n)) {
      const el = col.querySelector(`[data-k-col="${k}"] .k-k`);
      if (el) el.textContent = String(x);
    }
  }
  const pane = () => $("pane");
  let filling = 0;
  async function fill() {
    const p = pane();
    if (!p) return;
    const mine = ++filling;
    try {
      const html = await partHtml();
      if (mine !== filling || !p.isConnected) return void (cards = []);
      p.innerHTML = html;
      drawCards();
      void nameCards(p);
      const ids = cardsUntimed(p);
      if (ids.length)
        void b.ask("clock words", { ids }).then((w) => p.isConnected && stampCards(p, w)).catch(() => void 0);
    } catch (err) {
      if (mine !== filling) return;
      p.innerHTML = "";
      fail(err);
    }
  }
  const drawn = /* @__PURE__ */ new Map();
  let cards = [];
  const meId = () => state?.identity?.id ?? "";
  const whoOf = (id) => idCopy(id, { me: id === meId(), inline: true });
  const who2 = (id) => {
    const form2 = formOf2(id, "mid");
    const named2 = id === meId() ? state?.identity?.named ?? null : known.get(id) ?? { nick: null, published: { state: "loading" } };
    return { id, form: form2, link: form2, name: null, named: named2, me: id === meId() };
  };
  function profileOf(id) {
    const me = id === meId();
    const named2 = me ? state?.identity?.named : known.get(id);
    popup2.show(me ? "You" : labelOf3(named2, "Their profile"), `<dl class="k-facts"><dt>ID</dt><dd>${idCopy(id, { me })}</dd></dl><div class="k-row"><button type="button" class="k-btn k-p" data-point-id="${e(id)}">Point Look at them</button>${me ? "" : `<button type="button" class="k-btn" data-follow-releases="${e(id)}">Follow their releases</button>`}</div><p class="k-small k-soft">Full record in Ki\u0161ib. Their posts and profile are in Dub.</p>`);
  }
  const cardOf = (a, item = null) => {
    cards.push({ act: a, item });
    return card(a);
  };
  function drawCards() {
    drawn.clear();
    for (const c of cards) drawn.set(c.act.id, c);
    cards = [];
  }
  const itemCard = (x) => cardOf(
    {
      id: x.id,
      form: formOf2(x.id),
      signer: who2(x.signer),
      kind: x.kind,
      text: x.text,
      html: `<div class="ummia-acts">${x.hash ? `${hashCopy(x.hash)}<button type="button" class="k-btn k-q k-small" data-spec="${e(x.hash)}">Its page</button>` : ""}${x.release ? `<button type="button" class="k-btn k-q k-small" data-point-release="${e(x.id)}">Its line</button>` : ""}</div>`,
      labels: x.labels,
      verified: x.verified,
      alarm: x.alarm,
      when: x.when,
      unstamped: x.when ? null : NOT_STAMPED,
      hint: x.hint,
      own: x.signer === meId()
    },
    x
  );
  attachCards(app2, {
    app: "Ummia",
    act: (id) => drawn.get(id)?.act,
    signerItems: (a) => a.signer.me ? [] : [{ key: "follow-releases", label: "Follow their releases" }],
    // "Add to accepted list" in the act menu, below the line (decided).
    actItems: (a) => ({ before: [{ key: "accept", label: "Add to accepted list", disabled: !drawn.get(a.id)?.item?.hash, hint: drawn.get(a.id)?.item?.hash ? void 0 : "not a specification" }], after: [] }),
    async choose(key, a) {
      const c = drawn.get(a.id);
      const item = c?.item ?? null;
      switch (key) {
        case "profile":
          return void profileOf(a.signer.id);
        case "follow":
          return void popup2.show("Follow: add to contacts", followForm(a.signer.id, false));
        case "follow-releases":
          return void popup2.show("Follow their releases", followForm(a.signer.id, true));
        case "unfollow":
          return void contacts.open();
        case "mute":
        case "unmute":
          return void popup2.show("Muting is Dub\u2019s", '<p class="k-soft">Ummia shares the one contacts list (Contacts, top left); muting is done in Dub, from their card or profile.</p>');
        case "why":
          return void popup2.show("Why it\u2019s valid", `${lines([{ text: a.verified ? "Its signature and its place in its signer\u2019s sequence hold, judged through its signer\u2019s chain by the core library." : a.alarm ?? "Not shown as valid.", tone: a.verified ? "ok" : "bad" }, ...item?.hash ? [{ text: "Its content decodes as a specification (Development, Part three), and its hash is computed from that content." }] : [], ...item?.release ? [{ text: "Its manifest was found and matches its fingerprint. \u201CCheck it as anyone would\u201D (Publish) fetches every file." }] : []])}`);
        case "open":
          return void popup2.show("What it answers", '<p class="k-soft">It answers nothing.</p>');
        case "accept":
          if (item?.hash) popup2.show("Add to accepted list", acceptForm(item.hash, item.title));
          return;
        case "rely":
          return void popup2.show("Rely on it", relyForm(a.id));
        case "anchor": {
          const x = await act(() => b.ask("releases"));
          return void popup2.show("Anchor it", anchorForm(a.id, null, x?.anchorSay ?? []));
        }
        case "correct":
          return void popup2.show("Correct it", `<p class="k-soft">${item?.hash ? "A specification is never corrected: a changed one is a new one, with a new hash (Development rule 4). What can be said again is its card: sign a later one." : "A release is never corrected: publish the next one, naming this one as the one before it."}</p>${item?.hash ? `<div class="k-row"><button type="button" class="k-btn k-p" data-action="card-new" data-hash="${e(item.hash)}" data-title="${e(item.title)}">Sign a later card</button></div>` : ""}`);
      }
    }
  });
  const followForm = (id, releases) => `<form id="${releases ? "follow-releases" : "follow"}" data-id="${e(id)}">${say2(releases ? "Their releases, in Look\u2019s saved points: the one contacts list, here it filters." : "Added to the one contacts list, the same in every app.", ["Your contacts are sealed to you at your homes: nobody else can read them, nor the nickname you give."])}<p>${idCopy(id)}</p><label>Your nickname for it (optional: only you see it)</label><input name="name" maxlength="48" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn k-p">${releases ? "Follow their releases" : "Add to contacts"}</button></div></form>`;
  async function partHtml() {
    const s = state;
    if (tab === "look") {
      if (part === "page") return pageForm();
      if (part === "acts") return actsForm();
      if (part === "saved-none") return `<h2>Saved points</h2><p class="k-soft">None yet. Point Look somewhere and press \u201CSave this point\u201D, or choose \u201CFollow their releases\u201D in a signer\u2019s menu: a developer\u2019s releases, from the same follow list Dub reads.</p>`;
      if (page) {
        const p = await b.ask("spec page", { hash: page });
        return specPagePane(p, whoOf);
      }
      const saved = part.startsWith("saved:") ? s.saved.find((x) => `saved:${x.key}` === part) ?? null : null;
      const here = saved ? { point: { kind: saved.point.kind, value: saved.point.value }, filters: saved.filters, layer: null } : at;
      const head = lookHead(here, s, saved);
      if (here.point.kind === "release" && !here.point.value) return `${head}${feedBox({ id: "look-feed", cards: "", empty: "Name a release by its act ID, then Look." })}`;
      if (here.point.kind === "id" && !here.point.value) return `${head}${feedBox({ id: "look-feed", cards: "", empty: "Name an identity by its ID, then Look." })}`;
      const l = await b.ask("look", { point: here.point, filters: here.filters, layer: here.layer ?? "" });
      return `${head}${l.lines.length ? lines(l.lines) : ""}${feedBox({ id: "look-feed", cards: l.items.map(itemCard).join(""), empty: "Nothing found there with these filters." })}${lookFoot(l.limit, l.counts, l.ordered)}`;
    }
    if (tab === "discuss") {
      if (part === "mip-new") return mipNew((await b.ask("mips")).forkable);
      if (part === "reports") return reportsPane(await b.ask("reports"));
      if (part === "threads") {
        const t = await b.ask("discussions");
        return `<h2>Discussions</h2>${say2("The threads started here and the MIP drafts published for discussion, each with its replies.", ["A reply comes from any app: Dub\u2019s replies are plain posts; here, a reply is a signed document. Replies are found in your inbox and on the relays you name."])}${lines(t.lines)}${t.threads.map(
          (x) => `<div class="k-box" data-thread="${e(x.id)}"><div class="k-row"><h3 class="k-grow">${e(x.title)}</h3>${actCopy(x.id)}</div>${x.spec ? `<div class="k-row">${hashCopy(x.spec, false, "about")}<button type="button" class="k-btn k-q k-small" data-spec="${e(x.spec)}">Its page</button></div>` : ""}<div class="k-feed">${x.replies.map((r) => cardOf({ id: r.id, form: formOf2(r.id), signer: who2(r.signer), kind: r.sealed ? "sent to you" : null, text: r.text, verified: r.standing === "valid", alarm: r.standing === "valid" ? null : r.standing, own: r.mine })).join("") || '<p class="k-empty">No reply found yet.</p>'}</div><div class="k-row"><button type="button" class="k-btn" data-action="reply-open" data-to="${e(x.id)}" data-title="${e(x.title)}">Reply, as a signed document</button></div></div>`
        ).join("") || '<p class="k-empty">No discussion yet: a thread is started with a specification\u2019s card (Publish), and a MIP draft is published for discussion here.</p>'}`;
      }
      return mipsPane(await b.ask("mips"), openMip);
    }
    if (tab === "publish") {
      if (part === "spec") return specPane(s, await b.ask("spec choices"));
      if (part === "anchoring") {
        const r2 = await b.ask("releases");
        return anchoringPane(r2.anchors, r2.anchorSay, b.web);
      }
      if (part === "published") {
        const p = await b.ask("published here");
        const r2 = s.releases ? await b.ask("releases").catch(() => ({ releases: [] })) : { releases: [] };
        return `<h2>Published here</h2>${say2("What this identity published from Ummia: specifications with their cards, releases.", ["A specification stays as published; its card can be signed again whenever something new arrives, and the latest counts."])}
<h3>Specifications</h3><div class="k-feed">${p.specs.map((x) => {
          const cs = p.cards.filter((c) => c.spec === x.hash);
          const th = p.discussions.find((d) => d.spec === x.hash);
          return cardOf({ id: x.id, form: formOf2(x.id), signer: who2(meId()), kind: x.kind, text: `${cs[cs.length - 1]?.title ?? x.name}${cs.length ? `
Its card, signed ${cs.length} time${cs.length === 1 ? "" : "s"}` : "\nNo card yet"}`, html: `<div class="ummia-acts">${hashCopy(x.hash)}<button type="button" class="k-btn k-q k-small" data-spec="${e(x.hash)}">Its page</button><button type="button" class="k-btn k-small${cs.length ? "" : " k-p"}" data-action="card-new" data-hash="${e(x.hash)}" data-title="${e(cs[cs.length - 1]?.title ?? x.name)}" data-discussion="${e(th?.id ?? "")}">${cs.length ? "A later card" : "Its card"}</button></div>`, verified: true, own: true });
        }).join("") || '<p class="k-empty">None yet.</p>'}</div>
<h3>Releases</h3>${r2.releases.length ? `<ul class="ummia-list">${r2.releases.map((x) => `<li><span class="k-grow">${e(x.name)} ${e(x.version)}</span>${actCopy(x.id)}</li>`).join("")}</ul>` : '<p class="k-empty">None from here.</p>'}`;
      }
      const r = s.releases ? await b.ask("releases") : null;
      return releasePane(s, r);
    }
    if (tab === "choose") {
      if (part === "accept-hash") return `<h2>Accept by hash</h2>${acceptForm()}`;
      if (part === "ummia-rules") return rulesHtml();
      const a = await b.ask("accepted");
      return choosePane(a, part.startsWith("layer:") ? part.slice(6) : null);
    }
    return "";
  }
  let adding = false;
  function panelHtml(inside) {
    const s = state;
    const ids = s.held.map((h) => ({
      id: h.id,
      form: h.form,
      link: h.link,
      // One used through Kišib, with no name published: said so, as before.
      name: labelOf3(h.named, h.runner ? "via Ki\u0161ib" : "") || null,
      named: h.runner && !labelOf3(h.named, "") ? null : h.named,
      on: h.active && !actingOf(s),
      collectives: h.active ? s.actors.filter((c) => c.kind === "collective").map((c) => ({ id: c.id, form: formOf2(c.id, "mid"), name: labelOf3(s.names?.[c.id], "Collective"), named: s.names?.[c.id] ?? null, on: s.acting === c.id, why: c.available ? null : c.why })) : []
    }));
    return identityPanel({ ids, adding, add: ADD(b.web), foot: `<button type="button" class="k-btn k-q k-small" data-action="relays-open">Relays</button> <span class="k-small k-soft">${b.web ? "This browser: the web client, for testing only." : "This app: Ummia on this computer."}</span>`, inside });
  }
  function openIdentityPanel(inside) {
    if (panelOpen()) redrawPanel(panelHtml(inside));
    else openPanel(app2, panelHtml(inside));
  }
  async function identityMenu(button, id) {
    const runner = state?.held.find((h) => h.id === id)?.runner;
    const items = IDENTITY_MENU.filter(([k]) => runner ? k !== "renew" && k !== "words" : true).map(([key, label, hint], i, all2) => ({ key, label, hint: hint || void 0, line: i === all2.length - 1 }));
    const named2 = state?.held.find((h) => h.id === id)?.named;
    popAt(button, `<div class="k-pop" role="menu"><div class="k-t">${e(labelOf3(named2, "Its settings"))}</div>${items.map((m) => `${m.line ? "<hr>" : ""}<button type="button" role="menuitem" data-k-item="${m.key}">${e(m.label)}${m.hint ? `<span class="k-k">${e(m.hint)}</span>` : ""}</button>`).join("")}</div>`, "below", async (key) => {
      if (id !== state?.identity?.id && key !== "remove") {
        await act(() => b.ask("use", { id }));
        state = await b.ask("state");
      }
      if (key === "remove") return void openConfirm(app2, removeSaid("Ummia", labelOf3(named2, "this identity")).replace("data-k-remove>", `data-k-remove data-id="${e(id)}">`));
      closePanel();
      if (key === "words") {
        const c = await act(() => b.ask("carry"));
        if (c) popup2.show("The signing key\u2019s words", wordsShown(c));
      } else if (key === "line") popup2.show("Line and homes", lineShown(state));
      else if (key === "renew") popup2.show("New words from Ki\u0161ib", renewForm());
      else if (key === "collective") popup2.show("A collective under it", collectiveForm(state));
    });
  }
  async function addPart(k) {
    if (state?.stage === "identity") {
      app2.innerHTML = firstScreen(b.web, k);
      if (k === "kishib") await runnerPart($("first-part"));
      return;
    }
    closePanel();
    const body = popup2.show(k === "bring" ? "Bring an identity" : "Use one from Ki\u0161ib", k === "bring" ? bringForm() : '<p class="k-small k-soft">Reading Ki\u0161ib\u2019s runner\u2026</p>');
    if (k === "kishib") await runnerPart(body);
  }
  async function runnerPart(into) {
    const r = await raw("runner").catch((e3) => ({ available: true, origin: null, state: null, code: null, identities: [], problem: errorOf(e3) }));
    if (into.isConnected) into.innerHTML = runnerForm(r);
  }
  async function go(t, p) {
    [tab, part] = [t, p];
    if (t !== "look" || p !== "feed") page = null;
    await draw();
  }
  async function openPage(hash) {
    popup2.close();
    page = hash;
    [tab, part] = ["look", "feed"];
    await draw();
  }
  async function lookAgain() {
    page = null;
    if (part !== "feed" && !part.startsWith("saved:")) part = "feed";
    await draw();
  }
  attachColumn(app2, async (key) => {
    part = key;
    page = null;
    keepAt();
    const p = pane();
    if (p) p.innerHTML = '<p class="k-empty">Reading\u2026</p>';
    await fill();
  });
  app2.addEventListener("click", async (ev) => {
    const t = ev.target;
    const tile = t.closest("[data-k-tile]");
    if (tile) return void await go(tile.dataset.kTile, firstPart(tile.dataset.kTile));
    const tb = t.closest("[data-tab]");
    if (tb) return void await go(tb.dataset.tab, firstPart(tb.dataset.tab));
    const cp = t.closest("[data-copy]");
    if (cp) {
      const ok = await copy(cp.dataset.copy ?? "");
      cp.textContent = ok ? "Copied" : "Select it and copy it";
      cp.dataset.copied = ok ? "yes" : "no";
      return;
    }
    const sp = t.closest("[data-spec]");
    if (sp) return void await openPage(sp.dataset.spec);
    const pr = t.closest("[data-point-release]");
    if (pr) {
      popup2.close();
      at = { point: { kind: "release", value: formOf2(pr.dataset.pointRelease) }, filters: ["releases"], layer: null };
      return void await go("look", "feed");
    }
    const pid = t.closest("[data-point-id]");
    if (pid) {
      popup2.close();
      at = { ...at, point: { kind: "id", value: formOf2(pid.dataset.pointId, "mid") } };
      return void await go("look", "feed");
    }
    const fr = t.closest("[data-follow-releases]");
    if (fr) return void popup2.show("Follow their releases", followForm(fr.dataset.followReleases, true));
    const pt = t.closest("[data-k-point]");
    if (pt && tab === "look") {
      const kind = pt.dataset.kPoint;
      at = { ...at, point: { kind, value: kind === at.point.kind ? at.point.value : kind === "relay" ? "" : "" }, filters: kind === "release" ? ["releases"] : at.point.kind === "release" ? [...EVERY] : at.filters };
      if (part.startsWith("saved:")) part = "feed";
      return void await lookAgain();
    }
    const fl = t.closest("[data-k-filter]");
    if (fl && tab === "look") {
      const f = fl.dataset.kFilter;
      at = { ...at, filters: at.filters.includes(f) ? at.filters.filter((x) => x !== f) : [...at.filters, f] };
      if (part.startsWith("saved:")) part = "feed";
      return void await lookAgain();
    }
    const ly = t.closest("[data-k-layer]");
    if (ly && tab === "look") {
      at = { ...at, layer: ly.dataset.kLayer || null };
      if (part.startsWith("saved:")) part = "feed";
      return void await lookAgain();
    }
    const sr = t.closest("[data-saved-remove]");
    if (sr) {
      const r = await act(() => b.ask("saved remove", { key: sr.dataset.savedRemove }));
      if (r) state = await b.ask("state"), part = "feed", await draw(), done(r);
      return;
    }
    const ac = t.closest("[data-acting]");
    if (ac) {
      const r = await act(() => b.ask("acting", { id: ac.dataset.acting }));
      if (r) state = await b.ask("state"), await draw(), done(r);
      return;
    }
    if (t.closest('[data-k-open="identity"]')) {
      adding = false;
      return openIdentityPanel();
    }
    const add = t.closest("[data-k-add]");
    if (add) {
      if (add.dataset.kAdd === "toggle") {
        adding = !adding;
        return void redrawPanel(panelHtml());
      }
      return void await addPart(add.dataset.kAdd);
    }
    const first = t.closest("[data-add]");
    if (first) return void await addPart(first.dataset.add);
    const use = t.closest("[data-k-use]");
    if (use) {
      const id2 = use.dataset.kUse;
      closePanel();
      if (use.dataset.kUnder) {
        const r = await act(() => b.ask("acting", { id: state?.acting === id2 ? meId() : id2 }));
        if (r) state = await b.ask("state"), await draw(), done(r);
        return;
      }
      if (id2 === meId()) {
        if (state?.acting !== id2) await act(() => b.ask("acting", { id: id2 }));
      } else await act(() => b.ask("use", { id: id2 }));
      return void await show(await b.ask("state"));
    }
    const menu2 = t.closest("[data-k-idmenu]");
    if (menu2) return void await identityMenu(menu2, menu2.dataset.kIdmenu);
    if (t.closest("[data-k-remove-no]")) return void redrawPanel(panelHtml());
    const yes = t.closest("[data-k-remove-yes]");
    if (yes) {
      const id2 = yes.closest("[data-k-remove]")?.dataset.id ?? meId();
      closePanel();
      await act(() => b.ask("forget", { id: id2 }));
      return void await show(await b.ask("state"));
    }
    const take = t.closest("[data-runner-take]");
    if (take) {
      const r = await act(() => raw("runner take", { id: take.dataset.runnerTake }));
      if (r) popup2.close(), await show(await b.ask("state")), say3("done", `${lines(r.lines)}${ownIdNow()}`);
      return;
    }
    const el = t.closest("[data-action]");
    if (!el) return;
    const a = el.dataset.action;
    const id = el.dataset.id ?? "";
    switch (a) {
      case "status-close":
        $("status").innerHTML = "";
        return;
      case "home-tiles":
        tab = null;
        page = null;
        return void await draw();
      case "look-back":
        page = null;
        return void await fill();
      case "relays-open":
        closePanel();
        return void popup2.show("Relays", relaysForm(state));
      case "runner-pair": {
        const r = await act(() => raw("runner pair"));
        if (r) await runnerPart(el.closest("#first-part, .k-mbody"));
        return;
      }
      case "runner-look":
        return void await runnerPart(el.closest("#first-part, .k-mbody"));
      case "save-point": {
        const label = at.point.kind === "contacts" ? "My contacts" : at.point.kind === "relay" ? (at.point.value || "Every relay").replace(/^https?:\/\//, "") : `${at.point.kind === "release" ? "Release line" : "ID"} ${shortForm(/^[0-9a-f]{64}$/.test(at.point.value) ? formOf2(at.point.value, at.point.kind === "id" ? "mid" : "mact") : at.point.value)}`;
        const r = await act(() => b.ask("saved add", { label, point: at.point, filters: at.filters }));
        if (r) state = await b.ask("state"), await draw(), done(r);
        return;
      }
      case "card-new":
        return void popup2.show(el.dataset.discussion !== void 0 || el.textContent?.includes("later") ? "A later card" : "Its card", cardForm({ hash: el.dataset.hash, title: el.dataset.title ?? "", discussion: el.dataset.discussion || null, later: /later/i.test(el.textContent ?? ""), limits: { title: 120, summary: 600 } }));
      case "card-skip":
        el.closest("#card-offer")?.remove();
        popup2.close();
        return;
      case "reply-open":
        return void popup2.show("Reply", replyForm(el.dataset.to, el.dataset.title ?? "its thread"));
      case "accept-hash":
        return void popup2.show("Add to accepted list", acceptForm(el.dataset.hash, el.dataset.label));
      case "accept-hash-open":
        return void popup2.show("Accept by hash", acceptForm());
      case "confirm":
      case "release confirm": {
        const r = await act(() => b.ask(a, { plan: el.dataset.plan, digest: el.dataset.digest }));
        if (!r) return;
        state = await b.ask("state");
        const was = reviewing;
        reviewing = null;
        if (was?.kind === "spec" && r.hash) {
          const into = el.closest("#spec-review");
          if (into) {
            into.innerHTML = `${note("done", `<b>${e(r.title)}</b>${lines(r.lines)}`)}${cardForm({ hash: r.hash, title: was.title, later: false, limits: { title: 120, summary: 600 } })}`;
            void readCounts();
            return;
          }
        }
        if (popup2.open) popup2.close();
        await fill();
        void readCounts();
        done(r);
        return;
      }
      case "cancel":
        await b.ask("cancel", { plan: el.dataset.plan }).catch(() => void 0);
        el.closest(".review")?.remove();
        return;
      case "folders": {
        const l = await act(() => b.ask("folders", { path: el.dataset.path ?? "" }));
        if (l) $("picker").innerHTML = picker(l);
        return;
      }
      case "folder use":
        return void await useFolder(el.dataset.path ?? "");
      case "release standing": {
        const c = await act(() => b.ask("collective release standing", { id }));
        if (c) $(`check-${id}`).innerHTML = lines(c.lines);
        return;
      }
      case "release check": {
        const c = await act(() => b.ask("release check", { id }));
        if (c) $(`check-${id}`).innerHTML = checked2(c);
        return;
      }
      case "anchor open": {
        const x = await act(() => b.ask("releases"));
        if (x) $(`anchor-${id}`).innerHTML = anchorForm(id, null, x.anchorSay);
        return;
      }
      case "accepted remove": {
        const r = await act(() => b.ask("accepted change", { remove: [el.dataset.hash] }));
        if (r) await fill(), done(r);
        return;
      }
      case "accepted publish": {
        const r = await act(() => b.ask("accepted publish", { on: el.dataset.on === "true" }));
        if (r) await fill(), done(r);
        return;
      }
      case "mip draft": {
        const r = await act(() => b.ask("mip draft", { key: el.dataset.key }));
        if (r) await fill(), void readCounts(), done(r);
        return;
      }
      case "mip replies": {
        const r = await act(() => b.ask("mip replies", { key: el.dataset.key }));
        const box2 = $(`mip-out-${el.dataset.key}`);
        if (r && box2) {
          const all2 = Object.values(r.replies).flat();
          box2.innerHTML = `${lines(r.lines)}<div class="k-feed">${all2.map((x) => cardOf({ id: x.id, form: formOf2(x.id), signer: who2(x.signer), kind: x.sealed ? "sent to you" : null, text: x.text, verified: x.standing === "valid", alarm: x.standing === "valid" ? null : x.standing })).join("") || '<p class="k-empty">No reply found yet.</p>'}</div>`;
          for (const c of cards) drawn.set(c.act.id, c);
          cards = [];
          void nameCards(box2);
        }
        return;
      }
      case "mip prepare": {
        const r = await act(() => b.ask("mip prepare", { key: el.dataset.key }));
        if (r) {
          reviewing = { kind: "mip", title: r.title };
          $(`mip-out-${el.dataset.key}`).innerHTML = review(r);
        }
        return;
      }
    }
  });
  async function useFolder(path) {
    const f = $("release");
    const s = await act(() => b.ask("release suggest", { folder: path }));
    if (f && s) {
      f.elements.namedItem("folder").value = s.folder;
      f.elements.namedItem("name").value = s.name;
      f.elements.namedItem("previous").value = s.previous ?? "";
      $("picker").innerHTML = "";
      $("folder-said").textContent = `${s.folder}: ${s.how === "git" ? "a git folder: the files git tracks there." : "a plain folder: every file but hidden ones."}`;
    }
  }
  app2.addEventListener("change", async (ev) => {
    const el = ev.target;
    if (el.name === "folder" && el.closest("form#release") && el.value.trim()) return void await useFolder(el.value);
    if (el.id === "spec-file" && el.files?.[0]) {
      const text3 = await el.files[0].text();
      const area = (el.form ?? app2).querySelector("textarea[name=text]");
      if (area) area.value = text3.replace(/\r\n/g, "\n");
    }
  });
  const str = (fd, k) => String(fd.get(k) ?? "");
  const all = (fd, k) => fd.getAll(k).map(String);
  const rows = (fd, k) => str(fd, k).split("\n").map((x) => x.trim()).filter(Boolean);
  app2.addEventListener("submit", async (ev) => {
    const f = ev.target;
    const fid = f.getAttribute("id");
    if (fid === "pair") return;
    ev.preventDefault();
    const fd = new FormData(f);
    switch (fid) {
      case "bring": {
        const r = await act(() => b.ask("bring", { id: str(fd, "id"), words: str(fd, "words"), address: str(fd, "address"), relays: str(fd, "relays") }));
        if (r) popup2.close(), await show(await b.ask("state")), say3("done", `<strong>The identity is here.</strong>${lines(r.lines)}${ownIdNow()}`);
        return;
      }
      case "renew": {
        const r = await act(() => b.ask("renew", { words: str(fd, "words") }));
        if (r) popup2.close(), spentShown(null), await show(await b.ask("state")), done(r);
        return;
      }
      case "collective-add": {
        const r = await act(() => b.ask("collective add", { id: str(fd, "collective") }));
        if (r) {
          state = await b.ask("state");
          popup2.replace(collectiveForm(state))?.insertAdjacentHTML("afterbegin", note("done", lines(r.lines)));
        }
        return;
      }
      case "relays": {
        const r = await act(() => b.ask("settings", { relays: str(fd, "relays"), track: str(fd, "track") }));
        if (r) state = await b.ask("state"), popup2.close(), done(r);
        return;
      }
      case "reporting": {
        const r = await act(() => b.ask("settings", { reports: str(fd, "reports") }));
        if (r) state = await b.ask("state"), await fill(), done(r);
        return;
      }
      case "look": {
        at = { ...at, point: { kind: at.point.kind, value: str(fd, "value") } };
        page = null;
        if (part.startsWith("saved:")) part = "feed";
        return void await act(() => fill());
      }
      case "page": {
        const box2 = $("page-out");
        const p = await act(() => b.ask("spec page", { hash: str(fd, "hash") }));
        if (p && box2) {
          page = p.hash;
          [tab, part] = ["look", "feed"];
          await draw();
        }
        return;
      }
      case "acts": {
        const r = await act(() => b.ask("acts of", { spec: str(fd, "spec"), type: str(fd, "type"), signer: str(fd, "signer") }));
        if (r) $("acts-out").innerHTML = acts(r);
        return;
      }
      case "follow":
      case "follow-releases": {
        const r = await act(() => b.ask(fid === "follow" ? "follow" : "follow releases", { id: f.dataset.id, name: str(fd, "name") }));
        if (r) {
          known.clear();
          popup2.close();
          state = await b.ask("state");
          if (tab) await draw();
          done(r);
        }
        return;
      }
      case "accept-add": {
        const r = await act(() => b.ask("accepted change", { add: [{ hash: str(fd, "hash"), label: str(fd, "label") }] }));
        if (r) {
          if (popup2.open) popup2.close();
          if (tab === "choose") {
            part = "every";
            await draw();
          }
          done(r);
        }
        return;
      }
      case "rely": {
        const r = await act(() => b.ask("rely", { id: f.dataset.id, typed: str(fd, "typed") }));
        if (r) popup2.close(), done(r);
        return;
      }
      case "release": {
        const r = await act(() => b.ask("release prepare", { folder: str(fd, "folder"), name: str(fd, "name"), version: str(fd, "version"), previous: str(fd, "previous"), implements: str(fd, "implements") }));
        if (r) {
          reviewing = { kind: "release", title: r.title };
          $("release-review").innerHTML = review(r, "release confirm");
        }
        return;
      }
      case "spec": {
        const r = await act(
          () => b.ask("spec prepare", {
            kind: Number(str(fd, "kind")),
            text: str(fd, "text"),
            tasks: all(fd, "tasks"),
            types: str(fd, "types"),
            implements: str(fd, "implements"),
            predecessor: str(fd, "predecessor"),
            dependencies: str(fd, "dependencies"),
            layers: all(fd, "layers"),
            railKind: str(fd, "railKind"),
            railBinds: all(fd, "railBinds"),
            checker: fd.get("checker") === "on"
          })
        );
        if (r) {
          const first = str(fd, "text").split("\n").find((l) => /\p{L}/u.test(l)) ?? "";
          reviewing = { kind: "spec", title: first.replace(/^#+\s*/, "").replace(/^(cMIP|Module):\s*/, "").trim().slice(0, 120) };
          $("spec-review").innerHTML = review(r);
        }
        return;
      }
      case "card": {
        const r = await act(() => b.ask("card prepare", { spec: f.dataset.hash, title: str(fd, "title"), summary: str(fd, "summary"), releases: rows(fd, "releases"), vectors: rows(fd, "vectors"), discussion: fd.get("thread") === "on" ? "new" : str(fd, "discussion") }));
        if (r) {
          reviewing = { kind: "card", title: r.title };
          const box2 = f.parentElement?.querySelector("#card-review") ?? $("card-review");
          if (box2) box2.innerHTML = review(r);
        }
        return;
      }
      case "reply": {
        const r = await act(() => b.ask("reply", { to: f.dataset.to, text: str(fd, "text") }));
        if (r) popup2.close(), tab === "discuss" && await fill(), done(r);
        return;
      }
      case "mip-new": {
        const forks = str(fd, "forks") || str(fd, "hash");
        const r = await act(() => b.ask("mip new", { title: str(fd, "title"), forks }));
        if (r) {
          openMip = r.key;
          await go("discuss", "mips");
          void readCounts();
        }
        return;
      }
      case "report": {
        const r = await act(() => b.ask("report send", { text: str(fd, "text") }));
        if (r) await fill(), done(r);
        return;
      }
    }
    if (f.classList.contains("mip-text")) {
      const r = await act(() => b.ask("mip save", { key: f.dataset.key, text: str(fd, "text") }));
      if (r) {
        openMip = f.dataset.key;
        $(`mip-out-${f.dataset.key}`).innerHTML = lines(r.lines);
      }
    } else if (f.classList.contains("anchor")) {
      const release = f.dataset.release;
      const choice = str(fd, "choice");
      const into = f.parentElement;
      if (!choice) {
        const offers2 = await act(() => b.ask("anchor offers", { service: str(fd, "service") }));
        const x = await b.ask("releases");
        if (offers2) {
          into.innerHTML = anchorForm(release, offers2, x.anchorSay);
          into.querySelector("input[name=service]").value = str(fd, "service");
        }
        return;
      }
      const [offer, tier] = choice.split(" ");
      const r = await act(() => b.ask("anchor ask", { release, service: str(fd, "service"), offer, tier: Number(tier) }));
      if (r) {
        if (popup2.open) popup2.close();
        state = await b.ask("state");
        void readCounts();
        if (tab === "publish") await fill();
        done(r);
      }
    }
  });
  return { show };
}

// src/web/keep.ts
var DB = "ummia";
var STORE = "keep";
var LOCK = "ummia-signing";
function request(r) {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
var WebKeep = class _WebKeep {
  constructor(db) {
    this.db = db;
  }
  static async open() {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    return new _WebKeep(await request(r));
  }
  async get(key) {
    return request(this.db.transaction(STORE).objectStore(STORE).get(key));
  }
  async tx(f) {
    const t = this.db.transaction(STORE, "readwrite");
    f(t.objectStore(STORE));
    await new Promise((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error("the browser refused to keep it"));
    });
  }
  put(key, value) {
    return this.tx((s) => s.put(JSON.parse(JSON.stringify(value)), key));
  }
  async held() {
    const keys = await request(this.db.transaction(STORE).objectStore(STORE).getAllKeys());
    return keys.map(String).filter((k) => k.startsWith("identity:")).map((k) => k.slice(9)).sort();
  }
  async active() {
    const a = await this.get("active") ?? null;
    return a && (await this.held()).includes(a) ? a : null;
  }
  async setActive(id) {
    await this.put("active", id);
  }
  async identity(id) {
    const f = await this.get(`identity:${id}`);
    if (!f) return null;
    if (f.label !== TEST_LABEL) throw new Error("What this browser keeps is not a MOR test identity.");
    return new TestIdentity(f);
  }
  async saveIdentity(id) {
    if (id.f.safety.seeds) throw new Error("A chain key is never kept in this browser.");
    await this.put(`identity:${id.id}`, id.f);
  }
  async read(id, name) {
    return await this.get(`${name}:${id}`) ?? null;
  }
  async write(id, name, v) {
    await this.put(`${name}:${id}`, name === "settings" ? { ...v, via: {} } : v);
  }
  async forget(id) {
    await this.tx((s) => {
      for (const k of ["identity", "settings", "book"]) s.delete(`${k}:${id}`);
    });
  }
  exclusive(f) {
    if (!navigator.locks) return f();
    return navigator.locks.request(LOCK, f);
  }
};

// src/web/app.ts
var app = document.getElementById("app");
var ummia;
var ask3 = (op, a = {}) => run(ummia, op, a);
var ui = mount(app, { web: true, ask: ask3, start });
async function start() {
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    app.innerHTML = `${top0(true)}${note("error", "This page keeps a key in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it.")}`;
    return;
  }
  try {
    ummia ??= new Ummia(await WebKeep.open(), { web: true, releases: null, chain: null });
  } catch (err) {
    app.innerHTML = `${top0(true)}${note("error", `This browser does not let the page keep anything (${e(err instanceof Error ? err.message : String(err))}).`)}`;
    return;
  }
  try {
    await ui.show(await ummia.state());
  } catch (err) {
    app.innerHTML = `${top0(true)}${note("error", e(err instanceof Error ? err.message : String(err)))}`;
  }
}
void start();
