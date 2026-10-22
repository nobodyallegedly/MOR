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
   * What a fork of `collective` must hand out (F127), its line drawn at
   * `chain_act` and `tips` (`[{ act, position, summary }]`) with
   * `agreement` in force there: every obligation in the history it would
   * cite, its own and those an earlier fork handed to it. Null where the
   * line does not hold.
   * @param {any} specs
   * @param {string} collective
   * @param {string} agreement
   * @param {string} chain_act
   * @param {any} tips
   * @returns {string[] | undefined}
   */
  agreementsHandOut(specs, collective, agreement, chain_act, tips) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passStringToWasm0(chain_act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsHandOut(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, ptr2, len2, tips);
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
   * The acts the history a line at `chain_act` and `tips` would cite
   * that this verifier does not hold (F127): a member's client signs no
   * fork or closing while any is missing (F131 IT2b, client conformance).
   * @param {any} specs
   * @param {string} collective
   * @param {string} chain_act
   * @param {any} tips
   * @returns {string[]}
   */
  agreementsLineUnheld(specs, collective, chain_act, tips) {
    const ptr0 = passStringToWasm0(collective, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(chain_act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsLineUnheld(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, tips);
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
   * open obligations, each `{ payment, to, unit, value, stillBroken }`.
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
   * attempts to reach homes, shown as unknown (F153).
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
   * Payer-side splitting (F124 P2): what a paying wallet reading Agreements pays
   * each holder for `amount` on the stake in `object` (hex, or null for
   * the collective itself), or why it cannot. Leftovers by largest
   * remainder; a tied unit is the payer's to decide, at most one per tie
   * (Agreements rule 15a, F165, F168): this wallet gives it to the tied holder
   * with the smallest identity hash, a choice, not a rule.
   * @param {any} specs
   * @param {string} agreement
   * @param {string | null | undefined} object
   * @param {bigint} amount
   * @returns {any}
   */
  agreementsPayerSplit(specs, agreement, object, amount) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(object) ? 0 : passStringToWasm0(object, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPayerSplit(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, amount);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
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
   * A payment for a work, judged (F126, F127 W2, F128 W4): "purchase",
   * "no-purchase" (a refund owed to the payer, with why), or "unrecorded"
   * (on a request rail, a collective seller's actions chain has not
   * recorded it yet; on a push rail (`specs.pushRails`), a holder has not
   * signed its receipt yet, or receipts of one payment name different
   * claims and the rail has not shown which the payment committed to),
   * or "wrong-receipt" (F131 IT3: a receipt `specs.railInvalid` names,
   * whose claim the payment did not commit to; it counts for nothing);
   * null where the payment is not for a work.
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
   * @param {string} agreement
   * @param {bigint} stake
   * @param {string[]} holders
   * @param {string | null} [previous]
   * @returns {Float64Array | undefined}
   */
  agreementsSplitTurns(specs, service, agreement, stake, holders2, previous) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(holders2, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    var ptr3 = isLikeNone(previous) ? 0 : passStringToWasm0(previous, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len3 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsSplitTurns(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, stake, ptr2, len2, ptr3, len3);
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
   * `specs.railValid` names the claims whose rail the client checked:
   * a sale is read only from a buyer's own claim with the rail's answer.
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
  foundAtHome(act, home) {
    const ptr0 = passStringToWasm0(act, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(home, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
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
function agreementsClonePlan(parent, clone, specs) {
  const ptr0 = passArray8ToWasm0(parent, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(clone, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.agreementsClonePlan(ptr0, len0, ptr1, len1, specs);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function anchoringCheckTicket(offer_act, ticket, commitment, leaf, now4) {
  const ptr0 = passArray8ToWasm0(offer_act, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(ticket, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ptr2 = passArray8ToWasm0(commitment, wasm.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN;
  const ptr3 = passStringToWasm0(leaf, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len3 = WASM_VECTOR_LEN;
  const ret = wasm.anchoringCheckTicket(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, now4);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  let v5;
  if (ret[0] !== 0) {
    v5 = getStringFromWasm0(ret[0], ret[1]);
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  }
  return v5;
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
function anchoringReadOffer(act) {
  const ptr0 = passArray8ToWasm0(act, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.anchoringReadOffer(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function anchoringReadTicket(payload) {
  const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.anchoringReadTicket(ptr0, len0);
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
function commitmentCbor(input) {
  const ret = wasm.commitmentCbor(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
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
function lightningAddress(input) {
  const ret = wasm.lightningAddress(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function lightningInvoice(invoice) {
  const ptr0 = passStringToWasm0(invoice, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.lightningInvoice(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function lightningProof(invoice, preimage) {
  const ptr0 = passStringToWasm0(invoice, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(preimage) ? 0 : passArray8ToWasm0(preimage, wasm.__wbindgen_malloc);
  var len1 = WASM_VECTOR_LEN;
  const ret = wasm.lightningProof(ptr0, len0, ptr1, len1);
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
function moneyPayload(input) {
  const ret = wasm.moneyPayload(input);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function moneyRead(type_, payload) {
  const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.moneyRead(type_, ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
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
function nfc(s) {
  let deferred2_0;
  let deferred2_1;
  try {
    const ptr0 = passStringToWasm0(s, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.nfc(ptr0, len0);
    deferred2_0 = ret[0];
    deferred2_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}
function onchainAddress(input) {
  const ret = wasm.onchainAddress(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function onchainKey(secret) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.onchainKey(ptr0, len0);
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
function onchainPayTo(address, commitment) {
  const ptr0 = passArray8ToWasm0(address, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passStringToWasm0(commitment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.onchainPayTo(ptr0, len0, ptr1, len1);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function onchainProof(input) {
  const ret = wasm.onchainProof(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function onchainRequest(secret, commitment, confirmations) {
  const ptr0 = passArray8ToWasm0(secret, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passStringToWasm0(commitment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.onchainRequest(ptr0, len0, ptr1, len1, isLikeNone(confirmations) ? Number.MAX_SAFE_INTEGER : confirmations >>> 0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v3;
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
function openWithKey(act, key) {
  const ptr0 = passArray8ToWasm0(act, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.openWithKey(ptr0, len0, ptr1, len1);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function paymentCommitment(input) {
  let deferred2_0;
  let deferred2_1;
  try {
    const ret = wasm.paymentCommitment(input);
    var ptr1 = ret[0];
    var len1 = ret[1];
    if (ret[3]) {
      ptr1 = 0;
      len1 = 0;
      throw takeFromExternrefTable0(ret[2]);
    }
    deferred2_0 = ptr1;
    deferred2_1 = len1;
    return getStringFromWasm0(ptr1, len1);
  } finally {
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}
function paymentProof(input) {
  const ret = wasm.paymentProof(input);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
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
function railCheck(module2, commitment, amount, address, rail_proof, chain) {
  const ptr0 = passStringToWasm0(module2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passStringToWasm0(commitment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  const ptr2 = passArray8ToWasm0(address, wasm.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN;
  const ptr3 = passArray8ToWasm0(rail_proof, wasm.__wbindgen_malloc);
  const len3 = WASM_VECTOR_LEN;
  const ret = wasm.railCheck(ptr0, len0, ptr1, len1, amount, ptr2, len2, ptr3, len3, chain);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function randomBytes(n) {
  const ret = wasm.randomBytes(n);
  var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v1;
}
function readCommitment(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.readCommitment(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
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
function readLightningAddress(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.readLightningAddress(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function readOnchainAddress(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.readOnchainAddress(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function readPaymentProof(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.readPaymentProof(ptr0, len0);
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
function resignationPayload(agreement, area, drafts) {
  const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  var ptr1 = isLikeNone(drafts) ? 0 : passArrayJsValueToWasm0(drafts, wasm.__wbindgen_malloc);
  var len1 = WASM_VECTOR_LEN;
  const ret = wasm.resignationPayload(ptr0, len0, isLikeNone(area) ? Number.MAX_SAFE_INTEGER : area >>> 0, ptr1, len1);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v3;
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
function shareOnPaper(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.shareOnPaper(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function signaturePayload(signed) {
  const ptr0 = passStringToWasm0(signed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.signaturePayload(ptr0, len0);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v2;
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
function vowContestPayload(vow, sale, promise) {
  const ptr0 = passStringToWasm0(vow, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passStringToWasm0(sale, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  var ptr2 = isLikeNone(promise) ? 0 : passStringToWasm0(promise, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len2 = WASM_VECTOR_LEN;
  const ret = wasm.vowContestPayload(ptr0, len0, ptr1, len1, ptr2, len2);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v4 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v4;
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
var atitle = (title2) => title2 ? `"${title2}" ` : "";
function anumber(n, title2 = "") {
  if (typeof n !== "number")
    throw new TypeError(atitle(title2) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0)
    throw new RangeError(atitle(title2) + "expected integer >= 0, got " + n);
  return n;
}
function abytes(value, length, title2 = "") {
  if (isBytes(value) && (length === void 0 || value.length === length))
    return value;
  if (length !== void 0)
    anumber(length, "length");
  const bytes = isBytes(value);
  const ofLen = length !== void 0 ? ` of length ${length}` : "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message7 = atitle(title2) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message7);
  throw new RangeError(message7);
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
function checkOpts(defaults, opts, title2 = "opts") {
  aopts(defaults, "defaults");
  if (opts !== void 0)
    aopts(opts, title2);
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
    const { A: A2, B, C, D, E, F, G, H } = this;
    return [A2, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A2, B, C, D, E, F, G, H) {
    this.A = A2 | 0;
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
    let { A: A2, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A2, 2) ^ rotr(A2, 13) ^ rotr(A2, 22);
      const T2 = sigma0 + Maj(A2, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A2;
      A2 = T1 + T2 | 0;
    }
    A2 = A2 + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A2, B, C, D, E, F, G, H);
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
  constructor(code, reason, acts = [], status = 0) {
    super(`relay error ${code}: ${reason}`);
    this.code = code;
    this.reason = reason;
    this.acts = acts;
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
  constructor(base, via2 = base) {
    this.base = base;
    this.via = via2;
  }
  async call(path, init) {
    const r = await fetch(this.via.replace(/\/$/, "") + path, init);
    const body = new Uint8Array(await r.arrayBuffer());
    if (!r.ok) {
      let code = -1;
      let reason = `HTTP ${r.status}`;
      let acts = [];
      try {
        const e3 = cborDecode(body);
        code = e3.get(0);
        reason = e3.get(1) ?? reason;
        acts = bytesList(e3.get(2));
      } catch {
      }
      throw new RelayError(code, reason, acts, r.status);
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
var relayAt = (hint, via2 = {}) => new Relay(hint, via2[hint] ?? hint);

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
  const words2 = d.spec === specs.identity ? IDENTITY_WORDS[d.type] : d.spec === specs.envelopes ? ENVELOPES_WORDS[d.type] : d.spec === specs.text ? d.type === 0 ? "a text, such as a post or a message" : void 0 : d.spec === specs.money ? MONEY_WORDS[d.type] : d.spec === specs.agreements ? AGREEMENTS_WORDS[d.type] : void 0;
  const w = words2 ?? `an act of type ${d.type} under ${d.spec === specs.identity ? "Identity" : d.spec === specs.envelopes ? "Envelopes" : d.spec === specs.money ? "Money" : d.spec === specs.agreements ? "Agreements" : "another specification"}`;
  return d.public ? w : `${w}, private`;
}
function ownLine(sequence) {
  if (!sequence.length) return { acts: 0, card: null };
  return { acts: sequence.length, card: { act: sequence[sequence.length - 1], position: sequence.length, summary: runningSummary(sequence) } };
}
async function actsBy(signer, hints, via2 = {}) {
  const out = /* @__PURE__ */ new Map();
  for (const hint of hints) {
    try {
      let after;
      for (; ; ) {
        const page = await relayAt(hint, via2).feed({ signer, after });
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
  const named = /* @__PURE__ */ new Set();
  for (const id of [...held.keys(), ...ownPrev.keys()]) {
    const p = prevOf(id);
    if (p.prev) named.add(p.prev);
  }
  const ownTips = new Set(owns.map((line) => line[line.length - 1]));
  const tips = [...held.values()].filter((d) => !named.has(d.id) && d.binding === o.binding).map((d) => d.id);
  for (const t of ownTips) if (!tips.includes(t) && !named.has(t)) tips.push(t);
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
  const cards2 = o.cards ?? [];
  for (const t of leaveOut) if (!lines2.some((l) => l.tip === t)) throw new Error(`no line found ends at ${t}: nothing to leave out`);
  for (const c of cards2) {
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
  for (const c of cards2) {
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
  const counts = o.unplaced && cards2.length && cards2.every((c) => c.hidden !== void 0) ? cards2.reduce((n, c) => n + c.hidden, 0) : null;
  const covered = counts !== null && counts === o.unplaced.length && !unplacedSay.length;
  const unread = [];
  for (const l of lines2) {
    const card2 = cards2.find((c) => c.act === l.tip) ?? l.card;
    const given = cards2.find((c) => c.act === l.tip);
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
  for (const c of cards2) {
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
function cannotReach(hint, via2 = {}) {
  if (via2[hint]) return null;
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
async function firstOf(items, ask2, failed) {
  if (!items.length) return null;
  return new Promise((resolve) => {
    let left = items.length;
    let done = false;
    for (const x of items) {
      ask2(x).then(
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
async function lookUp(identity, hints, via2 = {}, into) {
  const v = into ?? new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const asked = /* @__PURE__ */ new Set();
  const unreachable = [];
  const notTried = [];
  const operatorActs = /* @__PURE__ */ new Map();
  const heldBytes = /* @__PURE__ */ new Map();
  const keep2 = (acts) => {
    for (const a of acts) {
      try {
        heldBytes.set(actId(a), a);
        v.add(a);
      } catch {
      }
    }
  };
  const tryable = (hint) => {
    const why = cannotReach(hint, via2);
    if (!why) return true;
    if (!notTried.some((n) => n.hint === hint)) notTried.push({ hint, why });
    return false;
  };
  const failed = (hint) => {
    if (!unreachable.includes(hint)) unreachable.push(hint);
  };
  const genesis = await firstOf(hints.filter(tryable), (h) => relayAt(h, via2).getAct(identity), failed);
  if (!genesis) throw new Error(`the genesis of ${identity} was not found at ${hints.join(", ")}`);
  keep2([genesis]);
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
    const rec = await relayAt(h.hint, via2).identity(identity);
    keep2([...rec.chain, ...rec.receipts, ...rec.routes, ...rec.encryptionKeys, ...rec.evidence, ...rec.otherReceipts]);
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
      const r2 = relayAt(hint, via2);
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
    keep2(got);
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
      const named = homelessHomes();
      fresh = named.filter((h) => !asked.has(h.hint));
      if (!fresh.length) break;
      for (const h of fresh) asked.add(h.hint);
      await Promise.all(fresh.filter((h) => tryable(h.hint)).map((h) => record2(h).catch(() => failed(h.hint))));
      const ops2 = [...new Set(named.map((h) => h.operator).filter((o) => !!o && o !== identity && !operatorActs.has(o)))];
      await Promise.all(ops2.map((op) => operatorChain(op, named.filter((h) => h.operator === op).map((h) => h.hint))));
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
var refAct = (r) => typeof r === "string" ? r : r[0];
var refSigner = (r) => typeof r === "string" ? null : r[1];
function referenceTo(act) {
  const d = describeAct(act);
  return d.public ? [d.id, d.signer ?? d.id] : d.id;
}
async function chainOf(identity, hints, via2 = {}) {
  const l = await lookUp(identity, hints, via2);
  const r = l.resolution;
  const homes = [...new Set([...r.homesAt?.length ? r.homesAt[r.homesAt.length - 1] : r.homes, ...r.homes].map((h) => h.hint))].filter((h) => !cannotReach(h, via2));
  const chain = await firstOf(homes, async (h) => {
    const rec = await relayAt(h, via2).identity(identity);
    return rec.chain.length && actId(rec.chain[0]) === identity ? rec.chain : null;
  });
  if (!chain) throw new Error(`no home of ${identity} served its identity chain (${homes.join(", ") || "none reachable"})`);
  return chain;
}
async function followRef(r, hints, via2 = {}) {
  const id = refAct(r);
  const named = refSigner(r);
  const notTried = [];
  const check = (act) => {
    const d = describeAct(act);
    if (d.id !== id) throw new Error(`the act fetched is ${d.id}, not ${id}`);
    const actual = d.signer ?? d.id;
    if (named && actual !== named) throw new Error(`the reference names ${named} as the signer of ${id}, but the act shows ${actual}: the reference is wrong`);
    return act;
  };
  const tryable = (hint) => {
    const why = cannotReach(hint, via2);
    if (why && !notTried.some((n) => n.hint === hint)) notTried.push({ hint, why });
    return !why;
  };
  const fetchFrom = async (places2) => {
    let at = "";
    const act = await firstOf(places2.filter(tryable), async (h) => {
      const a = await relayAt(h, via2).getAct(id);
      if (a && !at) at = h;
      return a;
    });
    return act ? { act: check(act), at } : null;
  };
  const here = await fetchFrom(hints);
  if (here) return { ...here, how: "asked", notTried };
  if (!named) throw new Error(`the act ${id} was not found at ${hints.join(", ")}, and the reference names no signer to look by`);
  let l;
  try {
    l = await lookUp(named, hints, via2);
  } catch (e3) {
    throw new Error(`the act ${id} was not found at ${hints.join(", ")}, and its signer ${named} could not be looked up there: ${e3 instanceof Error ? e3.message : e3}`);
  }
  for (const n of l.notTried) if (!notTried.some((x) => x.hint === n.hint)) notTried.push(n);
  const places = l.verifier.places(named).filter((p) => !hints.includes(p));
  const outbox = new Set(l.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints.map((h) => h.replace(/\/$/, ""))));
  const there = await fetchFrom(places.filter((p) => outbox.has(p))) ?? await fetchFrom(places.filter((p) => !outbox.has(p)));
  if (there) return { ...there, how: "signer", notTried };
  throw new Error(`the act ${id} was not found at ${hints.join(", ")}, nor at its signer's routes and homes (${places.join(", ") || "none found"})`);
}
async function holdSequence(v, signer, l, places, via2 = {}) {
  if (l.resolution.links.length < 2) return;
  const homes = (l.resolution.homes ?? []).map((h) => h.hint);
  const hints = [.../* @__PURE__ */ new Set([...homes, ...places])].filter((h) => !cannotReach(h, via2));
  for (const a of await actsBy(signer, hints, via2)) {
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
var AGREEMENTS_RECORD = 17;
var b64 = (b) => base64(b);
var unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
var TestIdentity = class _TestIdentity {
  constructor(f, via2 = {}) {
    this.f = f;
    this.via = via2;
  }
  /** Where this file holds no signing key: who signs for it (the Dubsar runner cMIP). Never saved with the file. */
  signer;
  get id() {
    return this.f.identity;
  }
  // ------------------------------------------------------------ files
  static load(path, via2 = {}) {
    const f = JSON.parse(readFileSync(path, "utf8"));
    if (f.label !== TEST_LABEL) throw new Error(`${path} is not a MOR test identity file`);
    return new _TestIdentity(f, via2);
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
    const isRecord = spec === MIRS.agreements && type === AGREEMENTS_RECORD;
    if (this.f.cites && spec !== SPECS.identity && !isRecord && !objects?.some((o) => o[0] === this.f.identity)) {
      objects = [...objects ?? [], ...this.f.cites.map((d) => [this.f.identity, d])];
    }
    return objects;
  }
  /** After an act is made: on its line, waiting for the homes if private, a record cited next. */
  everydayMade(spec, type, isPublic, line, made) {
    line.push(made.id);
    if (!isPublic && !this.f.cites) (this.f.unsent ??= {})[made.id] = { act: b64(made.act), key: b64(made.key) };
    if (this.f.cites && spec === MIRS.agreements && type === AGREEMENTS_RECORD) this.f.cites = [made.id];
    return made;
  }
  everyday(spec, type, payload, opts) {
    if (!this.f.signingSecret) throw new Error(HELD_ELSEWHERE_SAY);
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
      acks: opts.acks
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
  async witness(acts, opts) {
    if (opts.shown !== WITNESS_EXPLANATION) {
      throw new Error("a witness act is signed only after the owner was shown what it does (Identity rule 18c)");
    }
    if (!acts.length) throw new Error("a witness act names at least one act");
    if (acts.some((a) => ownIds(this.f).includes(a))) throw new Error("a witness act names other identities' acts, not this one's");
    const made = await this.everydayNow(SPECS.identity, IDENTITY_TYPES.witness, cborEncode(/* @__PURE__ */ new Map()), { public: true, acks: acts });
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
    const acts = q.supports.flat();
    const tryOn = async (ref, on) => {
      const a = ref && anchoring.find((x) => sameRef(x.reference, ref));
      if (!a) return null;
      try {
        const out = [];
        for (const act of acts) out.push({ act, on, proof: await a.anchor(act) });
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
      acks: opts.acks
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
async function receive(sealed, me, secrets, senderHints, via2 = {}) {
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
        const them = await lookUp(d.signer, senderHints, via2);
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
function failure(home, e3) {
  if (e3 instanceof RelayError) return { home, error: e3.reason, code: e3.code };
  return { home, error: String(e3) };
}

// ../genesis/src/private.ts
var unb642 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
function ownKey(me) {
  const e3 = me.f.encryption[me.f.encryption.length - 1];
  if (!e3) return null;
  return e3.secret ? xwingPublic(unhex(e3.secret)) : e3.public ? unhex(e3.public) : null;
}
async function leaveAtHomes(me, made, o = {}) {
  const via2 = o.via ?? me.via;
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
      await relayAt(h.hint, via2).putAct(made.act);
      if (copy2) await relayAt(h.hint, via2).putSealed(copy2.sealed, copy2.tags);
      took.push(h.hint);
    } catch {
    }
  }
  if (took.length && (o.sealed || o.lockedOnly || copy2) && me.f.unsent?.[made.id]) delete me.f.unsent[made.id];
  return took;
}
async function sendWaiting(me, via2 = me.via) {
  for (const [id, x] of Object.entries(me.f.unsent ?? {})) {
    await leaveAtHomes(me, { id, act: unb642(x.act), key: unb642(x.key) }, { via: via2 });
  }
  return Object.keys(me.f.unsent ?? {}).length;
}
function linesHeld(f) {
  if (!f.split) return f.sequence.length ? [{ ids: f.sequence }] : [];
  return [["public", f.sequence], ["private", f.private ?? []], ["earlier", f.earlier ?? []]].filter(([, ids]) => ids.length).map(([kind, ids]) => ({ kind, ids }));
}
async function lineAtHomes(me, app2, via2 = me.via) {
  const lines2 = linesHeld(me.f).map((l) => ({ ...l, card: ownLine(l.ids).card }));
  const acts = lines2.reduce((n, l) => n + l.ids.length, 0);
  const shown = (l) => ({ acts, latest: l?.card.act ?? null, summary: l?.card.summary ?? null });
  const first = lines2.find((l) => l.kind === "private") ?? lines2[0];
  if (!lines2.length) return { ...shown(), atHomes: null, missing: 0, hidden: 0, card: null };
  const homes = me.f.homes.map((h) => h.hint);
  let places = homes;
  try {
    const look = await lookUp(me.f.identity, homes, via2);
    places = [.../* @__PURE__ */ new Set([...homes, ...look.resolution.homes.map((h) => h.hint), ...look.routes.routes.flatMap((x) => x.hints)])];
  } catch {
  }
  const found = await actsBy(me.f.identity, places, via2);
  if (!found.length) return { ...shown(first), atHomes: null, missing: 0, hidden: null, card: null };
  const held = new Set(found.map((a) => describeAct(a).id));
  const u2 = new Set(unplaced({ identity: me.f.identity, binding: me.f.binding, acts: found }));
  const cards2 = lines2.map((l) => {
    const missing = l.ids.filter((id) => !held.has(id)).length;
    const card2 = { ...l.card, hidden: l.ids.filter((id) => u2.has(id)).length, ...l.kind ? { line: l.kind } : {}, ...missing ? { missing } : {} };
    return { l, card: card2, missing, atHomes: held.has(l.card.act) };
  });
  const away = cards2.find((c) => !c.atHomes);
  return {
    ...shown(away?.l ?? first),
    atHomes: !away,
    missing: cards2.reduce((n, c) => n + c.missing, 0),
    hidden: cards2.reduce((n, c) => n + c.card.hidden, 0),
    card: away ? null : cards2.map((c) => cardText(c.card, app2)).join("; ")
  };
}
async function ownActs(identity, secrets, places, via2 = {}) {
  const out = /* @__PURE__ */ new Map();
  const locked = /* @__PURE__ */ new Map();
  for (const a of await actsBy(identity, places, via2)) {
    const d = describeAct(a);
    if (d.public) out.set(d.id, { act: a });
    else locked.set(d.id, a);
  }
  const delivered = /* @__PURE__ */ new Map();
  if (!secrets.length) return [...out.values()];
  const queries = [{ q: { to: identity }, me: identity }, ...secrets.map((s) => ({ q: { pickup: pickupTag(xwingPublic(s)) } }))];
  for (const h of places) {
    for (const { q, me } of queries) {
      let after;
      try {
        for (; ; ) {
          const page = await relayAt(h, via2).feed({ ...q, after });
          for (const it of page.items) {
            if (it.kind !== "sealed") continue;
            for (const s of secrets) {
              try {
                const o = openSealed(it.item, me, s);
                const d = o.described;
                if (d.signer !== identity) break;
                if (d.spec === SPECS.envelopes && d.type === ENVELOPES_TYPES.keyDelivery && d.payload) {
                  const k = readKeyDelivery(d.payload);
                  delivered.set(k.target, k.key);
                } else if (!out.has(d.id)) out.set(d.id, { act: o.act, key: o.key });
                break;
              } catch {
              }
            }
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
      }
    }
  }
  for (const [id, key] of delivered) if (!out.has(id) && locked.has(id)) out.set(id, { act: locked.get(id), key });
  return [...out.values()];
}
function lineReader(app2) {
  const seen = /* @__PURE__ */ new Map();
  return async (me, via2 = me.via) => {
    const latest = linesHeld(me.f).map((l) => l.ids[l.ids.length - 1]).join(" ") || null;
    const was = seen.get(me.f.identity);
    const waiting = Object.keys(me.f.unsent ?? {}).length > 0;
    if (was && was.latest === latest && !waiting && was.line.atHomes && Date.now() - was.at < 6e4) return was.line;
    const line = await lineAtHomes(me, app2, via2);
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

// ../../modules/jpeg/src/jpeg.ts
var NotJpeg = class extends Error {
};
var CARRIED_WORDS = {
  exif: "camera data (Exif)",
  location: "the place the picture was taken (GPS)",
  "exif-thumbnail": "a small preview picture (Exif)",
  xmp: "descriptive data (XMP)",
  iptc: "captions and credits (IPTC)",
  comment: "a comment",
  "jfif-thumbnail": "a small preview picture (JFIF)",
  "jfxx-thumbnail": "a small preview picture (JFXX)",
  "multi-picture": "further pictures (multi-picture format)",
  "bytes-after-end": "bytes after the end of the picture",
  "other-application-data": "other application data"
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
    const list8 = [];
    for (let k = 0; k < n; k++) {
      const at = o + 2 + 12 * k;
      list8.push({ tag: r16(at), type: r16(at + 2), count: r32(at + 4), at: at + 8 });
    }
    return { list: list8, next: r32(o + 2 + 12 * n) };
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
  constructor(kind, message7) {
    super(message7);
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
var CARRIED_WORDS2 = {
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
var one = (list8, type, where) => {
  const f = list8.filter((b) => b.type === type);
  if (f.length !== 1) throw new NotFilm("structure", `${where} has ${f.length ? "more than one" : "no"} ${JSON.stringify(type)}`);
  return f[0];
};
var maybe = (list8, type, where) => {
  const f = list8.filter((b) => b.type === type);
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
  const profile2 = s.u(8);
  s.u(8);
  const level = s.u(8);
  s.ue();
  if ([100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135].includes(profile2)) {
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
  return { profile: profile2, level, width, height };
}
function readAvcC(r, box2) {
  const b = r.b;
  r.need(box2.body, 6, box2.end, "the H.264 configuration");
  if (b[box2.body] !== 1) throw new NotFilm("structure", "the H.264 configuration is not version 1");
  const profile2 = b[box2.body + 1];
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
  if (sps.profile !== profile2 || sps.level !== level) throw new NotFilm("structure", "the H.264 configuration and its parameter set disagree");
  return { profile: profile2, compat, level, width: sps.width, height: sps.height };
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
  const named = hdlr.end - (hdlr.body + 24) > 1 || hdlr.end > hdlr.body + 24 && r.b[hdlr.body + 24] !== 0;
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
  const t = { handler, timescale, mediaDuration: 0, samples: 0, chunks: [], rotation, names: named };
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
    const count4 = r.u32(stts.o + 8 * i);
    timed += count4;
    t.mediaDuration += count4 * r.u32(stts.o + 8 * i + 4);
  }
  const stsz = one(sk, "stsz", "a sample table");
  r.need(stsz.body, 12, stsz.end, "the sample sizes");
  const fixed = r.u32(stsz.body + 4);
  const count3 = r.u32(stsz.body + 8);
  if (!fixed && count3 * 4 > stsz.end - (stsz.body + 12)) throw new NotFilm("structure", "the sample sizes run past their box");
  const sizeOf = (i) => fixed ? fixed : r.u32(stsz.body + 12 + 4 * i);
  if (count3 !== timed) throw new NotFilm("structure", "a track whose sample count and timing disagree");
  if (!count3) throw new NotFilm("structure", "a track with no samples");
  t.samples = count3;
  const ctts = maybe(sk, "ctts", "a sample table");
  if (ctts) {
    const c = table(r, ctts, 8);
    let n = 0;
    for (let i = 0; i < c.n; i++) n += r.u32(c.o + 8 * i);
    if (n !== count3) throw new NotFilm("structure", "a track whose composition offsets and samples disagree");
  }
  const stss = maybe(sk, "stss", "a sample table");
  if (stss) {
    const s = table(r, stss, 4);
    for (let i = 0; i < s.n; i++) {
      const k = r.u32(s.o + 4 * i);
      if (k < 1 || k > count3) throw new NotFilm("structure", "a key picture that is not a sample");
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
        if (sample >= count3) throw new NotFilm("structure", "chunks hold more samples than the track has");
        size += sizeOf(sample++);
      }
      t.chunks.push({ offset: offsets[c - 1], size });
    }
  }
  if (sample !== count3 || t.chunks.length !== co.n) throw new NotFilm("structure", "chunks and samples disagree");
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
  const short3 = Math.min(vv.width, vv.height);
  if (long > MAX_LONG_SIDE || short3 > MAX_SHORT_SIDE) throw new NotFilm("limits", `pictures of ${vv.width} x ${vv.height}, beyond ${MAX_LONG_SIDE} x ${MAX_SHORT_SIDE}`);
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
    carried: Object.keys(CARRIED_WORDS2).filter((c) => carried.has(c))
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
  const keep2 = (b) => bytes.subarray(b.start, b.end);
  const undated = (b) => {
    const out = bytes.slice(b.start, b.end);
    const d = dates(r, b, bytes[b.body]);
    out.fill(0, d.at - b.start, d.at - b.start + d.n);
    return out;
  };
  const drop = (list8) => list8.filter((b) => !(b.type in ASIDE) && b.type !== "iods");
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
      const track = p.tracks[ti];
      const parts = kids(trak).map((b) => {
        if (b.type === "tkhd") return undated(b);
        if (b.type !== "mdia") return b.type === "edts" ? box("edts", ...kids(b).map(keep2)) : keep2(b);
        return box(
          "mdia",
          ...kids(b).map((m) => {
            if (m.type === "hdlr") {
              const fixed = bytes.slice(m.body, m.body + 24);
              return box("hdlr", fixed, new Uint8Array(1));
            }
            if (m.type === "mdhd") return undated(m);
            if (m.type !== "minf") return keep2(m);
            return box(
              "minf",
              ...kids(m).filter((n) => n.type !== "hdlr").map((n) => {
                if (n.type === "dinf") return box("dinf", ...kids(n).map(keep2));
                if (n.type !== "stbl") return keep2(n);
                return box(
                  "stbl",
                  ...kids(n).map((s) => {
                    if (s.type === "stsd") {
                      const entry = r.boxes(s.body + 8, s.end)[0];
                      const head = bytes.slice(entry.body, entry.body + (track.handler === "vide" ? 78 : 28));
                      if (track.handler === "vide") head.fill(0, 42, 74);
                      const extras = kids(entry, head.length).map(keep2);
                      return box("stsd", bytes.subarray(s.body, s.body + 8), box(entry.type, head, ...extras));
                    }
                    if (s.type === "stco" || s.type === "co64") {
                      const w = s.type === "stco" ? 4 : 8;
                      const out = new Uint8Array(8 + w * track.chunks.length);
                      const dv = new DataView(out.buffer);
                      dv.setUint32(4, track.chunks.length);
                      track.chunks.forEach((c, i) => {
                        const o = mdatBody2 + placed.get(c);
                        if (w === 4) dv.setUint32(8 + 4 * i, o);
                        else {
                          dv.setUint32(8 + 8 * i, Math.floor(o / 2 ** 32));
                          dv.setUint32(12 + 8 * i, o % 2 ** 32);
                        }
                      });
                      return box(s.type, out);
                    }
                    return keep2(s);
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
  const ftyp = keep2(p.ftyp);
  const size = rebuild(0).length;
  const mdatBody = ftyp.length + size + 8;
  const moov = rebuild(mdatBody);
  const media = new Uint8Array(at);
  for (const c of all) media.set(bytes.subarray(c.offset, c.offset + c.size), placed.get(c));
  return concat2([ftyp, moov, box("mdat", media)]);
}

// ../longform/src/specs.ts
var test = (s) => sha2562(s);
var LONGFORM_SPECS = {
  /** The Text MIR (`TEXT`). */
  text: SPECS.text,
  /** The long-form text format cMIP (cmips/cmip-long-form-draft-1.md). */
  longform: test("long-form text format cMIP, draft 1, test value until publication")
};

// ../barebone/src/specs.ts
var test2 = (s) => sha2562(s);
var POST_SPECS = {
  /** The Text MIR (`TEXT`). */
  text: LONGFORM_SPECS.text,
  /** The Envelopes MIR (`ENVELOPES`). */
  envelopes: SPECS.envelopes,
  /** The long-form text format cMIP: a post naming it is rendered with it. */
  longform: LONGFORM_SPECS.longform,
  /** The JPEG Module (modules/module-jpeg-draft-1.md). */
  jpeg: test2("JPEG Module, draft 1, test value until publication"),
  /** The video Module (modules/module-video-draft-1.md): a film, named by its test value until publication, as the JPEG Module is. */
  video: test2("video Module, draft 1, test value until publication")
};
var TEXT_ACT = 0;
var PUBLICATION = 0;
var WITHDRAWAL = 3;

// ../barebone/src/corrections.ts
var CORRECTIONS_SPEC = sha2562("Corrections cMIP, draft 2, test value until publication");
var LONG_FORM_CORRECTION = sha2562("Long-form corrections cMIP, draft 1, test value until publication");
var isCorrectionFormat = (format) => format === CORRECTIONS_SPEC || format === LONG_FORM_CORRECTION;
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
function correctionOf(p) {
  if (!isCorrectionFormat(p.format)) return null;
  const r = p.refs[0];
  if (!r || r.kind !== "act" || !r.actSigner || r.actSigner !== p.signer) return null;
  return r.id;
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
  const made = await by.publish(POST_SPECS.envelopes, PUBLICATION, payload, { public: true, relays });
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
  const made = await by.publish(POST_SPECS.envelopes, PUBLICATION, payload, { public: true, relays });
  for (const hint of relays) await relayAt(hint, by.via).putMedia(l.locked);
  return { id: made.id, act: made.act, removed: s.removed, film, work: l.workHash, size: s.bytes.length };
}
async function post(by, opts) {
  const picture = opts.jpeg ? await publishPicture(by, opts.jpeg, opts.relays) : null;
  const film = opts.mp4 ? await publishVideo(by, opts.mp4, opts.relays) : null;
  await carryChain(by, opts.relays);
  const refs = [...opts.corrects ? [opts.corrects] : [], ...picture ? [referenceTo(picture.act)] : [], ...film ? [referenceTo(film.act)] : [], ...opts.refs ?? []];
  const corrected = opts.corrects && opts.format === void 0 ? await fetchAct(typeof opts.corrects === "string" ? opts.corrects : opts.corrects[0], opts.relays, {}) : null;
  const format = opts.format !== void 0 ? opts.format : opts.corrects ? correctionFormatFor(corrected ? formatOfPayload(describeAct(corrected).payload) : null) : null;
  const made = await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(opts.text, format), {
    public: true,
    relays: opts.relays,
    refs: refs.length ? refs : void 0,
    to: opts.to?.length ? opts.to : void 0
  });
  return { id: made.id, act: made.act, picture, film };
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
async function withdraw(by, publication, relays) {
  const made = await by.publish(POST_SPECS.envelopes, WITHDRAWAL, cborEncode(/* @__PURE__ */ new Map()), {
    public: true,
    relays,
    objects: [[publication, publication]]
  });
  return { id: made.id };
}
async function fetchAct(id, hints, via2) {
  return firstOf(hints.filter((h) => !cannotReach(h, via2)), (h) => relayAt(h, via2).getAct(id));
}
function describeChecked(act, id) {
  const d = describeAct(act);
  if (d.id !== id) throw new Error(`the relay answered with ${d.id}, not ${id}`);
  if (d.public && !d.payload) {
    openWithKey(act, new Uint8Array(32));
    throw new Error("the act does not open");
  }
  return d;
}
var Judge = class {
  constructor(hints, via2) {
    this.hints = hints;
    this.via = via2;
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
async function readPost(id, hints, via2 = {}, judging) {
  const act = await fetchAct(id, hints, via2);
  if (!act) throw new Error(`the act ${id} was not found at ${hints.join(", ")}`);
  const d = describeChecked(act, id);
  if (!d.public) throw new Error("the post is not public");
  if (d.spec !== POST_SPECS.text || d.type !== TEXT_ACT) throw new Error("the act is not a text act");
  if (!d.signer) throw new Error("the act has no signer");
  const p = cborDecode(d.payload);
  const text3 = p.get(0);
  if (typeof text3 !== "string") throw new Error("the text act has no text");
  const f = p.get(1);
  const judge2 = judging ?? new Judge(hints, via2);
  const standing2 = await judge2.standing(act, id, d.signer);
  const named = (d.refs ?? []).map((r, i) => d.refSigners?.[i] ? [r, d.refSigners[i]] : r);
  const refs = await Promise.all(named.map((r) => readRef(r, hints, via2, judge2)));
  return { id, signer: d.signer, standing: standing2, text: text3, format: f instanceof Uint8Array ? hex(f) : null, refs, notTried: judge2.notTried ?? [] };
}
async function readRef(r, hints, via2, judge2) {
  const id = typeof r === "string" ? r : r[0];
  const signer = typeof r === "string" ? void 0 : r[1];
  let act = null;
  try {
    const f = await followRef(r, hints, via2);
    act = f.act;
    if (judge2.notTried) {
      for (const n of f.notTried) if (!judge2.notTried.some((x) => x.hint === n.hint)) judge2.notTried.push(n);
    }
  } catch (e3) {
    const why = e3 instanceof Error ? e3.message : String(e3);
    if (/the reference is wrong/.test(why)) return { kind: "act", id, signer, what: why };
  }
  if (!act) return { kind: "act", id, signer, what: signer ? "not found at the relays asked, nor at its signer's routes and homes" : "not found at the relays asked" };
  let d;
  try {
    d = describeChecked(act, id);
  } catch (e3) {
    return { kind: "act", id, signer, what: `not a valid act: ${e3 instanceof Error ? e3.message : e3}` };
  }
  if (!d.public) return { kind: "act", id, signer, what: "a private act", actSigner: d.signer };
  if (d.spec === POST_SPECS.text && d.type === TEXT_ACT) return { kind: "act", id, signer, what: "a text act", actSigner: d.signer };
  if (d.spec !== POST_SPECS.envelopes || d.type !== PUBLICATION) return { kind: "act", id, signer, what: "an act of a specification this client does not implement", actSigner: d.signer };
  const media = cborDecode(d.payload).get(0);
  if (media instanceof Uint8Array && hex(media) === POST_SPECS.video) return readFilmRef(act, d, hints, via2, judge2);
  return readPicture(act, d, hints, via2, judge2);
}
async function readFilmRef(act, d, hints, via2, judge2) {
  const m = cborDecode(d.payload);
  const size = m.get(3);
  const out = { kind: "film", publication: d.id, signer: d.signer ?? "", standing: "unknown", problem: null, withdrawn: null, size: typeof size === "number" ? size : 0 };
  const no = (why) => (out.problem = why, out);
  if (!d.signer) return no("the publication has no signer");
  out.standing = await judge2.standing(act, d.id, d.signer);
  if (out.standing !== "valid") return no(`the publication is ${out.standing}, not valid, for its signer's identity chain`);
  if (!(m.get(5) instanceof Uint8Array)) return no("the film is locked: its key is not public");
  out.withdrawn = await findWithdrawal(d.id, d.signer, m.get(8), hints, via2, judge2);
  if (out.withdrawn) return no("withdrawn by its signer");
  return out;
}
async function filmBytes(publication, signer, hints, via2 = {}) {
  const act = signer ? (await followRef([publication, signer], hints, via2)).act : await fetchAct(publication, hints, via2);
  if (!act) throw new Error("the film\u2019s publication was not found");
  const d = describeChecked(act, publication);
  const m = cborDecode(d.payload);
  const spec = m.get(0);
  if (!(spec instanceof Uint8Array) || hex(spec) !== POST_SPECS.video) throw new Error("not a film");
  const work = m.get(1);
  const lockedHash = m.get(2);
  const size = m.get(3);
  const nonce = m.get(4);
  const key = m.get(5);
  if (!(key instanceof Uint8Array)) throw new Error("the film is locked: its key is not public");
  if (!(work instanceof Uint8Array) || !(lockedHash instanceof Uint8Array) || typeof size !== "number" || !(nonce instanceof Uint8Array)) throw new Error("the publication does not describe its media");
  const named = Array.isArray(m.get(6)) ? m.get(6).filter((x) => typeof x === "string") : [];
  const media = (places) => firstOf(places.filter((h) => !cannotReach(h, via2)), (h) => relayAt(h, via2).getMedia(hex(lockedHash)));
  const locked = await media(hints) ?? await media(named.filter((n) => !hints.includes(n)));
  if (!locked) throw new Error("its bytes were not found");
  let plain;
  try {
    plain = openMedia(locked, key, nonce);
  } catch {
    throw new Error("its key does not open its bytes");
  }
  if (workHash(plain) !== hex(work) || plain.length !== size) throw new Error("its bytes do not match the work hash and size it was published with");
  try {
    return { bytes: plain, film: read2(plain) };
  } catch (e3) {
    if (e3 instanceof NotFilm) throw new Error(`not a film the video Module plays: ${e3.message}`);
    throw e3;
  }
}
async function readPicture(act, d, hints, via2, judge2) {
  const out = {
    kind: "picture",
    publication: d.id,
    signer: d.signer ?? "",
    standing: "unknown",
    problem: null,
    withdrawn: null,
    bytes: null,
    picture: null
  };
  const no = (why) => (out.problem = why, out);
  if (!d.signer) return no("the publication has no signer");
  out.standing = await judge2.standing(act, d.id, d.signer);
  if (out.standing !== "valid") return no(`the publication is ${out.standing}, not valid, for its signer's identity chain`);
  const m = cborDecode(d.payload);
  const spec = m.get(0);
  if (!(spec instanceof Uint8Array) || hex(spec) !== POST_SPECS.jpeg) return no("media of a type this client does not implement");
  const work = m.get(1);
  const lockedHash = m.get(2);
  const size = m.get(3);
  const nonce = m.get(4);
  const key = m.get(5);
  if (!(key instanceof Uint8Array)) return no("the picture is locked: its key is not public");
  if (!(work instanceof Uint8Array) || !(lockedHash instanceof Uint8Array) || typeof size !== "number" || !(nonce instanceof Uint8Array)) {
    return no("the publication does not describe its media");
  }
  out.withdrawn = await findWithdrawal(d.id, d.signer, m.get(8), hints, via2, judge2);
  if (out.withdrawn) return no("withdrawn by its signer");
  const named = Array.isArray(m.get(6)) ? m.get(6).filter((x) => typeof x === "string") : [];
  const media = (places) => firstOf(places.filter((h) => !cannotReach(h, via2)), (h) => relayAt(h, via2).getMedia(hex(lockedHash)));
  const locked = await media(hints) ?? await media(named.filter((n) => !hints.includes(n)));
  if (!locked) return no("its bytes were not found");
  let plain;
  try {
    plain = openMedia(locked, key, nonce);
  } catch {
    return no("its key does not open its bytes");
  }
  if (workHash(plain) !== hex(work) || plain.length !== size) return no("its bytes do not match the work hash and size it was published with");
  try {
    out.picture = read(plain);
  } catch (e3) {
    if (e3 instanceof NotJpeg) return no(`not a JPEG this client reads: ${e3.message}`);
    throw e3;
  }
  out.bytes = plain;
  return out;
}
async function findWithdrawal(publication, signer, forId, hints, via2, judge2) {
  const who = [signer];
  if (forId instanceof Uint8Array) who.push(hex(forId));
  const search = async (h, s) => {
    let after;
    for (; ; ) {
      let page;
      try {
        page = await relayAt(h, via2).feed({ signer: s, after });
      } catch {
        return null;
      }
      for (const it of page.items) {
        if (it.kind !== "act") continue;
        let d;
        try {
          d = describeAct(it.item);
        } catch {
          continue;
        }
        if (d.spec !== POST_SPECS.envelopes || d.type !== WITHDRAWAL || !d.signer) continue;
        if (!(d.objects ?? []).some(([chain]) => chain === publication)) continue;
        if (await judge2.standing(it.item, d.id, d.signer) === "valid") return d.id;
      }
      if (!page.items.length || page.next === after) return null;
      after = page.next;
    }
  };
  const pairs = hints.filter((h) => !cannotReach(h, via2)).flatMap((h) => who.map((s) => [h, s]));
  return firstOf(pairs, ([h, s]) => search(h, s));
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
var test3 = (s) => sha2562(s);
var SITE_SPECS = {
  identity: SPECS.identity,
  /** The Envelopes MIR (`ENVELOPES`): a version is a publication. */
  envelopes: SPECS.envelopes,
  /** The Agreements MIR (`AGREEMENTS`): only to tell that a signer is a collective. */
  agreements: test3("LAW, test value until the freeze"),
  /** The website cMIP (cmips/cmip-website-draft-4.md). Draft 3 adds the icon
   * (rule 16a), draft 4 films (rules 4, 6a, 12a); both leave the manifest's
   * format as it was, so the test value stays draft 2's: versions already
   * published still verify. */
  site: test3("website cMIP, draft 2, test value until publication")
};
var SITE_AGREEMENTS_SPECS = { ...MIRS, agreements: SITE_SPECS.agreements };
var NUDGE = test3("nudge cMIP, draft 2, test value until publication");
var NUDGE_TYPES = { terms: 0, nudge: 1, pick: 2 };
var RELEASE_MANIFEST = test3("release manifest cMIP, draft 1, test value until publication");
var PAYMENT_CMIP = test3("payment cMIP, draft 2, test value until publication");

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
  const list8 = m.get(1);
  if (!Array.isArray(list8) || !list8.length) throw new NotAStamp("its acts (field 1) are not a list of at least one");
  if (list8.length > MOST_PER_STAMP) throw new NotAStamp(`it names more than ${MOST_PER_STAMP} acts`);
  const acts = list8.map((x, i) => {
    if (!(x instanceof Uint8Array) || x.length !== 32) throw new NotAStamp(`its act ${i + 1} is not an act id`);
    return hex(x);
  });
  if (new Set(acts).size !== acts.length) throw new NotAStamp("it names an act twice");
  return { time, acts };
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
function earliest(stamps) {
  const out = /* @__PURE__ */ new Map();
  for (const s of stamps) for (const a of s.acts) if (!out.has(a) || s.time < out.get(a)) out.set(a, s.time);
  return out;
}
function earliestByNames(acts, own) {
  const ids = new Set(acts.map((a) => a.id));
  const links = new Map(acts.map((a) => [a.id, a.links.filter((l) => ids.has(l) && l !== a.id)]));
  const out = /* @__PURE__ */ new Map();
  for (const [a, t] of own) if (ids.has(a)) out.set(a, t);
  const work = [...out.keys()];
  while (work.length) {
    const a = work.pop();
    const t = out.get(a);
    for (const n of links.get(a) ?? []) {
      if (!out.has(n) || t < out.get(n)) {
        out.set(n, t);
        work.push(n);
      }
    }
  }
  return out;
}
async function readStamps(clock, places, judge2, via2 = {}) {
  const seen = /* @__PURE__ */ new Map();
  for (const h of places) {
    let after;
    for (; ; ) {
      let page;
      try {
        page = await relayAt(h, via2).feed({ signer: clock, after });
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

// ../site/src/feed.ts
var FEED_LIMIT = 30;
var isPost = (d) => d.public && d.spec === POST_SPECS.text && d.type === TEXT_ACT;
var FeedJudge = class {
  constructor(places, via2) {
    this.places = places;
    this.via = via2;
  }
  v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  looked = /* @__PURE__ */ new Map();
  held = /* @__PURE__ */ new Map();
  /** The signer's chain and its sequence, held before one of its acts is judged (F298). */
  sequence(identity) {
    let h = this.held.get(identity);
    if (!h) {
      h = this.lookUp(identity).then((l) => holdSequence(this.v, identity, l, this.places, this.via));
      this.held.set(identity, h);
    }
    return h;
  }
  lookUp(identity, places = this.places) {
    let l = this.looked.get(identity);
    if (!l) {
      l = lookUp(identity, places, this.via, this.v);
      this.looked.set(identity, l);
    }
    return l;
  }
  async standing(act, id, signer) {
    await this.sequence(signer);
    this.v.add(act);
    return this.v.status(id);
  }
};
function placesFor(l, relays, scope = POST_SPECS.text) {
  const outbox = (l?.routes.routes ?? []).filter((r) => (r.kind ?? 0) === 0);
  const route = outbox.find((r) => r.scope === scope) ?? outbox.find((r) => r.scope === null);
  const asked = [];
  const unreachable = [];
  for (const h of route?.hints ?? []) {
    const a = relayAddress(h);
    if (a) {
      if (!asked.includes(a)) asked.push(a);
    } else if (!unreachable.includes(h)) unreachable.push(h);
  }
  for (const r of relays) if (!asked.includes(r)) asked.push(r);
  return { asked, unreachable };
}
async function actsBy2(signer, places, via2, into) {
  for (const h of places) {
    let after;
    for (; ; ) {
      let page;
      try {
        page = await relayAt(h, via2).feed({ signer, after });
      } catch {
        break;
      }
      for (const it of page.items) {
        if (it.kind !== "act") continue;
        let d;
        try {
          d = describeAct(it.item);
        } catch {
          continue;
        }
        if (d.signer !== signer || into.has(d.id)) continue;
        into.set(d.id, { d, act: it.item });
      }
      if (!page.items.length || page.next === after) break;
      after = page.next;
    }
  }
}
var linksOf = (d) => [
  ...d.prev ? [d.prev] : [],
  ...d.refs ?? [],
  ...(d.objects ?? []).flatMap(([chain, pred]) => [chain, pred]),
  ...d.acks ?? []
];
function signedOrder(acts, rank, times) {
  const ids = new Set(acts.map((d) => d.id));
  const byId = new Map(acts.map((d) => [d.id, d]));
  const waiting = new Map(acts.map((d) => [d.id, 0]));
  for (const d of acts) for (const n of new Set(linksOf(d))) if (ids.has(n) && n !== d.id) waiting.set(n, waiting.get(n) + 1);
  const key = (d) => [rank(d.signer), -(d.position ?? 0), d.id];
  const byTime = (a, b) => {
    if (!times) return 0;
    const [x, y] = [times.get(a.id), times.get(b.id)];
    if (x === void 0 || y === void 0) return x === y ? 0 : x === void 0 ? -1 : 1;
    return y - x;
  };
  const before = (a, b) => {
    const [x, y] = [key(a), key(b)];
    return byTime(a, b) || x[0] - y[0] || x[1] - y[1] || (x[2] < y[2] ? -1 : 1);
  };
  const free = acts.filter((d) => waiting.get(d.id) === 0);
  const out = [];
  while (free.length) {
    free.sort(before);
    const d = free.shift();
    out.push(d.id);
    for (const n of new Set(linksOf(d))) {
      if (!ids.has(n) || n === d.id) continue;
      const left = waiting.get(n) - 1;
      waiting.set(n, left);
      if (left === 0) free.push(byId.get(n));
    }
  }
  for (const d of acts.filter((x) => !out.includes(x.id)).sort(before)) out.push(d.id);
  return out.filter((id) => isPost(byId.get(id)));
}
async function readOne(id, signer, position, places, via2, judge2, lookupProblem) {
  const p = { id, signer, position, post: null, problem: null, answers: [] };
  if (lookupProblem) {
    p.problem = `its signer's identity chain could not be looked up: ${lookupProblem}`;
    return p;
  }
  try {
    p.post = await readPost(id, places, via2, judge2);
    if (p.post.standing !== "valid") p.problem = `its standing is \u201C${p.post.standing}\u201D, not valid`;
  } catch (err) {
    p.problem = err instanceof Error ? err.message : String(err);
  }
  return p;
}
async function causeOf(id, agent, named, places, via2, judge2, found) {
  let act = found.get(id)?.act ?? null;
  for (const h of act ? [] : places) {
    try {
      act = await relayAt(h, via2).getAct(id);
      if (act) break;
    } catch {
    }
  }
  if (!act) return null;
  let d;
  try {
    d = describeAct(act);
  } catch {
    return null;
  }
  if (d.id !== id || !d.public || !d.payload || !d.signer || d.spec !== NUDGE) return null;
  if (d.type !== NUDGE_TYPES.pick && d.type !== NUDGE_TYPES.nudge) return null;
  if (!named.has(d.signer)) return null;
  let m;
  try {
    m = cborDecode(d.payload);
  } catch {
    return null;
  }
  const f0 = m.get(0);
  if (!(f0 instanceof Uint8Array) || hex(f0) !== agent) return null;
  const f2 = m.get(2);
  const picked = d.type === NUDGE_TYPES.pick ? f2 instanceof Uint8Array ? hex(f2) : null : null;
  if (d.type === NUDGE_TYPES.pick && !picked) return null;
  if (d.type === NUDGE_TYPES.nudge && !(typeof f2 === "number" && f2 >= 1)) return null;
  if (await judge2.standing(act, id, d.signer) !== "valid") return null;
  return { type: d.type, signer: d.signer, picked };
}
var message = (err) => err instanceof Error ? err.message : String(err);
async function readFeed(authors, relays, via2 = {}, limit = FEED_LIMIT, clock = null) {
  const judge2 = new FeedJudge(relays, via2);
  const lines2 = [];
  const found = /* @__PURE__ */ new Map();
  const placesOf2 = /* @__PURE__ */ new Map();
  const problems = /* @__PURE__ */ new Map();
  await Promise.all(
    authors.map(async (a) => {
      let l = null;
      let problem = null;
      try {
        l = await judge2.lookUp(a.identity);
      } catch (err) {
        problem = message(err);
      }
      const { asked, unreachable } = placesFor(l, relays);
      lines2.push({ ...a, asked, unreachable, problem, found: 0, verified: 0 });
      placesOf2.set(a.identity, asked);
      if (problem) problems.set(a.identity, problem);
    })
  );
  lines2.sort((x, y) => authors.findIndex((a) => a.identity === x.identity) - authors.findIndex((a) => a.identity === y.identity));
  for (const a of authors) await actsBy2(a.identity, placesOf2.get(a.identity), via2, found);
  let clockLine2 = null;
  let times;
  if (clock) {
    let l = null;
    let problem = null;
    try {
      l = await judge2.lookUp(clock.identity);
    } catch (err) {
      problem = message(err);
    }
    const { asked, unreachable } = placesFor(l, relays, TIMESTAMP_SPEC);
    clockLine2 = { ...clock, asked, unreachable, problem, found: 0, verified: 0, placed: 0 };
    if (!problem) {
      const read3 = await readStamps(clock.identity, asked, judge2, via2);
      clockLine2.found = read3.found;
      clockLine2.verified = read3.verified.length;
      times = earliestByNames([...found.values()].map((x) => ({ id: x.d.id, links: linksOf(x.d) })), read3.earliest);
    }
  }
  const rank = (s) => authors.findIndex((a) => a.identity === s);
  const all = [...found.values()].map((x) => x.d);
  const placed = times ? all.filter((d) => isPost(d) && times.has(d.id)).length : 0;
  if (clockLine2) clockLine2.placed = placed;
  const byClock = placed > 0;
  const order = signedOrder(all, rank, byClock ? times : void 0);
  const shown = order.slice(0, limit);
  const posts = await Promise.all(
    shown.map(async (id) => {
      const { d } = found.get(id);
      const p = await readOne(id, d.signer, d.position ?? null, placesOf2.get(d.signer), via2, judge2, problems.get(d.signer) ?? null);
      if (byClock) p.time = times.get(id) ?? null;
      return p;
    })
  );
  const answered = /* @__PURE__ */ new Map();
  const byId = new Map(posts.map((p) => [p.id, p]));
  const everywhere = [...new Set([...placesOf2.values()].flat())];
  const named = new Set(authors.map((a) => a.identity));
  for (const p of posts) {
    if (!p.post || p.problem) continue;
    for (const ref of p.post.refs) {
      if (ref.kind !== "act") continue;
      const r = ref.id;
      if (answered.has(r)) {
        p.answers.push(r);
        continue;
      }
      const inFeed = byId.get(r);
      if (inFeed) {
        answered.set(r, inFeed);
        p.answers.push(r);
        continue;
      }
      let d = found.get(r)?.d ?? null;
      for (const h of d ? [] : everywhere) {
        try {
          const act = await relayAt(h, via2).getAct(r);
          if (act) {
            d = describeAct(act);
            if (d.id !== r) d = null;
            if (d) break;
          }
        } catch {
        }
      }
      if (!d) {
        if (ref.what !== "not found at the relays asked") continue;
        answered.set(r, { id: r, signer: "", position: null, post: null, problem: "not found at the places asked", answers: [] });
      } else if (!isPost(d) || !d.signer) {
        continue;
      } else if (!named.has(d.signer) && (d.to ?? []).some((t) => named.has(t))) {
        const n = await readOne(r, d.signer, d.position ?? null, everywhere, via2, judge2, null);
        n.note = true;
        answered.set(r, n);
      } else if (!named.has(d.signer)) {
        answered.set(r, { id: r, signer: d.signer, position: d.position ?? null, post: null, problem: null, answers: [] });
      } else {
        answered.set(r, await readOne(r, d.signer, d.position ?? null, everywhere, via2, judge2, problems.get(d.signer) ?? null));
      }
      p.answers.push(r);
    }
  }
  for (const p of posts) {
    const notes = p.answers.filter((r) => answered.get(r)?.note);
    if (!notes.length) continue;
    p.picked = new Map(notes.map((r) => [r, null]));
    const causes = p.post.refs.flatMap((x) => x.kind === "act" && !answered.has(x.id) ? [x.id] : []);
    let nudged = false;
    for (const c of causes) {
      const cause = await causeOf(c, p.signer, named, everywhere, via2, judge2, found);
      if (cause?.type === NUDGE_TYPES.pick && p.picked.has(cause.picked)) p.picked.set(cause.picked, cause.signer);
      if (cause?.type === NUDGE_TYPES.nudge) nudged = true;
    }
    if (nudged) {
      for (const [r, by] of p.picked) if (by === null) p.picked.set(r, p.signer);
    }
  }
  for (const p of posts) {
    if (!p.post || p.problem) continue;
    const c = correctionOf(p.post);
    if (!c) continue;
    p.corrects = c;
    const o = byId.get(c) ?? answered.get(c);
    if (o) o.correctedBy = [...o.correctedBy ?? [], p.id];
  }
  for (const line of lines2) {
    const mine = posts.filter((p) => p.signer === line.identity);
    line.found = order.filter((id) => found.get(id).d.signer === line.identity).length;
    line.verified = mine.filter((p) => !p.problem).length;
  }
  return { authors: lines2, posts, more: order.length - shown.length, answered, clock: clockLine2, order: byClock ? "clock" : "signed" };
}

// ../reader/src/link.ts
function makeLink(page, act, relays = []) {
  const base = page.replace(/#.*$/, "");
  const q = relays.length ? "?" + relays.map((r) => `r=${encodeURIComponent(r)}`).join("&") : "";
  return `${base}#${act}${q}`;
}

// ../longform/src/text.ts
var SPACE = "[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]";
var TRAILING = new RegExp(`${SPACE}+$`, "gmu");
var TRAILING_END = new RegExp(`(?:${SPACE}|
)+$`, "u");
var CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/gu;
var NONCHAR = /[\uFDD0-\uFDEF\uFFFE\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/gu;
function compose(raw) {
  const changes = [];
  let t = raw;
  const step = (next, what) => {
    if (next !== t) changes.push(what);
    t = next;
  };
  step(t.replace(/\r\n?|[\u2028\u2029]/g, "\n"), "line breaks converted to LF");
  step(t.replace(/\uFEFF/g, ""), "byte order marks removed");
  step(t.replace(/\t/g, "    "), "tabs replaced with four spaces");
  step(t.replace(CONTROL, ""), "control characters removed");
  step(t.replace(NONCHAR, ""), "noncharacters removed");
  step(nfc(t), "normalized to NFC");
  step(t.replace(TRAILING, ""), "trailing spaces removed");
  step(t.replace(TRAILING_END, ""), "final line breaks removed");
  return { text: t, changes };
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
  const words2 = typeof written === "string" ? splitWords(written) : written.map((w) => w.trim().toLowerCase());
  if (words2.length !== 24) throw new Refused(`${words2.length} words, not 24`);
  let bits = 0n;
  words2.forEach((w, i) => {
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
function threePositions(random) {
  const out = /* @__PURE__ */ new Set();
  while (out.size < 3) out.add(1 + random(24));
  return [...out].sort((a, b) => a - b);
}
function typedBack(words2, positions, typed) {
  return positions.length === 3 && typed.length === 3 && positions.every((p, i) => words2[p - 1] === (typed[i] ?? "").trim().toLowerCase());
}

// ../genesis/src/forms.ts
var form = (label, hex3) => formEncode(label, unhex(hex3));
var idForm = (id) => form("mid", id);
var actForm = (id) => form("mact", id);
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

// ../nudge/src/specs.ts
var NUDGE_SPECS = {
  /** The Text MIR (`TEXT`): an action is a text act. */
  text: SPECS.text,
  /** The nudge cMIP, draft 2. */
  nudge: sha2562("nudge cMIP, draft 2, test value until publication")
};
var NUDGE_TYPES2 = { terms: 0, nudge: 1, pick: 2 };

// ../nudge/src/nudge.ts
var Invalid = class extends Error {
};
function asMap(payload, what, fields) {
  let m;
  try {
    m = cborDecode(payload);
  } catch (e3) {
    throw new Invalid(`${what}: not CBOR (${e3 instanceof Error ? e3.message : e3})`);
  }
  if (!(m instanceof Map)) throw new Invalid(`${what}: not a map`);
  for (const k of m.keys()) if (!fields.includes(k)) throw new Invalid(`${what}: ${String(k)} is not one of its fields`);
  return m;
}
function hash(v, what) {
  if (!(v instanceof Uint8Array) || v.length !== 32) throw new Invalid(`${what} is not a hash`);
  return hex(v);
}
var count = (v) => typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : typeof v === "bigint" ? Number.MAX_SAFE_INTEGER : null;
function decodeNudge(payload) {
  const m = asMap(payload, "the nudge", [0, 1, 2, 3]);
  const n = { agent: hash(m.get(0), "the agent (field 0)"), terms: hash(m.get(1), "the terms (field 1)"), count: 0 };
  const c = count(m.get(2));
  if (c === null) throw new Invalid("the count (field 2) is not a whole number");
  if (c < 1) throw new Invalid("the count (field 2) is 0: a nudge allows at least one action (item 5)");
  n.count = c;
  if (m.has(3)) {
    const t = m.get(3);
    if (typeof t !== "string") throw new Invalid("the context (field 3) is not text");
    try {
      checkText(t);
    } catch (e3) {
      throw new Invalid(`the context (field 3): ${e3 instanceof Error ? e3.message : e3}`);
    }
    n.context = t;
  }
  return n;
}
function decodePick(payload) {
  const m = asMap(payload, "the pick", [0, 1, 2]);
  return { agent: hash(m.get(0), "the agent (field 0)"), terms: hash(m.get(1), "the terms (field 1)"), picked: hash(m.get(2), "the act picked (field 2)") };
}

// ../reader/src/read.ts
function standingWords(s) {
  switch (s) {
    case "valid":
      return { ok: true, words: "Verified: signed by this identity with a key its identity chain counts, checked in this browser." };
    case "pending":
      return { ok: false, words: "Not verified yet: the identity chain it rests on is waiting for its homes to confirm it." };
    case "disputed":
      return { ok: false, words: "Disputed: signed with a key the identity has since replaced; its owner did not keep it, but another identity acknowledged it or a keeper recorded it." };
    case "void":
      return { ok: false, words: "Void: signed with a key the identity has since replaced, and its owner did not keep it." };
    case "invalid":
      return { ok: false, words: "Invalid: the signature or the act does not check." };
    case "scoped":
      return { ok: false, words: "Signed with a grant key: a key of a collective scoped to one of its grants (Agreements, F128). Whether the grant backs it is Agreements' to say, and this reader does not judge Agreements." };
    default:
      return { ok: false, words: `Not verified (${s}): this browser could not establish who signed it.` };
  }
}

// ../repo/src/specs.ts
var test4 = (s) => createHash("sha256").update(s).digest("hex");
var REPO_SPECS = {
  /** The Agreements MIR (`AGREEMENTS`). */
  agreements: test4("LAW, test value until the freeze"),
  /** The release manifest cMIP (cmips/cmip-release-manifest-draft-1.md). */
  manifest: test4("release manifest cMIP, draft 1, test value until publication"),
  /** The payment cMIP: a Module under it must carry fields 11 and 13 (Development draft 10, F301). The core's test value. */
  payment: test4("payment cMIP, draft 2, test value until publication")
};
var AGREEMENTS_TYPES = {
  terms: 0,
  signature: 1,
  release: 5,
  offer: 6,
  split: 8,
  grant: 9,
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
var TEST_RAIL = test4("a test rail Module, no real rail");
var TEST_TIME = test4("a test time reference, no real clock");
var FOUNDING_AGREEMENT = 0;

// ../repo/src/agreements.ts
var AGREEMENTS_SPECS = { ...MIRS, agreements: REPO_SPECS.agreements, extLayers: { [REPO_SPECS.manifest]: [] } };
var SPLIT_CMIP = sha2562("split cMIP, draft 2, test value until publication");
function obligationPayload(o) {
  return cborEncode(
    /* @__PURE__ */ new Map([
      [0, unhex(o.debtor)],
      [1, unhex(o.creditor)],
      [2, [unhex(o.unit), o.value]],
      [3, unhex(o.pointer)]
    ])
  );
}
async function carryChain2(by, relays) {
  for (const hint of relays) {
    for (const a of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(a);
      } catch {
      }
    }
  }
}
async function latestPointerAct(by, relays) {
  const acts = /* @__PURE__ */ new Map();
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  for (const a of by.chainActs()) v.add(a);
  const found = /* @__PURE__ */ new Map();
  for (const h of relays) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, by.via).feed({ signer: by.id, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          try {
            const d = describeAct(it.item);
            if (d.spec !== MIRS.money || d.type !== MONEY_POINTER || !d.payload) continue;
            const m = cborDecode(d.payload);
            const payee = m.get(0);
            if (!(payee instanceof Uint8Array) || hex(payee) !== by.id) continue;
            const id = v.add(it.item);
            if (v.status(id) !== "valid") continue;
            const prev = m.get(2);
            found.set(id, { version: Number(m.get(1)), previous: prev instanceof Uint8Array ? hex(prev) : null });
            acts.set(id, it.item);
          } catch {
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  const firsts = [...found].filter(([, p2]) => p2.version === 1 && p2.previous === null);
  if (firsts.length !== 1) return null;
  let [at, p] = firsts[0];
  for (; ; ) {
    const next = [...found].filter(([, q]) => q.previous === at && q.version === p.version + 1);
    if (next.length !== 1) return { id: at, act: acts.get(at) };
    [at, p] = next[0];
  }
}
var MONEY_POINTER = 0;
async function sign(by, act, relays, key) {
  await carryChain2(by, relays);
  let refs;
  if (await canPaySigner(act, relays, by.via)) {
    const p = await latestPointerAct(by, relays);
    if (p) refs = [referenceTo(p.act)];
  }
  const payload = key ? cborEncode(/* @__PURE__ */ new Map([[0, unhex(act)], [1, [key[0], key[1]]]])) : signaturePayload(act);
  return by.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.signature, payload, {
    public: true,
    relays,
    objects: [[act, act]],
    refs
  });
}
async function canPaySigner(act, relays, via2) {
  for (const h of relays) {
    try {
      const a = await relayAt(h, via2).getAct(act);
      if (!a) continue;
      const d = describeAct(a);
      return d.spec === REPO_SPECS.agreements && (d.type === AGREEMENTS_TYPES.terms || d.type === AGREEMENTS_TYPES.offer);
    } catch {
    }
  }
  return false;
}
async function resign(by, agreement, relays, area, drafts) {
  await carryChain2(by, relays);
  return by.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.resignation, resignationPayload(agreement, area, drafts?.length ? drafts : void 0), {
    public: true,
    relays,
    objects: [[agreement, agreement]]
  });
}

// ../grants/src/limits.ts
var GRANT_LIMITS_SPEC = sha2562("Grant limits cMIP, draft 1, test value until publication");
var CLOCKS = { timestamp: TIMESTAMP_SPEC };
function encodeLimits(l) {
  if (!l.cap && !l.expiry) throw new Error("Limits name a cap, an expiry, or both.");
  const m = /* @__PURE__ */ new Map();
  if (l.cap) {
    if (!Number.isSafeInteger(l.cap.value) || l.cap.value < 0) throw new Error("The cap is a whole amount.");
    m.set(0, [unhex(l.cap.unit), l.cap.value]);
  }
  if (l.expiry) {
    if (l.expiry.clock === "timestamp") m.set(1, [unhex(CLOCKS.timestamp), unhex(l.expiry.identity), l.expiry.time]);
    else m.set(1, [unhex(l.expiry.spec), l.expiry.network, l.expiry.height]);
  }
  return cborEncode(m);
}
function limitsValue(l) {
  return cborDecode(encodeLimits(l));
}
var h32 = (v) => v instanceof Uint8Array && v.length === 32;
function readLimits(v) {
  if (!(v instanceof Map)) throw new Error("the limits are not a map");
  const m = v;
  for (const k of m.keys()) if (k !== 0 && k !== 1) throw new Error(`the limits carry a key this cMIP does not define (${k})`);
  if (!m.size) throw new Error("the limits name neither a cap nor an expiry");
  const out = {};
  if (m.has(0)) {
    const c = m.get(0);
    if (!Array.isArray(c) || c.length !== 2 || !h32(c[0]) || typeof c[1] !== "number" || c[1] < 0) throw new Error("the cap is not [unit, value]");
    out.cap = { unit: hex(c[0]), value: c[1] };
  }
  if (m.has(1)) {
    const e3 = m.get(1);
    if (!Array.isArray(e3) || e3.length !== 3 || !h32(e3[0]) || typeof e3[2] !== "number") throw new Error("the expiry is not [clock, reference, point]");
    if (hex(e3[0]) === CLOCKS.timestamp) {
      if (!h32(e3[1])) throw new Error("a timestamp clock is named by its identity");
      out.expiry = { clock: "timestamp", identity: hex(e3[1]), time: e3[2] };
    } else {
      if (typeof e3[1] !== "number") throw new Error("a Bitcoin clock is named by its network");
      out.expiry = { clock: "height", spec: hex(e3[0]), network: e3[1], height: e3[2] };
    }
  }
  return out;
}
var MESSAGES = { specs: [] };
function amountOf(act, moneySpec) {
  if (act.type === void 0 || !act.payload) return null;
  if (act.spec && MESSAGES.specs.includes(act.spec)) {
    try {
      const m = cborDecode(act.payload);
      const pair = (x) => Array.isArray(x) && x.length === 2 && x[0] instanceof Uint8Array ? { unit: hex(x[0]), value: Number(x[1]) } : null;
      if (act.type === 1) return pair(m.get(2));
      if (act.type === 2) return pair(m.get(0));
      if (act.type === 4) return pair(m.get(4));
      if (act.type !== 3) return null;
      const c = readCommitment(cborEncode(m.get(0)));
      return { unit: c.amount.unit, value: c.amount.value };
    } catch {
      return null;
    }
  }
  if (act.spec !== moneySpec) return null;
  try {
    const r = moneyRead(act.type, act.payload);
    return r.act.amount ? { unit: r.act.amount.unit, value: r.act.amount.value } : null;
  } catch {
    return null;
  }
}
function judge(l, act, moneySpec, places = {}) {
  if (l.cap) {
    const a = amountOf(act, moneySpec);
    if (a && a.unit !== l.cap.unit) return { within: false, why: `it moves an amount in another unit than the cap\u2019s (2.2): no conversion is assumed` };
    if (a && a.value > l.cap.value) return { within: false, why: `it moves ${a.value}, above the cap of ${l.cap.value} per act (2.2)` };
  }
  if (l.expiry) {
    if (l.expiry.clock === "timestamp") {
      const t = places.stamps?.get(l.expiry.identity)?.get(act.id);
      if (t === void 0) return { within: null, why: "no stamp of the clock the grant names places it yet: whether it came before the expiry is unknown (3.1)" };
      if (t > l.expiry.time) return { within: false, why: `the clock the grant names stamped it at ${new Date(t * 1e3).toISOString()}, past the expiry ${new Date(l.expiry.time * 1e3).toISOString()} (3.1)` };
    } else {
      const h = places.heights?.get(act.id);
      if (h === void 0) return { within: null, why: "no anchor placing it on the Bitcoin clock the grant names is checked here: unknown (3.2)" };
      if (h > l.expiry.height) return { within: false, why: `anchored at height ${h}, past the expiry at height ${l.expiry.height} (3.2)` };
    }
  }
  return { within: true };
}
function refuseBeforeSigning(l, act, moneySpec, nowSeconds) {
  if (!l) return null;
  if (l.cap) {
    const a = amountOf(act, moneySpec);
    if (a && a.unit !== l.cap.unit) return "The grant\u2019s cap is in another unit: an act moving this unit is outside it. Nothing was signed.";
    if (a && a.value > l.cap.value) return `${a.value} is above the grant\u2019s cap of ${l.cap.value} per act. Nothing was signed.`;
  }
  if (l.expiry?.clock === "timestamp" && nowSeconds > l.expiry.time) return `The grant expired on ${new Date(l.expiry.time * 1e3).toISOString().slice(0, 16).replace("T", " ")} UTC (this device\u2019s clock). Nothing was signed.`;
  return null;
}

// ../grants/src/grant.ts
var GRANTABLE = [
  { key: "posts", kind: { spec: SPECS.text, type: 0 }, words: "posts and messages (Text acts)" },
  { key: "publications", kind: { spec: SPECS.envelopes, type: 0 }, words: "publications, a picture among them (Envelopes)" },
  { key: "money", kind: { layer: 2 }, words: "money acts: promises to pay, claims and receipts (the Money layer)" }
];
var kindValue = (k) => "layer" in k ? [0, k.layer] : [1, unhex(k.spec), k.type];
function personGrantPayload(g) {
  const m = /* @__PURE__ */ new Map([
    [0, unhex(g.grantee)],
    [1, 2]
  ]);
  if (g.limits) {
    m.set(3, limitsValue(g.limits));
    m.set(4, unhex(GRANT_LIMITS_SPEC));
  }
  if (g.kinds?.length) m.set(6, g.kinds.map(kindValue));
  m.set(9, g.key);
  return cborEncode(m);
}
function readGrant(payload) {
  const m = cborDecode(payload);
  if (!(m instanceof Map)) throw new Error("not a grant");
  const grantee = m.get(0);
  if (!(grantee instanceof Uint8Array)) throw new Error("a grant names its grantee");
  const kinds = m.has(6) ? m.get(6).map((k) => {
    const a = k;
    return a[0] === 0 ? { layer: a[1] } : { spec: hex(a[1]), type: a[2] };
  }) : null;
  let limits = null;
  let limitsProblem = null;
  if (m.has(3) || m.has(4)) {
    const cmip = m.get(4);
    if (!(cmip instanceof Uint8Array) || hex(cmip) !== GRANT_LIMITS_SPEC) limitsProblem = "its limits are under a cMIP this app does not implement";
    else {
      try {
        limits = readLimits(m.get(3));
      } catch (e3) {
        limitsProblem = `its limits cannot be read: ${e3 instanceof Error ? e3.message : String(e3)}`;
      }
    }
  }
  const key = m.get(9);
  return { grantee: hex(grantee), scope: m.get(1), kinds, limits, limitsProblem, key: hex(key[1]) };
}
function kindWords(k) {
  const g = GRANTABLE.find((x) => JSON.stringify(x.kind) === JSON.stringify(k));
  if (g) return g.words;
  if ("layer" in k) return `every act of layer ${k.layer}`;
  return `acts of type ${k.type} of the specification ${k.spec.slice(0, 8)}\u2026`;
}
function grantInWords(g, grantor, names, unitName = (u2) => `units ${u2.slice(0, 8)}\u2026`) {
  const out = [`${names(grantor)} grants ${names(g.grantee)} authority to sign in ${names(grantor)}\u2019s name, with a key of ${names(g.grantee)}\u2019s own (Agreements rule 73; F128).`];
  out.push(g.kinds?.length ? `What it may sign: ${g.kinds.map(kindWords).join("; ")}.` : "What it may sign: every act but a decision (no grant, revocation or record).");
  if (g.limits?.cap) out.push(`How much one act may move: at most ${g.limits.cap.value} ${unitName(g.limits.cap.unit)} (the grant limits cMIP, 2).`);
  if (g.limits?.expiry?.clock === "timestamp") out.push(`Until: ${new Date(g.limits.expiry.time * 1e3).toISOString().slice(0, 16).replace("T", " ")} UTC, by the timestamp clock ${names(g.limits.expiry.identity)}; an act that clock has not stamped is unknown under the expiry (3.1).`);
  if (g.limits?.expiry?.clock === "height") out.push(`Until: block ${g.limits.expiry.height} on the Bitcoin clock (3.2).`);
  if (g.limitsProblem) out.push(`Its limits: ${g.limitsProblem}; its acts are unknown under them.`);
  out.push("Every act it signs this way is shown as signed under this grant, naming both. It never signs a grant, a revocation or a record; it ends with one revocation (rule 76).");
  out.push("Public: anyone who checks its acts reads the grant (rule 73: a private grant backs nothing).");
  return out;
}
function acceptance(grant) {
  return { spec: REPO_SPECS.agreements, type: AGREEMENTS_TYPES.signature, payload: signaturePayload(grant), objects: [[grant, grant]] };
}
var REVOCATION = 10;
function revocationPayload(grant) {
  return cborEncode(/* @__PURE__ */ new Map([[0, unhex(grant)]]));
}
function signUnderGrant(k, a) {
  const made = makeEveryday({
    signingSecret: unhex(k.secret),
    signer: k.grantor,
    binding: k.grant,
    spec: a.spec,
    type: a.type,
    payload: a.payload,
    sequence: k.strand,
    public: a.public,
    to: a.to?.length ? a.to : void 0,
    objects: [[k.grantor, k.grant]],
    refs: a.refs?.length ? a.refs : void 0,
    acks: a.acks?.length ? a.acks : void 0
  });
  k.strand.push(made.id);
  return made;
}
function makeGrantKey() {
  const secret = newSigningSecret();
  return { secret, public: [1, signingPublic(secret)] };
}
async function allBy(signer, hints, via2) {
  const out = [];
  for (const h of hints) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via2).feed({ signer, after });
        for (const it of page.items) if (it.kind === "act") out.push(it.item);
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  return out;
}
var fetchAct2 = async (id, hints, via2) => {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via2).getAct(id);
      if (a) return a;
    } catch {
    }
  }
  return null;
};
async function stampsOf(clock, hints, via2 = {}) {
  const judgeStamp = {
    standing: async (act, id, signer) => {
      const l = await lookUp(signer, hints, via2);
      l.verifier.add(act);
      return l.verifier.status(id);
    }
  };
  return (await readStamps(clock, hints, judgeStamp, via2)).earliest;
}
async function authorityOf(act, hints, via2 = {}, opts = {}) {
  const d = opts.key ? openWithKey(act, opts.key) : describeAct(act);
  if (!d.signer || !d.binding) return null;
  const grantBytes = await fetchAct2(d.binding, hints, via2);
  if (!grantBytes) return null;
  const gd = describeAct(grantBytes);
  if (gd.spec !== MIRS.agreements || gd.type !== AGREEMENTS_TYPES.grant || !gd.payload) return null;
  const g = readGrant(gd.payload);
  const names = opts.names ?? ((id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`);
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  for (const id of [d.signer, g.grantee]) {
    try {
      await lookUp(id, hints, via2, v);
    } catch {
    }
  }
  v.add(grantBytes);
  for (const a of await allBy(g.grantee, hints, via2)) {
    const x = describeAct(a);
    if (x.spec === MIRS.agreements && x.type === AGREEMENTS_TYPES.signature && x.objects?.some((o) => o[0] === d.binding)) v.add(a);
  }
  for (const a of await allBy(d.signer, hints, via2)) {
    const x = describeAct(a);
    if (x.spec !== MIRS.agreements || x.type !== REVOCATION || !x.payload) continue;
    const named = cborDecode(x.payload).get(0);
    if (named instanceof Uint8Array && hex(named) === d.binding) v.add(a);
  }
  if (opts.key) v.addWithKey(act, opts.key);
  else v.add(act);
  let limits = null;
  if (g.limits) {
    let stamps = opts.stamps;
    if (g.limits.expiry?.clock === "timestamp" && !stamps?.has(g.limits.expiry.identity)) {
      stamps = new Map(stamps ?? []);
      try {
        stamps.set(g.limits.expiry.identity, await stampsOf(g.limits.expiry.identity, hints, via2));
      } catch {
      }
    }
    limits = judge(g.limits, d, MIRS.money, { stamps });
  }
  const verdicts = limits && limits.within !== null ? [[d.id, limits.within]] : [];
  const b = v.agreementsBacking(withGrantLimits(AGREEMENTS_SPECS, verdicts), d.id);
  const lane = g.grantee === d.signer;
  const laneBy = `Signed under a lane of ${names(d.signer)} (a grant to itself, ${d.binding.slice(0, 8)}\u2026, its key held by an app; F351)`;
  const plain = b.kind === "backed" || b.kind === "binds" ? `${lane ? laneBy : `Signed by ${names(g.grantee)} in ${names(d.signer)}\u2019s name, under ${names(d.signer)}\u2019s grant ${d.binding.slice(0, 8)}\u2026`}: backed (Agreements rule 80).` : b.kind === "not-backed" ? `${lane ? laneBy : `Signed by ${names(g.grantee)} in ${names(d.signer)}\u2019s name, under the grant ${d.binding.slice(0, 8)}\u2026`}, which does not back it: ${b.reason}.` : `${lane ? laneBy : `Signed by ${names(g.grantee)} in ${names(d.signer)}\u2019s name, under the grant ${d.binding.slice(0, 8)}\u2026`}: whether it backs it is unknown (${b.reason ?? "not readable"}).`;
  return { grant: d.binding, grantor: d.signer, grantee: g.grantee, lane, backing: b.kind, reason: b.reason ?? null, limits, words: plain };
}
async function authorityOfId(id, hints, via2 = {}, opts = {}) {
  const act = await fetchAct2(id, hints, via2);
  return act ? authorityOf(act, hints, via2, opts) : null;
}

// ../repo/src/proposals.ts
var NEGOTIATION = 18;
var SHARE_MEDIA = "f2f9c2b8a6e0c5c1b4a7d1e3f0a9c8b7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1";
var ONE_TIME_LINE = "One-time key for my share of the chain key: ";
var SIGNED = "Signed.";
var DECLINED = "Declined.";
var RESIGNED = "Resigned.";
var negotiationPayload = (text3) => cborEncode(/* @__PURE__ */ new Map([[0, text3.normalize("NFC")]]));
async function negotiate(by, to, o) {
  const made = by.sign(REPO_SPECS.agreements, NEGOTIATION, negotiationPayload(o.text), {
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
function readMessage(d) {
  if (d.spec !== REPO_SPECS.agreements || d.type !== NEGOTIATION || !d.payload || !d.signer) return null;
  const m = cborDecode(d.payload);
  const text3 = m.get(0);
  if (typeof text3 !== "string") return null;
  const link = d.objects?.[0];
  return {
    id: d.id,
    from: d.signer,
    to: d.to ?? [],
    text: text3,
    thread: link ? link[0] : d.id,
    previous: link ? link[1] : null,
    acks: d.acks ?? [],
    refs: (d.refs ?? []).flatMap((r, i) => d.refSigners?.[i] ? [[r, d.refSigners[i]]] : [])
  };
}
function acceptanceText(signature, oneTime) {
  return [SIGNED, `My signature is act ${signature}.`, ...oneTime ? [`${ONE_TIME_LINE}${base64(oneTime)}`] : []].join("\n");
}
async function openShare(secret, relays, senderHints, via2 = {}) {
  const tag = pickupTag(xwingPublic(secret));
  for (const hint of relays) {
    let items = [];
    try {
      items = (await relayAt(hint, via2).feed({ pickup: tag })).items;
    } catch {
      continue;
    }
    for (const it of items) {
      if (it.kind !== "sealed") continue;
      const r = await receive(it.item, null, [secret], senderHints, via2);
      if (!r.opened || !r.act) continue;
      const opened = await openedAct(it.item, secret);
      if (!opened) continue;
      const m = cborDecode(opened.payload);
      if (hex(m.get(0)) !== SHARE_MEDIA) throw new Error("What was sealed to this one-time key is not a share.");
      const lockedHash = hex(m.get(2));
      for (const h of [.../* @__PURE__ */ new Set([...m.get(6) ?? [], ...relays])]) {
        let locked = null;
        try {
          locked = await relayAt(h, via2).getMedia(lockedHash);
        } catch {
          locked = null;
        }
        if (!locked) continue;
        const share2 = openMedia(locked, m.get(5), m.get(4));
        if (workHash(share2) !== hex(m.get(1))) throw new Error("The share does not match its fingerprint.");
        return { share: share2, from: r.from ?? "", status: r.status ?? "unknown" };
      }
      throw new Error("The share was sealed to this key, but its contents were not found at the relays.");
    }
  }
  return null;
}
async function openedAct(sealed, secret) {
  try {
    const o = openSealed(sealed, void 0, secret);
    if (o.described.spec !== SPECS.envelopes || o.described.type !== 0 || !o.described.payload) return null;
    return { payload: o.described.payload };
  } catch {
    return null;
  }
}

// ../grants/src/member.ts
var MEMBER_KEYS_SPEC = sha2562("Member keys cMIP, draft 1, test value until publication");
var MEMBER_KEY = 0;
var makeMemberKey = makeGrantKey;
function memberKeyPayload(k) {
  return cborEncode(
    /* @__PURE__ */ new Map([
      [0, unhex(k.terms)],
      [1, unhex(k.signature)],
      [2, [k.public[0], k.public[1]]],
      [3, k.secret]
    ])
  );
}
function readPayload(p) {
  try {
    const m = cborDecode(p);
    if (!(m instanceof Map) || [...m.keys()].some((k) => ![0, 1, 2, 3].includes(k))) return null;
    const [t, s, pub, sec] = [m.get(0), m.get(1), m.get(2), m.get(3)];
    if (!(t instanceof Uint8Array) || t.length !== 32 || !(s instanceof Uint8Array) || s.length !== 32) return null;
    if (!Array.isArray(pub) || typeof pub[0] !== "number" || !(pub[1] instanceof Uint8Array) || !(sec instanceof Uint8Array)) return null;
    return { terms: hex(t), signature: hex(s), public: [pub[0], pub[1]], secret: sec };
  } catch {
    return null;
  }
}
async function sealMemberKey(me, k, save) {
  const homes = me.f.homes.map((h) => h.hint);
  const look = await lookUp(me.id, homes, me.via);
  if (!look.encryptionKey || !me.f.encryption.some((e3) => hex(xwingPublic(unhex(e3.secret))) === hex(look.encryptionKey))) {
    throw new Error("The encryption key this identity publishes is not one this app holds: your member key cannot be sealed to you. Your signature stands; the key stays in this app only.");
  }
  let made;
  try {
    made = me.sign(MEMBER_KEYS_SPEC, MEMBER_KEY, memberKeyPayload(k), { public: false, to: [me.id] });
  } finally {
    await save();
  }
  const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
  let left = 0;
  for (const h of homes) {
    try {
      await relayAt(h, me.via).putSealed(sealed);
      left++;
    } catch {
    }
  }
  await leaveAtHomes(me, made, { sealed: left > 0 });
  if (!left) throw new Error("No home took your member key. Your signature stands; the key stays in this app only until it is sent again.");
  return made.id;
}
async function readMemberKeys(identity, secrets, homes, via2 = {}) {
  const out = /* @__PURE__ */ new Map();
  if (!secrets.length) return [];
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l;
  try {
    l = await lookUp(identity, homes, via2, v);
  } catch {
    return [];
  }
  const at = [.../* @__PURE__ */ new Set([...homes, ...l.resolution.homes.map((h) => h.hint)])];
  for (const x of await ownActs(identity, secrets, [.../* @__PURE__ */ new Set([...at, ...l.routes.routes.flatMap((r) => r.hints)])], via2)) {
    try {
      if (x.key) l.verifier.addWithKey(x.act, x.key);
      else l.verifier.add(x.act);
    } catch {
    }
  }
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via2).feed({ to: identity, after });
        for (const it of page.items) {
          if (it.kind !== "sealed") continue;
          let o = null;
          for (const s of secrets) {
            try {
              o = openSealed(it.item, identity, s);
              break;
            } catch {
            }
          }
          const d = o?.described;
          if (!o || !d || out.has(d.id) || d.public || d.signer !== identity || d.spec !== MEMBER_KEYS_SPEC || d.type !== MEMBER_KEY || !d.payload) continue;
          if (o.key) l.verifier.addWithKey(o.act, o.key);
          else l.verifier.add(o.act);
          const st = l.verifier.status(d.id);
          if (st !== "valid" && st !== "disputed") continue;
          const x = readPayload(d.payload);
          if (x) out.set(d.id, { ...x, act: d.id, position: d.position ?? 0 });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  return [...out.values()].sort((a, b) => a.position - b.position);
}
async function resealMemberKeys(identity, oldSecrets, newKey, homes, via2 = {}) {
  let n = 0;
  const queries = [{ q: { to: identity }, me: identity }, ...oldSecrets.map((s) => ({ q: { pickup: pickupTag(xwingPublic(s)) } }))];
  for (const h of homes) {
    for (const { q, me } of queries) {
      let after;
      try {
        for (; ; ) {
          const page = await relayAt(h, via2).feed({ ...q, after });
          for (const it of page.items) {
            if (it.kind !== "sealed") continue;
            for (const s of oldSecrets) {
              try {
                const o = openSealed(it.item, me, s);
                if (o.described.signer !== identity) break;
                if (me) await relayAt(h, via2).putSealed(sealFor(o.act, o.key, [{ id: identity, key: newKey }]));
                else await relayAt(h, via2).putSealed(sealFor(o.act, o.key, [{ key: newKey }]), [pickupTag(newKey)]);
                if (o.described.spec === MEMBER_KEYS_SPEC && o.described.type === MEMBER_KEY) n++;
                break;
              } catch {
              }
            }
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
      }
    }
  }
  return n;
}
async function foundingOf(collective, hints, via2) {
  const l = await lookUp(collective, hints, via2);
  const links = l.resolution.links.map((x) => x.act);
  const chain = await chainOf(collective, hints, via2);
  const g = chain.find((b) => describeAct(b).id === collective);
  const d = g ? describeAct(g) : null;
  const decl = d?.payload ? cborDecode(d.payload).get(4) : void 0;
  for (const x of decl ?? []) {
    if (x[0] instanceof Uint8Array && hex(x[0]) === REPO_SPECS.agreements && Number(x[1]) === FOUNDING_AGREEMENT && x[2] instanceof Uint8Array) return { founding: hex(x[2]), links };
  }
  throw new Error("The collective\u2019s genesis declares no founding agreement.");
}
async function rootOf(terms, hints, via2) {
  let cur = terms;
  for (let i = 0; i < 64; i++) {
    let a = null;
    for (const h of hints) {
      a = await relayAt(h, via2).getAct(cur).catch(() => null);
      if (a) break;
    }
    if (!a) return null;
    const d = describeAct(a);
    if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms || !d.payload) return null;
    const t = readTerms(d.payload, AGREEMENTS_SPECS);
    if (!t.parent) return cur;
    cur = t.parent;
  }
  return null;
}
async function memberKeyFor(keys, collective, hints, via2 = {}) {
  const { founding } = await foundingOf(collective, hints, via2);
  for (const k of [...keys].reverse()) if (await rootOf(k.terms, hints, via2) === founding) return k;
  return null;
}
async function chainFor(collective, k, hints, via2 = {}) {
  const { links } = await foundingOf(collective, hints, via2);
  const latest = links[links.length - 1];
  let decision = latest;
  let best = -1;
  const strand = [];
  for (const a of await allBy(collective, hints, via2)) {
    const d = describeAct(a);
    if (d.binding === latest && d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.record && (d.position ?? 0) > best) {
      best = d.position ?? 0;
      decision = d.id;
    }
    if (d.binding === k.signature && !strand.some((x) => x.id === d.id)) strand.push({ id: d.id, position: d.position ?? 0 });
  }
  return { decision, strand: strand.sort((a, b) => a.position - b.position).map((x) => x.id) };
}
function signAsMember(collective, k, at, a) {
  const made = makeEveryday({
    signingSecret: k.secret,
    signer: collective,
    binding: k.signature,
    spec: a.spec,
    type: a.type,
    payload: a.payload,
    sequence: at.strand,
    public: a.public,
    to: a.to?.length ? a.to : void 0,
    // A text act carries exactly one object (Text rule 14): for a member
    // key, the founding or clone that named the key, the version that is
    // its grant, which Agreements reads as the decision it acts under
    // (Agreements rules 58 and 73). Every other act cites the latest decision.
    objects: a.spec === MIRS.text && a.type === 0 ? [[collective, k.terms]] : [...a.objects ?? [], [collective, at.decision]],
    refs: a.refs?.length ? a.refs : void 0
  });
  at.strand.push(made.id);
  return made;
}
function cosignAsMember(collective, k, at, act) {
  return signAsMember(collective, k, at, {
    spec: REPO_SPECS.agreements,
    type: AGREEMENTS_TYPES.signature,
    payload: cborEncode(/* @__PURE__ */ new Map([[0, unhex(act)]])),
    public: true,
    objects: [[act, act]]
  });
}
async function publishAt(acts, places, via2 = {}) {
  const ok = [];
  for (const p of places) {
    try {
      for (const a of acts) await relayAt(p, via2).putAct(a);
      ok.push(p);
    } catch {
    }
  }
  return ok;
}
async function collectiveVerifier(collective, hints, via2 = {}, acts = []) {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const add = (a) => {
    try {
      v.add(a);
    } catch {
    }
  };
  const hold = async (id) => {
    let places = hints;
    try {
      const l = await lookUp(id, hints, via2, v);
      places = [.../* @__PURE__ */ new Set([...hints, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)])];
    } catch {
    }
    for (const a of await allBy(id, places, via2)) add(a);
  };
  await hold(collective);
  const { founding } = await foundingOf(collective, hints, via2);
  const parties = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  const termsOfId = async (id) => {
    if (seen.has(id)) return;
    seen.add(id);
    for (const h of hints) {
      const a = await relayAt(h, via2).getAct(id).catch(() => null);
      if (!a) continue;
      add(a);
      const d = describeAct(a);
      if (d.payload) for (const p of readTerms(d.payload, AGREEMENTS_SPECS).parties) parties.add(p);
      break;
    }
  };
  await termsOfId(founding);
  for (const a of await allBy(collective, hints, via2)) {
    const d = describeAct(a);
    if (d.spec === SPECS.identity && d.type === 1 && d.payload) {
      for (const x of cborDecode(d.payload).get(8) ?? []) {
        if (x[0] instanceof Uint8Array && hex(x[0]) === REPO_SPECS.agreements && Array.isArray(x[2])) await termsOfId(hex(x[2][0]));
      }
    }
  }
  for (const p of parties) await hold(p);
  for (const id of acts) {
    {
      for (const h of hints) {
        const a = await relayAt(h, via2).getAct(id).catch(() => null);
        if (a) {
          add(a);
          break;
        }
      }
    }
  }
  return { v, founding, parties: [...parties] };
}
async function collectiveNow(collective, hints, via2 = {}) {
  const { v, parties } = await collectiveVerifier(collective, hints, via2);
  const cur = v.agreementsCurrent(AGREEMENTS_SPECS, collective);
  let resignations = [];
  try {
    resignations = v.agreementsPublishedResignations(AGREEMENTS_SPECS, collective);
  } catch {
  }
  return { agreement: cur?.agreement ?? null, departed: cur?.departed ?? [], resignations, parties };
}
async function signAndAsk(me, collective, key, act, ask2, text3, hints, via2 = {}) {
  const at = await chainFor(collective, key, hints, via2);
  const made = signAsMember(collective, key, at, { ...act, public: true });
  const places = await publishAt([made.act], hints, via2);
  if (!places.length) throw new Error("No relay took the act: nothing counts. Try again.");
  const asked = [];
  const notAsked = [];
  for (const h of ask2) {
    try {
      const l = await lookUp(h, hints, via2);
      const inbox = l.inbox(REPO_SPECS.agreements) ?? l.routes.routes.flatMap((r) => r.hints);
      if (!l.encryptionKey || !inbox?.length) throw new Error("no inbox or encryption key");
      await negotiate(me, { id: h, key: l.encryptionKey, inbox }, { text: text3, refs: [[made.id, collective], [collective, collective]] });
      asked.push(h);
    } catch {
      notAsked.push(h);
    }
  }
  return { act: made.id, places, asked, notAsked };
}
async function collectivePointer(collective, hints, via2 = {}, pay) {
  const places = await collectivePlaces(collective, hints, via2);
  const { v, founding } = await collectiveVerifier(collective, places, via2).catch(() => ({ v: null, founding: null }));
  if (!v || !founding) return null;
  const pointers = [];
  for (const a of await allBy(collective, places, via2)) {
    const d = describeAct(a);
    if (d.spec === MIRS.money && d.type === 0) pointers.push([d.id, true]);
  }
  const specs = withGrantLimits(AGREEMENTS_SPECS, pointers);
  const p = v.agreementsPointer(specs, collective);
  const choice = pay ? v.agreementsChoose(specs, collective, pay.amount, pay.accepted) : null;
  return { pointer: p.act ?? null, version: p.version ?? 0, why: p.why ?? null, choice };
}
async function judgeCollective(collective, acts, hints, via2 = {}, limits = []) {
  const { v } = await collectiveVerifier(collective, hints, via2, acts);
  const out = /* @__PURE__ */ new Map();
  for (const id of acts) {
    try {
      out.set(id, v.agreementsConsent(withGrantLimits(AGREEMENTS_SPECS, limits), id));
    } catch (e3) {
      out.set(id, { kind: "unread", reason: e3 instanceof Error ? e3.message : String(e3), met: false, areas: [] });
    }
  }
  return out;
}
async function collectivePlaces(collective, hints, via2 = {}) {
  try {
    const l = await lookUp(collective, hints, via2);
    return [.../* @__PURE__ */ new Set([...hints, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)])];
  } catch {
    return [...new Set(hints)];
  }
}
var LAYER_OF = { [MIRS.text]: 1, [MIRS.envelopes]: 1, [MIRS.money]: 2, [MIRS.agreements]: 3, [MIRS.development]: 4 };
async function areaReaching(collective, places, kind, via2 = {}) {
  const now4 = await collectiveNow(collective, places, via2);
  if (!now4.agreement) return { agreement: null, area: null };
  for (const h of places) {
    const a = await relayAt(h, via2).getAct(now4.agreement).catch(() => null);
    if (!a) continue;
    const d = describeAct(a);
    if (!d.payload) break;
    const t = readTerms(d.payload, AGREEMENTS_SPECS);
    const x = t.areas.find((r) => r.kinds.some((k) => k.form === "layer" && k.layer === LAYER_OF[kind.spec] || k.spec === kind.spec && k.type === kind.type));
    return { agreement: now4.agreement, area: x ? { id: x.id, name: x.name, holders: x.holders, number: x.threshold } : null };
  }
  return { agreement: now4.agreement, area: null };
}
async function termsAt(agreement, places, via2 = {}) {
  for (const h of places) {
    const a = await relayAt(h, via2).getAct(agreement).catch(() => null);
    if (!a) continue;
    const d = describeAct(a);
    if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms || !d.payload) return null;
    try {
      return readTerms(d.payload, AGREEMENTS_SPECS);
    } catch {
      return null;
    }
  }
  return null;
}
async function splitServiceOf(agreement, payee, places, via2 = {}) {
  const t = await termsAt(agreement, places, via2);
  if (!t) return null;
  const grants = t.splitGrant ? [t.splitGrant] : t.payeeGrants ?? [];
  for (const g of grants) {
    for (const h of places) {
      const a = await relayAt(h, via2).getAct(g).catch(() => null);
      if (!a) continue;
      const d = describeAct(a);
      if (!d.payload) break;
      if (!t.splitGrant && d.signer !== payee) break;
      const grantee = cborDecode(d.payload).get(0);
      if (grantee instanceof Uint8Array) return { service: hex(grantee), grant: g };
      break;
    }
  }
  return null;
}

// src/appended.ts
var APPENDED_FORMAT = sha2562("Appended collective cMIP, draft 1, test value until publication");
function appendedOf(format, refs) {
  if (format !== APPENDED_FORMAT) return null;
  const first = refs[0]?.id;
  return first && /^[0-9a-f]{64}$/.test(first) ? first : null;
}
var appendedRef = (collective) => collective;
async function membership(member, collective, hints, via2 = {}) {
  try {
    const places = await collectivePlaces(collective, hints, via2);
    const now4 = await collectiveNow(collective, places, via2);
    if (!now4.agreement) return { checked: false, why: "its agreement in force was not found at its places" };
    const t = await termsAt(now4.agreement, places, via2);
    if (!t?.parties) return { checked: false, why: "its agreement in force could not be read" };
    if (now4.departed.includes(member)) return { checked: false, why: "the writer has left it" };
    return t.parties.includes(member) ? { checked: true, why: null } : { checked: false, why: "the writer is not one of its members" };
  } catch (e3) {
    return { checked: false, why: `it could not be read (${e3 instanceof Error ? e3.message : String(e3)})` };
  }
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
var unitOf = (hash2) => {
  for (const m of UNITS_MODULES) {
    const x = m.units.find((y) => y.hash === hash2);
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
function totals(xs) {
  const by = /* @__PURE__ */ new Map();
  for (const x of xs) by.set(x.unit, (by.get(x.unit) ?? 0) + x.value);
  return [...by.entries()].map(([unit, value]) => ({ unit, value }));
}
function readValue(typed) {
  const t = typed.replace(/[\s_]/g, "");
  if (!/^\d{1,15}$/.test(t) || Number(t) === 0) throw new Error("An amount is a whole number above zero, in the unit\u2019s smallest part.");
  return Number(t);
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
    text: "cmips/cmip-anchoring-draft-5.md",
    draft: 5,
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
    text: "cmips/cmip-money-messages-draft-4.md",
    draft: 4,
    hashes: [MESSAGES_SPEC, MESSAGES_SPEC_3, MESSAGES_SPEC_2, MESSAGES_SPEC_1],
    does: "The messages between apps and people: a draft sealed to yourself by Dub or Edubba, a request to be paid, an invoice request and its answer (draft 1); a lane asked by an app, and a sale told to your own Dub (draft 2); the amount in an answer, so a lane\u2019s cap is judged on it (draft 3); an invoice request sent to a collective\u2019s split service, and a purchase confirmed from Edubba (draft 4). Written by Damgar\u2019s builds, awaiting approval.",
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
var OURS = new Set(ACCEPTABLE.flatMap((a) => a.hashes));
var labelOf = (hash2) => {
  const a = ACCEPTABLE.find((x) => x.hashes.includes(hash2));
  if (!a) return void 0;
  if (a.hashes.length === 1) return `${a.name} ${a.kind}, draft ${a.draft}`;
  const u2 = BITCOIN_UNITS.units.find((x) => x.hash === hash2);
  return `${a.name}, draft ${a.draft}: ${u2?.name ?? "a unit"}`;
};
var isAccepted = (a, accepted) => a.hashes.every((h) => accepted.has(h));

// ../damgar/src/messages.ts
var TYPES = { draft: 1, request: 2, invoiceRequest: 3, answer: 4, laneRequest: 5, sale: 6 };
var WHAT2 = { pay: 0, ask: 1, anchor: 2, confirm: 3 };
var amountValue = (a) => [unhex(a.unit), a.value];
var amountOf2 = (v) => {
  if (!Array.isArray(v) || v.length !== 2 || !(v[0] instanceof Uint8Array) || v[0].length !== 32 || typeof v[1] !== "number" || v[1] < 0) throw new Error("not an amount");
  return { unit: hex(v[0]), value: v[1] };
};
var h322 = (v, what) => {
  if (!(v instanceof Uint8Array) || v.length !== 32) throw new Error(`${what}: not a hash`);
  return hex(v);
};
var text = (v, what) => {
  if (typeof v !== "string" || v.length > 280 || /[\u0000-\u0009\u000b-\u001f]/.test(v)) throw new Error(`${what}: not a short text`);
  return v;
};
var closed = (m, keys, what) => {
  for (const k of m.keys()) if (!keys.includes(k)) throw new Error(`${what}: an unknown key ${k}`);
};
var asMap2 = (payload, what) => {
  const m = cborDecode(payload);
  if (!(m instanceof Map)) throw new Error(`${what}: not a map`);
  return m;
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
    if (!d.anchor) throw new Error("A draft paying for an anchor names the offer, the tier and the leaf.");
    m.set(5, [unhex(d.anchor.offer), d.anchor.tier, unhex(d.anchor.leaf)]);
  }
  if (d.what === "confirm") {
    if (!d.confirm?.acks.length) throw new Error("A draft confirming a purchase names the claim and what it acknowledges.");
    m.set(6, [unhex(d.confirm.claim), d.confirm.acks.map(unhex)]);
  }
  return cborEncode(m);
}
function readDraft(payload) {
  const m = asMap2(payload, "a draft");
  closed(m, [0, 1, 2, 3, 4, 5, 6], "a draft");
  const w = m.get(0);
  const what = w === 0 ? "pay" : w === 1 ? "ask" : w === 2 ? "anchor" : w === 3 ? "confirm" : null;
  if (!what) throw new Error("a draft: an unknown what");
  let anchor = null;
  if (what === "anchor") {
    const a = m.get(5);
    if (!Array.isArray(a) || a.length !== 3 || typeof a[1] !== "number") throw new Error("a draft for an anchor: its anchor");
    anchor = { offer: h322(a[0], "the offer"), tier: a[1], leaf: h322(a[2], "the leaf") };
  } else if (m.has(5)) throw new Error("a draft: an anchor on a draft that pays for none");
  let confirm2 = null;
  if (m.get(0) === 3) {
    const c = m.get(6);
    if (!Array.isArray(c) || c.length !== 2 || !Array.isArray(c[1]) || !c[1].length) throw new Error("a draft confirming a purchase: its claim and what it acknowledges");
    confirm2 = { claim: h322(c[0], "the claim"), acks: c[1].map((x) => h322(x, "an act acknowledged")) };
  } else if (m.has(6)) throw new Error("a draft: a confirmation on a draft that confirms nothing");
  return {
    what,
    other: h322(m.get(1), "the other party"),
    amount: amountOf2(m.get(2)),
    whatFor: m.has(3) ? text(m.get(3), "what for") : null,
    app: text(m.get(4), "the app"),
    anchor,
    confirm: confirm2
  };
}
async function sendDraft(me, d, opts) {
  return sendToSelf(me, TYPES.draft, draftPayload(d), opts);
}
async function sendToSelf(me, type, payload, opts) {
  const homes = me.f.homes.map((h) => h.hint);
  const look = await lookUp(me.id, homes, opts.via ?? {});
  if (!look.encryptionKey) throw new Error("This identity publishes no encryption key, so nothing can be sealed to it: the draft cannot travel to Damgar. Nothing was signed.");
  if (!me.f.encryption.some((e3) => (e3.secret ? hex(xwingPublic(unhex(e3.secret))) : e3.public ?? "") === hex(look.encryptionKey))) {
    throw new Error("The encryption key this identity publishes is not one this app holds: Damgar, holding the same words, could not open the draft either. Nothing was signed.");
  }
  let made;
  try {
    made = await me.signNow(MESSAGES_SPEC, type, payload, { public: false, to: [me.id], refs: opts.refs });
  } finally {
    await opts.save();
  }
  const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
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
function requestPayload(r) {
  const m = /* @__PURE__ */ new Map([[0, amountValue(r.amount)]]);
  if (r.whatFor) m.set(1, text(r.whatFor, "what for"));
  m.set(2, unhex(r.pointer));
  return cborEncode(m);
}
function readRequest(payload) {
  const m = asMap2(payload, "a request");
  closed(m, [0, 1, 2], "a request");
  return { amount: amountOf2(m.get(0)), whatFor: m.has(1) ? text(m.get(1), "what for") : null, pointer: h322(m.get(2), "the pointer") };
}
function invoiceRequestPayload(r) {
  const m = /* @__PURE__ */ new Map([[0, cborDecode(r.commitment)]]);
  if (r.whatFor) m.set(1, text(r.whatFor, "what for"));
  if (r.answers) m.set(2, unhex(r.answers));
  if (r.ticket) m.set(3, [unhex(r.ticket.leaf), r.ticket.tier]);
  const out = cborEncode(m);
  if (hex(cborEncode(cborDecode(r.commitment))) !== hex(r.commitment)) throw new Error("the commitment does not survive encoding");
  return out;
}
function readInvoiceRequest(payload) {
  const m = asMap2(payload, "an invoice request");
  closed(m, [0, 1, 2, 3], "an invoice request");
  const commitment = cborEncode(m.get(0));
  const t = m.get(3);
  if (t !== void 0 && (!Array.isArray(t) || t.length !== 2 || typeof t[1] !== "number")) throw new Error("an invoice request: its ticket");
  return {
    commitment,
    fields: readCommitmentFields(commitment),
    whatFor: m.has(1) ? text(m.get(1), "what for") : null,
    answers: m.has(2) ? h322(m.get(2), "the request answered") : null,
    ticket: t ? { leaf: h322(t[0], "the leaf"), tier: t[1] } : null
  };
}
var readCommitmentFields = (bytes) => readCommitment(bytes);
function answerPayload(a) {
  const b = a.bound;
  const bound = b.kind === "invoice" ? [0, b.invoice] : b.kind === "request" ? b.confirmations ? [1, b.request, b.confirmations] : [1, b.request] : [2, text(b.why, "why")];
  const m = /* @__PURE__ */ new Map([
    [0, unhex(a.to)],
    [1, unhex(a.commitment)],
    [2, bound]
  ]);
  if (a.ticket) m.set(3, unhex(a.ticket));
  if (a.amount) m.set(4, amountValue(a.amount));
  return cborEncode(m);
}
function readAnswer(payload) {
  const m = asMap2(payload, "an answer");
  closed(m, [0, 1, 2, 3, 4], "an answer");
  const b = m.get(2);
  if (!Array.isArray(b)) throw new Error("an answer: its bound");
  let bound;
  if (b[0] === 0 && b.length === 2 && typeof b[1] === "string") bound = { kind: "invoice", invoice: b[1] };
  else if (b[0] === 1 && (b.length === 2 || b.length === 3) && b[1] instanceof Uint8Array && b[1].length === 64) bound = { kind: "request", request: b[1], confirmations: b.length === 3 ? Number(b[2]) : null };
  else if (b[0] === 2 && b.length === 2) bound = { kind: "refused", why: text(b[1], "why") };
  else throw new Error("an answer: its bound");
  const amount = m.has(4) ? amountOf2(m.get(4)) : null;
  return { to: h322(m.get(0), "the request answered"), commitment: h322(m.get(1), "the commitment"), bound, ticket: m.has(3) ? h322(m.get(3), "the ticket") : null, amount };
}
function laneRequestPayload(r) {
  if (!r.kinds.length) throw new Error("A lane names what it may sign.");
  const m = /* @__PURE__ */ new Map([
    [0, [1, unhex(r.key)]],
    [1, text(r.label, "the lane\u2019s words")],
    [2, r.kinds.map((k) => [unhex(k.spec), k.type])]
  ]);
  if (r.limits !== null && r.limits !== void 0) m.set(3, r.limits);
  m.set(4, text(r.app, "the app"));
  return cborEncode(m);
}
function readLaneRequest(payload) {
  const m = asMap2(payload, "a lane request");
  closed(m, [0, 1, 2, 3, 4], "a lane request");
  const k = m.get(0);
  if (!Array.isArray(k) || k.length !== 2 || k[0] !== 1 || !(k[1] instanceof Uint8Array) || k[1].length !== 32) throw new Error("a lane request: its key is not a signing key of scheme 1");
  const kinds = m.get(2);
  if (!Array.isArray(kinds) || !kinds.length) throw new Error("a lane request: what it may sign");
  return {
    key: hex(k[1]),
    label: text(m.get(1), "the lane\u2019s words"),
    kinds: kinds.map((x) => {
      if (!Array.isArray(x) || x.length !== 2 || typeof x[1] !== "number") throw new Error("a lane request: a kind");
      return { spec: h322(x[0], "a kind\u2019s specification"), type: x[1] };
    }),
    limits: m.has(3) ? m.get(3) : null,
    app: text(m.get(4), "the app")
  };
}
function salePayload(x) {
  return cborEncode(
    /* @__PURE__ */ new Map([
      [0, unhex(x.offer)],
      [1, unhex(x.buyer)],
      [2, unhex(x.receipt)],
      [3, unhex(x.publication)]
    ])
  );
}
function readSale(payload) {
  const m = asMap2(payload, "a sale");
  closed(m, [0, 1, 2, 3], "a sale");
  return { offer: h322(m.get(0), "the offer"), buyer: h322(m.get(1), "the buyer"), receipt: h322(m.get(2), "the receipt"), publication: h322(m.get(3), "the publication") };
}

// ../ummia/src/anchor.ts
async function placesOf(service, hints, via2) {
  const l = await lookUp(service, hints, via2);
  const places = [.../* @__PURE__ */ new Set([...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints), ...l.resolution.homes.map((h) => h.hint), ...hints])];
  return { l, places };
}
async function offers(service, hints, via2 = {}) {
  const { l, places } = await placesOf(service, hints, via2);
  const out = /* @__PURE__ */ new Map();
  for (const h of places) {
    try {
      for (const it of (await relayAt(h, via2).feed({ signer: service, spec: MIRS.agreements })).items) {
        if (it.kind !== "act") continue;
        try {
          const o = anchoringReadOffer(it.item);
          l.verifier.add(it.item);
          if (l.verifier.status(o.id) === "valid") out.set(o.id, { act: o.id, tiers: o.tiers, unit: o.unit, network: o.network, words: o.words });
        } catch {
        }
      }
    } catch {
    }
  }
  return [...out.values()];
}

// ../genesis/src/shown.ts
var CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
function polymod(values) {
  const G = [996825010, 642813549, 513874426, 1027748829, 705979059];
  let chk = 1;
  for (const v of values) {
    const b = chk >>> 25;
    chk = (chk & 33554431) << 5 ^ v;
    for (let i = 0; i < 5; i++) if (b >>> i & 1) chk ^= G[i];
  }
  return chk >>> 0;
}
function shownForm(label, hex3) {
  if (!/^([0-9a-f]{2})+$/i.test(hex3)) return hex3;
  const bytes = hex3.match(/../g).map((b) => parseInt(b, 16));
  const five = [];
  let acc = 0;
  let bits = 0;
  for (const b of bytes) {
    acc = (acc << 8 | b) & 65535;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      five.push(acc >> bits & 31);
    }
  }
  if (bits > 0) five.push(acc << 5 - bits & 31);
  const hrp = [...label].map((c) => c.charCodeAt(0));
  const values = [...hrp.map((c) => c >> 5), 0, ...hrp.map((c) => c & 31), ...five, 0, 0, 0, 0, 0, 0];
  const pm = polymod(values) ^ 734539939;
  const check = [0, 1, 2, 3, 4, 5].map((i) => pm >>> 5 * (5 - i) & 31);
  return `${label}1${[...five, ...check].map((v) => CHARSET[v]).join("")}`;
}
var shownId = (hex3) => shownForm("mid", hex3);
var shownAct = (hex3) => shownForm("mact", hex3);

// src/chainwords.ts
var WORDS_KEY_TAG = "MOR/module/seed-words/key";
var SCHEME = 3;
var INDEX2 = 0n;
var cat = (...xs) => {
  const out = new Uint8Array(xs.reduce((n, x) => n + x.length, 0));
  let at = 0;
  for (const x of xs) {
    out.set(x, at);
    at += x.length;
  }
  return out;
};
function taggedHash(tag, data) {
  const t = unhex(sha2562(tag));
  return unhex(sha2562(cat(t, t, data)));
}
function keySeeds(seed, scheme, index) {
  if (seed.length !== 32) throw new Error("a chain-key seed is 32 bytes");
  const i = new Uint8Array(8);
  new DataView(i.buffer).setBigUint64(0, index);
  const a = taggedHash(WORDS_KEY_TAG, cat(seed, Uint8Array.of(scheme), i, Uint8Array.of(0)));
  const b = taggedHash(WORDS_KEY_TAG, cat(seed, Uint8Array.of(scheme), i, Uint8Array.of(1)));
  return cat(a, b.subarray(0, 16));
}
function newChainKey(seed) {
  const key = chainKeyFromSeeds(SCHEME, keySeeds(seed, SCHEME, INDEX2));
  return { words: toWords(seed), key };
}

// ../collective/src/explain.ts
var short = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
var count2 = (n, one2, many = `${one2}s`) => `${n} ${n === 1 ? one2 : many}`;
function termsOf(payload) {
  return readTerms(payload, AGREEMENTS_SPECS);
}
var KNOWN = {
  [SPECS.identity]: "the Identity MIR",
  [SPECS.envelopes]: "the Envelopes MIR",
  [SPECS.text]: "the Text MIR",
  [MIRS.money]: "the Money MIR",
  [MIRS.development]: "the Development MIR",
  [REPO_SPECS.agreements]: "the Agreements MIR",
  [REPO_SPECS.manifest]: "the release manifest cMIP (draft 1)"
};
var EXTENSIONS = /* @__PURE__ */ new Set([REPO_SPECS.manifest]);
var ABSENCE_PROOFS = /* @__PURE__ */ new Set();
var specName = (h) => KNOWN[h] ?? `an unknown specification (${short(h)})`;
function list(xs) {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}
function ruleWords(r, parties, names) {
  switch (r.form) {
    case "all":
      return parties.length === 1 ? "the one party" : `all ${parties.length} parties`;
    case "threshold":
      return `any ${r.threshold} of the ${parties.length} parties`;
    case "named":
      return list((r.named ?? []).map(names));
    case "share":
      return `parties holding together at least ${pct(r.share)} of what the voices that remain hold of stake ${r.stake}`;
    case "holders":
      return `holders of stake ${r.stake} holding together at least ${pct(r.share)} of it, members or not`;
    case "allOf":
      return `all of: ${(r.rules ?? []).map((x) => ruleWords(x, parties, names)).join("; ")}`;
  }
}
function ownersWithoutKeys(t, names) {
  const parts = (r) => !r ? [] : r.form === "allOf" ? (r.rules ?? []).flatMap(parts) : [r];
  const among = parts(t.constitutional).filter((r) => r.form === "holders");
  if (!among.length || !t.grammar) return [];
  const k = t.grammar.chainKey;
  const keyed = /* @__PURE__ */ new Set([...k.members ?? [], ...k.holder ? [k.holder] : [], ...k.custodian ? [k.custodian] : [], ...t.grammar.recovery?.custodian ? [t.grammar.recovery.custodian] : []]);
  const out = [];
  for (const r of among) {
    const holders2 = (t.stakes[r.stake ?? 0]?.[1] ?? []).map(([h]) => h).filter((h) => !!h && !t.parties.includes(h));
    if (holders2.some((h) => keyed.has(h))) continue;
    out.push({
      text: `The constitution counts members among the holders of stake ${r.stake}, but none of them who is no member${holders2.length ? ` (${list(holders2.map(names))})` : ""} holds a share of the chain key or is its custodian: if the owners vote the members out and the members refuse to rotate, the vote stands complete and unexecuted, and the collective runs on under the old members (Agreements draft 14, F317, a stated cost; client conformance).`,
      tone: "warn"
    });
  }
  return out;
}
function pct(n) {
  return `${(n ?? 0) / 1e4}%`;
}
function constitutionWords(t, names) {
  const r = t.constitutional;
  if (!r || r.form === "all") return "every member whose voice remains: nobody loses their say without signing (F103)";
  if (r.form === "threshold") return `any ${r.threshold} of the ${t.parties.length} members (all of those whose voice remains, if fewer remain)`;
  if (r.form === "named") return list((r.named ?? []).map(names));
  return ruleWords(r, t.parties, names);
}
function powerWords(p, areas, names) {
  switch (p.form) {
    case "constitutional":
      return "the constitutional change rule";
    case "clone":
      return "the clone rule";
    case "area": {
      const a = areas.find((x) => x.id === p.area);
      return a ? `the power of the \u201C${a.name}\u201D area (area ${p.area})` : `the power of area ${p.area}`;
    }
    case "plan":
      return `the succession plan of ${names(p.party ?? "")}`;
    case "judicial":
      return "the judicial tier's rule, every member whose voice remains";
  }
}
var LAYERS = ["Identity", "Envelopes and Text", "Money", "Agreements", "Development"];
var TYPE_NAMES = {
  [SPECS.envelopes]: { 0: "every publication of the collective (a release is one)", 1: "every key delivery of the collective", 4: "every encryption key of the collective" },
  [REPO_SPECS.agreements]: { 0: "every terms act of the collective", 1: "every signature of the collective" },
  [SPECS.text]: { 0: "every text of the collective" }
};
function kindWords2(k) {
  if (k.form === "layer") {
    const layer = LAYERS[k.layer ?? -1] ?? `layer ${k.layer}`;
    return `every act of the ${layer} layer: its area, which also adopts the cMIPs for that layer's tasks`;
  }
  return TYPE_NAMES[k.spec ?? ""]?.[k.type ?? -1] ?? `every act of type ${k.type} of ${specName(k.spec ?? "")} made by the collective`;
}
var OPERATIONAL_FIELDS = { 7: "the stakes", 8: "the split plan", 17: "the refund terms", 28: "the fees" };
function fieldRefWords(f) {
  return f.form === "field" ? OPERATIONAL_FIELDS[f.number] ?? `field ${f.number}` : `the cMIP for task ${f.number}`;
}
var OUTCOMES = [
  "their voice is removed (they no longer count in any rule or area)",
  "their stake is shared among the remaining holders",
  "their stake is transferred to parties named or defined by role",
  "their obligations are redirected or held",
  "the agreement is closed"
];
var AGREEMENTS_SAYS = {
  check: "Agreements refuse these terms",
  shape: "These are not terms in Agreements' format",
  unsupported: "Agreements do not support these terms yet",
  missing: "Agreements lacks something it needs to judge these terms",
  unsettled: "Agreements cannot settle these terms yet"
};
function problemWords(p) {
  return `${AGREEMENTS_SAYS[p.code] ?? `Agreements refuse these terms (${p.code})`}. Agreements' own words: \u201C${p.text}\u201D.`;
}
var INVISIBLE = /[؜​‎‏‪-‮⁦-⁩]/g;
function uncovered(t) {
  const voices = t.constitutional?.form === "named" ? t.constitutional.named ?? [] : t.parties;
  const a = t.abandonment;
  if (!a || !a.outcomes.includes(0)) return voices;
  if (a.authority === "named") return voices.filter((v) => v === a.identity);
  return [];
}
function absenceWarning(t, names) {
  const a = t.abandonment;
  if (!a) return null;
  const by = a.authority === "named" ? names(a.identity) : `any ${a.threshold} of the other parties together`;
  const outcomes = list(a.outcomes.map((o) => OUTCOMES[o] ?? `outcome ${o}`));
  const between = a.proof ? `An absence-proof cMIP stands between their word and your stake: ${specName(a.proof)}. A declaration counts only if it accepts it (Agreements rule 51).` : `No absence-proof cMIP stands between: their word alone is enough, nobody checks it against time or your activity. Signing accepts that (Agreements rules 49 and 51, a stated cost); if they declare you absent wrongly, you can only contest it, in public (Agreements rule 52).`;
  return {
    text: `If a party stops acting on the agreement, ${by} may declare them absent. What may then follow: ${outcomes}. ${between}`,
    tone: "warn"
  };
}
function capOf(hexed) {
  if (!hexed) return null;
  try {
    const v = cborDecode(unhex(hexed));
    const c = v instanceof Map ? v.get(0) : null;
    return Array.isArray(c) && typeof c[1] === "number" ? c[1] : null;
  } catch {
    return null;
  }
}
function readAgreement(t, names, parent) {
  const blocking = [];
  const plain = [];
  const who = t.parties.map(names);
  const sections = [];
  const g = t.grammar;
  const bound = [
    { text: `${t.parties.length} parties: ${list(who)}.` },
    { text: "Each is bound only by their own signature act. Until someone signs, nothing in it binds them (Agreements rule 1)." }
  ];
  if (!t.parent) {
    if (t.signing?.form === "all") {
      bound.push({
        text: g ? "It exists only once every one of them has signed it: nobody is founded into a collective without signing (Agreements, \u201CFounding terms\u201D, Q11)." : "It exists only once every one of them has signed it (Agreements, \u201CFounding terms\u201D, F107)."
      });
    } else if (t.signing) {
      bound.push({ text: `It says it exists once ${ruleWords(t.signing, t.parties, names)} have signed it; Agreements asks for every party.`, tone: "bad" });
    }
  } else {
    bound.push({ text: `It is a clone of agreement ${short(t.parent)}: once in force, it replaces it, and that one closes (Agreements rule 45).` });
  }
  sections.push({ heading: "Who is bound", lines: bound });
  if (t.parent) {
    const areas = parent?.areas ?? t.areas;
    const lines2 = [];
    if (!t.mark?.length) lines2.push({ text: "It carries no mark: it does not say by which power it comes in.", tone: "bad" });
    const order = (ids) => {
      const at = (x) => t.parties.indexOf(x) + 1 || Infinity;
      return [...ids].sort((x, y) => at(x) - at(y));
    };
    for (const e3 of t.mark ?? []) {
      lines2.push({ text: `It says it comes in by ${powerWords(e3.power, areas, names)} of that agreement, signed by ${list(order(e3.signers).map(names))}.` });
    }
    lines2.push({
      text: "Agreements check that these are exactly the powers its changes need, and that those named meet them, counted among the voices that remain. A false mark sinks the clone, whatever signatures it gathers (F104)."
    });
    lines2.push({ text: "It is complete once everyone its mark names, and everyone it adds, has signed it (Agreements rule 45)." });
    if (g) {
      lines2.push({
        text: "A change of the constitution is then put in force by a rotation of the collective; any other change by the collective's record, at once, with its signing key (Agreements rules 37, 37c)."
      });
    }
    sections.push({ heading: "How it comes into force: its mark", lines: lines2 });
  }
  if (g) {
    const lines2 = [{ text: "It founds a collective: an identity of its own, whose keys its members hold as follows (Agreements rule 36)." }];
    const s = g.signing;
    if (s.form === "one") {
      lines2.push({
        text: `${names(s.holder)} holds the collective's signing key, and signs the collective's acts with it. An act no area reaches needs nobody else's signature.`
      });
    } else if (s.form === "shares") {
      lines2.push({ text: `The signing key is held jointly: any ${s.threshold} of ${list((s.members ?? []).map(names))} sign together.` });
    } else {
      lines2.push({ text: `${names(s.custodian)} holds the signing key as custodian, under grant ${short(s.grant)}.` });
    }
    const k = g.chainKey;
    if (k.form === "shares") {
      const m = k.members ?? [];
      lines2.push({
        text: `The chain key, the one that rotates the collective (new keys, new members, new homes), is cut into ${m.length} shares, one each for ${list(m.map(names))}. Any ${k.threshold} of them together rebuild it.`
      });
      if (k.threshold === 1) {
        lines2.push({ text: "Any one member alone can rebuild the chain key and rotate the collective, without the others.", tone: "warn" });
      } else if (k.threshold < m.length) {
        lines2.push({ text: `If one member is lost, the other ${m.length - 1} can still rotate the collective (F96).`, tone: "ok" });
      }
    } else if (k.form === "one") {
      lines2.push({ text: `${names(k.holder)} alone holds the chain key.`, tone: "warn" });
    } else {
      lines2.push({ text: `${names(k.custodian)} holds the chain key as custodian, under grant ${short(k.grant)}.`, tone: "warn" });
    }
    if (g.recovery) {
      const r = g.recovery;
      lines2.push({
        text: r.form === "escrow" ? `A further share is held in escrow, released by ${names(r.authority)}, the authority on absence.` : `A further share is held by ${names(r.custodian)}, as custodian under grant ${short(r.grant)}.`
      });
    }
    sections.push({ heading: "The collective's keys", lines: lines2 });
    const words2 = new Map(t.areaWords);
    const al = [];
    if (!t.areas.length) al.push({ text: "No area: no act of the collective needs members' own signatures; its signing key alone speaks for it.", tone: "warn" });
    for (const a2 of t.areas) {
      al.push(
        a2.holders.length ? { text: `\u201C${a2.name}\u201D (area ${a2.id}): held by ${list(a2.holders.map(names))}; any ${a2.threshold} of them decide together.` } : { text: `\u201C${a2.name}\u201D (area ${a2.id}): held by nobody. It stands frozen until the members refit it (Agreements rule 37b).`, tone: "warn" }
      );
      const reach = [...a2.kinds.map(kindWords2), ...a2.fields.map(fieldRefWords)];
      al.push({ text: `It reaches ${list(reach) || "nothing"}.` });
      if (a2.limitsCmip) {
        const cap2 = capOf(a2.limits);
        al.push({
          text: cap2 !== null ? `Above ${cap2.toLocaleString("en")} an act, one more holder's key than its number: limits the grant limits cMIP judges on each act, a cMIP's rule beside the core's count of keys (Agreements draft 16, F353). An app that does not read that cMIP shows such an act as unknown.` : `Its holders' keys are judged under limits of cMIP ${short(a2.limitsCmip)}, a cMIP's rule beside the core's count of keys (Agreements draft 16, F353); an app that does not read it shows its acts as unknown.`,
          tone: "warn"
        });
      }
      const releases = a2.kinds.some((k2) => k2.form === "type" && k2.spec === MIRS.envelopes && k2.type === 0);
      al.push({
        text: `${releases ? "A release" : "An act it reaches"} counts only once that many of its holders have signed it, each with a visible act of their own, under the agreement in force when the collective signed it (Agreements rule 36a, F100).`
      });
      const own = words2.get(a2.id);
      if (own !== void 0) {
        al.push({ text: "It has words of its own, shown below; its holders change them alone." });
        plain.push({ heading: `The \u201C${a2.name}\u201D area's own words`, text: own });
      }
    }
    if (t.areas.length) {
      al.push({ text: "Each holder may name a key of their own in their signature of these terms (at founding, and at each member change): an act made with it counts as that member's signature in the areas they hold, and shows which member signed (Agreements draft 16, F353). An area of one takes one member's act; an area of two takes one member's act and another member's signature." });
      al.push({ text: "In an area, its holders alone decide, and may grant within it (Q5). Its holders, and how many of them decide, change only by the constitutional change rule." });
      al.push({
        text: "A holder may step down at once, alone. The other holders carry on: their number stands while enough of them remain, and all of them together meet it when fewer do (Agreements rule 44d). With no holder left, the area is frozen: its acts count for nothing until the members refit it (Agreements rule 37b)."
      });
      al.push({ text: "An act no area reaches counts on the collective's own signature; an act of a specification this agreement names nowhere counts for nothing (Q16)." });
    }
    sections.push({ heading: "Areas: who decides which acts", lines: al });
    const clone = ruleWords(t.clone, t.parties, names);
    sections.push({
      heading: "Who decides what",
      lines: [
        {
          text: `Constitutional: the members, the change rules, the key grammar, the areas and the constitution's words. They change only by the constitutional change rule: ${constitutionWords(t, names)}. Such a change is declared by a rotation of the collective to new keys; whatever its old key signs afterwards is void (Agreements rule 37, F100).`
        },
        {
          text: `Judicial: the protected clauses (the abandonment clause, the keepers, the arbitrators, the time reference, the succession plans, the fork rule, and the condition, time reference and anchoring cMIPs). They change only with the signature of every member whose voice remains: one version for everyone (Agreements rule 46a, F121).`
        },
        {
          text: `Operational: matters outside every area change by the clone rule, ${clone}, and are written on the collective's record at once (Agreements rule 37c); matters inside an area, by its holders.`
        },
        { text: "A change touching the constitution needs the constitutional change rule alone, which may change every tier; any other needs the power of each area and tier it touches, all at once (Agreements rule 44c, Q7)." },
        ...ownersWithoutKeys(t, names)
      ]
    });
  }
  sections.push({
    heading: "Changing it",
    lines: [
      {
        text: g ? "It is never edited. It changes only by a clone, a new version naming this one, whose mark names the powers its changes need (Agreements rule 45). A member who joins is bound once they sign it too: nobody is added without signing (Agreements rule 1, Q11)." : "It is never edited. It changes only by a clone, a new version naming this one, that every party signs (Agreements rule 45b, F107)."
      }
    ]
  });
  if (g) {
    sections.push({
      heading: "Leaving",
      lines: [
        { text: "Any member can leave alone, at any time, by a resignation no one else signs, keeping what they own and staying bound by what they signed (Agreements rule 37a)." },
        {
          text: "It takes effect for the collective at the collective's next record, its line, drawn with its signing key. Until then their signature still counts (F109, a stated cost). The members who stay then rotate the collective to keys the one who left never held (Agreements rule 37).",
          tone: "warn"
        }
      ]
    });
  }
  const a = t.abandonment;
  const absence = [];
  const warning = absenceWarning(t, names);
  if (warning) {
    absence.push(warning);
    if (a?.proof && !ABSENCE_PROOFS.has(a.proof)) {
      absence.push({ text: `This client does not implement the absence-proof cMIP the clause names (${short(a.proof)}): it cannot show how absence would be judged.`, tone: "bad" });
      blocking.push(`It names an absence-proof cMIP this client does not implement (${short(a.proof)}, task 14); a client MUST NOT sign terms naming one it does not implement, as for an unknown extension (Agreements, task "Absence proof", F182).`);
    }
    absence.push({ text: "Signing agrees to this in advance (Agreements rule 13). It is a protected clause: a later clone you do not sign cannot change it for you (Agreements rule 46a)." });
    absence.push({ text: "A declaration moves nothing by itself: what follows takes effect only through a record, rotation or clone put in force under it, and no later act undoes that (Agreements rule 51)." });
  } else {
    absence.push({ text: "No abandonment clause: nobody can declare a party absent." });
  }
  if (g) {
    const out = uncovered(t);
    if (!out.length) {
      absence.push({
        text: "Every member with a say in the constitution is covered: if one disappears, their voice can be removed, so the constitution never freezes for want of them (F105).",
        tone: "ok"
      });
    } else {
      absence.push({ text: `Not covered by the abandonment clause, though they have a say in the constitution: ${list(out.map(names))} (Agreements rule 36b, F105).`, tone: "bad" });
    }
  }
  sections.push({ heading: "If someone disappears", lines: absence });
  const more = [];
  if (!t.cmips.length) more.push({ text: "It uses no task cMIP." });
  for (const [task, h] of t.cmips) {
    const known = KNOWN[h];
    more.push({ text: `For task ${task}: ${specName(h)}.`, tone: known ? void 0 : "bad" });
    if (!known) blocking.push(`It names a cMIP this client does not implement (${short(h)}, task ${task}); a client that does not implement it cannot sign it (Agreements rule 2).`);
  }
  for (const h of t.extensions ?? []) {
    if (EXTENSIONS.has(h)) more.push({ text: `It adds the rules of ${specName(h)}.` });
    else {
      more.push({ text: `It adds the rules of ${specName(h)}.`, tone: "bad" });
      blocking.push(`It names an extension this client does not implement (${short(h)}); a client that does not implement all of them cannot sign it (Agreements rule 2).`);
    }
  }
  if (t.keepers) {
    more.push({ text: `Keepers record the deal as it happens: ${list(t.keepers[0].map(names))}; ${ruleWords(t.keepers[1], t.keepers[0], names)} count as recorded. A protected clause (Agreements rule 46a).` });
  }
  if (t.time) {
    more.push({ text: `Time reference: ${specName(t.time)}. This client does not read time references.`, tone: "bad" });
    blocking.push("It names a time reference, which this client does not read: it cannot show what its deadlines mean.");
  }
  if (t.arbitrators) more.push({ text: `Arbitrators or verifiers, who receive keys to judge content: ${list(t.arbitrators.map(names))}.` });
  if (t.splitGrant) {
    more.push({
      text: `Incoming payments go to a split service, under grant ${short(t.splitGrant)}. A protected clause. The collective's payee pointer counts for Agreements only if every address in it is also in the service's own signed pointer (Agreements rule 18, F123); every split is delivered to every holder it pays, naming each fee and who received it (F121, Q9). The service's grant key signs only receipts for money coming in under the collective's own claims and offers: never one whose payer is the service, nor a payout the collective is owed (F130, H7).`
    });
  }
  if (t.payeeGrants?.length) {
    more.push({
      text: `Incoming payments go to a split service, under ${t.payeeGrants.length === 1 ? "one payee grant" : `${t.payeeGrants.length} payee grants`}: ${list(t.payeeGrants.map(short))}. Each payee's own grant, signed by signing this deal; the service holds one grant key per payee, which signs only receipts for money coming into the deal, never one whose payer is the service, nor a split's payout; each payee can revoke its own grant (F129, H4, H5; F130, H7).`
    });
  }
  const holderName = (h) => h == null ? "this collective" : names(h);
  for (const [object, holders2] of t.stakes ?? []) {
    more.push({
      text: `Stake in ${object == null ? "this collective itself, a share of all its income (F121 Q8, F124 S1)" : names(object)}: ${list(holders2.map(([h, n]) => `${holderName(h)} ${n / 1e4}%`))}. Every payout matches its stake exactly, every fee alike for every stake (F124 N10); no share is lowered without its holder's signature (Agreements rule 46).`
    });
  }
  if (t.departed?.length) {
    more.push({ text: `Departed holders: ${list(t.departed.map(names))}. No voice and no veto; their share of the collective's income is in its stakes above (Agreements rule 46b, F124 N5).` });
  }
  if (t.backups?.services.length) {
    const service = (hs) => hs.length === 1 ? `the service granted by ${short(hs[0])}` : `the service granted by ${list(hs.map(short))} (one grant per payee, signed with this deal)`;
    more.push({
      text: `Backup split services, in order: ${list(t.backups.services.map(service))}. Each payment is tried at the split service first; only if that attempt fails, as the split cMIP ${t.backups.splitCmip ? short(t.backups.splitCmip) : ""} defines failure${t.backups.failure ? " (its terms for it are signed with this agreement)" : " (its defaults)"}, does it go to the next, and the next payment starts again from the first. Money only ever goes to a service named here (Agreements rule 18a, F249, F250).`
    });
  }
  for (const [judge2, next] of t.chain ?? []) {
    more.push({ text: `If ${judge2.startsWith("task ") ? `the judge for ${judge2}` : names(judge2)} answers \u201Cunknown\u201D, or does not act within its period, ${list(next.map(([hs, p]) => `${names(hs[0])} (after ${p} on the time reference)`))} take${next.length === 1 ? "s" : ""} over, in that order (Agreements rule 34a, F121).` });
  }
  more.push({
    text: "Whatever is done in the collective's name binds it once it is sealed to every member (or public) and on its chain, citing its latest decision; before that, even signed, it binds no one (Agreements rule 35a, F128). Where it is stored decides nothing: the relays are only where its clients publish and look first."
  });
  if (t.forkedFrom) {
    more.push({ text: `Forked from ${names(t.forkedFrom)}: a back-link only, deciding nothing; the fork act names this collective as a successor (Agreements rule 47a, F124 N4).` });
  }
  for (const p of t.succession ?? []) {
    const parts = [];
    if (p.stakes) parts.push(`stakes to ${list(p.stakes.map(([h, n]) => `${names(h)} (${n / 1e4}%)`))}`);
    if (p.seats) parts.push(`the seat to ${list(p.seats.map(names))}${p.entry === 1 ? ", with the members\u2019 approval" : ""}`);
    more.push({ text: `If ${names(p.party)} leaves or is declared absent: ${parts.join("; ") || "nothing named"}. A protected clause.` });
  }
  if (more.length) sections.push({ heading: "Also", lines: more });
  if (t.problem) blocking.push(problemWords(t.problem));
  const controls = [t.text, ...t.areaWords.map(([, w]) => w)].join("").match(INVISIBLE)?.length ?? 0;
  if (controls) {
    sections.push({
      heading: "Hidden characters",
      lines: [
        {
          text: `The words contain ${controls} invisible character${controls > 1 ? "s" : ""} that can make text display in another order than it is written. ${controls > 1 ? "They are" : "It is"} shown below as U+\u2026 codes (Text rule 5a). Read the words as shown before signing.`,
          tone: "warn"
        }
      ]
    });
  }
  return { sections, blocking, plain };
}
var FIELD_NAMES = {
  0: "who the members are",
  1: "the constitution's words",
  3: "the keepers",
  5: "the clone rule",
  6: "the time reference",
  7: "the stakes",
  8: "the split plan",
  9: "the abandonment clause",
  12: "the key grammar",
  13: "the arbitrators",
  14: "the split service's grant",
  16: "the succession plans",
  17: "the refund terms",
  18: "the constitutional change rule",
  19: "the areas",
  28: "the fees"
};
function planOf(before, after) {
  return agreementsClonePlan(before, after, AGREEMENTS_SPECS);
}
var powerKey = (p) => p.form === "area" ? `area ${p.area}` : p.form === "plan" ? `plan ${p.party}` : p.form;
function readChanges(beforePayload, afterPayload, names) {
  const before = termsOf(beforePayload);
  const after = termsOf(afterPayload);
  const out = [];
  const joined = after.parties.filter((p) => !before.parties.includes(p));
  const left = before.parties.filter((p) => !after.parties.includes(p));
  for (const p of joined) out.push({ text: `${names(p)} joins, bound once they sign the clone.` });
  for (const p of left)
    out.push({
      text: `${names(p)} leaves. They hand over nothing: the collective rotates to keys they never held, and from then on they have no say in it. They keep what they own (Agreements rules 37, 46, F100).`
    });
  const holder = (t) => t.grammar?.signing.form === "one" ? t.grammar.signing.holder : null;
  if (holder(before) !== holder(after) && holder(after)) {
    out.push({ text: `The signing key passes to ${names(holder(after))}${holder(before) ? ` (was ${names(holder(before))})` : ""}.` });
  }
  const sb = before.grammar?.chainKey;
  const sa = after.grammar?.chainKey;
  if (sa?.form === "shares" && sb?.form === "shares" && JSON.stringify(sa) !== JSON.stringify(sb)) {
    out.push({
      text: `The chain key is dealt afresh: ${sa.members.length} shares, any ${sa.threshold} rebuild it (was ${sb.members.length} shares, any ${sb.threshold}). Nobody leaving ever holds a share of the new key.`,
      tone: sa.threshold === 1 && sb.threshold !== 1 ? "warn" : void 0
    });
  }
  const ids = [...new Set([...before.areas, ...after.areas].map((a) => a.id))];
  for (const id of ids) {
    const b = before.areas.find((a2) => a2.id === id);
    const a = after.areas.find((x) => x.id === id);
    const held = (x) => x.holders.length ? `any ${x.threshold} of ${list(x.holders.map(names))}` : "nobody: frozen";
    if (!b && a) out.push({ text: `A new area, \u201C${a.name}\u201D (area ${id}): ${held(a)}.` });
    else if (b && !a) out.push({ text: `The \u201C${b.name}\u201D area (area ${id}) is dropped.`, tone: "warn" });
    else if (a && b && JSON.stringify(a) !== JSON.stringify(b)) {
      out.push({ text: `The \u201C${a.name}\u201D area (area ${id}) is now decided by ${held(a)} (was ${held(b)}).` });
    }
  }
  const rule = (r, parties) => ruleWords(r, parties, names);
  if (JSON.stringify(before.constitutional) !== JSON.stringify(after.constitutional)) {
    out.push({ text: `The constitution now changes with ${constitutionWords(after, names)} (was ${constitutionWords(before, names)}).` });
  }
  if (JSON.stringify(before.clone) !== JSON.stringify(after.clone)) {
    out.push({ text: `Other changes now need ${rule(after.clone, after.parties)} (was ${rule(before.clone, before.parties)}).` });
  }
  if (JSON.stringify(before.abandonment) !== JSON.stringify(after.abandonment)) {
    const words2 = (a) => !a ? "no one" : a.authority === "named" ? names(a.identity) : `any ${a.threshold} of the other parties`;
    out.push({
      text: `Absence is now judged by ${words2(after.abandonment)} (was ${words2(before.abandonment)}). A protected clause: it changes only with every member's signature, one version for everyone (Agreements rule 46a, F121).`,
      tone: "warn"
    });
  }
  if (before.text !== after.text) out.push({ text: "The constitution's words change: read the new words below, in full.", tone: "warn" });
  else out.push({ text: "The constitution's words stay the same." });
  const wb = new Map(before.areaWords);
  for (const [id, w] of after.areaWords) {
    if (wb.get(id) !== w) out.push({ text: `The \u201C${after.areas.find((a) => a.id === id)?.name ?? `area ${id}`}\u201D area's own words change: read them below.`, tone: "warn" });
  }
  let plan;
  try {
    plan = planOf(beforePayload, afterPayload);
  } catch (e3) {
    out.push({ text: `Agreements cannot say what this clone changes: ${e3 instanceof Error ? e3.message : e3}`, tone: "bad" });
    return out;
  }
  const areaName = (id) => before.areas.find((a) => a.id === id)?.name ?? after.areas.find((a) => a.id === id)?.name ?? `area ${id}`;
  for (const ch of plan.changes) {
    const what = ch.form === "field" ? FIELD_NAMES[ch.field] ?? `field ${ch.field}` : ch.form === "task" ? `the cMIP for task ${ch.task}` : ch.form === "extension" ? `the extension ${specName(ch.extension)}` : `the \u201C${areaName(ch.area)}\u201D area's own words`;
    const tier = ch.tier === "constitutional" ? "constitutional" : ch.tier === "judicial" ? "judicial, a protected clause: it changes only with every member's signature, one version for everyone (Agreements rule 46a, F121)" : ch.form === "words" ? `operational, in the \u201C${areaName(ch.area)}\u201D area` : "operational";
    out.push({ text: `A change to ${what}: ${tier}.` });
  }
  if (!plan.changes.length) out.push({ text: "Agreements find nothing changed in the terms." });
  const areas = before.areas;
  out.push({ text: `So its mark must name ${list(plan.needs.map((p) => powerWords(p, areas, names)))} (Agreements rule 44c).` });
  const claimed = (after.mark ?? []).map((e3) => powerKey(e3.power));
  if (JSON.stringify(claimed) === JSON.stringify(plan.needs.map(powerKey))) {
    out.push({ text: "Its mark names exactly that.", tone: "ok" });
  } else {
    out.push({
      text: `Its mark names ${list((after.mark ?? []).map((e3) => powerWords(e3.power, areas, names))) || "nothing"}: a false mark sinks the clone (F104).`,
      tone: "bad"
    });
  }
  return out;
}
function readRelease(m, before) {
  const files = [
    { text: `${m.name} ${m.version}: ${count2(m.files.length, "file")}, ${count2(m.dependencies.length, "library", "libraries")} it depends on.` },
    { text: m.source ? `Made from ${m.source}.` : "It names no source." }
  ];
  if (!m.previous) files.push({ text: "It is the first release: it names no release before it." });
  if (before) {
    const old = new Map(before.files.map((f) => [f.path, f.work]));
    const now4 = new Map(m.files.map((f) => [f.path, f.work]));
    const added = m.files.filter((f) => !old.has(f.path)).map((f) => f.path);
    const changed = m.files.filter((f) => old.has(f.path) && old.get(f.path) !== f.work).map((f) => f.path);
    const removed = before.files.filter((f) => !now4.has(f.path)).map((f) => f.path);
    files.push({
      text: `Since ${before.name} ${before.version}: ${count2(added.length, "file")} added, ${changed.length} changed, ${removed.length} removed; ${count2(m.files.length - added.length - changed.length, "file")} the same.`
    });
    const some = (xs, what) => {
      if (!xs.length) return;
      const shown = xs.slice(0, 30);
      files.push({ text: `${what}: ${shown.join(", ")}${xs.length > shown.length ? `, and ${xs.length - shown.length} more` : ""}.` });
    };
    some(added, "Added");
    some(changed, "Changed");
    some(removed, "Removed");
    const key = (d) => `${d.registry} ${d.name}`;
    const oldDeps = new Map(before.dependencies.map((d) => [key(d), d.version]));
    const newDeps = new Map(m.dependencies.map((d) => [key(d), d.version]));
    const depsAdded = [...newDeps.keys()].filter((k) => !oldDeps.has(k));
    const depsRemoved = [...oldDeps.keys()].filter((k) => !newDeps.has(k));
    const depsChanged = [...newDeps.keys()].filter((k) => oldDeps.has(k) && oldDeps.get(k) !== newDeps.get(k));
    if (depsAdded.length + depsRemoved.length + depsChanged.length) {
      files.push({ text: `Libraries: ${depsAdded.length} added, ${depsChanged.length} at another version, ${depsRemoved.length} removed.` });
    } else files.push({ text: "The libraries are the same." });
  } else if (m.previous) {
    files.push({ text: `It follows release ${short(m.previous)}, which this client does not hold, so what changed is not shown.` });
  }
  return [{ heading: "What is released", lines: files }];
}

// ../assess/src/assess.ts
var A = (...rules) => rules.map((rule) => ({ mir: "Agreements", rule }));
var unique = (cites) => cites.filter((c, i) => cites.findIndex((d) => d.mir === c.mir && d.rule === c.rule) === i);
var cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
var pct2 = (n) => `${Number((n / 1e4).toFixed(4))}%`;
var SHARED = ["The collective's keys", "Areas: who decides which acts", "Who decides what", "If someone disappears", "Hidden characters"];
function assess(payload, names, found) {
  const t = termsOf(payload);
  const collective = !!t.grammar;
  const problem = t.problem ? problemWords(t.problem) : null;
  const flags = problem ? [] : flagsOf(t, payload, names);
  const shared = readAgreement(t, names);
  const sections = [
    signedSection(t, names, found),
    boundSection(t, names),
    sharesSection(t, names),
    judgesSection(t, names),
    endsSection(t, names),
    owedSection(t, found),
    ...shared.sections.filter((s) => SHARED.includes(s.heading)),
    {
      heading: "Risks",
      lines: problem ? [{ text: `Not judged further: ${problem}`, tone: "bad" }] : flags.length ? flags.map((f) => ({ text: `${cap(f.text)} Rests on: ${f.rests}.`, tone: "warn" })) : [{ text: "None of the risks this tool looks for: a party with no exit, an uncapped fee, a judge who is also a party, no judge of forks, a stake diluted without its holder, money divided with no owner, or a stated cost one of its clauses brings.", tone: "ok" }]
    }
  ];
  const who = list(t.parties.map(names));
  const kind = collective ? "collective" : "deal";
  const summary = [
    collective ? `${t.parent ? "A new version of a collective\u2019s agreement" : "The founding agreement of a collective"} of ${t.parties.length} members: ${who}.` : `${t.parent ? "A new version of a deal" : "A deal"} between ${t.parties.length === 1 ? "one party" : `${t.parties.length} parties`}: ${who}.`,
    problem ? "Agreements refuse these terms: they bind nobody as they stand." : flags.length ? `${flags.length === 1 ? "One risk" : `${flags.length} risks`} flagged, each with the rule it rests on.` : "No risk flagged."
  ];
  return {
    kind,
    title: collective ? "A collective\u2019s agreement, assessed" : "A deal, assessed",
    summary,
    sections,
    plain: [{ heading: "The words, as signed", text: t.text }, ...shared.plain],
    flags,
    problem
  };
}
function signedSection(t, names, found) {
  const lines2 = [];
  if (!found) {
    lines2.push({ text: `The relays were not asked: who has signed is not known here. Its parties: ${list(t.parties.map(names))}.` });
  } else {
    for (const p of t.parties) {
      lines2.push(
        found.signed.includes(p) ? { text: `${names(p)} has signed.`, tone: "ok" } : { text: `${names(p)} has not signed: nothing in it binds ${names(p)} yet.`, tone: "warn" }
      );
    }
    if (found.invalid) lines2.push({ text: `Agreements count it invalid: ${found.invalid}`, tone: "bad" });
    else if (found.exists === true) lines2.push({ text: "It exists: every signature its rule asks for is there, as far as the relays asked show.", tone: "ok" });
    else if (found.exists === false) lines2.push({ text: "It is not in force: it exists only once every party has signed it.", tone: "warn" });
    else lines2.push({ text: "Whether it exists cannot be said from what the relays hold.", tone: "warn" });
    if (found.fork) {
      lines2.push({
        text: found.fork.tangled ? `The deal is tangled (${found.fork.tangled}): it stays on its reference ${found.fork.reference.slice(0, 8)}\u2026 until one version names every tip it drops (rule 47).` : `The deal stands forked: ${found.fork.branches.length} branches from its reference ${found.fork.reference.slice(0, 8)}\u2026; a payment under either branch counts (rule 47).`,
        tone: "warn"
      });
    } else if (found.inForce) {
      lines2.push({ text: `The version of this deal in force is ${found.inForce.slice(0, 8)}\u2026, as far as ${list(found.at)} show.` });
    }
  }
  lines2.push({ text: "Each party is bound only through its own signature act (Agreements rule 1)." });
  return { heading: "Who signed", lines: lines2 };
}
function roles(t, who, names) {
  const out = [];
  for (const [object, holders2] of t.stakes ?? []) {
    for (const [h, n] of holders2) if (h === who) out.push(`holds ${pct2(n)} of ${object == null ? "all of this collective\u2019s income" : names(object)}`);
  }
  if (t.arbitrators?.includes(who)) out.push("is named arbitrator or verifier");
  if (t.forkJudge === who) out.push("is the judge of the deal\u2019s forks");
  if (t.keepers?.[0].includes(who)) out.push("operates a keeper");
  if (t.abandonment?.authority === "named" && t.abandonment.identity === who) out.push("judges whether a party is absent");
  for (const [, next] of t.chain ?? []) if (next.some(([hs]) => hs[0] === who)) out.push("takes over as a judge in the chain of judgment");
  for (const a of t.areas ?? []) if (a.holders.includes(who)) out.push(`holds the \u201C${a.name}\u201D area`);
  for (const p of t.succession ?? []) if (p.party === who) out.push("has a succession plan in it");
  if (t.plan?.shares.some((s) => s.kind === "receiver" && s.receiver === who)) out.push("is a named receiver in the split plan");
  return out;
}
function boundSection(t, names) {
  const lines2 = [{ text: "Each party who signs is bound to the words below, as signed, and to every rule of these terms: a signature is consent to everything they define, pre-authorised changes included (Agreements rule 8)." }];
  for (const p of t.parties) {
    const r = roles(t, p, names);
    lines2.push({ text: `${names(p)}: ${r.length ? list(r) : "a party, with no stake or role of its own in these terms"}.` });
  }
  const others = /* @__PURE__ */ new Set();
  for (const [, holders2] of t.stakes ?? []) for (const [h] of holders2) if (h && !t.parties.includes(h)) others.add(h);
  for (const h of others) lines2.push({ text: `${names(h)}, not a party: ${list(roles(t, h, names))}. Bound by nothing here; protected by it (Agreements rules 45, 48).` });
  lines2.push({
    text: t.grammar ? "A member\u2019s obligations change only as the constitution\u2019s rules allow; no share is lowered without its holder\u2019s signature (Agreements rules 45, 48)." : "No version of it changes without every party\u2019s signature (Agreements rule 47, was 45b)."
  });
  return { heading: "What each party is bound to", lines: lines2 };
}
function sharesSection(t, names) {
  const lines2 = [];
  const stakes = t.stakes ?? [];
  stakes.forEach(([object, holders2], i) => {
    lines2.push({
      text: `Stake ${i}, in ${object == null ? "this collective itself, a share of all its income" : names(object)}: ${list(holders2.map(([h, n]) => `${h == null ? "this collective" : names(h)} ${pct2(n)}`))}, written in millionths summing to 100% (Agreements rule 9).`
    });
  });
  const p = t.plan;
  if (p) {
    const share2 = (s) => s.kind === "stake" ? `stake ${s.stake}, paid to its holders as currently held` : s.kind === "role" ? `the role \u201C${s.role}\u201D, paid to whoever fills it, with evidence the payer acknowledges (rule 22)` : s.kind === "receiver" ? `${names(s.receiver ?? "")}, a named receiver holding no stake` : `metric ${s.metric}`;
    lines2.push({
      text: `Each payment in is divided by the split cMIP ${names(p.cmip)}, which computes the amounts from these parts: ${p.shares.map((s, i) => `${share2(s)}, part ${s.part}${p.top.includes(i) ? ", taken off the top first" : ""}`).join("; ")} (Agreements rules 17, 27).`
    });
    if (p.shares.some((s) => s.kind === "role")) {
      lines2.push({
        text: p.unfilled === "stakes" ? "A role nobody fills goes to the stakes, in proportion to their parts (F218)." : p.unfilled === "held-open" ? "A role nobody fills is held open, as an obligation." : `A role nobody fills goes to ${names(p.unfilledTo ?? "")}.`
      });
    }
    const bearer = p.serviceBearsRailFees ? "The split service bears each payout\u2019s rail fee" : "Each receiver bears its payout\u2019s rail fee";
    const m = p.maxRailFee;
    lines2.push(
      m ? { text: `${bearer}; no payout may lose more than ${m.form === "millionths" ? `${pct2(m.value)} of each payout` : `${m.value} of ${names(m.unit ?? "")}`} to it, and a shortfall beyond that is the service\u2019s open obligation (Agreements rule 25).` } : { text: `${bearer}; the plan states no maximum fee per payout (Agreements rule 25).`, tone: "warn" }
    );
  }
  for (const f of t.fees ?? []) {
    const when = f.scope === "every" ? "every payment" : f.scope === "publication" ? `payments for ${names(f.of ?? "")}` : `payments by the rail ${names(f.of ?? "")}`;
    lines2.push({ text: `A fee entry: ${names(f.module)} is owed part ${f.part} of ${when}, taken off the top before the stakes divide, so it falls alike on every stake; a split leaving it out owes it (Agreements rule 28, F213, F214).` });
  }
  if (t.payeeGrants?.length || t.splitGrant) {
    lines2.push({ text: `Payments go to a split service, by ${t.splitGrant ? "the collective\u2019s grant" : `${t.payeeGrants.length === 1 ? "one payee\u2019s grant" : `each payee\u2019s own grant (${t.payeeGrants.length})`}`}: it publishes each split, delivered to every holder it pays, naming each fee and who received it (Agreements rules 16, 20).` });
    if (t.backups?.services.length) lines2.push({ text: `If an attempt at the service fails, ${t.backups.services.length === 1 ? "one backup" : `${t.backups.services.length} backups`} take${t.backups.services.length === 1 ? "s" : ""} that payment, in order (Agreements rule 17, field 29).` });
  } else if (stakes.length) {
    lines2.push({ text: "No split service: each payer\u2019s wallet pays each holder\u2019s own pointer by the stakes (payer-side splitting, Agreements rule 16)." });
  }
  if (!lines2.length) lines2.push({ text: "It divides no money: no stakes, no split plan, no fees." });
  return { heading: "Shares and fees", lines: lines2 };
}
function judgesSection(t, names) {
  const lines2 = [];
  const then = (key) => {
    const next = (t.chain ?? []).find(([j]) => j === key)?.[1] ?? [];
    return next.length ? `, then ${list(next.map(([hs, p]) => `${names(hs[0])} after ${p} on the time reference`))}, in that order` : "";
  };
  const cmip = (task) => t.cmips.find(([n]) => n === task)?.[1];
  const c9 = cmip(9);
  if (c9) lines2.push({ text: `Conditions are judged by the condition cMIP ${names(c9)}${then("task 9")}.` });
  const time = t.time ?? cmip(10);
  if (time) lines2.push({ text: `Time is judged by the time reference ${names(time)}: for this agreement, only it says whether something is before, after or past its terms (Agreements rule 33)${then("task 10")}.` });
  const c11 = cmip(11);
  if (c11) lines2.push({ text: `Anchoring is judged by ${names(c11)}${then("task 11")}.` });
  for (const a2 of t.arbitrators ?? []) lines2.push({ text: `Content is judged by ${names(a2)}, an arbitrator or verifier, who receives the keys it must judge${then(a2)}.` });
  if (!t.grammar) {
    lines2.push(
      t.forkJudge ? { text: `The judge of forks is ${names(t.forkJudge)} (field 27): if two complete versions of the deal ever stand side by side, it settles them on a party\u2019s request${then(t.forkJudge)} (Agreements rule 47).` } : { text: "No judge of forks: if two complete versions of the deal ever stand side by side, only a version every party signs settles them (Agreements rule 47).", tone: "warn" }
    );
  }
  if (t.keepers) {
    const [ops, r] = t.keepers;
    const need = ops.length === 1 ? "its record counts" : `${r.form === "all" ? `all ${ops.length}` : r.form === "threshold" ? `any ${r.threshold}` : list((r.named ?? []).map(names))} count as recorded`;
    lines2.push({ text: `${ops.length === 1 ? "A keeper records" : "Keepers record"} what happens, sealed, without reading it: operated by ${list(ops.map((o) => `${names(o)}${then(o)}`))}; ${need} (Agreements rule 36).` });
  }
  const a = t.abandonment;
  if (a) {
    lines2.push({
      text: a.authority === "named" ? `Whether a party is absent is judged by ${names(a.identity ?? "")}${a.proof ? `, checked by the absence-proof cMIP ${names(a.proof)}` : ""}${then(a.identity ?? "")} (Agreements rules 85, 87).` : `Whether a member is absent is judged by any ${a.threshold} of the other members${a.proof ? `, checked by the absence-proof cMIP ${names(a.proof)}` : ""} (Agreements rules 85, 87).`
    });
  }
  if (lines2.length) lines2.push({ text: "A judge that answers \u201Cunknown\u201D, or does not act within its period, passes the question to the next in its chain, which every party signed; only the active link settles (Agreements rule 35)." });
  else lines2.push({ text: "Nobody judges anything: no condition cMIP, no time reference, no arbitrator, keeper or absence authority." });
  return { heading: "Who judges, and in what order", lines: lines2 };
}
function endsSection(t, names) {
  const lines2 = [];
  if (t.parent) lines2.push({ text: `It is a new version of ${names(t.parent)}: once complete, it replaces it (Agreements rule 45).` });
  if (t.grammar) {
    lines2.push({ text: "Any member can leave alone, at any time, by a resignation no one else signs, keeping what they own (Agreements rule 70)." });
    lines2.push({ text: "The collective ends by a fork, its members splitting into successors, or by a closing once it holds nothing and owes nothing (Agreements rule 91)." });
  } else {
    lines2.push({ text: "A deal has no closing act. It ends, or winds down, by a new version every party signs, stating where its stakes went, what is still owed, and, where it is a party of another agreement, to whom that one now pays (Agreements rule 47, F263)." });
    lines2.push({ text: "A party leaves only as its terms provide." });
  }
  if (t.abandonment?.outcomes.includes(4)) lines2.push({ text: `A declaration of absence may close it (Agreements rule 89, outcome 4: ${OUTCOMES[4]}).` });
  if ((t.stakes ?? []).length) {
    const r = t.releaseRule;
    lines2.push({ text: `A stake ends if released to the public domain, which ${!r || r.form === "all" ? "every holder of it signs" : r.form === "named" ? `${list((r.named ?? []).map(names))} sign` : `holders of it holding together at least ${(r.share ?? 0) / 1e4}% sign`} (Agreements rule 55, field 24; Agreements draft 14, F308: by share, never by head).` });
  }
  return { heading: "How it ends", lines: lines2 };
}
function owedSection(t, found) {
  const lines2 = [];
  const service = !!(t.payeeGrants?.length || t.splitGrant);
  if (found) {
    lines2.push(...found.owed.length ? found.owed : [{ text: `Nothing owed under it, as far as ${list(found.at)} show.` }]);
  } else {
    lines2.push({ text: "The relays were not asked: no payment made under it is known here." });
    if (service) lines2.push({ text: "What its split service receives and does not split, or splits and does not pay out, is that service\u2019s open obligation, naming one receiver and this agreement (Agreements rule 30)." });
  }
  if (t.refund?.until != null) lines2.push({ text: `A refund owed on a payment under it is claimable until ${t.refund.until} on its time reference; past that point it is ended (field 17, F219).` });
  else if (service || (t.stakes ?? []).length) lines2.push({ text: "No refund terms: a refund owed stays open until claimed (Agreements rule 11; the core sets no lapse, F80)." });
  lines2.push({ text: "A party who has not signed owes nothing under it: its obligations are shown as unsigned, never as open (Agreements rule 1, F74)." });
  return { heading: "What is still owed", lines: lines2 };
}
function mustSign(t, p) {
  const rule = (r, among) => {
    if (!r || r.form === "all") return among;
    if (r.form === "named") return r.named ?? [];
    return (r.threshold ?? 0) >= among.length ? among : [];
  };
  switch (p.form) {
    case "clone":
      return rule(t.clone, t.parties);
    case "constitutional":
      return rule(t.constitutional, t.parties);
    case "judicial":
      return t.parties;
    case "area": {
      const a = t.areas.find((x) => x.id === p.area);
      return a && a.threshold >= a.holders.length ? a.holders : [];
    }
    default:
      return [];
  }
}
function signersFor(payload, t, field) {
  const m = new Map(cborDecode(payload));
  const mark = (x) => unhex(sha2562(`deal assessment: a version changing field ${field}, ${x}`));
  m.set(11, mark("its parent"));
  m.set(4, [[[1], [...t.parties].sort().map(unhex)]]);
  if (field === 8) {
    const plan = m.get(8);
    if (plan instanceof Map) m.set(8, new Map([...plan, [7, "a changed parameter"]]));
    else m.set(8, /* @__PURE__ */ new Map([[0, [[0, 0, 1]]], [1, mark("a split cMIP")]]));
  } else {
    m.set(28, [[mark("a fee Module"), 1]]);
  }
  try {
    const plan = agreementsClonePlan(payload, cborEncode(m), AGREEMENTS_SPECS);
    return /* @__PURE__ */ new Set([...plan.needs.flatMap((p) => mustSign(t, p)), ...plan.paySigners]);
  } catch {
    return null;
  }
}
function holders(t) {
  const out = [];
  for (const [, hs] of t.stakes ?? []) for (const [h] of hs) if (h && !out.includes(h)) out.push(h);
  return out;
}
function flagsOf(t, payload, names) {
  const out = [];
  const deal = !t.grammar;
  const who = (xs) => list(xs.map(names));
  const owners = holders(t);
  const a = t.abandonment;
  if (deal && t.parties.length > 1) {
    const stuck = uncovered(t);
    if (stuck.length) {
      out.push({
        code: "no-exit",
        family: "listed",
        who: stuck,
        text: `${who(stuck)} cannot be declared absent: if ${stuck.length === 1 ? "that party goes" : "any of them goes"} silent, nobody can change or end the deal, and no party can leave it.`,
        rests: "Agreements rule 47 (was 45b), stated cost: \u201Cone silent party blocks every change to a deal, however large\u201D; the way out is an abandonment clause removing an absent party\u2019s voice (rule 89, outcome 0)",
        cites: A(47, 89)
      });
    }
  }
  {
    const why = [];
    const rests = [];
    const cites = [];
    let bearers = [];
    if (t.plan && !t.plan.maxRailFee) {
      why.push("the split plan states no maximum fee per payout, so a payout may lose any rail fee and nothing beyond a maximum becomes the service\u2019s obligation");
      rests.push("Agreements rule 25 (was 24a): the split plan \u201Cmay state a maximum fee per payout\u201D; \u201Cwhere it states none, there is no cap\u201D, and a client must flag the absence before signing (F271); Money rule 21");
      cites.push(...A(25), { mir: "Money", rule: 21 });
    }
    if (owners.length) {
      const need = signersFor(payload, t, 28);
      bearers = need ? owners.filter((h) => !need.has(h)) : [];
      if (bearers.length) {
        why.push(`fees can be added or raised without ${who(bearers)}, who bear${bearers.length === 1 ? "s" : ""} them with every stake`);
        rests.push("Agreements rule 28 (was 27): fees come off the top of every stake, and their bearers consent by the power the fees field falls under, not each by their own signature, save a holder with no voice in it, who signs a version paying its stake less (rule 48, F270)");
        cites.push(...A(28, 48));
      }
    }
    if (why.length) out.push({ code: "uncapped-fee", family: "listed", who: bearers.length ? bearers : void 0, text: `Uncapped fee: ${why.join("; and ")}.`, rests: rests.join("; "), cites });
  }
  {
    const judges = /* @__PURE__ */ new Map();
    const add = (h, as) => {
      if (!h || !t.parties.includes(h)) return;
      judges.set(h, [...judges.get(h) ?? [], as]);
    };
    for (const x of t.arbitrators ?? []) add(x, "an arbitrator");
    add(t.forkJudge, "the judge of forks");
    for (const x of t.keepers?.[0] ?? []) add(x, "a keeper\u2019s operator");
    if (a?.authority === "named") add(a.identity, "the absence authority");
    for (const [, next] of t.chain ?? []) for (const [hs] of next) add(hs[0], "a later link of the chain of judgment");
    if (judges.size) {
      const ids = [...judges.keys()];
      out.push({
        code: "judge-is-party",
        family: "listed",
        who: ids,
        text: `A judge who is also a party: ${list(ids.map((h) => `${names(h)} judges as ${list([...new Set(judges.get(h))])}`))}, in a question where they have a stake of their own.`,
        rests: "Agreements rule 35 (was 34a), the chain of judgment, which every party signs; Agreements bar it for specifications only (\u201Ca judge never handles what it judges\u201D, Q20), and let a party be the absence authority (rule 85)",
        cites: A(35, 85)
      });
    }
  }
  if (deal && t.parties.length > 1 && !t.forkJudge) {
    out.push({
      code: "no-fork-judge",
      family: "listed",
      text: "No judge of forks: if two complete versions of the deal ever stand side by side, the deal stays on its reference until every party signs one settling version, and any party can keep it there.",
      rests: "Agreements rule 47 (was 45b), field 27: \u201CWith no judge of forks named, the deal stays on its reference\u201D; stated cost: \u201Ca party of either branch can refuse every settlement and keep the deal on its reference\u201D",
      cites: A(47)
    });
  }
  if (owners.length) {
    const hit = /* @__PURE__ */ new Set();
    const why = [];
    const rests = [];
    const cites = [];
    const lose = (a?.outcomes ?? []).filter((o) => o === 1 || o === 2);
    if (a && lose.length) {
      const heir = (h) => (t.succession ?? []).some((s) => s.party === h && (s.stakes ?? []).length > 0);
      const declarable = (h) => (t.parties.includes(h) || (t.departed ?? []).includes(h)) && !(a.authority === "named" && h === a.identity);
      const declared = owners.filter((h) => declarable(h) && !heir(h));
      if (declared.length) {
        for (const h of declared) hit.add(h);
        why.push(`${who(declared)}, naming no stake successor, may be declared absent and have ${declared.length === 1 ? "that stake" : "those stakes"} ${list(lose.map((o) => o === 1 ? "shared among the remaining holders" : "transferred to parties named or defined by role"))}, without signing; naming a successor sends the stake to the successor instead`);
        rests.push("Agreements rule 89 (was 53), new in draft 12 (F279): outcomes 1 and 2 apply to a stake \u201Conly where the holder\u2019s succession plan names no stake successor\u201D; rule 48");
        cites.push(...A(48, 89));
      }
    }
    const r = t.releaseRule;
    if (r && r.form !== "all") {
      const need2 = new Set(r.form === "named" ? r.named ?? [] : []);
      const left2 = owners.filter((h) => !need2.has(h));
      if (left2.length) {
        for (const h of left2) hit.add(h);
        why.push(`a stake can be released to the public domain, ending what it earns, without ${who(left2)}`);
        rests.push("Agreements rule 55 (was 17), field 24: the release rule says which holders sign a release");
        cites.push(...A(55));
      }
    }
    const need = signersFor(payload, t, 8);
    const left = need ? owners.filter((h) => !need.has(h)) : [];
    if (left.length) {
      for (const h of left) hit.add(h);
      why.push(`the split plan, which sets what each stake is paid, can be changed without ${who(left)}`);
      rests.push("Agreements rules 45 and 48: the split plan (field 8) falls under its own power (rules 62 to 65; every party in a deal, rule 47); a version paying a stake less needs the signature of a holder with no voice in that power (a deal\u2019s holder who is no party, a collective\u2019s departed holder: rule 48, F270, F274), not of a member, whom the collective\u2019s own rules bind");
      cites.push(...A(45, 48, 62, 63, 64, 65, 47));
    }
    if (why.length) out.push({ code: "dilutable-stake", family: "listed", who: owners.filter((h) => hit.has(h)), text: `A stake can be diluted without its holder: ${why.join("; and ")}.`, rests: rests.join("; "), cites: unique(cites) });
  }
  if (!(t.stakes ?? []).length && (t.plan || (t.fees ?? []).length)) {
    out.push({
      code: "no-owner",
      family: "listed",
      text: "No owner: it divides money but writes no stake, so every share is overhead, taken off the top, and nothing is left for an owner. Nobody is paid as an owner is, protected against a fee raised or a share added without their signature. A deal made on a vow writes a stake in the vow, held by whoever signed it, and what is left after the overhead is theirs.",
      rests: "Agreements rule 14, new in draft 13 (F284): \u201Ca deal made on a vow has an owner: the vow\u2019s signer, who holds the stake\u201D; rule 22 (F280): every share paying anyone but a stake is paid off the top, what is left going to the stakes alone; rule 48 (F270): a stake is not paid less without its holder",
      cites: A(14, 22, 48)
    });
  }
  if (a && !a.proof) {
    out.push({
      code: "absence-on-word",
      family: "stated cost",
      text: `Absence is on ${a.authority === "named" ? `${names(a.identity ?? "")}\u2019s` : "the other members\u2019"} word alone: no absence-proof cMIP checks it, and a party declared absent wrongly can only contest it, in public.`,
      rests: "Agreements rule 87 (was 51), stated cost: a declaration is the authority\u2019s judgment, \u201Ca stated cost the party accepted\u201D; rule 85 (was 49), client conformance (F178)",
      cites: A(87, 85)
    });
  }
  if (owners.length) {
    if (t.payeeGrants?.length || t.splitGrant) {
      out.push({
        code: "split-service-window",
        family: "stated cost",
        text: "A split service holds the money between receiving and paying out: after a stake is sold, a seller and the service acting together can keep paying the seller until the first split citing the sale.",
        rests: "Agreements rule 10 (was 14), stated cost (the window after a transfer); rule 32 (was 31), the trust that remains",
        cites: A(10, 32)
      });
    } else {
      out.push({
        code: "payer-side-split",
        family: "stated cost",
        text: "No split service: each payer divides its own payment, so a payer can pay some holders and not others, every holder\u2019s pointer is visible to payers, and the payer decides who gets a leftover unit.",
        rests: "Agreements rule 16 (was 18), stated cost (payer-side splitting); rule 9, stated cost (the payer decides tied units)",
        cites: A(16, 9)
      });
    }
  }
  return out;
}

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
  const list8 = (v, w) => {
    if (!Array.isArray(v)) throw new Error(`manifest: ${w}`);
    return v;
  };
  const prev = m.get(2);
  const files = list8(m.get(3), "files").map((x) => {
    const a = list8(x, "file");
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
  const dependencies = list8(m.get(4), "dependencies").map((x) => {
    const a = list8(x, "dependency");
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
    const entries = list8(m.get(6), "implements").map((e3) => {
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

// ../connector/src/words.ts
var INVISIBLE2 = /[؜​‎‏‪-‮⁦-⁩]/g;
function escapeControls(s) {
  return s.replace(INVISIBLE2, (c) => `<U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}>`);
}

// src/signing.ts
var SIGNING_SAY = "Even more experimental than Dub itself. Here you sign agreements for real collectives: founding one, changing its members, its releases. A signature binds you, and it is public. Read every proposal in full before signing; when in doubt, decline.";
var SIGNING_OFF_SAY = "Signing is off: proposals to sign wait in your inbox, unread, until you turn Signing on in the identity window.";
var SHARE_SAY = [
  "This is your share of the collective\u2019s chain key: its number and 24 words. Write both on paper, in order, and keep the paper away from anything that goes online.",
  "It is shown once. Dub keeps nothing of it: once you have typed three words back, the one-time key it came sealed to is destroyed, and the copy on the relays can never be opened again.",
  "With enough members\u2019 papers, the collective\u2019s keys can be changed (in Ki\u0161ib, later). A lost paper weakens that, as the collective\u2019s rule allows; never type these words into Dub again.",
  "It is not your own chain key, nor your signing key, nor a Bitcoin wallet."
];
async function fetchAct3(id, hints, via2 = {}) {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via2).getAct(id);
      if (a && describeAct(a).id === id) return { act: a, at: h };
    } catch {
    }
  }
  return null;
}
async function readProposal(act, names, hints, via2 = {}) {
  const d = describeAct(act);
  const blocking = [];
  if (!d.public || !d.payload) {
    return { kind: "other", title: "A private act", summary: ["It cannot be read here, so it cannot be signed here."], sections: [], plain: [], risks: [], blocking: ["It is private."], collective: null };
  }
  if (d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.terms) {
    const a = assess(d.payload, names);
    const t = termsOf(d.payload);
    const parent = t.parent;
    const sections = [...a.sections];
    const collective = null;
    let kind = "founding";
    if (parent) {
      kind = "clone";
      const p = await fetchAct3(parent, hints, via2);
      const pd = p ? describeAct(p.act) : null;
      if (pd?.payload) sections.unshift({ heading: "What it changes", lines: readChanges(pd.payload, d.payload, names) });
      else blocking.push(`The agreement it changes (${parent}) was not found, so what it changes cannot be shown.`);
    }
    if (!t.grammar) blocking.push("These terms found no collective: Dub signs collectives\u2019 agreements only.");
    if (a.problem) blocking.push(`Agreements refuse these terms: ${a.problem}`);
    return {
      kind,
      title: kind === "founding" ? `Found a collective: ${a.title}` : `Change a collective\u2019s agreement: ${a.title}`,
      summary: a.summary,
      sections,
      plain: a.plain.map((x) => ({ heading: x.heading, text: escapeControls(x.text) })),
      risks: a.flags.map((f) => ({ text: f.text, rests: f.rests })),
      blocking,
      collective
    };
  }
  if (d.spec === SPECS.envelopes && d.type === 0) {
    const m = cborDecode(d.payload);
    if (hex(m.get(0)) !== REPO_SPECS.manifest) {
      return { kind: "other", title: "A publication", summary: ["It is no release: nothing to sign here."], sections: [], plain: [], risks: [], blocking: ["Not a release."], collective: null };
    }
    const lockedHash = hex(m.get(2));
    let manifest = null;
    for (const h of [.../* @__PURE__ */ new Set([...m.get(6) ?? [], ...hints])]) {
      try {
        const locked = await relayAt(h, via2).getMedia(lockedHash);
        if (!locked) continue;
        const plain = openMedia(locked, m.get(5), m.get(4));
        if (workHash(plain) !== hex(m.get(1))) continue;
        manifest = decodeManifest(plain);
        break;
      } catch {
      }
    }
    if (!manifest) {
      return { kind: "release", title: "A release", summary: ["Its manifest was not found, so what it releases cannot be shown."], sections: [], plain: [], risks: [], blocking: ["Its manifest was not found."], collective: d.signer ?? null };
    }
    const files = manifest.files.slice(0, 200).map((f) => ({ text: `${f.path}: ${f.size} bytes, fingerprint ${f.work.slice(0, 16)}\u2026` }));
    if (manifest.files.length > 200) files.push({ text: `And ${manifest.files.length - 200} more files.` });
    return {
      kind: "release",
      title: `Sign a release: ${manifest.name} ${manifest.version}`,
      summary: [
        `Published by the collective ${names(d.signer)}. It counts as the collective\u2019s release once enough holders of its Releases area have signed it, each with an act of their own (Agreements rule 60).`,
        "Dub cannot compare these files with a copy of your own: sign only if you checked them elsewhere (each file\u2019s fingerprint is listed)."
      ],
      sections: [...readRelease(manifest, null), { heading: `Its files (${manifest.files.length})`, lines: files }],
      plain: [],
      risks: [],
      blocking,
      collective: d.signer ?? null
    };
  }
  const act2 = actOfCollective(d, names);
  if (act2) return act2;
  return { kind: "other", title: "An act Dub does not sign", summary: ["Dub signs founding terms, clones of a collective\u2019s agreement, releases, and a collective\u2019s acts waiting for a second key."], sections: [], plain: [], risks: [], blocking: ["Not something Dub signs."], collective: null };
}
function actOfCollective(d, names) {
  if (!d.signer || !d.payload) return null;
  const by = d.binding && d.binding !== d.signer ? " It was made with one member\u2019s own key (F353)." : "";
  const base = (title2, lines2, plain = []) => ({
    kind: "act",
    title: title2,
    summary: [`An act of the collective ${names(d.signer)}, waiting for your signature: the area that reaches it asks one more key than it has.${by} Signing adds yours, with your own key for this collective where your apps hold it (Agreements rule 60, F353).`],
    sections: [{ heading: "What it is", lines: lines2.map((text3) => ({ text: text3 })) }],
    plain,
    risks: [],
    blocking: [],
    collective: d.signer
  });
  try {
    if (d.spec === MIRS.money) {
      const r = moneyRead(d.type, d.payload).act;
      const amount = r.amount;
      const lines2 = [`A Money act: ${r.type}.`];
      if (amount) lines2.push(`Amount: ${amount.value.toLocaleString("en")} in unit ${amount.unit.slice(0, 12)}\u2026 (the Bitcoin units Module names regtest satoshis so).`);
      for (const k of ["payer", "payee", "debtor", "creditor"]) if (typeof r[k] === "string") lines2.push(`${k[0].toUpperCase()}${k.slice(1)}: ${names(r[k])}.`);
      if (r.type === "pointer") {
        const rails = r.rails ?? [];
        lines2.push(`Where payments to the collective go from now on (its payee pointer, version ${r.version}${r.previous ? `, replacing ${String(r.previous).slice(0, 12)}\u2026` : ""}):`);
        for (const [i, x] of rails.entries()) lines2.push(`Rail ${i + 1}: ${labelOf(x.module) ?? `a rail Module not known here (${x.module.slice(0, 12)}\u2026)`}, address ${hex(new Uint8Array(x.address)).slice(0, 24)}\u2026`);
        lines2.push("Signing it with your key counts as your consent in the area reaching Money: check that these rails are the ones the collective agreed (its split service\u2019s, say).");
      }
      return base(`Sign a money act of the collective: ${r.type}`, lines2);
    }
    if (d.spec === SPECS.text && d.type === 0) {
      const m = cborDecode(d.payload);
      const text3 = typeof m.get(0) === "string" ? m.get(0) : "";
      return base("Sign a post of the collective", ["A post (Text), in the collective\u2019s name."], [{ heading: "Its words", text: escapeControls(text3) }]);
    }
    if (d.spec === SPECS.envelopes && d.type === 0) return base("Sign a publication of the collective", ["A publication (Envelopes), in the collective\u2019s name."]);
    if (d.spec === REPO_SPECS.agreements && d.type === AGREEMENTS_TYPES.offer) {
      const m = cborDecode(d.payload);
      const price = m.get(2);
      return base("Sign an offer of the collective", [`A standing offer, always public.${Array.isArray(price) ? ` Its price: ${String(price[1])}.` : ""}`], typeof m.get(4) === "string" ? [{ heading: "Its words", text: escapeControls(m.get(4)) }] : []);
    }
  } catch {
    return null;
  }
  return null;
}
async function holdsAnArea(act, hints, member, via2 = {}) {
  const got = await fetchAct3(act, hints, via2);
  const d = got ? describeAct(got.act) : null;
  if (!d?.payload || d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms) return false;
  try {
    return termsOf(d.payload).areas.some((a) => a.holders.includes(member));
  } catch {
    return false;
  }
}

// src/carryin.ts
var message2 = (e3) => e3 instanceof Error ? e3.message : String(e3);
var NOT_CURRENT = "These words do not give this identity\u2019s current signing key: they are another identity\u2019s, an earlier key\u2019s, or written wrong. Nothing was kept. If these are your chain key\u2019s words, they must never be typed into an online app.";
async function lookCurrent(id, seed, hints, via2) {
  let pub;
  try {
    pub = signingPublic(seed);
  } catch {
    throw new Error("The words do not hold a signing key. Nothing was kept.");
  }
  let look;
  try {
    look = await lookUp(id, hints, via2);
  } catch (e3) {
    throw new Error(`This identity was not found at ${hints.join(", ")}: ${message2(e3)}`);
  }
  const r = look.resolution;
  if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing can be signed for it until they agree.");
  if (r.stop === "pending" || r.waiting.length) throw new Error("A change of its keys is waiting for its homes: bring it once that change counts, with the new words.");
  if (!r.signingKey || !r.links.length) throw new Error(`Its chain could not be read (${r.stop}).`);
  if (hex(r.signingKey) !== hex(pub)) throw new Error(NOT_CURRENT);
  return look;
}
async function servedChain(id, homes, via2) {
  for (const h of homes) {
    try {
      const chain = (await relayAt(h.hint, via2).identity(id)).chain;
      if (chain.length) return chain;
    } catch {
    }
  }
  throw new Error("None of its homes served its chain.");
}
function carriedKey(look, seed) {
  const secret = encryptionSecret(seed);
  if (!look.encryptionKey || !look.encryptionKeyAct || hex(xwingPublic(secret)) !== hex(look.encryptionKey)) return null;
  const e3 = look.verifier.latest(look.resolution.identity, SPECS.envelopes, 4);
  const version2 = e3.payload ? Number(cborDecode(e3.payload).get(0)) : 1;
  return { version: version2, act: look.encryptionKeyAct, secret: hex(secret) };
}

// src/names.ts
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
function readName(typed) {
  const name = typed.normalize("NFC").trim();
  const why = nameProblem(name);
  if (why) throw new Error(`That name cannot be used: ${why}. Nothing was signed.`);
  return name;
}
var namePayload = (name) => cborEncode(
  /* @__PURE__ */ new Map([
    [0, name],
    [1, unhex(NAMING_SPEC)]
  ])
);
async function namesOf(identity, places, via2 = {}) {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const l = await lookUp(identity, places, via2, v);
  const routed = l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
  const at = [.../* @__PURE__ */ new Set([...l.resolution.homes.map((h) => h.hint), ...routed, ...places])];
  await holdSequence(v, identity, l, at, via2);
  const names = /* @__PURE__ */ new Map();
  const withdrawn = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via2).feed({ signer: identity, after });
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

// src/shapes.ts
var PUBLISH_WARNING = "Anyone can read whom this identity follows, now and for good: a later change of mind stops new versions, it does not take this one back. The names you gave them stay in this app.";

// src/people.ts
var PEOPLE_SPEC = sha2562("People cMIP, draft 2, test value until publication");
var PEOPLE_SPEC_1 = sha2562("People cMIP, draft 1, test value until publication");
var FOLLOW_LIST = 0;
var SEALED_LIST = 1;
var NO_PEOPLE = () => ({ follows: [], muted: [], list: "private", published: null, sealed: null, carried: false, seen: [], inbox: { after: {}, items: [] }, sent: [] });
function followListPayload(a) {
  const m = /* @__PURE__ */ new Map([[0, a.version]]);
  if (a.previous) m.set(1, unhex(a.previous));
  m.set(2, a.withdrawn ? [] : a.ids.map(unhex));
  if (a.withdrawn) m.set(3, true);
  return cborEncode(m);
}
async function readFollowList(identity, places, via2 = {}) {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const l = await lookUp(identity, places, via2, v);
  const routed = l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
  const at = [.../* @__PURE__ */ new Set([...routed, ...places, ...l.resolution.homes.map((h) => h.hint)])];
  await holdSequence(v, identity, l, at, via2);
  const acts = /* @__PURE__ */ new Map();
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via2).feed({ signer: identity, after });
        for (const it of page.items) {
          if (it.kind !== "act") continue;
          let d;
          try {
            d = describeAct(it.item);
          } catch {
            continue;
          }
          if (acts.has(d.id) || !d.public || d.spec !== PEOPLE_SPEC && d.spec !== PEOPLE_SPEC_1 || d.type !== FOLLOW_LIST || d.signer !== identity || !d.payload) continue;
          v.add(it.item);
          if (v.status(d.id) !== "valid") continue;
          try {
            const m = cborDecode(d.payload);
            const version2 = Number(m.get(0));
            const prev = m.get(1);
            const ids = m.get(2).filter((x) => x instanceof Uint8Array).map(hex);
            acts.set(d.id, { version: version2, previous: prev instanceof Uint8Array ? hex(prev) : null, ids, withdrawn: m.get(3) === true });
          } catch {
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  const out = { act: null, version: 0, ids: [], withdrawn: false, forked: null };
  let at_ = null;
  for (; ; ) {
    const next = [...acts.entries()].filter(([, a2]) => a2.previous === at_ && a2.version === out.version + 1);
    if (next.length !== 1) {
      if (next.length > 1) out.forked = out.version;
      return out;
    }
    const [id, a] = next[0];
    Object.assign(out, { act: id, version: a.version, ids: a.ids, withdrawn: a.withdrawn });
    at_ = id;
  }
}
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
async function readSealedList(identity, keys, homes, via2 = {}) {
  const out = { act: null, version: 0, follows: [], forked: false, problems: [] };
  if (Array.isArray(keys) && !keys.length) return out;
  const open = Array.isArray(keys) ? openerOf(identity, keys) : keys;
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l;
  try {
    l = await lookUp(identity, homes, via2, v);
  } catch (e3) {
    out.problems.push(`its homes did not answer (${e3 instanceof Error ? e3.message : String(e3)})`);
    return out;
  }
  const at = [.../* @__PURE__ */ new Set([...homes, ...l.resolution.homes.map((h) => h.hint)])];
  const acts = /* @__PURE__ */ new Map();
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via2).feed({ to: identity, after });
        const sealed = page.items.filter((it) => it.kind === "sealed");
        const opened = sealed.length ? await open(sealed.map((it) => it.item)) : [];
        for (const o of opened) {
          const d = o?.described;
          if (!o || !d || acts.has(d.id) || d.public || d.signer !== identity || d.spec !== PEOPLE_SPEC || d.type !== SEALED_LIST || !d.payload) continue;
          if (o.key) l.verifier.addWithKey(o.act, o.key);
          else l.verifier.add(o.act);
          if (l.verifier.status(d.id) !== "valid") continue;
          try {
            const m = cborDecode(d.payload);
            const prev = m.get(1);
            const follows = [];
            for (const x of m.get(2)) {
              if (!Array.isArray(x) || !(x[0] instanceof Uint8Array) || x[0].length !== 32) continue;
              const id = hex(x[0]);
              if (follows.some((f) => f.id === id)) continue;
              follows.push({ id, name: typeof x[1] === "string" && x[1].trim() ? x[1].slice(0, 64) : null });
            }
            acts.set(d.id, { version: Number(m.get(0)), previous: prev instanceof Uint8Array ? hex(prev) : null, follows });
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
    const next = [...acts.entries()].filter(([, a]) => a.previous === from && a.version === version2 + 1);
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
    const a = acts.get(tip.id);
    Object.assign(out, { act: tip.id, version: a.version, follows: a.follows });
  }
  return out;
}

// ../damgar/src/total.ts
var GRANT_LIMITS_SPEC_3 = sha2562("Grant limits cMIP, draft 3, test value until publication");
var TOTAL = 2;
var TOTAL_SAY = "In all: kept by the apps, not judged by verifiers. Dub refuses to sign past it and Damgar counts it here; a reader of the lane\u2019s acts judges only the cap per payment and the expiry, since a total needs every act of the lane, some of them private.";
function readAsked(v) {
  if (!(v instanceof Map)) throw new Error("the limits are not a map");
  const m = new Map(v);
  let total = null;
  if (m.has(TOTAL)) {
    const t = m.get(TOTAL);
    if (!Array.isArray(t) || t.length !== 2 || !(t[0] instanceof Uint8Array) || t[0].length !== 32 || typeof t[1] !== "number" || !Number.isSafeInteger(t[1]) || t[1] <= 0) throw new Error("the cap in all is not [unit, value], a whole amount above zero");
    total = { unit: hex(t[0]), value: t[1] };
    m.delete(TOTAL);
  }
  const limits = readLimits(m);
  if (total && limits.cap && limits.cap.unit !== total.unit) throw new Error("the cap in all is in another unit than the cap per act");
  return { limits, total };
}
function askedValue(limits, total, encode) {
  const m = cborDecode(encode(limits));
  if (total) {
    if (!Number.isSafeInteger(total.value) || total.value <= 0) throw new Error("The cap in all is a whole amount above zero.");
    if (limits.cap && total.value < limits.cap.value) throw new Error("The cap in all is at least the cap per payment.");
    m.set(TOTAL, [unhex(total.unit), total.value]);
  }
  return cborDecode(cborEncode(m));
}
function spent(payments, unit) {
  return payments.filter((p) => !p.refused && p.amount.unit === unit).reduce((n, p) => n + p.amount.value, 0);
}

// ../grants/src/lanes.ts
function reaches(kinds, spec, type, layerOf2) {
  if (!kinds?.length) return true;
  return kinds.some((k) => "layer" in k ? layerOf2(spec) === k.layer : k.spec === spec && k.type === type);
}
async function grantsForKey(person, key, hints, via2 = {}) {
  const out = [];
  for (const a of await allBy(person, hints, via2)) {
    const d = describeAct(a);
    if (d.spec !== MIRS.agreements || d.type !== AGREEMENTS_TYPES.grant || !d.payload) continue;
    try {
      const g = readGrant(d.payload);
      if (g.grantee === person && g.key === key && !out.some((x) => x.id === d.id)) out.push({ id: d.id, grant: g });
    } catch {
    }
  }
  return out;
}
async function revocationsOf(grantor, grant, hints, via2 = {}) {
  const out = [];
  for (const a of await allBy(grantor, hints, via2)) {
    const d = describeAct(a);
    if (d.spec !== MIRS.agreements || d.type !== REVOCATION || !d.payload) continue;
    const named = cborDecode(d.payload).get(0);
    if (named instanceof Uint8Array && hex(named) === grant && !out.includes(d.id)) out.push(d.id);
  }
  return out;
}
async function actsUnder(grantor, grant, hints, via2 = {}) {
  const out = [];
  for (const a of await allBy(grantor, hints, via2)) {
    const d = describeAct(a);
    if (d.binding === grant && !out.some((x) => x.id === d.id)) out.push({ id: d.id, public: d.public, spec: d.spec, type: d.type });
  }
  return out;
}

// ../damgar/src/link-say.ts
var LINK_SAY = [
  "Damgar can answer a Lightning payment to you by itself, if you let it make invoices on your node. It needs a permission from your node that makes invoices and does nothing else: it cannot pay, cannot read your balance, cannot move money.",
  "On lnd: bake it with \u201Clncli bakemacaroon invoices:write invoices:read\u201D, and give its file here with the node\u2019s address and certificate. Damgar asks the node for its balance with it first, and refuses a permission that can read it.",
  "Its cost: whoever steals it can make invoices in your node\u2019s name, never take anything. Remove it here at any time; without it, you make each invoice in your wallet, as before.",
  "An invoice is made by itself only below the cap of your receipts lane, and only while \u201CFollow every step by hand\u201D is off."
];

// ../damgar/src/collective.ts
var MONEY_LAYER = 2;
function capOf2(hexed) {
  if (!hexed) return null;
  try {
    const m = cborDecode(unhex(hexed));
    const c = m instanceof Map ? m.get(0) : null;
    return Array.isArray(c) && c[0] instanceof Uint8Array && typeof c[1] === "number" ? { unit: hex(c[0]), value: c[1] } : null;
  } catch {
    return null;
  }
}
async function termsOf2(id, hints, via2) {
  for (const h of hints) {
    const a = await relayAt(h, via2).getAct(id).catch(() => null);
    if (!a) continue;
    const d = describeAct(a);
    if (d.spec !== REPO_SPECS.agreements || d.type !== 0 || !d.payload) return null;
    return readTerms(d.payload, AGREEMENTS_SPECS);
  }
  return null;
}
async function readCollective(me, id, hints, via2) {
  const now4 = await collectiveNow(id, hints, via2);
  if (!now4.agreement) return { id, agreement: null, area: null, key: null, why: "Its agreement in force could not be read from its relays and homes." };
  const t = await termsOf2(now4.agreement, hints, via2);
  const a = t?.areas.find((x) => x.kinds.some((k) => k.form === "layer" && k.layer === MONEY_LAYER || k.spec === AGREEMENTS_SPECS.money));
  const area = a ? { id: a.id, name: a.name, holders: a.holders, number: a.threshold, cap: capOf2(a.limits) } : null;
  const keys = await readMemberKeys(me.id, me.f.encryption.map((e3) => unhex(e3.secret)), me.f.homes.map((h) => h.hint), via2).catch(() => []);
  const key = keys.length ? await memberKeyFor(keys, id, hints, via2).catch(() => null) : null;
  let why = null;
  if (!area) why = "Its constitution draws no Money area: the collective\u2019s money acts count on its own key, held by its founder\u2019s Edubba.";
  else if (!area.holders.includes(me.id)) why = `You hold no box in its Money area (\u201C${area.name}\u201D): your key does not count there.`;
  else if (!key) why = "No key of yours for this collective was found sealed to you at your homes: it is made when you sign its founding or a member change.";
  return { id, agreement: now4.agreement, area, key, why };
}
var withinCap = (area, amount) => !area.cap || area.cap.unit === amount.unit && amount.value <= area.cap.value;
function promiseSay(c, me, a, names) {
  const area = c.area;
  const above = !withinCap(area, a.amount);
  const need = area.number + (above ? 1 : 0);
  const others = area.holders.filter((h) => h !== me);
  const lines2 = [
    `A promise to pay, by the collective ${names(c.id)}: it owes ${names(a.to)} ${a.amount.value.toLocaleString("en")} (a Money obligation, public, signed with your own key for the collective; F353).`,
    `What for: ${a.whatFor || "nothing said"}.`,
    `Its Money area, \u201C${area.name}\u201D: ${area.holders.map(names).join(", ")}; ${area.number} key${area.number === 1 ? "" : "s"}${area.cap ? `; above ${area.cap.value.toLocaleString("en")} an act, one more (the grant limits cMIP, draft 2)` : ""}.`,
    above ? `It is above the cap: it counts only with ${need} keys. Yours signs it now; ${others.map(names).join(", ")} ${others.length === 1 ? "is" : "are"} asked for theirs, in their own app.` : need === 1 ? "Within the area: your key alone makes it count." : `The area asks ${need} keys: yours signs it now; the others are asked for theirs.`,
    "Damgar holds no wallet: paying the promise is a payment like any other."
  ];
  return { lines: lines2, above, others: need > 1 ? others : [] };
}
var promiseDigest = (c, payload) => sha2562(new Uint8Array([...new TextEncoder().encode(`MOR Damgar collective promise, version 1
${c.id}
`), ...payload]));
var promisePayload = (c, a) => obligationPayload({ debtor: c.id, creditor: a.to, unit: a.amount.unit, value: a.amount.value, pointer: a.pointer });
async function signPromise(me, c, payload, ask2, text3, hints, via2) {
  return signAndAsk(me, c.id, c.key, { spec: AGREEMENTS_SPECS.money, type: 1, payload }, ask2, text3, hints, via2);
}
async function standing(c, act, amount, hints, via2) {
  const area = c.area;
  const verdicts = area?.cap ? [[act, withinCap(area, amount)]] : [];
  return (await judgeCollective(c.id, [act], hints, via2, verdicts)).get(act);
}

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
async function readActs(identity, keys, homes, via2) {
  const acts = /* @__PURE__ */ new Map();
  const problems = [];
  if (Array.isArray(keys) && !keys.length) return { acts, problems: ["this app holds no encryption key of this identity"] };
  const open = Array.isArray(keys) ? openerOf(identity, keys) : keys;
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l;
  try {
    l = await lookUp(identity, homes, via2, v);
  } catch (e3) {
    return { acts, problems: [`its homes did not answer (${e3 instanceof Error ? e3.message : String(e3)})`] };
  }
  const at = [.../* @__PURE__ */ new Set([...homes, ...l.resolution.homes.map((h) => h.hint)])];
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via2).feed({ to: identity, after });
        const sealed = page.items.filter((it) => it.kind === "sealed").map((it) => it.item);
        const opened = sealed.length ? await open(sealed) : [];
        for (const o of opened) {
          const d = o?.described;
          if (!o || !d || acts.has(d.id) || d.public || d.signer !== identity || d.spec !== ACCEPTED_SPEC || d.type !== SEALED_LIST2 || !d.payload) continue;
          if (o.key) l.verifier.addWithKey(o.act, o.key);
          else l.verifier.add(o.act);
          if (l.verifier.status(d.id) !== "valid") continue;
          const x = readList(d.id, d.payload);
          if (x) acts.set(d.id, x);
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e3) {
      problems.push(`${h}: ${e3 instanceof Error ? e3.message : String(e3)}`);
    }
  }
  return { acts, problems };
}
function ancestors(acts, id) {
  const out = /* @__PURE__ */ new Set();
  const walk = (x) => {
    if (out.has(x)) return;
    out.add(x);
    const a = acts.get(x);
    if (!a) return;
    if (a.previous) walk(a.previous);
    for (const m of a.merged) walk(m);
  };
  walk(id);
  return out;
}
async function readAccepted(identity, keys, homes, via2 = {}) {
  const { acts, problems } = await readActs(identity, keys, homes, via2);
  const followed = /* @__PURE__ */ new Set();
  for (const a of acts.values()) {
    if (a.previous) followed.add(a.previous);
    for (const m of a.merged) followed.add(m);
  }
  const tips = [...acts.values()].filter((a) => !followed.has(a.id)).sort((x, y) => x.id < y.id ? -1 : 1);
  const version2 = Math.max(0, ...tips.map((t) => t.version));
  if (tips.length <= 1) return { entries: new Map(tips[0]?.entries ?? []), tips, merged: [], version: version2, problems };
  const anc = tips.map((t) => ancestors(acts, t.id));
  const common = [...anc[0]].filter((x) => anc.every((s) => s.has(x)) && acts.has(x));
  const base = common.map((x) => acts.get(x)).sort((a, b) => b.version - a.version)[0];
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
  const via2 = opts.via ?? {};
  const homes = me.f.homes.map((h) => h.hint);
  const held = [...me.f.encryption].reverse().filter((e3) => e3.secret).map((e3) => unhex(e3.secret));
  const secrets = held.length ? held : opts.open ?? [];
  if (Array.isArray(secrets) && !secrets.length) throw new Error("This app holds no encryption key of this identity, so its accepted list cannot be sealed to it. Nothing was changed.");
  for (let round = 0; round < 5; round++) {
    const read3 = await readAccepted(me.id, secrets, homes, via2);
    if (read3.problems.length >= homes.length && !read3.tips.length) throw new Error(`The identity\u2019s homes did not answer (${read3.problems.join("; ")}): the accepted list was not changed.`);
    const next = new Map(read3.entries);
    change(next);
    const same = read3.tips.length === 1 && JSON.stringify([...next].sort()) === JSON.stringify([...read3.entries].sort());
    if (same || !read3.tips.length && !next.size) return { written: null, list: read3 };
    const again = await readAccepted(me.id, secrets, homes, via2);
    if (!sameTips(again.tips, read3.tips)) continue;
    await opts.check();
    const look = await lookUp(me.id, homes, via2);
    if (!look.encryptionKey || !me.f.encryption.some((e3) => (e3.secret ? hex(xwingPublic(unhex(e3.secret))) : e3.public) === hex(look.encryptionKey))) {
      throw new Error("The encryption key this identity publishes is not one this app holds: the accepted list cannot be sealed. Nothing was changed.");
    }
    const [first, ...others] = read3.tips;
    const payload = listPayload({ version: read3.version + 1, previous: first?.id ?? null, merged: others.map((t) => t.id), entries: next });
    let made;
    try {
      made = await me.signNow(ACCEPTED_SPEC, SEALED_LIST2, payload, { public: false, to: [me.id] });
    } finally {
      await opts.save();
    }
    const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
    let left = 0;
    for (const h of homes) {
      try {
        await relayAt(h, via2).putSealed(sealed);
        left++;
      } catch {
      }
    }
    await leaveAtHomes(me, made, { via: via2, sealed: left > 0 });
    await opts.save();
    if (!left) throw new Error("No home took the accepted list: nothing was changed. Try again.");
    return { written: made.id, list: { entries: next, tips: [{ id: made.id, version: read3.version + 1, previous: first?.id ?? null, merged: others.map((t) => t.id), entries: next }], merged: read3.merged, version: read3.version + 1, problems: [] } };
  }
  throw new Error("Another app kept changing the accepted list while this one wrote: nothing was changed. Try again.");
}
async function publishAccepted(me, list8, relays, previous, withdrawn, save) {
  const payload = listPayload({ version: (previous?.version ?? 0) + 1, previous: previous?.act ?? null, merged: [], entries: withdrawn ? /* @__PURE__ */ new Map() : list8.entries }, withdrawn);
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

// ../damgar/src/damgar.ts
var LINE_SAY = "Damgar keeps its own line of acts for this identity (its money acts and messages). If the signing key is ever changed with the chain key, in Ki\u0161ib, that change must keep this line, or every claim and receipt signed here becomes void. Ki\u0161ib reads it from the homes and keeps it.";
var SPENT_SAY = "This identity\u2019s signing key was changed elsewhere, with its chain key, so the signing key\u2019s words Damgar holds no longer count. Nothing was signed. To go on here, give Damgar the new signing key\u2019s words.";
var RUNNER_OLD_KEY_SAY = "This identity\u2019s keys were changed with its chain key, and Ki\u0161ib\u2019s runner still holds the old signing key: nothing was signed. Give the runner the new signing key\u2019s words, in Ki\u0161ib (Runner, Identities held here). Damgar then goes on, in new lines.";
var RUNNER_HOLDS_SAY = "Ki\u0161ib\u2019s runner holds this identity\u2019s signing key, on this Mac; Damgar holds none of its keys. Its words are given and changed in Ki\u0161ib, never here.";
var RUNNER_NO_OPEN_SAY = "Ki\u0161ib does not let Damgar open what is sealed to this identity: drafts, requests and payments sealed to it are not read here. To allow it, in Ki\u0161ib: Runner, Apps, Damgar, \u201Cmay open what is sealed to this identity\u201D.";
var NO_KEY_SAY = "Damgar holds no encryption key for this identity, so nothing sealed to it opens here: no draft, no request, no payment. Its encryption key was not made from its signing key\u2019s words.";
var REQUEST_KEY_SAY = [
  "Damgar makes an on-chain request key and keeps it here, beside the signing key. It signs, for each payment, the request that binds a fresh address to that payment alone. It answers address requests by itself when they arrive through MOR.",
  "It moves no money: the money goes to your Bitcoin key, which stays in your wallet. But a thief holding it could commit your side to payments you did not intend, for example under terms you have left. The money would still reach your Bitcoin key (the on-chain rail Module, \u201CThe request key is online\u201D).",
  "To replace it: \u201CMake a new request key\u201D here publishes a new payee pointer naming the new key. From then on the old key no longer counts for new payments, which follow the pointer in force; payments already bound to the old key stay as they are."
];
var LIGHTNING_COSTS = [
  "A public node exposes its owner: naming it in your payee pointer links this identity to it publicly, with its channels and the coins behind them; its network address may be seen; identities sharing a node are linked by it.",
  "A Lightning vault stops a thief holding your MOR signing key, not one who takes the node, which must stay online to issue invoices. Your vault\u2019s node should be another node than your flow\u2019s.",
  "A claim without its preimage stays pending forever (MOR has no clock); an invoice for a fraction of a satoshi cannot be a MOR payment; keysend and AMP payments prove nothing."
];
var ONCHAIN_COSTS = [
  "Slow, and not final until confirmed: a payment counts after six blocks (about an hour on Bitcoin). A rewrite of the chain deeper than that would leave a counted payment unpaid, which has happened twice on Bitcoin, from software faults.",
  "The amount is in the clear on the chain: a payment of exactly a published price names the work; with a relay\u2019s timing, it names the payer. A payer is as anonymous as their coins.",
  "Checking proofs needs the chain\u2019s headers, kept or trusted from a header service: Damgar on this computer trusts the regtest node it is given, and says so.",
  "An ordinary wallet cannot spend a pay-to-contract output unless it is given that payment\u2019s commitment: Damgar keeps every commitment in your account. Spending is not shown in round 1.",
  "The request key is online in Damgar (above). Amounts below 330 satoshis cannot be paid on this rail."
];
var DEBT_SAY = "Damgar keeps to the Money layer, and a Money-only app shows every state of an obligation as unknown (Money rule 15, M5): whether it is open, discharged or released needs an app that reads Agreements. A payment to the flow counts toward it only once the creditor acknowledges it with an act of their own holding a pointer (Money rule 17).";
var ACCOUNT_NOTES = [
  "Each claim and receipt is checked by the rail Module it names, from the rail\u2019s own evidence: on Lightning the invoice its node signed and the preimage; on-chain the transaction in its block, on the chain Damgar follows.",
  "Beside the rail\u2019s answer, whether the payment went to a pointer in force for what it pays, and as the vault allows. For a debt, an agreement or an offer, that is Agreements\u2019 to read: unknown here.",
  "Money rule 29 (a theft of the signing key: anchor or bear the loss) is not judged here: it needs Agreements\u2019 reading of the payee\u2019s acts.",
  "Amounts in different units are never added: one total per unit, side by side."
];
var NO_BOOK = () => ({ after: {}, acts: {}, drafts: {}, requestsIn: {}, requestsOut: {}, invoices: {}, payments: {}, pointers: [], published: null });
var list2 = (xs) => [...new Set(xs.map((s) => s.trim()).filter(Boolean))];
var message3 = (e3) => e3 instanceof Error ? e3.message : String(e3);
var now = () => Math.floor(Date.now() / 1e3);
var short2 = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
var b642 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
var railName = (m) => m === SPEC.lightning.hash ? "Lightning" : m === SPEC.onchain.hash ? "on-chain" : `rail Module ${m.slice(0, 8)}\u2026`;
var Damgar = class {
  /**
   * `web`: Damgar's web client. `chain`: the chain followed (program only).
   * `link`: how a receive-only link is opened (program only, F351).
   * `app`: Damgar's code run inside another app (Dub), which signs a
   * payer's acts only under a lane whose key it holds, named so (F338).
   */
  constructor(store, opts = {}) {
    this.store = store;
    this.opts = opts;
  }
  /** This app's line as the homes hold it, for its card (H80's question 2). */
  line = lineReader("Damgar");
  /** This app's line: what waits sent first, in its own turn (the file read again there, the key checked first), then read back. Null where the homes could not be read. */
  async lineNow(me, via2) {
    if (Object.keys(me.f.unsent ?? {}).length) {
      await this.serial(async () => {
        const f = await this.load(me.id);
        if (!f) return;
        await this.current(f);
        await sendWaiting(f, via2);
        await this.store.saveIdentity(f);
        me.f.unsent = f.f.unsent;
      }).catch(() => void 0);
    }
    return this.line(me, via2).catch(() => null);
  }
  queue = Promise.resolve();
  /** Display names read (the naming cMIP), by identity, for a few minutes (memory only): the panel shows names, not hashes. */
  names = /* @__PURE__ */ new Map();
  async nameOf(id, places, via2) {
    const c = this.names.get(id);
    if (c && c.at + 300 > now()) return c.name;
    const name = (await namesOf(id, places, via2).catch(() => [])).map((x) => x.name).pop() ?? null;
    this.names.set(id, { name, at: now() });
    return name;
  }
  /** The accepted list as last read, by identity (memory only). */
  lists = /* @__PURE__ */ new Map();
  /** An identity held here; one used through Kišib's runner signs by it, Damgar holding no key (the Dubsar runner cMIP). */
  async load(id) {
    const me = await this.store.identity(id);
    if (me && !me.f.signingSecret && this.opts.runner) me.signer = this.opts.runner.signer();
    return me;
  }
  /**
   * How Damgar opens what is sealed to an identity: with the encryption keys
   * it holds; for one used through Kišib, through its runner where Kišib
   * lets Damgar (the Dubsar runner cMIP, draft 2, section 8). Null, with why,
   * where it cannot.
   */
  async opener(me) {
    const secrets = [...me.f.encryption].reverse().filter((e3) => e3.secret).map((e3) => unhex(e3.secret));
    if (secrets.length) return { open: openerOf(me.id, secrets), problem: null };
    const r = this.opts.runner;
    if (me.f.signingSecret || !r) return { open: null, problem: NO_KEY_SAY };
    let p;
    try {
      p = await r.paired();
    } catch (e3) {
      return { open: null, problem: message3(e3).replace(/ Nothing was signed\.$/, "") };
    }
    if (!p || p.state !== "approved" || !p.identities.some((x) => x.id === me.id)) return { open: null, problem: "Damgar is not paired with Ki\u0161ib for this identity any more: nothing sealed to it opens here." };
    if (!p.open) return { open: null, problem: RUNNER_NO_OPEN_SAY };
    const open = async (sealed) => (await r.open(me.id, sealed)).map((o) => o ? { ...o, described: o.key ? openWithKey(o.act, o.key) : describeAct(o.act) } : null);
    return { open, problem: null };
  }
  // ------------------------------------------------------------ an identity used through Kišib (the Dubsar runner cMIP)
  runner() {
    if (!this.opts.runner) throw new Error("Ki\u0161ib\u2019s runner is in the computer\u2019s program only, never the web client: bring the identity with its signing key\u2019s words instead.");
    return this.opts.runner;
  }
  /** Where the pairing with Kišib stands, and the identities it lets Damgar use. */
  async runnerState() {
    if (!this.opts.runner) return { available: false, origin: null, state: null, code: null, identities: [], problem: null };
    const held = await this.store.held();
    try {
      const p = await this.opts.runner.paired();
      return { available: true, origin: this.opts.runner.origin(), state: p?.state ?? null, code: p?.code ?? null, identities: (p?.identities ?? []).map((x) => ({ id: x.id, form: idForm(x.id), name: x.name, held: held.includes(x.id) })), problem: null };
    } catch (e3) {
      return { available: true, origin: this.opts.runner.origin(), state: null, code: this.opts.runner.code(), identities: [], problem: message3(e3) };
    }
  }
  async runnerPair() {
    return this.runner().pair();
  }
  /** Use an identity Kišib's runner holds and lets Damgar use: no key of it kept here; money acts always ask, in Kišib's panel inside Damgar's window. */
  runnerTake(a) {
    return this.serial(async () => {
      const p = await this.runner().paired();
      if (!p || p.state !== "approved") throw new Error(p?.state === "waiting" ? "Ki\u0161ib has not approved Damgar yet: approve it in Ki\u0161ib (Runner, Apps), comparing the code." : "Damgar is not paired with Ki\u0161ib\u2019s runner: pair it first.");
      const k = p.identities.find((x) => x.id === a.id);
      if (!k) throw new Error("Ki\u0161ib does not let Damgar use this identity: choose it for Damgar in Ki\u0161ib (Runner, Apps).");
      if ((await this.store.held()).includes(k.id)) {
        await this.store.setActive(k.id);
        return { lines: [{ text: "Damgar already uses this identity: it is the one in use now.", tone: "ok" }] };
      }
      const look = await lookUp(k.id, k.homes, {});
      const r = look.resolution;
      if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): Damgar cannot use it until they agree.");
      const binding = r.links[r.links.length - 1];
      if (!r.signingKey || hex(r.signingKey) !== k.key) throw new Error(RUNNER_OLD_KEY_SAY);
      const chain = await servedChain(k.id, r.homes, {});
      const named = list2(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
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
        private: [],
        split: true,
        routes: null,
        encryption: look.encryptionKey && look.encryptionKeyAct ? [{ version: 1, act: look.encryptionKeyAct, secret: "", public: hex(look.encryptionKey) }] : [],
        pending: null
      };
      await this.store.write(k.id, "settings", { relays: named.length ? named : r.homes.map((h) => h.hint), via: {} });
      await this.store.saveIdentity(new TestIdentity(f, {}));
      await this.store.setActive(k.id);
      return {
        lines: [
          { text: `Damgar uses ${k.name ?? short2(k.id)} through Ki\u0161ib\u2019s runner: Ki\u0161ib holds its signing key, Damgar none. Every money act is shown by Ki\u0161ib, in its panel here, before it is signed: money always asks.`, tone: "ok" },
          p.open ? { text: "Ki\u0161ib opens for Damgar what is sealed to this identity: drafts, requests and payments are read here, Damgar holding no key.", tone: "ok" } : { text: RUNNER_NO_OPEN_SAY, tone: "warn" },
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
  async keys(id) {
    return await this.store.read(id, "keys") ?? { request: null, earlier: [] };
  }
  serial(f) {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => void 0);
    return next;
  }
  who(id, me) {
    return { id, short: short2(id), me: id === me };
  }
  async ctx() {
    const active = await this.store.active();
    const me = active ? await this.load(active) : null;
    if (!me) throw new Error("No identity in use: bring one by its signing key\u2019s words.");
    const s = await this.store.read(me.id, "settings") ?? { relays: [], via: {} };
    const book = { ...NO_BOOK(), ...await this.store.read(me.id, "book") ?? {} };
    return { me, s, book, hints: [.../* @__PURE__ */ new Set([...me.f.homes.map((h) => h.hint), ...s.relays])] };
  }
  async saveBook(id, book) {
    await this.store.write(id, "book", book);
  }
  // ------------------------------------------------------------ the identity
  /**
   * Bring an identity by its ID and its signing key's words (the carry
   * Module, section 4), as Dub does: kept only if the words give its current
   * signing key; its encryption key where the words carry it. Damgar starts
   * its own line. An identity already held takes the new words instead.
   */
  bring(a) {
    return this.serial(async () => {
      const via2 = a.via ?? {};
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
      const look = await lookCurrent(id, seed, [address], via2);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await servedChain(id, r.homes, via2);
      const named = list2(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : list2(a.relays ?? []);
      if (!relays.length) throw new Error("This identity names no relays. Give one or more relay addresses, and bring it again.");
      const enc2 = carriedKey(look, seed);
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
      await this.store.write(id, "settings", { relays, via: via2 });
      await this.store.saveIdentity(new TestIdentity(f, via2));
      await this.store.setActive(id);
      return {
        lines: [
          { text: "Its current signing key matches the words.", tone: "ok" },
          enc2 ? { text: "Its encryption key is the one the words carry: drafts, requests and payments sealed to it open here.", tone: "ok" } : { text: NO_KEY_SAY, tone: "warn" },
          { text: LINE_SAY, tone: "warn" }
        ]
      };
    });
  }
  /** The new signing key's words, after a rotation made elsewhere counts (the carry Module, 4.6). */
  renew(words2) {
    return this.serial(async () => {
      const active = await this.store.active();
      if (!active) throw new Error("No identity in use.");
      let seed;
      try {
        seed = fromWords(words2);
      } catch (e3) {
        if (e3 instanceof Refused) throw new Error(`${e3.message}. Nothing was kept.`);
        throw e3;
      }
      return this.renewHeld(active, seed);
    });
  }
  async renewHeld(id, seed) {
    const me = await this.store.identity(id);
    const s = await this.store.read(id, "settings") ?? { relays: [], via: {} };
    if (hex(seed) === me.f.signingSecret) throw new Error("These are the signing key\u2019s words Damgar already holds, and they still count: nothing to change.");
    const look = await lookCurrent(id, seed, [.../* @__PURE__ */ new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via);
    const r = look.resolution;
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
    const carried = carriedKey(look, seed);
    if (carried && !me.f.encryption.some((e3) => e3.act === carried.act)) me.f.encryption.push(carried);
    await this.store.saveIdentity(me);
    return {
      lines: [
        { text: "The new signing key\u2019s words give its current signing key. Damgar signs with them from now on, in a new line.", tone: "ok" },
        carried ? { text: "Its encryption key is the one the new words carry.", tone: "ok" } : { text: NO_KEY_SAY, tone: "warn" },
        { text: LINE_SAY, tone: "warn" }
      ]
    };
  }
  /** A new identity made here, waiting for three of its chain key's words typed back (memory only: nothing of it is written before). */
  pending = null;
  /**
   * Make a new identity (decided: every app stands alone; Damgar gains Make):
   * its chain key from a seed shown as words, once, and kept nowhere, as Dub
   * and Kišib make one. Nothing is published until three of the words are
   * typed back (`makeConfirm`). Starting again forgets the last one.
   */
  async make(a) {
    const via2 = a.via ?? {};
    const hints = list2(a.homes);
    if (!hints.length) throw new Error("Give at least one home address: where the identity lives, and anyone can check it.");
    const relays = list2(a.relays);
    for (const r of [...hints, ...relays]) if (!/^https?:\/\//.test(r)) throw new Error(`\u201C${r}\u201D: an address starts with https:// (or http://)`);
    const homes = [];
    for (const hint of hints) {
      let info;
      try {
        info = await relayAt(hint, via2).info();
      } catch (e3) {
        throw new Error(`${hint} did not answer: ${message3(e3)}`);
      }
      const op = info.get(0);
      if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator`);
      homes.push({ operator: hex(op), hint });
    }
    const positions = threePositions((n) => {
      const b = new Uint32Array(1);
      const lim = Math.floor(4294967296 / n) * n;
      do
        crypto.getRandomValues(b);
      while (b[0] >= lim);
      return b[0] % n;
    });
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const chain = newChainKey(seed);
    const id = TestIdentity.create({ homes, via: via2, chainKey: chain.key });
    id.f.safety = { scheme: 0, seeds: "" };
    chain.key.seeds.fill(0);
    this.pending?.seed.fill(0);
    this.pending = { file: id.f, seed, positions, relays: relays.length ? relays : hints, via: via2 };
    return { words: chain.words, positions };
  }
  /** The three words typed back: then the genesis goes to its homes, its routes and encryption key are published, and it is the identity in use. */
  makeConfirm(typed) {
    return this.serial(async () => {
      const p = this.pending;
      if (!p) throw new Error("No new identity is waiting: make one first.");
      if (!typedBack(toWords(p.seed), p.positions, typed)) throw new Error(`Those are not words ${p.positions.join(", ")} as shown. Look at what you wrote down. Nothing has been published.`);
      const id = new TestIdentity(p.file, p.via);
      const sent = await id.publishGenesis();
      if (!sent.some((x) => x.result?.receipt)) throw new Error(`No home took the identity, so it was not kept: ${sent.map((x) => `${x.home} ${x.error ?? x.code ?? ""}`).join("; ")}`);
      p.seed.fill(0);
      this.pending = null;
      await this.store.write(id.id, "settings", { relays: p.relays, via: p.via });
      await this.store.saveIdentity(id);
      await this.store.setActive(id.id);
      await id.publishRoutes([
        { scope: null, hints: p.relays, kind: 0 },
        { scope: null, hints: p.relays, kind: 1 }
      ]);
      await this.store.saveIdentity(id);
      await id.publishEncryptionKey(encryptionSecret(unhex(id.f.signingSecret)));
      await this.store.saveIdentity(id);
      for (const r of p.relays)
        for (const act of id.chainActs())
          await relayAt(r, p.via).putAct(act).catch(() => void 0);
      return {
        lines: [
          { text: `Made: its homes took it (${sent.filter((x) => x.result?.receipt).map((x) => x.home).join(", ")}). Its acts and its inbox are at ${p.relays.join(", ")}; its encryption key is published.`, tone: "ok" },
          { text: "Its chain key is on your paper only: Damgar kept none of it. Its signing key\u2019s words are in the identity\u2019s menu (Words)." }
        ]
      };
    });
  }
  async use(id) {
    if (!(await this.store.held()).includes(id)) throw new Error("Damgar does not hold that identity.");
    await this.store.setActive(id);
  }
  async leave() {
    await this.store.setActive(null);
  }
  /** Forget an identity here: its keys, its request key and its book go. What it signed stays where it was sent. */
  forget(id) {
    return this.serial(async () => {
      if (!(await this.store.held()).includes(id)) throw new Error("Damgar does not hold that identity.");
      const was = await this.store.active();
      await this.store.forget(id);
      this.lists.delete(id);
      if (was === id) await this.store.setActive((await this.store.held())[0] ?? null);
    });
  }
  /** The signing key's words, on request: the way back if this app's storage is lost. */
  async carry() {
    const { me } = await this.ctx();
    if (!me.f.signingSecret) throw new Error(RUNNER_HOLDS_SAY);
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)) };
  }
  /** Whether the signing key Damgar holds still counts. */
  async check() {
    const { me } = await this.ctx();
    try {
      await this.current(me);
      return { current: true, say: null };
    } catch (e3) {
      if (message3(e3) === SPENT_SAY) return { current: false, say: SPENT_SAY };
      throw e3;
    }
  }
  async current(me) {
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
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
      if (look.encryptionKey && look.encryptionKeyAct && !me.f.encryption.some((e3) => e3.act === look.encryptionKeyAct)) me.f.encryption.push({ version: me.f.encryption.length + 1, act: look.encryptionKeyAct, secret: "", public: hex(look.encryptionKey) });
      await this.store.saveIdentity(me);
      return;
    }
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) throw new Error(SPENT_SAY);
  }
  /** Sign, then save the sequence before anything leaves. */
  /** Sign with the identity's own key, held here, or through Kišib's runner where Damgar holds none (the Dubsar runner cMIP). */
  signAct(me, spec, type, payload, o) {
    return me.signNow(spec, type, payload, o);
  }
  // ------------------------------------------------------------ what is accepted (the accepted cMIP, F340)
  async accepted(me, fresh = false) {
    const c = this.lists.get(me.id);
    if (c && !fresh && c.at + 60 > now()) return c.list;
    const { open } = await this.opener(me);
    const l = await readAccepted(me.id, open ?? [], me.f.homes.map((h) => h.hint), me.via);
    this.lists.set(me.id, { list: l, at: now() });
    return l;
  }
  acceptedSet(l) {
    return new Set(l.entries.keys());
  }
  /**
   * Accept these, and only these, of what Damgar lists (F338: "changeable
   * in Settings"); every entry of another app's part is kept as found (the
   * accepted cMIP, 1.3). Written on the latest version read, checked again
   * before sending (F340).
   */
  setAccepted(keys) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.current(me);
      const want = new Set(keys);
      const unknownKey = keys.find((k) => !ACCEPTABLE.some((a) => a.key === k));
      if (unknownKey) throw new Error(`Damgar lists no \u201C${unknownKey}\u201D.`);
      const r = await changeAccepted(
        me,
        (entries) => {
          for (const a of ACCEPTABLE) for (const h of a.hashes) {
            if (want.has(a.key)) entries.set(h, labelOf(h) ?? null);
            else entries.delete(h);
          }
        },
        { via: s.via, save: () => this.store.saveIdentity(me), check: () => this.current(me), open: (await this.opener(me)).open }
      );
      this.lists.set(me.id, { list: r.list, at: now() });
      const lines2 = [];
      if (r.list.merged.length) lines2.push({ text: `Two apps had changed the accepted list at once. Both changes were merged: ${r.list.merged.join(" ")}`, tone: "warn" });
      lines2.push(r.written ? { text: `What you accept is sealed to this identity and kept at its homes (version ${r.list.version}): every app holding the identity reads it; nobody else can.`, tone: "ok" } : { text: "Nothing changed." });
      for (const a of ACCEPTABLE) {
        if (!want.has(a.key)) continue;
        const missing = a.needs.filter((n) => !want.has(n));
        if (missing.length) lines2.push({ text: `${a.name} needs ${missing.map((n) => ACCEPTABLE.find((x) => x.key === n).name).join(" and ")} accepted too, to be of use.`, tone: "warn" });
      }
      if (want.has("onchain") && this.opts.web) lines2.push({ text: "The web client follows no chain: an on-chain payment is shown paid, not yet checked against the chain.", tone: "warn" });
      return { lines: lines2 };
    });
  }
  /** The other option (F59): publish the accepted list, or withdraw it. */
  publishList(on) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      const l = await this.accepted(me, true);
      const id = await publishAccepted(me, l, s.relays, book.published ? { act: book.published.act, version: book.published.version } : null, !on, () => this.store.saveIdentity(me));
      book.published = { act: id, version: (book.published?.version ?? 0) + 1, withdrawn: !on };
      await this.saveBook(me.id, book);
      return {
        lines: [
          on ? { text: `What you accept is published at ${s.relays.join(", ")}: anyone can read which specifications you accept, and so which rails you can pay on.`, tone: "warn" } : { text: "The published list is withdrawn: it is private again. Earlier versions stay readable as acts.", tone: "ok" }
        ]
      };
    });
  }
  // ------------------------------------------------------------ state
  async state() {
    const active = await this.store.active();
    const held = [];
    for (const id of await this.store.held()) {
      const f = await this.store.identity(id);
      held.push({ id, grouped: groupId(id), short: short2(id), active: id === active, runner: !f?.f.signingSecret, name: f ? await this.nameOf(id, f.f.homes.map((h) => h.hint), f.via) : null });
    }
    const me = active ? await this.load(active) : null;
    const out = { web: !!this.opts.web, settingsSaved: false, stage: "identity", held, identity: null, accept: [], list: { version: 0, merged: [], published: false, problems: [] }, counts: { toSign: 0, toPay: 0 } };
    if (!me) return out;
    const s = await this.store.read(me.id, "settings") ?? { relays: [], via: {} };
    const book = { ...NO_BOOK(), ...await this.store.read(me.id, "book") ?? {} };
    const line = await this.lineNow(me, s.via);
    out.identity = {
      id: me.id,
      grouped: groupId(me.id),
      form: idForm(me.id),
      short: short2(me.id),
      homes: me.f.homes.map((h) => h.hint),
      relays: s.relays,
      encryption: me.f.encryption.length > 0,
      line: line ?? noLine(me.f),
      // The collectives under it (decided: acting as a collective is the identity panel's gesture): those Damgar acts for, added here.
      collectives: await Promise.all((s.collectives ?? []).map(async (c) => ({ id: c, form: idForm(c), short: short2(c), name: await this.nameOf(c, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via) }))),
      name: held.find((h) => h.id === me.id)?.name ?? null,
      runner: !me.f.signingSecret
    };
    let l;
    try {
      l = await this.accepted(me);
    } catch (e3) {
      l = { entries: /* @__PURE__ */ new Map(), tips: [], merged: [], version: 0, problems: [message3(e3)] };
    }
    const set = this.acceptedSet(l);
    out.accept = ACCEPTABLE.map((a) => ({ key: a.key, name: a.name, kind: a.kind, draft: a.draft, text: a.text, does: a.does, here: a.here, built: a.built, needs: a.needs, accepted: isAccepted(a, set), hashes: a.hashes }));
    out.list = { version: l.version, merged: l.merged, published: !!book.published && !book.published.withdrawn, problems: l.problems };
    out.stage = l.version === 0 ? "accept" : "ready";
    out.settingsSaved = !!s.settingsSaved;
    out.counts = {
      toSign: Object.values(book.drafts).filter((d) => d.stage === "new").length + Object.values(book.requestsIn).filter((r) => r.stage === "new" || r.stage === "debt").length + Object.values(book.invoices).filter((i) => i.stage === "new").length + Object.values(book.laneRequests ?? {}).filter((r) => r.stage === "new").length + Object.values(book.payments).filter((p) => p.side === "in" && p.claims.length > 0 && !p.receipts.length).length,
      toPay: Object.values(book.payments).filter((p) => p.side === "out" && p.stage === "to pay").length
    };
    return out;
  }
  /** Settings were saved (H45): from now on its sections start folded. */
  settingsSaved() {
    return this.serial(async () => {
      const active = await this.store.active();
      if (!active) return;
      const s = await this.store.read(active, "settings") ?? { relays: [], via: {} };
      if (!s.settingsSaved) await this.store.write(active, "settings", { ...s, settingsSaved: true });
    });
  }
  // ------------------------------------------------------------ for a collective (round 3, F353)
  /** The collectives this identity acts for in money, each as its relays and homes show it now, with the promises signed here. */
  collectives() {
    return this.serial(async () => {
      const { me, s, book, hints } = await this.ctx();
      const out = [];
      for (const id of s.collectives ?? []) {
        const places = await this.collectivePlaces(id, hints, s.via);
        let c;
        try {
          c = await readCollective(me, id, places, s.via);
        } catch (e3) {
          c = { id, agreement: null, area: null, key: null, why: message3(e3) };
        }
        const acts = [];
        for (const [act, x] of Object.entries(book.collectiveActs ?? {}).filter(([, x2]) => x2.collective === id)) {
          acts.push({ act, to: x.to, amount: x.amount, whatFor: x.whatFor, standing: c.area ? await standing(c, act, x.amount, places, s.via).catch(() => null) : null });
        }
        out.push({ ...c, key: c.key ? { ...c.key, secret: new Uint8Array() } : null, acts });
      }
      return { collectives: out };
    });
  }
  async collectivePlaces(id, hints, via2) {
    try {
      const l = await lookUp(id, hints, via2);
      return [.../* @__PURE__ */ new Set([...hints, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)])];
    } catch {
      return hints;
    }
  }
  /** Act for a collective, by its ID: kept only if this identity holds a box in its Money area and its own key for it is found. */
  collectiveAdd(typed) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const id = readId(typed);
      const c = await readCollective(me, id, await this.collectivePlaces(id, hints, s.via), s.via);
      if (c.why) throw new Error(`${c.why} Nothing was kept.`);
      s.collectives = [.../* @__PURE__ */ new Set([...s.collectives ?? [], id])];
      await this.store.write(me.id, "settings", s);
      const area = c.area;
      return {
        lines: [
          { text: `Damgar acts for ${short2(id)} in money, with your own key for it (F353).`, tone: "ok" },
          { text: `Its Money area, \u201C${area.name}\u201D: ${area.holders.map(short2).join(", ")}; ${area.number} key${area.number === 1 ? "" : "s"}${area.cap ? `; above ${area.cap.value.toLocaleString("en")} an act, one more` : ""}.` }
        ]
      };
    });
  }
  /** Stop acting for a collective here (it stays what it is; nothing is signed). */
  collectiveRemove(id) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      s.collectives = (s.collectives ?? []).filter((c) => c !== id);
      await this.store.write(me.id, "settings", s);
      return { lines: [{ text: `Damgar no longer acts for ${short2(id)} here. Nothing was signed; add it again by its ID.`, tone: "ok" }] };
    });
  }
  /** A promise to pay from the collective, read back: what it says, and how many keys it needs (the area, its cap). Nothing is signed. */
  collectivePromiseRead(a) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const r = await this.collectivePromiseMake(me, s, hints, a);
      return { lines: r.say.lines.map((text3) => ({ text: text3 })), digest: r.digest };
    });
  }
  async collectivePromiseMake(me, s, hints, a) {
    if (!(s.collectives ?? []).includes(a.collective)) throw new Error("Damgar does not act for that collective: add it first, by its ID.");
    const places = await this.collectivePlaces(a.collective, hints, s.via);
    const c = await readCollective(me, a.collective, places, s.via);
    if (c.why) throw new Error(`${c.why} Nothing was signed.`);
    const to = readId(a.to);
    const amount = { unit: a.unit || SPEC.units.regtest, value: readValue(a.value) };
    const acc = this.acceptedSet(await this.accepted(me));
    const pointer = (await this.payee(to, me, s)).look.verifier.moneyPointer(MONEY, to);
    if (!pointer.act) throw new Error(`${short2(to)} publishes no payee pointer: there is nowhere the promise could be paid. Nothing was signed.`);
    const payload = promisePayload(c, { to, amount, pointer: pointer.act });
    const say_ = promiseSay(c, me.id, { to, amount, whatFor: a.whatFor.trim() }, short2);
    if (!acc.has(amount.unit)) say_.lines.push(`Its unit is not one you accept: shown ${say(amount, acc)}.`);
    return { c, payload, say: say_, digest: promiseDigest(c, payload), to, amount, places };
  }
  /** Sign the promise read back, as the collective with your own key; where the lane needs more keys, the other holders are asked. */
  collectivePromise(a) {
    return this.serial(async () => {
      const { me, s, book, hints } = await this.ctx();
      await this.current(me);
      const r = await this.collectivePromiseMake(me, s, hints, a);
      if (r.digest !== a.digest) throw new Error("It is not the promise read back: read it again. Nothing was signed.");
      const text3 = `A promise of the collective ${short2(r.c.id)} to pay ${short2(r.to)} ${r.amount.value.toLocaleString("en")}${a.whatFor.trim() ? `, for ${a.whatFor.trim()}` : ""}: ${r.say.above ? "above its Money lane\u2019s cap, it" : "it"} needs your key too. Read it in your Signing tab, then sign it with your own key for the collective.`;
      const made = await signPromise(me, r.c, r.payload, r.say.others, text3, r.places, s.via);
      await this.store.saveIdentity(me);
      book.collectiveActs = { ...book.collectiveActs ?? {}, [made.act]: { collective: r.c.id, to: r.to, amount: r.amount, whatFor: a.whatFor.trim(), asked: made.asked, at: now() } };
      await this.saveBook(me.id, book);
      const st = await standing(r.c, made.act, r.amount, r.places, s.via).catch(() => null);
      const lines2 = [{ text: `Signed for the collective with your own key: act ${short2(made.act)}, public at ${made.places.join(", ")}.`, tone: "ok" }];
      if (made.asked.length) lines2.push({ text: `Asked for their key: ${made.asked.map(short2).join(", ")}, in their own app.` });
      if (made.notAsked.length) lines2.push({ text: `Not reached: ${made.notAsked.map(short2).join(", ")} (no inbox or encryption key found).`, tone: "warn" });
      lines2.push(st?.met ? { text: "It counts for the collective: its Money lane is met.", tone: "ok" } : { text: `It does not count yet: ${st ? st.areas.map((x) => `${x.signers.length} of ${x.needed} keys`).join("; ") : "not read"}.`, tone: "warn" });
      return { lines: lines2, act: made.act };
    });
  }
  // ------------------------------------------------------------ reading what arrived
  /** Where this identity's inbox is, as its routes say. */
  async inboxOf(me, s) {
    const l = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
    return list2([...l.inbox(MESSAGES_SPEC) ?? [], ...l.inbox(MONEY) ?? []]);
  }
  /**
   * Read what arrived since last time: at the identity's homes (drafts
   * sealed to itself) and its inbox (requests, invoice requests, answers,
   * obligations, claims, receipts), each container opened with its
   * encryption keys, each act kept with its key. Invoice requests on the
   * on-chain rail are answered at once, with the request key, where they
   * are in order (the money messages cMIP, 5.3). Silence proves nothing.
   */
  look() {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const problems = [];
      const lines2 = [];
      try {
        const l = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
        if (me.f.signingSecret && l.encryptionKey && !me.f.encryption.some((e3) => hex(xwingPublic(unhex(e3.secret))) === hex(l.encryptionKey))) {
          const c = carriedKey(l, unhex(me.f.signingSecret));
          if (c) {
            me.f.encryption.push(c);
            await this.store.saveIdentity(me);
            lines2.push({ text: "This identity\u2019s encryption key was renewed elsewhere from the signing key\u2019s words Damgar holds: Damgar takes it, and what is sealed to it opens here.", tone: "ok" });
          } else problems.push("This identity publishes an encryption key Damgar does not hold (it was not made from the signing key\u2019s words held here): what is sealed to it does not open here.");
        }
      } catch {
      }
      const { open, problem } = await this.opener(me);
      if (!open) return { lines: [{ text: problem ?? NO_KEY_SAY, tone: "warn" }], problems };
      let unopened = 0;
      let inbox = [];
      try {
        inbox = await this.inboxOf(me, s);
      } catch (e3) {
        problems.push(`Its inbox could not be looked up: ${message3(e3)}`);
      }
      const places = list2([...me.f.homes.map((h) => h.hint), ...inbox]);
      const fresh = [];
      for (const hint of places) {
        let after = book.after[hint];
        try {
          for (; ; ) {
            const page = await relayAt(hint, s.via).feed({ to: me.id, after });
            const sealed = page.items.filter((it) => it.kind === "sealed").map((it) => it.item);
            const openedAll = sealed.length ? await open(sealed) : [];
            for (const o of openedAll) {
              if (!o) {
                unopened++;
                continue;
              }
              const d = o.described;
              if ((d.spec && MESSAGES_SPECS.includes(d.spec) || d.spec === MONEY) && !book.acts[d.id] && !fresh.some((f) => f.described.id === d.id)) fresh.push(o);
              else if (d.spec === SPECS.envelopes && d.type === ENVELOPES_TYPES.keyDelivery && d.signer === me.id && d.payload) {
                try {
                  const k = readKeyDelivery(d.payload);
                  if (!k.media) (book.delivered ??= {})[k.target] = base64(Uint8Array.from(k.key));
                } catch {
                }
              }
            }
            if (!page.items.length || page.next === after) break;
            after = page.next;
          }
          book.after[hint] = after ?? 0;
        } catch (e3) {
          problems.push(`${hint}: ${message3(e3)}`);
        }
      }
      const looked = /* @__PURE__ */ new Map();
      const standing2 = async (o) => {
        const signer = o.described.signer;
        let l = looked.get(signer);
        if (!l) looked.set(signer, l = lookUp(signer, [...places, ...s.relays], s.via));
        try {
          const x = await l;
          if (o.key) x.verifier.addWithKey(o.act, o.key);
          else x.verifier.add(o.act);
          return x.verifier.status(o.described.id);
        } catch (e3) {
          return `its signer was not found (${message3(e3)})`;
        }
      };
      for (const o of fresh) {
        const d = o.described;
        if (!d.signer || !d.payload) continue;
        let st = await standing2(o);
        const underGrant = (st === "scoped" || st === "unknown") && !!o.described.binding;
        const a = underGrant ? await this.authority(o, [...places, ...s.relays], s.via) : null;
        if (a) {
          st = a.backing === "backed" || a.backing === "binds" ? "valid" : `signed under a grant that does not back it: ${a.words}`;
          (book.authorities ??= {})[d.id] = a.words;
        }
        if (st !== "valid") {
          problems.push(`An act from ${short2(d.signer)} that does not count (${st}): set aside.`);
          continue;
        }
        book.acts[d.id] = { act: base64(o.act), key: o.key ? base64(o.key) : void 0, from: d.signer };
        try {
          await this.file(me, s, book, d, lines2);
        } catch (e3) {
          problems.push(`${short2(d.signer)}: ${message3(e3)}`);
        }
      }
      if (unopened) problems.push(`${unopened} sealed act${unopened === 1 ? "" : "s"} addressed to this identity did not open with the encryption keys Damgar holds: sealed to a key it does not hold.`);
      await this.byItself(me, s, book, lines2, problems);
      await this.saveBook(me.id, book);
      return { lines: lines2, problems };
    });
  }
  /** On whose authority an act under a grant stands: its grant, its acceptance and the grantor's revocations read at these places and the signer's homes (`clients/grants`). */
  async authority(o, places, via2) {
    const signer = o.described.signer;
    let hints = list2(places);
    try {
      const l = await lookUp(signer, places, via2);
      hints = list2([...places, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints)]);
    } catch {
    }
    try {
      return await authorityOf(o.act, hints, via2, { key: o.key, names: short2 });
    } catch {
      return null;
    }
  }
  /** Put one act that arrived where it belongs in the book. Inside `serial`. */
  async file(me, s, book, d, lines2) {
    const t = now();
    const signer = d.signer;
    if (d.spec && MESSAGES_SPECS.includes(d.spec)) {
      const unread = (why) => {
        (book.unread ??= {})[d.id] = { from: signer, found: t, type: d.type ?? -1, why, stage: "new" };
        lines2.push({ text: `A money message from ${short2(signer)} that Damgar cannot read: shown unknown, in Waiting.`, tone: "warn" });
      };
      if ((d.type === TYPES.draft || d.type === TYPES.laneRequest || d.type === TYPES.sale) && signer !== me.id) return;
      if (d.type === TYPES.sale) return;
      const readers = { [TYPES.draft]: readDraft, [TYPES.request]: readRequest, [TYPES.invoiceRequest]: readInvoiceRequest, [TYPES.answer]: readAnswer };
      if (d.spec === MESSAGES_SPEC) readers[TYPES.laneRequest] = readLaneRequest;
      if (!readers[d.type]) return unread(`a message of type ${d.type}, which the money messages cMIP draft 1 does not define`);
      try {
        readers[d.type](d.payload);
      } catch (e3) {
        return unread(message3(e3));
      }
      if (d.type === TYPES.laneRequest) {
        (book.laneRequests ??= {})[d.id] = { found: t, stage: "new", grant: null };
        lines2.push({ text: `${readLaneRequest(d.payload).app} asks for a lane: in Waiting, to be read and granted or declined.`, tone: "ok" });
        return;
      }
      if (d.type === TYPES.draft) {
        if (signer !== me.id) return;
        readDraft(d.payload);
        book.drafts[d.id] = { found: t, stage: "new", payment: null };
        lines2.push({ text: "A draft arrived, prepared in another app: in Waiting.", tone: "ok" });
      } else if (d.type === TYPES.request) {
        readRequest(d.payload);
        book.requestsIn[d.id] = { from: signer, found: t, stage: "new", obligation: null, payment: null };
        lines2.push({ text: `A request to be paid, from ${short2(signer)}: in Waiting.`, tone: "ok" });
      } else if (d.type === TYPES.invoiceRequest) {
        book.invoices[d.id] = { from: signer, found: t, stage: "new", payment: null, why: null };
        await this.onInvoiceRequest(me, s, book, d.id, lines2);
      } else if (d.type === TYPES.answer) {
        const a2 = readAnswer(d.payload);
        const p = Object.values(book.payments).find((x) => x.side === "out" && x.invoiceRequest === a2.to);
        if (!p) {
          (book.laneAnswers ??= {})[a2.to] = { refused: a2.bound.kind === "refused" };
          return;
        }
        if (p.other !== signer && p.service !== signer || p.key !== a2.commitment) throw new Error("an answer to no invoice request of this identity");
        if (a2.amount ? a2.amount.unit !== p.amount.unit || a2.amount.value !== p.amount.value : d.spec === MESSAGES_SPEC || d.spec === MESSAGES_SPEC_3) throw new Error("an answer naming no amount, or another than the payment\u2019s (the money messages cMIP draft 3, 5.1)");
        await this.onAnswer(me, s, book, p, d.id, a2.bound, a2.ticket);
        lines2.push({ text: p.stage === "to pay" ? `${short2(signer)} answered: a payment is ready, in Waiting, To pay.` : `${short2(signer)} refused to bind the payment: ${p.bound?.kind === "refused" ? p.bound.why : ""}`, tone: p.stage === "to pay" ? "ok" : "warn" });
      }
      return;
    }
    const r = moneyRead(d.type, d.payload);
    const a = r.act;
    if (a.type === "claim" && a.payee === me.id) {
      const pr = readPaymentProof(new Uint8Array(a.proof));
      const key = paymentCommitment({ rail: a.rail, payee: me.id, amount: a.amount, fulfils: a.fulfils, payer: signer, paidTo: pr.paidTo, salt: pr.salt });
      let p = book.payments[key];
      if (!p) {
        p = book.payments[key] = { key, side: "in", other: signer, amount: a.amount, fulfils: a.fulfils, whatFor: null, rail: a.rail, address: "", commitment: "", invoiceRequest: "", answer: null, bound: null, preimage: null, onchain: null, claims: [], receipts: [], draft: null, request: null, ticket: null, stage: "paid", at: t };
      }
      if (!p.claims.includes(d.id)) p.claims.push(d.id);
      if (p.stage === "to pay" || p.stage === "asked") p.stage = "paid";
      lines2.push({ text: `${short2(signer)} says they paid you ${say(a.amount, new Set(unitOf(a.amount.unit) ? [a.amount.unit] : []))}: check it, and sign the receipt, in Waiting.`, tone: "ok" });
    } else if (a.type === "receipt" && a.payer === me.id) {
      const pr = readPaymentProof(new Uint8Array(a.proof));
      const key = paymentCommitment({ rail: a.rail, payee: a.payee, amount: a.amount, fulfils: a.fulfils, payer: me.id, paidTo: pr.paidTo, salt: pr.salt });
      const p = book.payments[key];
      if (!p) throw new Error("a receipt for no payment of this identity");
      if (!p.receipts.includes(d.id)) p.receipts.push(d.id);
      p.stage = "settled";
      lines2.push({ text: `${short2(signer)} signed the receipt for your payment: in the account.`, tone: "ok" });
    } else if (a.type === "obligation" && a.creditor === me.id && a.debtor === signer) {
      const ask2 = Object.entries(book.requestsOut).find(([id, x]) => x.to === signer && !x.obligation && this.requestOf(book, id)?.pointer === a.pointer);
      if (ask2) ask2[1].obligation = d.id;
      lines2.push({ text: `${short2(signer)} accepted a debt to you, signed: in the account. ${DEBT_SAY}`, tone: "ok" });
    }
  }
  requestOf(book, id) {
    try {
      return readRequest(this.opened(book, id).payload);
    } catch {
      return null;
    }
  }
  /** A kept act's description and payload, opened with its content key where private; a pasted draft's payload, as one's own. */
  opened(book, id) {
    const pasted = book.pasted?.[id];
    if (pasted) return { d: { id, signer: book.me ?? null, public: false }, payload: b642(pasted) };
    const k = book.acts[id];
    if (!k) throw new Error("that act is not kept here");
    const d = k.key ? openWithKey(b642(k.act), b642(k.key)) : describeAct(b642(k.act));
    if (!d.payload) throw new Error("an act kept without its content");
    return { d, payload: d.payload };
  }
  /** An identity's public acts at these places, held by its lookup's verifier; their payloads, by act. */
  async actsOf(id, places, via2, l) {
    const out = /* @__PURE__ */ new Map();
    for (const h of list2(places)) {
      let after;
      try {
        for (; ; ) {
          const page = await relayAt(h, via2).feed({ signer: id, after });
          for (const it of page.items) {
            if (it.kind !== "act") continue;
            try {
              const d = describeAct(it.item);
              l.verifier.add(it.item);
              out.set(d.id, { ...d, bytes: it.item });
            } catch {
            }
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
      }
    }
    return out;
  }
  /** A payee as a payer reads it: its chain, its public acts (its payee pointers) at its outbox and homes. */
  async payee(id, me, s) {
    let look;
    try {
      look = await lookUp(id, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via);
    } catch (e3) {
      throw new Error(`${short2(id)} was not found: ${message3(e3)}`);
    }
    const outbox = look.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
    const acts = await this.actsOf(id, [...outbox, ...look.resolution.homes.map((h) => h.hint), ...s.relays], s.via, look);
    return { look, acts };
  }
  // ------------------------------------------------------------ the payee's side: invoice requests
  /**
   * An invoice request arrived (the money messages cMIP, 4.3): checked as
   * the payment cMIP's step 1 allows; on-chain, answered at once with the
   * request key; on Lightning, kept for the person to make an invoice in
   * their wallet. One out of order is refused, saying why.
   */
  async onInvoiceRequest(me, s, book, id, lines2) {
    const inv = book.invoices[id];
    const checked = await this.checkInvoiceRequest(me, s, book, id);
    const ir = checked.ir;
    const f = ir.fields;
    if (checked.why) {
      await this.sendAnswer(me, s, book, id, f.hash, { kind: "refused", why: checked.why.slice(0, 280) }, inv.from, null, void 0, f.amount);
      inv.stage = "refused";
      inv.why = checked.why;
      lines2.push({ text: `An invoice request from ${short2(inv.from)} was refused: ${checked.why}.`, tone: "warn" });
      return;
    }
    const p = {
      key: f.hash,
      side: "in",
      other: inv.from,
      amount: f.amount,
      fulfils: f.fulfils,
      whatFor: ir.whatFor,
      rail: f.rail,
      address: base64(checked.address),
      commitment: base64(ir.commitment),
      invoiceRequest: id,
      answer: null,
      bound: null,
      preimage: null,
      onchain: null,
      claims: [],
      receipts: [],
      draft: null,
      request: ir.answers,
      ticket: null,
      stage: "asked",
      at: now()
    };
    book.payments[f.hash] = p;
    inv.payment = f.hash;
    if (ir.answers && book.requestsOut[ir.answers]) book.requestsOut[ir.answers].payment = f.hash;
    const acc = this.acceptedSet(await this.accepted(me));
    if (f.rail === SPEC.onchain.hash) {
      const keys = await this.store.read(me.id, "keys") ?? { request: null, earlier: [] };
      const addr = readOnchainAddress(checked.address);
      const secret = [keys.request, ...keys.earlier].find((k) => k && addr && onchainKey(unhex(k)) === addr.request);
      if (!secret) {
        const why = "the request key this address names is not held by this Damgar";
        await this.sendAnswer(me, s, book, id, f.hash, { kind: "refused", why }, inv.from, null, void 0, f.amount);
        inv.stage = "refused";
        inv.why = why;
        delete book.payments[f.hash];
        lines2.push({ text: `An on-chain invoice request from ${short2(inv.from)} could not be answered: ${why}.`, tone: "warn" });
        return;
      }
      if (s.manual) {
        lines2.push({ text: `${short2(inv.from)} asks where to pay you ${say(f.amount, acc)} on-chain: an address to give, in Waiting (every step by hand).`, tone: "ok" });
        return;
      }
      const sig = onchainRequest(unhex(secret), f.hash, void 0);
      const bound = { kind: "request", request: sig, confirmations: null };
      const how = await this.payeeAuto(me, s, MESSAGES_SPEC, TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound, ticket: null, amount: f.amount })) ?? { by: "itself" };
      const answer = await this.sendAnswer(me, s, book, id, f.hash, bound, inv.from, null, how, f.amount);
      inv.stage = "answered";
      p.answer = answer;
      p.bound = { kind: "request", request: base64(sig), confirmations: null };
      p.stage = "to pay";
      lines2.push({ text: `${short2(inv.from)} asked where to pay you ${say(f.amount, acc)} on-chain: Damgar answered by itself with an address bound to that payment alone, signed with your request key${how.by === "lane" ? ", under your receipts lane" : ""}.`, tone: "ok" });
    } else {
      const keys = await this.keys(me.id);
      const lane = keys.link && this.opts.link ? await this.payeeLane(me, s, MESSAGES_SPEC, TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound: { kind: "invoice", invoice: "" }, ticket: null, amount: f.amount })) : null;
      const auto = lane && !("why" in lane) ? lane : null;
      if (auto && keys.link) {
        try {
          const link = await this.opts.link(keys.link);
          const invoice = await link.invoice(f.amount.value, f.hash);
          const problems = this.invoiceProblems(p, invoice);
          if (problems.length) throw new Error(problems.join("; "));
          p.answer = await this.sendAnswer(me, s, book, id, p.key, { kind: "invoice", invoice }, inv.from, null, auto, f.amount);
          p.bound = { kind: "invoice", invoice };
          p.stage = "to pay";
          inv.stage = "answered";
          lines2.push({ text: `${short2(inv.from)} wants to pay you ${say(f.amount, acc)} on Lightning: Damgar answered by itself, with an invoice your node made through its receive-only link, under your receipts lane.`, tone: "ok" });
          return;
        } catch (e3) {
          lines2.push({ text: `Damgar could not make the invoice by itself (${message3(e3)}): make it in your wallet, in Waiting.`, tone: "warn" });
          return;
        }
      }
      lines2.push({ text: `${short2(inv.from)} wants to pay you ${say(f.amount, acc)} on Lightning: make an invoice in your wallet, in Waiting.${lane && "why" in lane && !s.manual ? ` Not answered by itself: ${lane.why.replace(/\.? ?Nothing was signed\.?$/, "")}.` : ""}`, tone: "ok" });
    }
  }
  /** What keeps a Lightning invoice from binding this payment (the Lightning rail Module's rule, and the checks of the money messages cMIP, 5.3). */
  invoiceProblems(p, invoice) {
    const t = invoice.trim().toLowerCase().replace(/^lightning:/, "");
    let decoded;
    try {
      decoded = lightningInvoice(t);
    } catch (e3) {
      return [`${message3(e3)}. Copy the whole invoice from your wallet`];
    }
    const addr = readLightningAddress(b642(p.address));
    const problems = [];
    if (decoded.node !== addr?.node) problems.push(`it was signed by node ${decoded.node.slice(0, 12)}\u2026, not the node your payee pointer names (${addr?.node.slice(0, 12)}\u2026): make it in that wallet`);
    if (decoded.hasDescription) problems.push("it carries a plain description: make it with the description hash only");
    if (decoded.descriptionHash !== p.key) problems.push(`its description hash is not the one asked (${p.key})`);
    if (decoded.amountMsat !== p.amount.value * 1e3) problems.push(`its amount is not exactly ${p.amount.value} (in the unit\u2019s smallest part)`);
    const rule = railCheck(p.rail, p.key, p.amount, b642(p.address), lightningProof(t, void 0), null);
    if (!problems.length && rule.answer !== "pending") problems.push(`the Lightning rail Module\u2019s rule says ${rule.answer}: ${rule.why}`);
    return problems;
  }
  /** Every step by hand: give an on-chain address bound to a payment to you, signed with the request key (as round 1 did by itself). */
  answerAddress(id) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const inv = book.invoices[id];
      if (!inv || inv.stage !== "new" || !inv.payment) throw new Error("No address request is waiting there.");
      const p = book.payments[inv.payment];
      if (p.rail !== SPEC.onchain.hash) throw new Error("That is a Lightning payment: make an invoice for it.");
      const keys = await this.keys(me.id);
      const addr = readOnchainAddress(b642(p.address));
      const secret = [keys.request, ...keys.earlier].find((k) => k && addr && onchainKey(unhex(k)) === addr.request);
      if (!secret) throw new Error("The request key this address names is not held by this Damgar. Nothing was sent.");
      const sig = onchainRequest(unhex(secret), p.key, void 0);
      p.answer = await this.sendAnswer(me, s, book, id, p.key, { kind: "request", request: sig, confirmations: null }, inv.from, null);
      p.bound = { kind: "request", request: base64(sig), confirmations: null };
      p.stage = "to pay";
      inv.stage = "answered";
      await this.saveBook(me.id, book);
      return { lines: [{ text: `An address bound to this payment alone was sent to ${short2(inv.from)}, sealed, signed with your request key.`, tone: "ok" }] };
    });
  }
  /** The payment cMIP's step 1, on the payee's side. */
  async checkInvoiceRequest(me, s, book, id) {
    const opened = this.opened(book, id);
    const ir = readInvoiceRequest(opened.payload);
    const f = ir.fields;
    const fail = (why) => ({ ir, why, address: null });
    if (f.payer !== opened.d.signer) return fail("its signer is not the payer the commitment names");
    if (f.payee !== me.id) return fail("the commitment names another payee");
    const acc = this.acceptedSet(await this.accepted(me));
    if (!acc.has(SPEC.payment) || !acc.has(MESSAGES_SPEC)) return fail("the payee does not accept the payment cMIP and the money messages cMIP");
    if (!acc.has(f.rail)) return fail(`the payee does not accept this rail Module (${railName(f.rail)})`);
    if (!acc.has(f.amount.unit)) return fail("the payee does not accept this unit");
    const { look, acts } = await this.payee(me.id, me, s);
    let address = null;
    if (f.paidTo.kind === "flow") {
      const d = acts.get(f.paidTo.pointer);
      if (!d || d.spec !== MONEY || d.type !== 0 || look.verifier.bindingStatus(f.paidTo.pointer) !== "valid") return fail("it names a payee pointer that is not this identity\u2019s, or does not count");
      const ptr = moneyRead(0, d.payload).act;
      if (ptr.payee !== me.id) return fail("it names another identity\u2019s pointer");
      const rail = ptr.rails[f.paidTo.rail];
      if (!rail || rail.module !== f.rail) return fail("the pointer has no such rail, or it names another rail Module");
      address = new Uint8Array(rail.address);
    } else if (f.paidTo.kind === "vault") {
      const v = look.verifier.moneyVault(MONEY, me.id);
      const e3 = v && v.declaredBy === f.paidTo.declaredBy ? v.entries[f.paidTo.entry] : void 0;
      if (!e3 || e3.railModule !== f.rail || e3.unit !== f.amount.unit) return fail("it names no entry of the vault in force for this rail and unit");
      address = new Uint8Array(e3.source);
    } else return fail("a refund rail: not answered by Damgar in round 1");
    const network = f.rail === SPEC.lightning.hash ? readLightningAddress(address)?.network : readOnchainAddress(address)?.network;
    if (network === void 0 || unitOf(f.amount.unit)?.unit.network !== network) return fail("the rail does not carry the amount\u2019s unit");
    void book;
    return { ir, why: null, address };
  }
  /** An answer carries the amount it binds, the commitment's (draft 3, F352), so a lane's cap is judged on it by the grant limits cMIP. */
  async sendAnswer(me, s, book, to, commitment, bound, payer, ticket, how = { by: "hand" }, amount = book.payments[commitment]?.amount ?? null) {
    return this.deliver(me, s, book, MESSAGES_SPEC, TYPES.answer, answerPayload({ to, commitment, bound, ticket, amount }), payer, void 0, how);
  }
  /**
   * The payee answers a Lightning invoice request with an invoice its own
   * wallet made, pasted here (the money messages cMIP, 5.3): checked first
   * under the rail Module's rule, which must answer pending (the node its
   * pointer names, the description hash the commitment, the exact amount,
   * no plain description).
   */
  answerInvoice(id, invoice) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const inv = book.invoices[id];
      if (!inv || inv.stage !== "new" || !inv.payment) throw new Error("No invoice request is waiting for an invoice there.");
      const p = book.payments[inv.payment];
      const t = invoice.trim().toLowerCase().replace(/^lightning:/, "");
      const problems = this.invoiceProblems(p, t);
      if (problems.length) throw new Error(`This invoice cannot bind the payment: ${problems.join("; ")}. Nothing was sent.`);
      p.answer = await this.sendAnswer(me, s, book, id, p.key, { kind: "invoice", invoice: t }, inv.from, null);
      p.bound = { kind: "invoice", invoice: t };
      p.stage = "to pay";
      inv.stage = "answered";
      await this.saveBook(me.id, book);
      return { lines: [{ text: `The invoice was checked and sent, sealed, to ${short2(inv.from)}. When they pay it in their wallet, their Damgar sends you the claim; check it, and sign the receipt.`, tone: "ok" }] };
    });
  }
  /** Refuse an invoice request, saying why: nothing is bound. */
  refuseInvoice(id, why) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const inv = book.invoices[id];
      if (!inv || inv.stage !== "new") throw new Error("No invoice request is waiting there.");
      const w = why.trim().slice(0, 280) || "refused by the payee";
      await this.sendAnswer(me, s, book, id, inv.payment ?? "0".repeat(64), { kind: "refused", why: w }, inv.from, null);
      inv.stage = "refused";
      inv.why = w;
      if (inv.payment) book.payments[inv.payment].stage = "refused";
      await this.saveBook(me.id, book);
      return { lines: [{ text: "Refused, and said: nothing was bound to the payment." }] };
    });
  }
  // ------------------------------------------------------------ the payer's side
  /**
   * Where a payment to this payee of this amount goes, and on which rail,
   * from what the payee published and what this person accepts (the payment
   * cMIP, "Choosing where to pay"; Money rules 1, 3 and 5).
   */
  async route(me, s, payee, amount, acc) {
    const { look } = await this.payee(payee, me, s);
    let c = look.verifier.moneyChoose(MONEY, payee, amount, [...acc]);
    let ptr = look.verifier.moneyPointer(MONEY, payee);
    const col = await collectivePointer(payee, [...s.relays, ...me.f.homes.map((h) => h.hint)], s.via, { amount, accepted: [...acc] }).catch(() => null);
    if (col?.choice) {
      c = col.choice;
      ptr = { act: col.pointer };
    }
    if (c.to === "nowhere") throw new Error(`It cannot be paid: ${c.why}. The payee could be told why, in a message.`);
    return {
      to: c.to,
      pointer: c.pointer ?? null,
      rail: c.rail ?? 0,
      declaredBy: c.declaredBy ?? null,
      entry: c.entry ?? 0,
      module: c.module,
      address: new Uint8Array(c.address),
      why: c.why,
      tipPointer: ptr.act
    };
  }
  /**
   * Bind a payment (the payment cMIP, step 1): the commitment computed with
   * a fresh salt of 128 random bits, sent to the payee in an invoice request
   * (the money messages cMIP, 4).
   */
  async bind(me, s, book, a) {
    const acc = this.acceptedSet(await this.accepted(me));
    let r = await this.route(me, s, a.payee, a.amount, acc);
    const fulfils = a.fulfils ?? r.tipPointer;
    if (!fulfils) throw new Error("The payee has no payee pointer: a tip follows one (Money rule 17). Nothing was signed.");
    const service = await this.splitServiceFor(me, s, a.payee, fulfils);
    if (service) {
      const sr = await this.route(me, s, service, a.amount, acc);
      if (sr.module !== r.module || base64(sr.address) !== base64(r.address)) r = { ...sr, tipPointer: r.tipPointer };
    }
    const paidTo = r.to === "flow" ? { kind: "flow", pointer: r.pointer, rail: r.rail } : { kind: "vault", declaredBy: r.declaredBy, entry: r.entry };
    const salt = new Uint8Array(randomBytes(16));
    const c = { rail: r.module, payee: a.payee, amount: a.amount, fulfils, payer: me.id, paidTo, salt, ...a.purchase ? { purchase: a.purchase } : {} };
    const commitment = commitmentCbor(c);
    const key = paymentCommitment(c);
    const irPayload = invoiceRequestPayload({ commitment, whatFor: a.whatFor, answers: a.answers, ticket: a.ticket });
    const how = await this.payerHow(me, s, MESSAGES_SPEC, TYPES.invoiceRequest, irPayload, !!a.auto);
    if (how.by === "lane") {
      const claimAs = moneyPayload({ type: "claim", rail: r.module, proof: new Uint8Array(0), payee: a.payee, amount: a.amount, fulfils });
      const f = await this.laneFor(me, s, MONEY, claimAs.type, claimAs.payload, this.opts.app ? "app" : "payouts");
      if ("why" in f || f.lane.grant !== how.grant) throw new Error(`The lane does not reach the payment\u2019s claim${"why" in f ? ` (${f.why})` : ""}. Nothing was signed.`);
    }
    const ir = await this.deliver(me, s, book, MESSAGES_SPEC, TYPES.invoiceRequest, irPayload, service ?? a.payee, a.refs, how);
    const p = {
      key,
      side: "out",
      other: a.payee,
      amount: a.amount,
      fulfils,
      whatFor: a.whatFor,
      rail: r.module,
      address: base64(r.address),
      commitment: base64(commitment),
      invoiceRequest: ir,
      answer: null,
      bound: null,
      preimage: null,
      onchain: null,
      claims: [],
      receipts: [],
      draft: a.draft,
      request: a.answers,
      ticket: null,
      stage: "asked",
      at: now(),
      how,
      referral: a.referral ?? null,
      service,
      purchase: a.purchase ?? null
    };
    book.payments[key] = p;
    return p;
  }
  /**
   * The payee's split service, where its agreement names one (the money
   * messages cMIP, draft 4, 4.4; F357): the agreement an offer followed is
   * made under (field 0), or a collective payee's agreement in force; its
   * field 14 read, as the pointer check reads Agreements. Null where none.
   */
  async splitServiceFor(me, s, payee, fulfils) {
    const places = await collectivePlaces(payee, [...s.relays, ...me.f.homes.map((h) => h.hint)], s.via);
    let agreement = null;
    for (const h of places) {
      const act = await relayAt(h, s.via).getAct(fulfils).catch(() => null);
      if (!act) continue;
      const d = describeAct(act);
      if (d.spec === MIRS.agreements && d.type === AGREEMENTS_TYPES.offer && d.payload) {
        const under = cborDecode(d.payload).get(0);
        if (under instanceof Uint8Array) agreement = hex(under);
      }
      break;
    }
    if (!agreement) agreement = (await collectiveNow(payee, places, s.via).catch(() => null))?.agreement ?? null;
    if (!agreement) return null;
    return (await splitServiceOf(agreement, payee, places, s.via).catch(() => null))?.service ?? null;
  }
  /** An answer arrived: checked under the rail Module's rule before anything is shown to pay (the money messages cMIP, 5.2). */
  async onAnswer(me, s, book, p, id, bound, ticket) {
    p.answer = id;
    if (bound.kind === "refused") {
      p.bound = { kind: "refused", why: bound.why };
      p.stage = "refused";
      return;
    }
    const proof = bound.kind === "invoice" ? lightningProof(bound.invoice, void 0) : onchainProof({ request: bound.request, confirmations: bound.confirmations ?? void 0 });
    const v = railCheck(p.rail, p.key, p.amount, b642(p.address), proof, null);
    if (v.answer !== "pending") {
      p.bound = { kind: "refused", why: `what the payee sent does not bind this payment (${v.answer}: ${v.why}); do not pay` };
      p.stage = "refused";
      return;
    }
    p.bound = bound.kind === "invoice" ? { kind: "invoice", invoice: bound.invoice } : { kind: "request", request: base64(bound.request), confirmations: bound.confirmations };
    p.stage = "to pay";
    if (ticket) {
      const why = await this.checkTicket(me, s, book, p, ticket);
      if (why) {
        p.bound = { kind: "refused", why: `the anchoring service\u2019s ticket does not hold (${why}); do not pay` };
        p.stage = "refused";
      }
    }
  }
  /** Check an anchoring ticket before paying: it names the offer followed, the leaf sent and this payment's commitment, for the tier's price; its deadline within the tier's blocks of this Damgar's own point on the chain (unknown where it follows none, said). */
  async checkTicket(me, s, book, p, ticket) {
    const { acts } = await this.payee(p.other, me, s);
    const t = acts.get(ticket);
    const o = acts.get(p.fulfils);
    if (!t || !o || t.signer !== p.other) return "the ticket or the offer was not found at the service\u2019s places";
    const tk = anchoringReadTicket(t.payload);
    if (!tk) return "not a ticket";
    const ir = readInvoiceRequest(this.opened(book, p.invoiceRequest).payload);
    if (!ir.ticket) return "no anchor was asked";
    const chain = this.opts.chain ? await this.opts.chain.headers().catch(() => null) : null;
    const nowPoint = chain ? chain.start + chain.headers.length - 1 : null;
    const why = anchoringCheckTicket(o.bytes, t.payload, b642(p.commitment), ir.ticket.leaf, BigInt(nowPoint ?? Math.max(0, tk.deadline - 1)));
    if (why) return why;
    book.acts[ticket] = { act: base64(t.bytes), from: p.other };
    p.ticket = { act: ticket, batch: tk.batch, deadline: tk.deadline, tier: tk.tier, checked: nowPoint !== null };
    return null;
  }
  // ------------------------------------------------------------ To sign
  /** What waits for the person, read in plain words (F338). */
  toSign() {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      const items = [];
      const problems = [];
      const shown = (a) => ({ ...a, said: say(a, acc) });
      for (const [id, x] of Object.entries(book.drafts)) {
        if (x.stage !== "new") continue;
        try {
          items.push({ ...await this.readDraftItem(me, s, book, id, acc), ...book.pasted?.[id] ? { byHand: true } : {} });
        } catch (e3) {
          problems.push(`A draft ${short2(id)}: ${message3(e3)}`);
        }
      }
      for (const [id, x] of Object.entries(book.unread ?? {})) {
        if (x.stage !== "new") continue;
        items.push({
          id,
          kind: "unknown",
          from: this.who(x.from, me.id),
          app: null,
          title: "A money message Damgar cannot read",
          lines: [
            { text: `It cannot be read here (${x.why}): unknown. Nothing is guessed from it, and nothing can be signed for it.`, tone: "warn" },
            { text: "It may come from a newer app or another draft of the money messages cMIP. Setting it aside signs nothing and sends nothing." }
          ],
          amount: null,
          unknown: true,
          offers: ["decline"],
          found: x.found
        });
      }
      for (const [id, x] of Object.entries(book.requestsIn)) {
        if (x.stage !== "new" && x.stage !== "debt") continue;
        const r = this.requestOf(book, id);
        if (!r) continue;
        const known = acc.has(r.amount.unit) && acc.has(SPEC.payment) && acc.has(MESSAGES_SPEC);
        const lines2 = [
          { text: `${short2(x.from)} asks you to pay ${say(r.amount, acc)}${r.whatFor ? `, for \u201C${r.whatFor}\u201D` : ""}.` },
          { text: "A request is not a debt: nothing binds you until you sign something (F66)." }
        ];
        if (x.stage === "debt") lines2.push({ text: `You accepted it as a debt (an obligation, signed). ${DEBT_SAY}`, tone: "warn" });
        else lines2.push({ text: "Accept as a debt: you sign an obligation, \u201CI owe this\u201D, only if you mean to owe it (to pay later). Or pay it now, as a payment to their pointer. Most simple payments skip the debt." });
        if (!known) lines2.push({ text: "Its unit, or the payment cMIP, is not one you accept: unknown, and nothing is signed for it.", tone: "warn" });
        items.push({ id, kind: "request", from: this.who(x.from, me.id), app: null, title: "A request to be paid", lines: lines2, amount: shown(r.amount), unknown: !known, offers: known ? x.stage === "debt" ? ["pay", "decline"] : ["debt", "pay", "decline"] : ["decline"], found: x.found });
      }
      for (const [id, x] of Object.entries(book.laneRequests ?? {})) {
        if (x.stage !== "new") continue;
        try {
          items.push(this.laneItem(me, book, id, acc));
        } catch (e3) {
          problems.push(`A lane asked ${short2(id)}: ${message3(e3)}`);
        }
      }
      for (const [id, x] of Object.entries(book.invoices)) {
        if (x.stage !== "new" || !x.payment) continue;
        const p = book.payments[x.payment];
        if (p.rail === SPEC.onchain.hash) {
          items.push({
            id,
            kind: "address",
            from: this.who(x.from, me.id),
            app: null,
            title: "Give an address for a payment to you",
            lines: [
              { text: `${short2(x.from)} wants to pay you ${say(p.amount, acc)} on-chain${p.whatFor ? `, for \u201C${p.whatFor}\u201D` : ""}.` },
              { text: "Every step is followed by hand: Damgar waits for you to give an address bound to this payment alone, signed with your request key." }
            ],
            amount: shown(p.amount),
            unknown: false,
            offers: ["address", "refuse"],
            found: x.found
          });
          continue;
        }
        items.push({
          id,
          kind: "invoice",
          from: this.who(x.from, me.id),
          app: null,
          title: "Make an invoice for a payment to you",
          lines: [
            { text: `${short2(x.from)} wants to pay you ${say(p.amount, acc)} on Lightning${p.whatFor ? `, for \u201C${p.whatFor}\u201D` : ""}, to your ${p.address ? "payee pointer\u2019s node" : "node"}.` },
            { text: "In your own wallet, make an invoice for exactly this amount, with this description hash and no description. Paste it here: Damgar checks it and sends it to them, sealed." },
            { text: "Damgar holds no wallet: the invoice comes from the node your payee pointer names, and only that node can sign it." }
          ],
          amount: shown(p.amount),
          unknown: false,
          offers: ["invoice", "refuse"],
          descriptionHash: p.key,
          found: x.found
        });
      }
      for (const p of Object.values(book.payments)) {
        if (p.side !== "in" || !p.claims.length || p.receipts.length) continue;
        items.push({
          id: p.key,
          kind: "receipt",
          from: this.who(p.other, me.id),
          app: null,
          title: "A payment to you: check it, then sign the receipt",
          lines: [
            { text: `${short2(p.other)} says they paid you ${say(p.amount, acc)} on ${railName(p.rail)}, and sent their claim with the rail\u2019s proof.` },
            { text: "Signing the receipt says \u201CI received this, for that\u201D, signed by you (Money rule 7). Damgar first checks the claim by the rail Module\u2019s rule, from the rail\u2019s own evidence; you can sign only once it verifies." }
          ],
          amount: shown(p.amount),
          unknown: !acc.has(p.rail),
          offers: acc.has(p.rail) ? ["receipt"] : [],
          found: p.at
        });
      }
      items.sort((a, b) => b.found - a.found);
      return { items, problems };
    });
  }
  async readDraftItem(me, s, book, id, acc) {
    const { d, payload } = this.opened(book, id);
    const dr = readDraft(payload);
    const x = book.drafts[id];
    const lines2 = [];
    let unknown = false;
    const need = [SPEC.payment, MESSAGES_SPEC, dr.amount.unit, ...dr.what === "anchor" ? [SPEC.anchoring] : []];
    const missing = need.filter((h) => !acc.has(h));
    if (missing.length) {
      unknown = true;
      lines2.push({ text: `Under ${missing.map((h) => labelOf(h) ?? `${h.slice(0, 8)}\u2026`).join(", ")}, not accepted here: unknown, and it cannot be signed (F338). Accept it in Settings to read it.`, tone: "warn" });
    }
    const about = (d.refs ?? []).map((r, i) => `${r.slice(0, 8)}\u2026${d.refSigners?.[i] ? ` by ${short2(d.refSigners[i])}` : ""}`);
    if (dr.what === "confirm") {
      lines2.unshift({ text: `Prepared in ${dr.app}, not signed there: confirm your purchase from ${short2(dr.other)}, ${say(dr.amount, acc)}: what was promised was kept.` });
      const c = await this.ownClaim(me, s, dr).catch((e3) => ({ why: message3(e3) }));
      if ("why" in c) {
        unknown = true;
        lines2.push({ text: `${c.why}: it cannot be signed.`, tone: "warn" });
      } else lines2.push({ text: `Signing signs your claim of that payment (${short2(dr.confirm.claim)}) again, in public, acknowledging ${dr.confirm.acks.map(short2).join(", ")}: the sale then reads confirmed for anyone who looks (Agreements rule 13). Nothing moves; it is public.`, tone: "ok" });
      return { id, kind: "draft", from: this.who(me.id, me.id), app: dr.app, title: "A purchase to confirm", lines: lines2, amount: { ...dr.amount, said: say(dr.amount, acc) }, unknown, offers: unknown ? ["decline"] : ["sign", "decline"], found: x.found };
    }
    if (dr.what === "ask") {
      lines2.unshift({ text: `Prepared in ${dr.app}, not signed there: ask ${short2(dr.other)} to pay you ${say(dr.amount, acc)}${dr.whatFor ? `, for \u201C${dr.whatFor}\u201D` : ""}.` });
      lines2.push({ text: "Signing sends them a request to be paid, sealed to them, naming your payee pointer in force. It binds nobody: they may pay it, accept it as a debt, or decline." });
    } else {
      lines2.unshift({ text: `Prepared in ${dr.app}, not signed there: ${dr.what === "anchor" ? "pay an anchoring service" : "pay"} ${short2(dr.other)} ${say(dr.amount, acc)}${dr.whatFor ? `, for \u201C${dr.whatFor}\u201D` : ""}${about.length ? ` (about ${about.join(", ")})` : ""}.` });
      if (!unknown) {
        try {
          const r = await this.route(me, s, dr.other, dr.amount, acc);
          lines2.push({ text: `On ${railName(r.module)}, to ${r.to === "flow" ? "their flow (their payee pointer in force)" : "their vault"}. ${r.why}`.trim(), tone: "ok" });
          lines2.push({ text: "Signing sends them an invoice request, sealed: the payment\u2019s fingerprint (the commitment: who pays whom, how much, for what, where), for their side to bind. Nothing is paid yet; you pay in your own wallet, from Waiting, To pay." });
        } catch (e3) {
          unknown = true;
          lines2.push({ text: message3(e3), tone: "warn" });
        }
      }
      if (dr.what === "anchor" && dr.anchor) lines2.push({ text: `For an anchor of one act on the Bitcoin clock, through the service\u2019s standing offer ${short2(dr.anchor.offer)}, tier ${dr.anchor.tier}. The service is sent the leaf (a fingerprint mixed with a random secret ${dr.app} keeps), never the act. Whether the payment follows its offer is Agreements\u2019 to judge: unknown here.` });
    }
    return { id, kind: "draft", from: this.who(me.id, me.id), app: dr.app, title: dr.what === "ask" ? "A request to send" : dr.what === "anchor" ? "A payment for an anchor" : "A payment to make", lines: lines2, amount: { ...dr.amount, said: say(dr.amount, acc) }, unknown, offers: unknown ? ["decline"] : ["sign", "decline"], found: x.found };
  }
  /**
   * The first way to pay, by hand (decided by Nobody, allegedly, 21 October
   * 2026): a payment another app showed to copy (a money messages draft,
   * section 2.1, in base64), pasted here. It joins Waiting as a draft found
   * on MOR does, read in plain words, and is signed or declined there.
   * Nothing is signed by pasting it.
   */
  paste(text3) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const t = text3.replace(/\s+/g, "");
      let payload;
      try {
        if (!/^[A-Za-z0-9+/=_-]+$/.test(t)) throw new Error("not base64");
        payload = b642(t.replace(/-/g, "+").replace(/_/g, "/"));
        readDraft(payload);
      } catch (e3) {
        throw new Error(`This is not a payment Damgar can read: paste the whole text the other app showed (a money message\u2019s draft, in base64)${e3 instanceof Error && e3.message !== "not base64" ? `; ${e3.message}` : ""}. Nothing was kept.`);
      }
      const id = sha2562(payload);
      if (book.drafts[id]) throw new Error(book.drafts[id].stage === "new" ? "This payment is already waiting, in Waiting \u203A To pay." : "This payment was already signed or declined here.");
      (book.pasted ??= {})[id] = base64(payload);
      book.drafts[id] = { found: now(), stage: "new", payment: null };
      book.me = me.id;
      const item = await this.readDraftItem(me, s, book, id, this.acceptedSet(await this.accepted(me)));
      await this.saveBook(me.id, book);
      return { id, lines: [{ text: "Pasted, not signed: it waits in To pay, read in plain words below. Sign it or decline it there.", tone: "ok" }, ...item.lines] };
    });
  }
  /**
   * Woken by another app on this computer (the second way, 2A: "Damgar
   * should act as Kišib for money acts, it should pop up and authorise"):
   * Damgar looks on MOR, as always, and finds the draft the app left there,
   * sealed to the identity. The wake-up carries no payment: only which
   * identity, and the draft's id to show. Null where it is not found yet.
   */
  async woken(a) {
    const active = await this.store.active();
    if (!(await this.store.held()).includes(a.identity)) throw new Error("Damgar does not hold this identity: bring it into Damgar (+ Add), or pay by hand. The payment waits on MOR.");
    if (active !== a.identity) throw new Error("Damgar is using another identity now: switch to this one in Damgar (the identity, top right), and it shows the payment there, in Waiting.");
    await this.look();
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const x = book.drafts[a.draft];
      if (!x || x.stage !== "new") return null;
      return this.readDraftItem(me, s, book, a.draft, this.acceptedSet(await this.accepted(me)));
    });
  }
  /** A tip prepared here (the signer's menu, Tip): a draft as another app would leave one, waiting in To pay to be read and signed. Nothing is signed by it. */
  tip(a) {
    const other = readId(a.to);
    if (!unitOf(a.unit)) return Promise.reject(new Error("Choose a unit. Nothing was prepared."));
    const d = { what: "pay", other, amount: { unit: a.unit, value: readValue(a.value) }, whatFor: a.whatFor.trim() ? a.whatFor.trim().slice(0, 280) : null, app: "Damgar", anchor: null };
    return this.paste(base64(draftPayload(d)));
  }
  /** Sign a draft (the money messages cMIP, 2.2): an invoice request, or a request to be paid. */
  signDraft(id) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const x = book.drafts[id];
      if (!x || x.stage !== "new") throw new Error("That draft is not waiting.");
      const item = await this.readDraftItem(me, s, book, id, this.acceptedSet(await this.accepted(me)));
      if (item.unknown) throw new Error("It is unknown here: nothing was signed.");
      const dr = readDraft(this.opened(book, id).payload);
      if (dr.what === "confirm") {
        const c = await this.ownClaim(me, s, dr);
        const made = moneyPayload({ type: "claim", rail: c.rail, proof: new Uint8Array(c.proof), payee: c.payee, amount: c.amount, fulfils: c.fulfils, referral: c.referral ?? void 0 });
        const claim = await this.publishPublic(me, s, made, { by: "hand" }, dr.confirm.acks, c.payee);
        x.stage = "signed";
        await this.saveBook(me.id, book);
        return { lines: [{ text: `Your claim of that payment, acknowledging what you bought, is signed in public (${short2(claim)}): its sale reads confirmed for anyone who looks.`, tone: "ok" }] };
      }
      if (dr.what === "ask") {
        const { look, acts } = await this.payee(me.id, me, s);
        void acts;
        const ptr = look.verifier.moneyPointer(MONEY, me.id);
        if (!ptr.act) throw new Error("You have no payee pointer yet: say where you are paid, in Settings, before asking to be paid. Nothing was signed.");
        const req = await this.deliver(me, s, book, MESSAGES_SPEC, TYPES.request, requestPayload({ amount: dr.amount, whatFor: dr.whatFor, pointer: ptr.act }), dr.other);
        book.requestsOut[req] = { to: dr.other, at: now(), obligation: null, payment: null };
        x.stage = "signed";
        await this.saveBook(me.id, book);
        return { lines: [{ text: `The request was sent to ${short2(dr.other)}, sealed. Their Damgar offers them to pay it, or accept it as a debt.`, tone: "ok" }] };
      }
      const p = await this.bind(me, s, book, {
        payee: dr.other,
        amount: dr.amount,
        fulfils: dr.what === "anchor" ? dr.anchor.offer : null,
        whatFor: dr.whatFor,
        answers: null,
        draft: id,
        ticket: dr.what === "anchor" ? { leaf: dr.anchor.leaf, tier: dr.anchor.tier } : null
      });
      x.stage = "signed";
      x.payment = p.key;
      await this.saveBook(me.id, book);
      return { lines: [{ text: `The invoice request was sent to ${short2(dr.other)}, sealed. When they answer, the payment shows in Waiting, To pay.`, tone: "ok" }] };
    });
  }
  /** Decline a draft or a request: nothing is signed, nothing is sent. */
  decline(id) {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      if (book.drafts[id]?.stage === "new") book.drafts[id].stage = "declined";
      else if (book.laneRequests?.[id]?.stage === "new") book.laneRequests[id].stage = "declined";
      else if (book.requestsIn[id] && (book.requestsIn[id].stage === "new" || book.requestsIn[id].stage === "debt")) book.requestsIn[id].stage = "declined";
      else if (book.unread?.[id]?.stage === "new") {
        book.unread[id].stage = "set aside";
        await this.saveBook(me.id, book);
        return { lines: [{ text: "Set aside, unread: nothing was signed, nothing was sent." }] };
      } else throw new Error("Nothing is waiting there.");
      await this.saveBook(me.id, book);
      return { lines: [{ text: "Declined: nothing was signed, nothing was sent." }] };
    });
  }
  /** Accept a request as a debt: an obligation (Money type 1) signed by this identity, the debtor, delivered to the creditor (Q1, decided by Nobody, allegedly). */
  acceptDebt(id) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const x = book.requestsIn[id];
      if (!x || x.stage !== "new") throw new Error("No request is waiting there.");
      const r = this.requestOf(book, id);
      const made = moneyPayload({ type: "obligation", debtor: me.id, creditor: x.from, amount: r.amount, pointer: r.pointer });
      x.obligation = await this.deliver(me, s, book, MONEY, made.type, made.payload, x.from);
      x.stage = "debt";
      await this.saveBook(me.id, book);
      return { lines: [{ text: `You signed the debt: you owe ${short2(x.from)} ${say(r.amount, this.acceptedSet(await this.accepted(me)))}. It was sent to them, sealed.`, tone: "ok" }, { text: DEBT_SAY, tone: "warn" }] };
    });
  }
  /** Pay a request: an invoice request whose `fulfils` is the debt where one was signed, otherwise the pointer the request names. */
  payRequest(id) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const x = book.requestsIn[id];
      if (!x || x.stage !== "new" && x.stage !== "debt") throw new Error("No request is waiting there.");
      const r = this.requestOf(book, id);
      const p = await this.bind(me, s, book, { payee: x.from, amount: r.amount, fulfils: x.obligation ?? r.pointer, whatFor: r.whatFor, answers: id, draft: null, ticket: null });
      x.stage = "asked";
      x.payment = p.key;
      await this.saveBook(me.id, book);
      return { lines: [{ text: `The invoice request was sent to ${short2(x.from)}, sealed. When they answer, the payment shows in Waiting, To pay.`, tone: "ok" }] };
    });
  }
  /**
   * Inside another app holding a lane (Dub): pay someone, now, within the
   * lane: the invoice request signed under it and sent; the answer, then
   * the claim, as Damgar does. `fulfils`: an offer followed (a purchase from
   * a lone seller names no claim, Money rule 18), or none (a tip, to the
   * payee's pointer). `referral`: the repost followed (Money claim field 6).
   */
  payUnderLane(a) {
    return this.serial(async () => {
      if (!this.opts.app) throw new Error("Damgar signs a payment from To sign.");
      const { me, s, book } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      for (const h of [SPEC.payment, MESSAGES_SPEC, a.amount.unit]) if (!acc.has(h)) throw new Error(`${labelOf(h) ?? "Its unit"} is not accepted for this identity (set in Damgar\u2019s Settings). Nothing was signed.`);
      const p = await this.bind(me, s, book, { payee: a.payee, amount: a.amount, fulfils: a.fulfils ?? null, whatFor: a.whatFor, answers: null, draft: null, ticket: null, referral: a.referral ?? null, refs: a.refs, purchase: a.purchase ?? null });
      if (a.visible) book.payments[p.key].visible = true;
      await this.saveBook(me.id, book);
      return { key: p.key, lines: [{ text: `Asked of ${p.service ? `${short2(a.payee)}\u2019s split service, ${short2(p.service)}, which answers for it (the money messages cMIP, draft 4)` : short2(a.payee)}, under the lane: an invoice request for ${say(a.amount, acc)}, sealed. When they answer, pay it in your wallet.`, tone: "ok" }] };
    });
  }
  // ------------------------------------------------------------ Pay
  /**
   * The proof pasted back, from the person's own wallet: on Lightning the
   * preimage; on-chain the transaction's id. Checked by the rail Module's
   * rule; then the payment claim (Money type 3) is signed at once (Money
   * rule 29, client conformance: the claim written at payment) and sent to
   * the payee, sealed. On-chain, a claim at payment (pending), and a second
   * once the payment counts (F203): `recheck`.
   */
  paid(key, proof) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const p = book.payments[key];
      if (!p || p.side !== "out" || p.stage !== "to pay" && p.stage !== "paid" || !p.bound || p.bound.kind === "refused") throw new Error("No payment is waiting there.");
      const f = readCommitmentFields(b642(p.commitment));
      let rail;
      let verdict;
      if (p.bound.kind === "invoice") {
        const pre = proof.trim().toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(pre)) throw new Error("The proof of a Lightning payment is its preimage: 64 hexadecimal characters, as your wallet shows it once paid. Nothing was signed.");
        rail = lightningProof(p.bound.invoice, unhex(pre));
        verdict = railCheck(p.rail, p.key, p.amount, b642(p.address), rail, null);
        if (verdict.answer !== "valid") throw new Error(`The Lightning rail Module\u2019s rule says ${verdict.answer}: ${verdict.why}. Nothing was signed.`);
        p.preimage = pre;
      } else {
        const txid2 = proof.trim().toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(txid2)) throw new Error("The proof of an on-chain payment starts with its transaction\u2019s id: 64 hexadecimal characters, as your wallet shows it. Nothing was signed.");
        const built = await this.onchainRail(p, txid2);
        rail = built.rail;
        verdict = built.verdict;
        if (verdict.answer === "invalid") throw new Error(`The on-chain rail Module\u2019s rule says invalid: ${verdict.why}. Nothing was signed.`);
        p.onchain = { txid: txid2 };
      }
      const proofBytes = paymentProof({ paidTo: f.paidTo, salt: f.salt, rail });
      const made = moneyPayload({ type: "claim", rail: p.rail, proof: proofBytes, payee: p.other, amount: p.amount, fulfils: p.fulfils, referral: p.referral ?? void 0, ...p.purchase ? { purchase: p.purchase } : {} });
      const claim = await this.deliver(me, s, book, MONEY, made.type, made.payload, p.service ?? p.other, void 0, await this.claimHow(me, s, p, made));
      p.claims.push(claim);
      p.proof = base64(proofBytes);
      p.stage = "paid";
      if (p.visible) (p.publicClaims ??= []).push(await this.publicClaim(me, s, p, []));
      if (p.vault) await this.keepAtHomes(me, s, book, claim);
      if (p.request && book.requestsIn[p.request]) book.requestsIn[p.request].stage = "paid";
      await this.saveBook(me.id, book);
      const acc = this.acceptedSet(await this.accepted(me));
      return {
        lines: [
          { text: `The rail Module\u2019s rule says ${verdict.answer}${verdict.why ? ` (${verdict.why})` : ""}.`, tone: verdict.answer === "valid" ? "ok" : "warn" },
          { text: `Your payment claim (\u201CI paid ${short2(p.other)} ${say(p.amount, acc)}\u201D, with the rail\u2019s proof) is signed and sent to them, sealed. Their Damgar checks it and offers them the receipt.`, tone: "ok" }
        ]
      };
    });
  }
  /** A transfer to the vault's record (F355): its claim, carrying the commitment and salt, sealed to oneself at one's homes. */
  async keepAtHomes(me, s, book, act) {
    const kept = book.acts[act];
    const enc2 = me.f.encryption[me.f.encryption.length - 1];
    if (!kept?.key || !enc2) return;
    const sealed = sealFor(b642(kept.act), b642(kept.key), [{ id: me.id, key: xwingPublic(unhex(enc2.secret)) }]);
    for (const h of me.f.homes.map((x) => x.hint)) {
      try {
        await relayAt(h, s.via).putSealed(sealed);
      } catch {
      }
    }
  }
  /**
   * A public claim of a payment already paid (round 3; Agreements rule 13):
   * the same claim, signed again in public, acknowledging `acks` (a vow,
   * to confirm its sale). Signed as the payment's claim was (under the same
   * lane, or by hand), published at this identity's relays and homes and
   * the payee's relays. Its id.
   */
  async publicClaim(me, s, p, acks) {
    if (!p.proof) throw new Error("That payment carries no proof yet: it is not paid. Nothing was signed.");
    const made = moneyPayload({ type: "claim", rail: p.rail, proof: b642(p.proof), payee: p.other, amount: p.amount, fulfils: p.fulfils, referral: p.referral ?? void 0, ...p.purchase ? { purchase: p.purchase } : {} });
    return this.publishPublic(me, s, made, await this.claimHow(me, s, p, made), acks, p.other);
  }
  /** A Money act signed in public (by hand, or under a lane), acknowledging `acks`, at this identity's relays and homes and the payee's relays. Its id. */
  async publishPublic(me, s, made, how, acks, payee) {
    await this.current(me);
    let act;
    if (how.by === "lane") {
      const keys = await this.keys(me.id);
      const lane = keys.lanes?.find((x) => x.grant === how.grant);
      if (!lane) throw new Error("That lane\u2019s key is not held here. Nothing was signed.");
      try {
        act = signUnderGrant({ grant: lane.grant, grantor: me.id, secret: lane.secret, strand: lane.strand }, { spec: MONEY, type: made.type, payload: made.payload, public: true, acks });
      } finally {
        await this.store.write(me.id, "keys", keys);
      }
    } else {
      try {
        act = await me.signNow(MONEY, made.type, made.payload, { public: true, acks });
      } finally {
        await this.store.saveIdentity(me);
      }
    }
    let places = [...s.relays, ...me.f.homes.map((h) => h.hint)];
    try {
      const l = await lookUp(payee, places, s.via);
      places = [.../* @__PURE__ */ new Set([...places, ...l.routes.routes.flatMap((r) => r.hints)])];
    } catch {
    }
    let took = 0;
    for (const h of places) {
      try {
        await relayAt(h, s.via).putAct(act.act);
        took++;
      } catch {
      }
    }
    if (!took) throw new Error("No relay took the claim. It was signed; try again later.");
    return act.id;
  }
  /** The identity's own public claim a confirmation names (draft 4, 2.3), read and checked: this identity's, of that payee and amount. */
  async ownClaim(me, s, dr) {
    let act = null;
    for (const h of [...s.relays, ...me.f.homes.map((x) => x.hint)]) {
      act = await relayAt(h, s.via).getAct(dr.confirm.claim).catch(() => null);
      if (act) break;
    }
    if (!act) throw new Error("The claim it names was not found at your relays and homes");
    const d = describeAct(act);
    if (d.signer !== me.id || d.spec !== MONEY || d.type !== 3 || !d.payload) throw new Error("The act it names is no claim of yours");
    const c = moneyRead(3, d.payload).act;
    if (c.payee !== dr.other || c.amount.unit !== dr.amount.unit || c.amount.value !== dr.amount.value) throw new Error("The claim it names is of another payee or amount than the draft says");
    return c;
  }
  /**
   * Confirm a purchase (round 3; Agreements rule 13): a public claim of the
   * payment acknowledging `acks` (the vow bought), so its sale reads
   * confirmed. Signed as the payment's claim was.
   */
  confirmPurchase(key, acks) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const p = book.payments[key];
      if (!p || p.side !== "out" || !p.proof) throw new Error("No paid purchase is there. Nothing was signed.");
      const claim = await this.publicClaim(me, s, p, acks);
      (p.publicClaims ??= []).push(claim);
      await this.saveBook(me.id, book);
      return { claim, lines: [{ text: "Your claim of that payment, acknowledging what you bought, is signed in public: its sale reads confirmed for anyone who looks.", tone: "ok" }] };
    });
  }
  /** A payment of this identity's, as kept here (round 3: a vow's purchase, to confirm or contest). */
  payment(key) {
    return this.serial(async () => {
      const { book } = await this.ctx();
      return book.payments[key] ?? null;
    });
  }
  /** A claim is signed as its payment's invoice request was: under the same lane, still in force and within it, or by hand. */
  async claimHow(me, s, p, made) {
    if (p.how?.by !== "lane") {
      if (this.opts.app) throw new Error(`${this.opts.app} signs only under a lane. Nothing was signed.`);
      return { by: "hand" };
    }
    const f = await this.laneFor(me, s, MONEY, made.type, made.payload, this.opts.app ? "app" : "payouts");
    if ("why" in f) throw new Error(`${f.why}. Nothing was signed: sign the claim in Damgar instead.`);
    return { by: "lane", grant: f.lane.grant };
  }
  /** The on-chain rail proof for a transaction the person sent: its output paying the payment's address, and its block, from the chain followed. */
  async onchainRail(p, txid2) {
    if (p.bound?.kind !== "request") throw new Error("not an on-chain payment");
    const request2 = b642(p.bound.request);
    const to = onchainPayTo(b642(p.address), p.key);
    const chain = this.opts.chain;
    if (!chain) {
      throw new Error("This Damgar follows no chain (the web client): the transaction cannot be read or checked here. Paste its id into Damgar on your computer.");
    }
    const tx = await chain.tx(txid2);
    const output = findOutput(tx.raw, to.script);
    if (output === null) throw new Error(`Transaction ${txid2.slice(0, 12)}\u2026 pays nothing to ${to.address}, the address bound to this payment. Nothing was signed.`);
    const k = 6;
    let block;
    let have = 0;
    const headers = await chain.headers();
    if (tx.block) {
      const hs = headers.headers.slice(tx.block.height - headers.start, tx.block.height - headers.start + k);
      have = hs.length;
      block = { index: tx.block.index, branch: merkleBranch(tx.block.txids, tx.block.index), headers: hs };
    }
    const rail = onchainProof({ request: request2, paid: { tx: tx.raw, output, block } });
    const verdict = railCheck(p.rail, p.key, p.amount, b642(p.address), rail, headers);
    return { rail, verdict, confirmations: have };
  }
  /** On-chain: read the chain again; once the payment counts, a second claim with the whole proof (F203; the Module's client conformance 7). */
  recheck(key) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const p = book.payments[key];
      if (!p || p.side !== "out" || !p.onchain) throw new Error("No on-chain payment of yours is there.");
      const built = await this.onchainRail(p, p.onchain.txid);
      if (built.verdict.answer !== "valid") return { lines: [{ text: `Not yet: ${built.verdict.answer}, ${built.verdict.why} (${built.confirmations} of 6 confirmations on the chain followed).`, tone: "warn" }] };
      const f = readCommitmentFields(b642(p.commitment));
      const proofBytes = paymentProof({ paidTo: f.paidTo, salt: f.salt, rail: built.rail });
      const made = moneyPayload({ type: "claim", rail: p.rail, proof: proofBytes, payee: p.other, amount: p.amount, fulfils: p.fulfils, referral: p.referral ?? void 0 });
      p.claims.push(await this.deliver(me, s, book, MONEY, made.type, made.payload, p.other, void 0, await this.claimHow(me, s, p, made)));
      await this.saveBook(me.id, book);
      return { lines: [{ text: "Six confirmations on the chain followed: valid. A second claim, with the block, is signed and sent (the first, written at payment, stays pending).", tone: "ok" }] };
    });
  }
  // ------------------------------------------------------------ the receipt
  /** A verifier holding this identity's chain, each counterpart's chain and public acts, and every act kept. */
  async judge(me, s, book, others) {
    const l = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
    const hints = [...me.f.homes.map((h) => h.hint), ...s.relays];
    await this.actsOf(me.id, [...s.relays, ...hints], s.via, l);
    for (const o of list2(others)) {
      try {
        const x = await lookUp(o, hints, s.via, l.verifier);
        const outbox = x.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
        await this.actsOf(o, [...outbox, ...x.resolution.homes.map((h) => h.hint)], s.via, l);
      } catch {
      }
    }
    for (const [id, k] of Object.entries(book.acts)) {
      try {
        if (k.key) l.verifier.addWithKey(b642(k.act), b642(k.key));
        else l.verifier.add(b642(k.act));
      } catch {
        void id;
      }
    }
    return l;
  }
  async judgeOpts(me) {
    const acc = this.acceptedSet(await this.accepted(me));
    const chain = this.opts.chain ? await this.opts.chain.headers().catch(() => null) : null;
    return { money: MONEY, accepted: [...acc], chain: chain ? { network: chain.network, start: chain.start, headers: chain.headers } : void 0 };
  }
  /** The payee signs the settlement receipt (Money type 2) for a payment whose claim verifies (payment cMIP, "Delivery"), by hand. */
  signReceipt(key) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const p = book.payments[key];
      if (!p || p.side !== "in" || !p.claims.length) throw new Error("No payment to you is waiting there.");
      const lines2 = await this.receiptOf(me, s, book, p, { by: "hand" });
      await this.saveBook(me.id, book);
      return { lines: lines2 };
    });
  }
  /**
   * The receipt for a payment to this identity: its claim checked from the
   * rail's own evidence first, then the receipt signed (by hand, or under
   * the receipts lane), sent sealed to the payer; then, where the payment
   * follows one of this identity's offers, the sale told to its own Dub
   * (type 6), and a referral share its claim names prepared for payment
   * (F351). Inside `serial`; `how` null: Damgar itself, under its lane, or
   * nothing done.
   */
  async receiptOf(me, s, book, p, how) {
    const l = await this.judge(me, s, book, [p.other]);
    const opts = await this.judgeOpts(me);
    const claim = p.claims.find((c2) => l.verifier.moneyJudge(c2, opts).rail.answer === "valid");
    if (!claim) {
      if (!how) return [];
      const j = l.verifier.moneyJudge(p.claims[p.claims.length - 1], opts);
      throw new Error(`Their claim does not verify yet: ${j.rail.answer}${j.rail.why ? `, ${j.rail.why}` : ""} (its standing: ${j.standing}). No receipt was signed.`);
    }
    const c = moneyRead(3, this.opened(book, claim).payload).act;
    const made = moneyPayload({ type: "receipt", rail: c.rail, proof: new Uint8Array(c.proof), payer: p.other, payee: me.id, amount: c.amount, fulfils: c.fulfils });
    const as = how ?? await this.payeeAuto(me, s, MONEY, made.type, made.payload);
    if (!as) return [];
    const receipt = await this.deliver(me, s, book, MONEY, made.type, made.payload, p.other, void 0, as);
    p.receipts.push(receipt);
    p.stage = "settled";
    const acc = opts.accepted.length ? new Set(opts.accepted) : /* @__PURE__ */ new Set();
    const lines2 = [{ text: `${as.by === "lane" ? "Damgar checked their claim from the rail\u2019s own evidence and signed your receipt by itself, under your receipts lane" : "Their claim verifies from the rail\u2019s own evidence. Your receipt is signed"} (\u201CI received ${say(p.amount, acc)} from ${short2(p.other)}\u201D), and sent to them, sealed.`, tone: "ok" }];
    lines2.push(...await this.afterSale(me, s, book, p, receipt, c));
    return lines2;
  }
  /** A seller's offer this identity signed, read from its places: what it sells, its price, its words. */
  async offerOf(me, s, id) {
    const { acts } = await this.payee(me.id, me, s);
    const d = acts.get(id);
    if (!d || d.signer !== me.id || d.spec !== MIRS.agreements || d.type !== AGREEMENTS_TYPES.offer || !d.payload) return null;
    try {
      const m = cborDecode(d.payload);
      const sold = m.get(1).find((x) => x[0] === 0);
      const price = m.get(2);
      if (!sold || !(sold[1] instanceof Uint8Array)) return null;
      return { publication: hex(sold[1]), price: { unit: hex(price[0]), value: Number(price[1]) }, words: typeof m.get(4) === "string" ? m.get(4) : null };
    } catch {
      return null;
    }
  }
  /**
   * After a receipt following one of this identity's offers: the sale told
   * to its own Dub, sealed to itself (the money messages cMIP draft 2, type
   * 6), so Dub delivers the key; and, where the buyer's claim names a repost
   * the buyer followed (Money claim field 6, rule 20) and the offer's words
   * promise a referral share, that share prepared for payment to the
   * reposter, a draft of Damgar's own (F351: a promise in words, not judged;
   * the judged form is a one-party agreement with a split plan, round 3).
   */
  async afterSale(me, s, book, p, receipt, c) {
    const lines2 = [];
    const offer = await this.offerOf(me, s, c.fulfils).catch(() => null);
    if (!offer) return lines2;
    const save = () => this.store.saveIdentity(me);
    const sale = await sendToSelf(me, TYPES.sale, salePayload({ offer: c.fulfils, buyer: p.other, receipt, publication: offer.publication }), { via: s.via, save });
    (book.sales ??= {})[receipt] = sale.id;
    lines2.push({ text: `A sale of your offer ${short2(c.fulfils)}: told to your own Dub, sealed to yourself, which delivers the key to ${short2(p.other)}.`, tone: "ok" });
    const share2 = referralShare(offer.words);
    if (!c.referral || share2 === null) return lines2;
    const why = await this.repostProblem(me, s, c.referral, offer.publication);
    if (why) {
      lines2.push({ text: `The buyer names a repost they followed, but ${why}: no referral share is prepared.`, tone: "warn" });
      return lines2;
    }
    const amount = { unit: c.amount.unit, value: Math.floor(c.amount.value * share2 / 100) };
    if (amount.value <= 0) return lines2;
    const draft = await sendToSelf(
      me,
      TYPES.draft,
      draftPayload({ what: "pay", other: c.referral.identity, amount, whatFor: `referral share, ${share2}% of a sale of your offer`, app: "Damgar (a referral share)", anchor: null }),
      { refs: [[c.referral.evidence, c.referral.identity]], via: s.via, save }
    );
    (book.referrals ??= {})[p.claims[p.claims.length - 1]] = { reposter: c.referral.identity, evidence: c.referral.evidence, amount, draft: draft.id };
    lines2.push({ text: `The buyer followed a repost by ${short2(c.referral.identity)}: your offer promises ${share2}% to the reposter. Its payment is prepared (${say(amount, /* @__PURE__ */ new Set([amount.unit]))}): Damgar signs it by itself under your referral lane, or it waits in Waiting. A promise in words, not judged by the core (F351).`, tone: "ok" });
    return lines2;
  }
  /** Why a referral's evidence is no repost of this publication by its referrer, or null. */
  async repostProblem(me, s, r, publication) {
    try {
      const l = await lookUp(r.identity, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via);
      const outbox = l.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints);
      const acts = await this.actsOf(r.identity, [...outbox, ...l.resolution.homes.map((h) => h.hint), ...s.relays], s.via, l);
      const d = acts.get(r.evidence);
      if (!d) return "the repost it names was not found at the reposter\u2019s places";
      if (d.signer !== r.identity || !(d.refs ?? []).includes(publication)) return "the act it names is no repost of this publication by its referrer";
      if (l.verifier.status(r.evidence) !== "valid") return "the repost does not count";
      return null;
    } catch (e3) {
      return `the reposter was not found (${message3(e3)})`;
    }
  }
  /**
   * What Damgar does by itself after a look (round 2, 2b), unless every step
   * is followed by hand: a receipt for each payment to this identity whose
   * claim verifies, under its receipts lane and within its cap; and each
   * referral share it prepared, bound under its payouts lane. Anything it
   * may not do waits in Waiting.
   */
  async byItself(me, s, book, lines2, problems) {
    if (s.manual || this.opts.app) return;
    for (const p of Object.values(book.payments)) {
      if (p.side !== "in" || !p.claims.length || p.receipts.length) continue;
      try {
        lines2.push(...await this.receiptOf(me, s, book, p, null));
      } catch (e3) {
        problems.push(`A receipt Damgar could not sign by itself: ${message3(e3)}`);
      }
    }
    for (const [id, x] of Object.entries(book.drafts)) {
      if (x.stage !== "new") continue;
      let dr;
      try {
        dr = readDraft(this.opened(book, id).payload);
      } catch {
        continue;
      }
      if (dr.app !== "Damgar (a referral share)" || dr.what !== "pay") continue;
      try {
        const p = await this.bind(me, s, book, { payee: dr.other, amount: dr.amount, fulfils: null, whatFor: dr.whatFor, answers: null, draft: id, ticket: null, auto: true });
        x.stage = "signed";
        x.payment = p.key;
        lines2.push({ text: `The referral share to ${short2(dr.other)} is asked for by itself, under your referral lane: when they answer, it is in Waiting, To pay, to pay in your wallet.`, tone: "ok" });
      } catch (e3) {
        lines2.push({ text: `The referral share to ${short2(dr.other)} waits in Waiting (${message3(e3)}).` });
      }
    }
  }
  // ------------------------------------------------------------ the account
  /** Every payment, with its claims and receipts judged; requests and debts; totals per unit, never across units. */
  account() {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      const shown = (a) => ({ ...a, said: say(a, acc) });
      const others = [...Object.values(book.payments).map((p) => p.other), ...Object.values(book.requestsIn).map((r) => r.from), ...Object.values(book.requestsOut).map((r) => r.to)];
      const problems = [];
      let l = null;
      try {
        l = await this.judge(me, s, book, others);
      } catch (e3) {
        problems.push(`This identity could not be looked up: ${message3(e3)}`);
      }
      const opts = await this.judgeOpts(me);
      const payments = Object.values(book.payments).sort((a, b) => b.at - a.at).map((p) => {
        const proofs = [...p.claims.map((a) => ["claim", a]), ...p.receipts.map((a) => ["receipt", a])].map(([kind, act]) => {
          let j = { rail: { answer: "unknown", why: "not judged" }, beside: { answer: "unknown", why: "" }, standing: "unknown" };
          try {
            if (l) j = l.verifier.moneyJudge(act, opts);
          } catch (e3) {
            j.rail.why = message3(e3);
          }
          return { act, kind, by: this.who(kind === "claim" ? p.side === "out" ? me.id : p.other : p.side === "out" ? p.other : me.id, me.id), rail: j.rail, beside: j.beside, standing: j.standing, confirmations: j.confirmations ?? null, how: this.howSaid(book, act, j.standing) };
        });
        return this.showPayment(p, me.id, acc, proofs);
      });
      const asks = [
        ...Object.entries(book.requestsIn).map(([id, x]) => {
          const r = this.requestOf(book, id);
          return { id, side: "in", other: this.who(x.from, me.id), amount: shown(r?.amount ?? { unit: "", value: 0 }), whatFor: r?.whatFor ?? null, state: { new: "asked of you, not answered", declined: "declined", debt: "accepted as a debt by you, not paid", asked: "being paid", paid: "paid" }[x.stage], obligation: x.obligation, lines: x.obligation ? [{ text: DEBT_SAY, tone: "warn" }] : [] };
        }),
        ...Object.entries(book.requestsOut).map(([id, x]) => {
          const r = this.requestOf(book, id);
          const paid = x.payment ? book.payments[x.payment] : null;
          return { id, side: "out", other: this.who(x.to, me.id), amount: shown(r?.amount ?? { unit: "", value: 0 }), whatFor: r?.whatFor ?? null, state: paid ? paid.receipts.length ? "paid, receipt signed" : paid.claims.length ? "paid, by their claim" : "being paid" : x.obligation ? "accepted by them as a debt (signed), not paid" : "asked, not paid yet", obligation: x.obligation, lines: x.obligation ? [{ text: DEBT_SAY, tone: "warn" }] : [] };
        })
      ];
      const valid = (ps) => ps.some((x) => x.rail.answer === "valid");
      const inn = payments.filter((p) => p.side === "in" && valid(p.proofs)).map((p) => p.amount);
      const out = payments.filter((p) => p.side === "out" && valid(p.proofs)).map((p) => p.amount);
      const pending = payments.filter((p) => !valid(p.proofs) && p.stage !== "refused" && p.stage !== "declined").map((p) => p.amount);
      const owedYou = asks.filter((a) => a.side === "out" && !/^paid/.test(a.state)).map((a) => a.amount);
      const owedBy = asks.filter((a) => a.side === "in" && /not paid|not answered/.test(a.state)).map((a) => a.amount);
      const t = (label, xs) => ({ label, amounts: totals(xs.filter((x) => x.unit)).map(shown) });
      return {
        totals: [t("Came in (verified)", inn), t("Went out (verified)", out), t("Pending", pending), t("Asked of others, not paid", owedYou), t("Asked of you, not paid", owedBy)],
        payments,
        asks,
        problems,
        notes: ACCOUNT_NOTES
      };
    });
  }
  /** How an act was signed, in words (round 2, 2b): by hand, by Damgar itself, under a lane (named), or, for another's act, on whose authority. */
  howSaid(book, act, standing2) {
    const h = book.how?.[act];
    if (h?.by === "hand") return "signed by hand";
    if (h?.by === "itself") return "signed by Damgar itself (an address bound to the payment, as in round 1)";
    if (h?.by === "lane") return `signed under the lane \u201C${book.lanes?.[h.grant]?.label ?? `${h.grant.slice(0, 8)}\u2026`}\u201D`;
    const theirs = book.authorities?.[act];
    if (theirs) return theirs;
    return standing2 === "scoped" ? "signed under a grant: unknown to a Money-only reading" : "signed with its signer\u2019s own key";
  }
  showPayment(p, me, acc, proofs) {
    const amount = { ...p.amount, said: say(p.amount, acc) };
    let pay = null;
    if (p.side === "out" && (p.stage === "to pay" || p.stage === "paid") && p.bound && p.bound.kind !== "refused") {
      if (p.bound.kind === "invoice") pay = { invoice: p.bound.invoice, amount };
      else pay = { address: onchainPayTo(b642(p.address), p.key).address, amount };
    }
    const f = p.commitment ? readCommitmentFields(b642(p.commitment)) : null;
    const said = {
      asked: p.side === "out" ? "invoice requested, waiting for their answer" : "asked to be bound",
      "to pay": p.side === "out" ? "ready to pay, in your wallet" : "bound, waiting for their payment",
      refused: "refused",
      paid: p.side === "out" ? "paid: your claim sent, waiting for their receipt" : "paid by their claim: check it and sign the receipt",
      settled: "settled: claim and receipt",
      declined: "declined"
    };
    const lines2 = [];
    if (p.vault) {
      said.asked = "to your vault: waiting for the invoice your vault\u2019s node makes";
      said.paid = p.rail === SPEC.onchain.hash ? "sent to your vault: check the chain again at six confirmations" : "moved to your vault: its record sealed to you at your homes";
    }
    if (p.bound?.kind === "refused") lines2.push({ text: `Refused: ${p.bound.why}`, tone: "warn" });
    if (p.rail === SPEC.onchain.hash && !this.opts.chain) lines2.push({ text: "Paid, not yet checked against the chain: the web client follows none.", tone: "warn" });
    if (p.rail === SPEC.onchain.hash && this.opts.chain) lines2.push({ text: `Checked against ${this.opts.chain.said}.` });
    return {
      key: p.key,
      side: p.side,
      other: this.who(p.other, me),
      amount,
      rail: p.rail,
      railName: railName(p.rail),
      whatFor: p.whatFor,
      to: f?.paidTo.kind ?? "flow",
      stage: p.stage,
      stageSaid: said[p.stage],
      pay,
      proofs,
      lines: lines2,
      at: p.at,
      ticket: p.ticket ? { batch: p.ticket.batch, deadline: p.ticket.deadline, tier: p.ticket.tier, checked: p.ticket.checked !== false } : null,
      vaultInvoice: p.vault && p.stage === "asked" && p.rail === SPEC.lightning.hash ? { node: readLightningAddress(b642(p.address))?.node ?? "", descriptionHash: p.key } : null
    };
  }
  /** Pay: the payments of this identity waiting to be paid or checked again. */
  pay() {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      return {
        payments: Object.values(book.payments).filter((p) => p.side === "out" && (p.stage === "to pay" || p.stage === "asked" || p.stage === "paid" && !!p.onchain)).sort((a, b) => b.at - a.at).map((p) => this.showPayment(p, me.id, acc, []))
      };
    });
  }
  // ------------------------------------------------------------ lanes (F338 round 2, F351)
  /** A lane's grant in plain words, read back before it is signed: what it reaches, how much one act may move, until when, who holds its key. */
  laneWords(me, g, acc) {
    const read3 = { grantee: me.id, scope: 2, kinds: g.kinds, limits: g.limits, limitsProblem: null, key: "" };
    const kindSaid = (k) => k.spec === MONEY && k.type === 2 ? "receipts (\u201CI received this\u201D)" : k.spec === MONEY && k.type === 3 ? "payment claims (\u201CI paid this\u201D)" : MESSAGES_SPECS.includes(k.spec) && k.type === 3 ? "invoice requests (asking a payee where to pay)" : MESSAGES_SPECS.includes(k.spec) && k.type === 4 ? "answers to invoice requests (an invoice, or an address)" : `acts of type ${k.type} of ${k.spec.slice(0, 8)}\u2026`;
    const out = [
      `A lane named \u201C${g.label}\u201D, asked by ${g.app}: a grant of this identity to itself (Agreements draft 15, rule 73, F351), naming a key that ${g.app} made and holds. With it, ${g.app} signs in your name, by itself, without opening Damgar, within these limits only.`,
      `What it may sign: ${g.kinds.map(kindSaid).join("; ")}. Nothing else: never a grant, a revocation, a pointer, a debt or a post.`,
      g.limits?.cap ? `How much one act may move: at most ${say({ unit: g.limits.cap.unit, value: g.limits.cap.value }, acc)} (the grant limits cMIP, 2). An act above it is refused before it is signed, and one signed anyway counts for nothing.` : "How much one act may move: no cap. A lane without a cap is refused here.",
      g.total ? `In all: at most ${say({ unit: g.total.unit, value: g.total.value }, acc)} for the whole lane (the grant limits cMIP, draft 3, 8). ${TOTAL_SAY}` : "",
      g.limits?.expiry?.clock === "timestamp" ? grantInWords(read3, me.id, short2).find((l) => l.startsWith("Until")) ?? "" : "Until: no expiry; it ends only when you revoke it.",
      "Every act signed under it is shown, here and to every reader, as signed under this lane, not with your own key. One revocation ends it, here in Lanes.",
      "Public: the grant is published at your relays and homes (rule 73: a private grant backs nothing), so anyone can see that you hold such a lane, and its limits. Its name stays here."
    ];
    return out.filter(Boolean);
  }
  /** Sign a lane's grant (to oneself) and its acceptance, with the signing key, public, at the relays and homes. */
  async grantLaneActs(me, s, g) {
    await this.current(me);
    const payload = personGrantPayload({ grantee: me.id, kinds: g.kinds, limits: g.limits ?? void 0, key: [1, unhex(g.key)] });
    let grant;
    let acc;
    try {
      grant = await me.signNow(MIRS.agreements, AGREEMENTS_TYPES.grant, payload, { public: true });
      const a = acceptance(grant.id);
      acc = await me.signNow(a.spec, a.type, a.payload, { public: true, objects: a.objects });
    } finally {
      await this.store.saveIdentity(me);
    }
    let left = 0;
    for (const h of list2([...s.relays, ...me.f.homes.map((x) => x.hint)])) {
      try {
        await relayAt(h, s.via).putAct(grant.act);
        await relayAt(h, s.via).putAct(acc.act);
        left++;
      } catch {
      }
    }
    if (!left) throw new Error("No relay or home took the lane\u2019s grant. It was signed here; grant it again later.");
    return grant.id;
  }
  laneLimits(cap2, until, clock) {
    if (!Number.isSafeInteger(cap2.value) || cap2.value <= 0) throw new Error("A lane needs a cap per act, a whole amount above zero.");
    const l = { cap: { unit: cap2.unit, value: cap2.value } };
    if (until !== null) {
      if (!clock) throw new Error("An expiry is judged on a timestamp clock: name one in Settings (its ID), or leave Until empty.");
      l.expiry = { clock: "timestamp", identity: clock, time: until };
    }
    encodeLimits(l);
    return l;
  }
  /** A lane asked by an app, read in plain words (To sign). */
  laneItem(me, book, id, acc) {
    const r = readLaneRequest(this.opened(book, id).payload);
    const x = book.laneRequests[id];
    let limits = null;
    let total = null;
    const lines2 = [];
    try {
      if (r.limits !== null) ({ limits, total } = readAsked(r.limits));
    } catch (e3) {
      lines2.push({ text: `Its limits cannot be read (${message3(e3)}): it cannot be granted.`, tone: "warn" });
    }
    const unknown = !acc.has(GRANT_LIMITS_SPEC) || !limits?.cap;
    if (!acc.has(GRANT_LIMITS_SPEC)) lines2.push({ text: "Lanes carry their limits under the grant limits cMIP, which you do not accept: accept it in Settings to grant a lane.", tone: "warn" });
    lines2.unshift(...this.laneWords(me, { label: r.label, app: r.app, kinds: r.kinds, limits, total }, acc).map((text3) => ({ text: text3 })));
    return { id, kind: "lane", from: this.who(me.id, me.id), app: r.app, title: `A lane asked by ${r.app}: \u201C${r.label}\u201D`, lines: lines2, amount: limits?.cap ? { unit: limits.cap.unit, value: limits.cap.value, said: say({ unit: limits.cap.unit, value: limits.cap.value }, acc) } : null, unknown, offers: unknown ? ["decline"] : ["grant", "decline"], found: x.found };
  }
  /** Grant a lane an app asked for: its grant to oneself, naming the key the app holds, and the acceptance, signed here (F351). */
  grantLane(id) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const x = book.laneRequests?.[id];
      if (!x || x.stage !== "new") throw new Error("No lane is waiting there.");
      const acc = this.acceptedSet(await this.accepted(me));
      const item = this.laneItem(me, book, id, acc);
      if (item.unknown) throw new Error("It cannot be granted here: nothing was signed.");
      const r = readLaneRequest(this.opened(book, id).payload);
      const { limits, total } = readAsked(r.limits);
      const grant = await this.grantLaneActs(me, s, { key: r.key, kinds: r.kinds, limits });
      (book.lanes ??= {})[grant] = { label: r.label, app: r.app, key: r.key, kinds: r.kinds, limits, at: now(), revoked: null, here: false, role: null, total };
      x.stage = "granted";
      x.grant = grant;
      await this.saveBook(me.id, book);
      return { lines: [{ text: `The lane \u201C${r.label}\u201D is granted: public at your relays and homes. ${r.app} finds it there and signs within it from now on. Revoke it in Lanes at any time.`, tone: "ok" }] };
    });
  }
  /**
   * A lane Damgar holds itself (round 2, 2b): `receipts`, signing receipts
   * for payments it verified and answering invoice requests by itself;
   * `payouts`, signing the invoice requests and claims of referral shares it
   * owes. Read back first; nothing is signed until `ownLane` with the digest.
   */
  async ownLaneReview(a) {
    const { me, s } = await this.ctx();
    const acc = this.acceptedSet(await this.accepted(me));
    const limits = this.laneLimits({ unit: a.unit, value: Number(String(a.cap).replace(/[\s_]/g, "")) }, a.until ?? null, s.clock ?? null);
    const g = this.ownLaneShape(a.role, limits);
    return { digest: await digestOf(JSON.stringify({ me: me.id, a })), lines: this.laneWords(me, g, acc).map((text3) => ({ text: text3 })) };
  }
  ownLaneShape(role, limits) {
    return role === "receipts" ? { label: "Damgar: receipts and invoices by itself", app: "Damgar", kinds: [{ spec: MONEY, type: 2 }, { spec: MESSAGES_SPEC, type: TYPES.answer }], limits } : { label: "Damgar: referral shares by itself", app: "Damgar", kinds: [{ spec: MESSAGES_SPEC, type: TYPES.invoiceRequest }, { spec: MONEY, type: 3 }], limits };
  }
  ownLane(a) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const { digest: _, ...rest } = a;
      if (await digestOf(JSON.stringify({ me: me.id, a: rest })) !== a.digest) throw new Error("This is not what was read back: read it again.");
      const limits = this.laneLimits({ unit: a.unit, value: Number(String(a.cap).replace(/[\s_]/g, "")) }, a.until ?? null, s.clock ?? null);
      const g = this.ownLaneShape(a.role, limits);
      const k = makeGrantKey();
      const keys = await this.keys(me.id);
      const grant = await this.grantLaneActs(me, s, { key: hex(k.public[1]), kinds: g.kinds, limits });
      keys.lanes = [...keys.lanes ?? [], { grant, label: g.label, secret: hex(k.secret), strand: [], kinds: g.kinds, limits, role: a.role }];
      await this.store.write(me.id, "keys", keys);
      (book.lanes ??= {})[grant] = { label: g.label, app: "Damgar", key: hex(k.public[1]), kinds: g.kinds, limits, at: now(), revoked: null, here: true, role: a.role };
      await this.saveBook(me.id, book);
      return { lines: [{ text: `\u201C${g.label}\u201D is granted: Damgar signs within it by itself while \u201CFollow every step by hand\u201D is off.`, tone: "ok" }] };
    });
  }
  /**
   * What revoking a lane does, read back before it is signed (F352): the
   * revocation cites every act signed under the lane that the identity's
   * places hold, so each payee, holding only its own act, finds it counted;
   * its cost said: the public revocation lists every act's id, a long lane
   * makes a long revocation, and an act held nowhere Damgar reads is voided.
   */
  revokeLaneReview(grant) {
    return this.serial(async () => {
      const { me, s, book, hints } = await this.ctx();
      const l = book.lanes?.[grant];
      if (!l) throw new Error("No lane of this identity, granted here, is that one.");
      if (l.revoked) throw new Error("That lane is revoked already.");
      const under = await actsUnder(me.id, grant, hints, s.via).catch(() => []);
      return { acts: under.length, lines: [...REVOKE_SAY(l.label, under.length).map((text3) => ({ text: text3 })), { text: REVOKE_COST, tone: "warn" }] };
    });
  }
  /** Revoke a lane (Agreements type 10, an everyday act, public): one act ends it (rule 76). */
  revokeLane(grant) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const l = book.lanes?.[grant];
      if (!l) throw new Error("No lane of this identity, granted here, is that one.");
      if (l.revoked) throw new Error("That lane is revoked already.");
      await this.current(me);
      const { hints } = await this.ctx();
      const under = await actsUnder(me.id, grant, hints, s.via).catch(() => []);
      let r;
      try {
        r = await me.signNow(MIRS.agreements, REVOCATION, revocationPayload(grant), { public: true, objects: under.length ? under.map((a) => [me.id, a.id]) : void 0 });
      } finally {
        await this.store.saveIdentity(me);
      }
      let left = 0;
      for (const h of list2([...s.relays, ...me.f.homes.map((x) => x.hint)])) {
        try {
          await relayAt(h, s.via).putAct(r.act);
          left++;
        } catch {
        }
      }
      if (!left) throw new Error("No relay or home took the revocation. Revoke it again later.");
      l.revoked = r.id;
      if (l.here) {
        const keys = await this.keys(me.id);
        keys.lanes = (keys.lanes ?? []).filter((x) => x.grant !== grant);
        await this.store.write(me.id, "keys", keys);
      }
      await this.saveBook(me.id, book);
      return { lines: [{ text: `\u201C${l.label}\u201D is revoked, published at ${left} place${left === 1 ? "" : "s"}: an act signed under it after this counts for nothing. It cites the ${under.length} act${under.length === 1 ? "" : "s"} signed under it that its places hold, which keep counting; one held nowhere it reads would not (Agreements rule 76).`, tone: "ok" }] };
    });
  }
  /** Every lane granted here, in plain words, with every act signed under it that its homes and relays hold. */
  lanes() {
    return this.serial(async () => {
      const { me, s, book, hints } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      const keys = await this.keys(me.id);
      const out = [];
      for (const [grant, l] of Object.entries(book.lanes ?? {}).sort((a, b) => b[1].at - a[1].at)) {
        let acts = [];
        let revoked = l.revoked;
        try {
          if (!revoked) revoked = (await revocationsOf(me.id, grant, hints, s.via))[0] ?? null;
          acts = (await actsUnder(me.id, grant, hints, s.via)).map((a) => ({ id: a.id, said: this.actSaid(book, a) }));
        } catch {
        }
        const expired = l.limits?.expiry?.clock === "timestamp" && now() > l.limits.expiry.time;
        const under = l.here ? null : await this.underLane(me, s, book, grant, hints).catch(() => null);
        const unitOfLane = l.total?.unit ?? l.limits?.cap?.unit ?? null;
        const used = under && unitOfLane ? spent(under.payments.map((p) => ({ amount: p.amount, refused: p.stage === "refused" })), unitOfLane) : null;
        const shown = (value) => ({ unit: unitOfLane, value, said: say({ unit: unitOfLane, value }, acc) });
        out.push({
          grant,
          label: l.label,
          app: l.app,
          here: l.here,
          state: revoked ? "revoked" : expired ? "past its expiry (this device\u2019s clock)" : "in force",
          words: this.laneWords(me, l, acc),
          acts,
          cap: l.limits?.cap ? shown(l.limits.cap.value) : null,
          until: l.limits?.expiry?.clock === "timestamp" ? l.limits.expiry.time : null,
          total: l.total ? shown(l.total.value) : null,
          spent: used !== null ? shown(used) : null,
          left: l.total && used !== null ? shown(Math.max(0, l.total.value - used)) : null,
          over: l.total && used !== null && used > l.total.value ? shown(used - l.total.value) : null,
          payments: under?.payments.map((p) => ({ key: p.key, to: this.who(p.payee, me.id), amount: { ...p.amount, said: say(p.amount, acc) }, whatFor: p.whatFor, stage: p.stage, request: p.request, claims: p.claims })) ?? [],
          sealed: under?.sealed ?? 0
        });
      }
      void keys;
      return { lanes: out, manual: !!s.manual, link: !!keys.link, linkSay: LINK_SAY, clock: s.clock ?? null };
    });
  }
  /**
   * The payments an app made under its lane, read from the acts under it at
   * the identity's places whose content keys the app delivered to the
   * identity itself (`delivered`): each invoice request a payment, its
   * claims marking it paid, an answer refusing it giving it back. Acts whose
   * key was not delivered are counted as sealed.
   */
  async underLane(me, s, book, grant, hints) {
    const by = /* @__PURE__ */ new Map();
    const seen = /* @__PURE__ */ new Set();
    let sealed = 0;
    for (const act of await allBy(me.id, hints, s.via)) {
      const d0 = describeAct(act);
      if (d0.binding !== grant || seen.has(d0.id)) continue;
      seen.add(d0.id);
      const key = book.delivered?.[d0.id];
      let d;
      try {
        d = key ? openWithKey(act, b642(key)) : d0;
      } catch {
        sealed++;
        continue;
      }
      if (!d.payload) {
        sealed++;
        continue;
      }
      try {
        if (d.spec && MESSAGES_SPECS.includes(d.spec) && d.type === TYPES.invoiceRequest) {
          const r = readInvoiceRequest(d.payload);
          const x = by.get(r.fields.hash) ?? { key: r.fields.hash, payee: r.fields.payee, amount: r.fields.amount, whatFor: r.whatFor, stage: "asked", request: null, claims: [] };
          x.request = d.id;
          x.whatFor = r.whatFor;
          if (x.stage === "asked" && book.laneAnswers?.[d.id]?.refused) x.stage = "refused";
          by.set(x.key, x);
        } else if (d.spec === MONEY && d.type === 3) {
          const c = moneyRead(3, d.payload).act;
          const pr = readPaymentProof(new Uint8Array(c.proof));
          const k = paymentCommitment({ rail: c.rail, payee: c.payee, amount: c.amount, fulfils: c.fulfils, payer: me.id, paidTo: pr.paidTo, salt: pr.salt });
          const x = by.get(k) ?? { key: k, payee: c.payee, amount: c.amount, whatFor: null, stage: "paid", request: null, claims: [] };
          x.stage = "paid";
          if (!x.claims.includes(d.id)) x.claims.push(d.id);
          by.set(k, x);
        }
      } catch {
      }
    }
    return { payments: [...by.values()], sealed };
  }
  actSaid(book, a) {
    const k = book.acts[a.id];
    let spec = a.spec;
    let type = a.type;
    if (k?.key) {
      try {
        const d = openWithKey(b642(k.act), b642(k.key));
        spec = d.spec;
        type = d.type;
      } catch {
      }
    }
    if (spec === MONEY && type === 2) return "a receipt";
    if (spec === MONEY && type === 3) return "a payment claim";
    if (spec && MESSAGES_SPECS.includes(spec) && type === TYPES.invoiceRequest) return "an invoice request";
    if (spec && MESSAGES_SPECS.includes(spec) && type === TYPES.answer) return "an answer to an invoice request";
    return a.public ? "a public act" : "a private act, sealed (its kind is read by its recipient only)";
  }
  // ------------------------------------------------------------ transfer to the vault (H46, F355)
  /** The vault in force and the payee pointer this identity's chain declares, as its own look-up reads them. */
  async ownVault(me, s) {
    const { look } = await this.payee(me.id, me, s);
    const vault = look.verifier.moneyVault(MONEY, me.id);
    const ptr = look.verifier.moneyPointer(MONEY, me.id);
    return { vault, pointer: ptr.act };
  }
  /** What a transfer to the vault would be, in plain words, and what stops it. */
  async vaultPlan(me, s, a) {
    const acc = this.acceptedSet(await this.accepted(me));
    const { vault } = await this.ownVault(me, s);
    const blocking = [];
    const e3 = vault?.entries[a.entry];
    if (!vault) blocking.push("Your identity\u2019s chain declares no vault: declare one in Ki\u0161ib, in a change of keys (Money rule 2).");
    else if (!e3) blocking.push("Choose one of your vault\u2019s entries.");
    const value = Number(a.value);
    if (!Number.isSafeInteger(value) || value <= 0) blocking.push("An amount is a whole number above zero.");
    if (e3 && !acc.has(e3.railModule)) blocking.push(`${railName(e3.railModule)} is not accepted for this identity (Settings).`);
    if (e3 && e3.railModule === SPEC.onchain.hash && value > 0 && value < 330) blocking.push("Amounts below 330 satoshis cannot be paid on the on-chain rail.");
    const amount = e3 && value > 0 ? { unit: e3.unit, value } : null;
    const lines2 = [];
    const costs = [];
    if (e3 && amount) {
      const where = e3.railModule === SPEC.lightning.hash ? `its node ${readLightningAddress(e3.source)?.node.slice(0, 16) ?? "?"}\u2026` : `its Bitcoin key ${readOnchainAddress(e3.source)?.key.slice(0, 16) ?? "?"}\u2026`;
      lines2.push(
        { text: `To your vault: the entry on ${railName(e3.railModule)}, ${where}, declared in your chain (act ${vault.declaredBy.slice(0, 12)}\u2026) with the chain key.` },
        { text: `The amount: ${say(amount, acc)}, from your wallet (on regtest, the test wallet). It is a payment from you to you: Damgar binds it, you pay it in your wallet and paste the proof back, and Damgar checks it as any payment (F355).` },
        { text: "It names the act that declared your vault as what it follows: a transfer to yourself, which buys nothing and pays no one else (the payment cMIP, draft 4). Paid by anyone but you, such a payment is invalid." },
        e3.railModule === SPEC.lightning.hash ? { text: "The fee: your wallet\u2019s routing fee, which it shows before you pay. Damgar holds no wallet and cannot see it. Between two nodes with a direct channel it is usually none." } : { text: "The fee: the miners\u2019 fee your wallet sets when it sends, on top of the amount. Damgar holds no wallet and cannot see it; on regtest the test wallet chooses it." }
      );
      if (e3.railModule === SPEC.lightning.hash) lines2.push({ text: "Its invoice is made by your vault\u2019s node, not by Damgar: you make it there (on regtest, in the test wallet, on the vault\u2019s node) with the description hash Damgar shows, and paste it back." });
      costs.push(
        { text: "This money can then be spent only with the chain key and its record: the vault\u2019s own key, declared with your chain key in Ki\u0161ib, and the record Damgar keeps sealed to you at your homes (your claim of the payment, its commitment and salt included).", tone: "warn" },
        ...e3.railModule === SPEC.onchain.hash ? [{ text: "On-chain, the money sits at an address made from your vault\u2019s key and this payment\u2019s commitment: without the record, the vault\u2019s key alone does not find it.", tone: "warn" }] : [],
        { text: "One way only: Damgar never takes money out of the vault. Withdrawing needs the chain key and stays in Ki\u0161ib.", tone: "warn" }
      );
    }
    const digest = sha2562(cborEncode(["MOR Damgar transfer to the vault, version 2", me.id, a.entry, vault?.declaredBy ?? "", e3?.unit ?? "", value]));
    return { lines: lines2, costs, blocking, digest, plan: e3 && amount && !blocking.length ? { entry: a.entry, amount, declaredBy: vault.declaredBy, module: e3.railModule, source: e3.source } : null };
  }
  /** A transfer to the vault read back before anything is bound (H46, F355). */
  vaultTransferRead(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const r = await this.vaultPlan(me, s, a);
      return { digest: r.digest, lines: r.lines, costs: r.costs, blocking: r.blocking };
    });
  }
  /**
   * A transfer to the vault, bound (H46, F355): a payment from this identity
   * to itself, its commitment naming the vault entry it goes to (`paid-to`
   * `[1, declared-by, entry]`) and, as `fulfils`, the very act declaring
   * that vault (the payment cMIP, draft 4, item 6 and step 4a): a transfer
   * to oneself, which needs no payee pointer. Draft 3's form (`fulfils` one's
   * own payee pointer) is still read and verified as before. On-chain its address is made here, with
   * the vault's request key where this Damgar holds it; on Lightning, the
   * vault's node makes the invoice. Then it is paid as any payment, in Pay.
   */
  vaultTransfer(a) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const r = await this.vaultPlan(me, s, a);
      if (r.digest !== a.digest) throw new Error("What you confirmed is not what was read back: read it again. Nothing was bound.");
      if (!r.plan) throw new Error(`${r.blocking.join(" ") || "It cannot be bound."} Nothing was bound.`);
      const pl = r.plan;
      const salt = new Uint8Array(randomBytes(16));
      const paidTo = { kind: "vault", declaredBy: pl.declaredBy, entry: pl.entry };
      const c = { rail: pl.module, payee: me.id, amount: pl.amount, fulfils: pl.declaredBy, payer: me.id, paidTo, salt };
      const commitment = commitmentCbor(c);
      const key = paymentCommitment(c);
      const p = {
        key,
        side: "out",
        other: me.id,
        amount: pl.amount,
        fulfils: pl.declaredBy,
        whatFor: "to my vault",
        rail: pl.module,
        address: base64(pl.source),
        commitment: base64(commitment),
        invoiceRequest: "",
        answer: null,
        bound: null,
        preimage: null,
        onchain: null,
        claims: [],
        receipts: [],
        draft: null,
        request: null,
        ticket: null,
        stage: "asked",
        at: now(),
        vault: true
      };
      const lines2 = [];
      if (pl.module === SPEC.onchain.hash) {
        const keys = await this.store.read(me.id, "keys") ?? { request: null, earlier: [] };
        const addr = readOnchainAddress(pl.source);
        const secret = [keys.request, ...keys.earlier].find((k) => k && addr && onchainKey(unhex(k)) === addr.request);
        if (!secret) throw new Error("The request key your vault\u2019s on-chain entry names is not held by this Damgar: its address cannot be made here. Nothing was bound.");
        p.bound = { kind: "request", request: base64(onchainRequest(unhex(secret), key, void 0)), confirmations: null };
        p.stage = "to pay";
        lines2.push({ text: "Bound: the address for this transfer alone is in Waiting, To the vault. Send exactly the amount from your wallet, then paste the transaction\u2019s id there.", tone: "ok" });
      } else {
        lines2.push({ text: `Bound: make an invoice on your vault\u2019s node for ${say(pl.amount, this.acceptedSet(await this.accepted(me)))} with the description hash ${key} (on regtest, in the test wallet, on the vault\u2019s node), and paste it in Waiting, To the vault.`, tone: "ok" });
      }
      book.payments[key] = p;
      await this.saveBook(me.id, book);
      return { key, lines: lines2 };
    });
  }
  /** The invoice the vault's node made for a transfer to the vault (Lightning): checked (its node the vault's, the amount, the description hash), then it is paid in Pay. */
  vaultInvoice(key, invoice) {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      const p = book.payments[key];
      if (!p?.vault || p.stage !== "asked" || p.rail !== SPEC.lightning.hash) throw new Error("No transfer to your vault is waiting for its invoice there.");
      const t = invoice.trim().toLowerCase().replace(/^lightning:/, "");
      const problems = this.invoiceProblems(p, t).map((x) => x.replace("the node your payee pointer names", "your vault\u2019s node"));
      if (problems.length) throw new Error(`This invoice cannot bind the transfer: ${problems.join("; ")}. Nothing was kept.`);
      p.bound = { kind: "invoice", invoice: t };
      p.stage = "to pay";
      await this.saveBook(me.id, book);
      return { lines: [{ text: "The invoice is your vault\u2019s node\u2019s, for this transfer alone: pay it from your wallet, then paste the preimage.", tone: "ok" }] };
    });
  }
  /** Follow every step by hand (round 2, 2b): off by default. */
  setManual(on) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.store.write(me.id, "settings", { ...s, manual: on });
      return {
        lines: [
          on ? { text: "Every step by hand: every signature waits for you, as in round 1. No lane held here signs; invoices and addresses wait for you to answer them. Lanes held by other apps (Dub) still sign there: revoke them in Lanes to stop them.", tone: "ok" } : { text: "Damgar signs by itself again, within the lanes it holds.", tone: "ok" }
        ]
      };
    });
  }
  /** The timestamp clock a lane's expiry is judged on (its identity), or none. */
  setClock(clock) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const c = clock.trim().toLowerCase();
      if (c && !/^[0-9a-f]{64}$/.test(c)) throw new Error("A clock is named by its identity: 64 characters, 0 to 9 and a to f.");
      await this.store.write(me.id, "settings", { ...s, clock: c || void 0 });
      return { lines: [{ text: c ? `Lanes with an expiry are judged on the timestamp clock ${short2(c)}.` : "No clock: a lane can have no expiry.", tone: "ok" }] };
    });
  }
  /** The receive-only link (F351): checked first (too wide a permission refused), kept owner-only beside the keys. */
  setLink(c) {
    return this.serial(async () => {
      const { me } = await this.ctx();
      const keys = await this.keys(me.id);
      if (!c) {
        keys.link = null;
        await this.store.write(me.id, "keys", keys);
        return { lines: [{ text: "The link is removed: Damgar makes no invoice. You make each one in your wallet, as before.", tone: "ok" }] };
      }
      if (!this.opts.link) throw new Error("This Damgar makes no link to a node (the web client never does). Use Damgar on your computer.");
      const link = await this.opts.link(c);
      if (await link.tooWide()) throw new Error("This permission can read your node\u2019s balance: it is wider than making invoices. Bake one with \u201Clncli bakemacaroon invoices:write invoices:read\u201D and give that. Nothing was kept.");
      keys.link = c;
      await this.store.write(me.id, "keys", keys);
      return { lines: [{ text: "The link is kept: Damgar answers a Lightning payment to you by itself, with an invoice from your node, below your receipts lane\u2019s cap. It can make invoices only.", tone: "ok" }] };
    });
  }
  /**
   * The lane, held here, that reaches this act and lets it be signed now:
   * its kinds, its limits before signing (client conformance, 5.1), and no
   * revocation at the places. `role` narrows to Damgar's own lanes' purpose.
   */
  async laneFor(me, s, spec, type, payload, role) {
    const keys = await this.keys(me.id);
    const hints = [.../* @__PURE__ */ new Set([...me.f.homes.map((h) => h.hint), ...s.relays])];
    let why = role === "app" ? `${this.opts.app ?? "This app"} holds no lane: ask Damgar for one` : "Damgar holds no lane for this";
    for (const l of keys.lanes ?? []) {
      if (l.role !== role) continue;
      if (!reaches(l.kinds, spec, type, (x) => x === MONEY ? 2 : null)) {
        why = `its lane \u201C${l.label}\u201D does not reach this act`;
        continue;
      }
      const refused = refuseBeforeSigning(l.limits, { spec, type, payload }, MONEY, now());
      if (refused) {
        why = `\u201C${l.label}\u201D: ${refused}`;
        continue;
      }
      const over = l.total && MESSAGES_SPECS.includes(spec) && type === TYPES.invoiceRequest ? await this.pastTotal(me.id, l.grant, l.total, amountOf({ spec, type, payload }, MONEY)) : null;
      if (over) {
        why = `\u201C${l.label}\u201D: ${over}`;
        continue;
      }
      try {
        if ((await revocationsOf(me.id, l.grant, hints, s.via)).length) {
          why = `\u201C${l.label}\u201D was revoked. Nothing was signed`;
          continue;
        }
      } catch {
      }
      return { lane: l };
    }
    return { why };
  }
  /** What a lane held here has spent in all (draft 3, 8.2): its payments, each once, those the payee refused giving back. */
  async laneSpent(id, grant, unit) {
    const book = await this.store.read(id, "book") ?? null;
    const ps = Object.values(book?.payments ?? {}).filter((p) => p.side === "out" && p.how?.by === "lane" && p.how.grant === grant && p.stage !== "declined");
    return spent(ps.map((p) => ({ amount: p.amount, refused: p.stage === "refused" })), unit);
  }
  /** Why this payment would take the lane past its cap in all, or null. */
  async pastTotal(id, grant, total, amount) {
    if (!amount) return null;
    const acc = /* @__PURE__ */ new Set([total.unit]);
    if (amount.unit !== total.unit) return `the cap in all is in ${say({ unit: total.unit, value: 0 }, acc).replace(/^0 /, "")}, and this payment is in another unit`;
    const used = await this.laneSpent(id, grant, total.unit);
    if (used + amount.value <= total.value) return null;
    const left = Math.max(0, total.value - used);
    return `${amount.value} would go past the lane\u2019s cap in all of ${total.value}: ${left ? `${left} left` : "nothing left"} (the grant limits cMIP, draft 3; kept by the apps)`;
  }
  // ------------------------------------------------------------ Settings: where you are paid
  /** The payee pointer in force, the vault (read here, changed in Kišib), the request key, the chain followed. */
  rails() {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      const { look, acts } = await this.payee(me.id, me, s);
      const ptr = look.verifier.moneyPointer(MONEY, me.id);
      let pointer = null;
      if (ptr.act && acts.get(ptr.act)?.payload) {
        const pp = moneyRead(0, acts.get(ptr.act).payload).act;
        pointer = { act: ptr.act, version: ptr.version, forked: ptr.forked, rails: pp.rails.map((r) => ({ module: r.module, name: railName(r.module), said: railSaid(r.module, new Uint8Array(r.address)), accepted: acc.has(r.module) })) };
      }
      const v = look.verifier.moneyVault(MONEY, me.id);
      const keys = await this.store.read(me.id, "keys") ?? { request: null, earlier: [] };
      return {
        pointer,
        vault: v ? {
          declaredBy: v.declaredBy,
          entries: v.entries.map((e3) => ({
            unit: { unit: e3.unit, value: 0, said: unitOf(e3.unit)?.unit.name ?? `unit ${e3.unit.slice(0, 8)}\u2026` },
            railName: railName(e3.railModule),
            limit: { unit: e3.unit, value: e3.limit, said: say({ unit: e3.unit, value: e3.limit }, acc) },
            said: e3.limit === 0 ? "every payment in this unit goes to the vault (flow off)" : `a single payment above ${say({ unit: e3.unit, value: e3.limit }, acc)} goes to your vault, not your flow`
          }))
        } : null,
        requestKey: keys.request ? onchainKey(unhex(keys.request)) : null,
        chain: this.opts.chain ? this.opts.chain.said : "none: the web client follows no chain, so an on-chain payment is shown paid, not yet checked against the chain"
      };
    });
  }
  /**
   * Review a new payee pointer (Money type 0): the rails in order of
   * preference, with each rail Module's stated costs (a client MUST show
   * them before a rail is declared). Nothing is signed until `publishRails`
   * with the same digest. On-chain, the request key is made here, or a new
   * one where `newRequestKey`.
   */
  async railsReview(a) {
    const { me } = await this.ctx();
    const keys = await this.store.read(me.id, "keys") ?? { request: null, earlier: [] };
    const rails = this.railsFrom(a, keys.request && !a.newRequestKey ? keys.request : null);
    const lines2 = rails.map((r) => ({ text: `${railName(r.module)}: ${railSaid(r.module, r.address)}` }));
    if (!rails.length) throw new Error("Give a Lightning node key, or a Bitcoin key for the on-chain rail, or both.");
    const costs = [];
    if (a.lightning?.trim()) costs.push(...LIGHTNING_COSTS.map((t) => ({ text: `Lightning: ${t}`, tone: "warn" })));
    if (a.onchain?.trim()) costs.push(...[...REQUEST_KEY_SAY, ...ONCHAIN_COSTS].map((t) => ({ text: `On-chain: ${t}`, tone: "warn" })));
    const digest = await digestOf(JSON.stringify({ me: me.id, a }));
    return { digest, lines: [...lines2, { text: "Signed with your signing key, public: anyone paying you reads it. It replaces the pointer in force; payments already bound stay as they are." }], costs };
  }
  railsFrom(a, requestSecret) {
    const out = [];
    if (a.lightning?.trim()) out.push({ module: SPEC.lightning.hash, address: lightningAddress({ network: a.network, node: a.lightning.trim().toLowerCase() }), requestSecret: null });
    if (a.onchain?.trim()) {
      let key = a.onchain.trim().toLowerCase();
      if (/^0[23][0-9a-f]{64}$/.test(key)) key = key.slice(2);
      if (!/^[0-9a-f]{64}$/.test(key)) throw new Error("The Bitcoin key is an x-only key: 64 hexadecimal characters (or 66, starting 02 or 03).");
      const secret = requestSecret ?? hex(newSecret());
      out.push({ module: SPEC.onchain.hash, address: onchainAddress({ network: a.network, key, request: onchainKey(unhex(secret)) }), requestSecret: secret });
    }
    return out;
  }
  /** Publish the reviewed payee pointer: version one more than the pointer in force, naming it. */
  publishRails(a) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const { digest: _, ...rest } = a;
      if (await digestOf(JSON.stringify({ me: me.id, a: rest })) !== a.digest) throw new Error("This is not what was reviewed: review it again.");
      await this.current(me);
      const keys = await this.store.read(me.id, "keys") ?? { request: null, earlier: [] };
      const rails = this.railsFrom(a, keys.request && !a.newRequestKey ? keys.request : null);
      const { look } = await this.payee(me.id, me, s);
      const ptr = look.verifier.moneyPointer(MONEY, me.id);
      const made = moneyPayload({ type: "pointer", payee: me.id, version: ptr.version + 1, previous: ptr.act ?? void 0, rails: rails.map((r) => ({ module: r.module, address: r.address })) });
      const newSecretUsed = rails.find((r) => r.requestSecret)?.requestSecret ?? null;
      if (newSecretUsed && newSecretUsed !== keys.request) {
        await this.store.write(me.id, "keys", { request: newSecretUsed, earlier: keys.request ? [...keys.earlier, keys.request] : keys.earlier });
      }
      let act;
      try {
        act = await me.signNow(MONEY, made.type, made.payload, { public: true });
      } finally {
        await this.store.saveIdentity(me);
      }
      let left = 0;
      for (const h of list2([...s.relays, ...me.f.homes.map((x) => x.hint)])) {
        try {
          await relayAt(h, s.via).putAct(act.act);
          left++;
        } catch {
        }
      }
      if (!left) throw new Error("No relay or home took the payee pointer.");
      book.pointers.push(act.id);
      await this.saveBook(me.id, book);
      return { lines: [{ text: `Your payee pointer, version ${ptr.version + 1}, is published: ${rails.map((r) => railName(r.module)).join(", then ")}.${newSecretUsed && newSecretUsed !== keys.request && keys.request ? " It names a new request key: the old one no longer counts for new payments." : ""}`, tone: "ok" }] };
    });
  }
  /** The relays this identity's money acts and pointer go to. */
  setRelays(relays) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const r = list2(relays);
      for (const x of r) if (!/^https?:\/\//.test(x)) throw new Error(`\u201C${x}\u201D: an address starts with https:// (or http://)`);
      if (!r.length) throw new Error("Give at least one relay.");
      await this.store.write(me.id, "settings", { ...s, relays: r });
      return { lines: [{ text: `Relays: ${r.join(", ")}.`, tone: "ok" }] };
    });
  }
  /**
   * Sign a private act addressed to one identity, seal it to its current
   * encryption key, and leave it at its inbox; the locked act goes to this
   * identity's homes too (Identity rule 35). Kept in the book, with its key,
   * and how it was signed: by hand, by Damgar itself, or under a lane whose
   * key is held here (`lane`: signed with the grant key, citing its grant,
   * on the lane's own strand; F343, F350, F351).
   */
  async deliver(me, s, book, spec, type, payload, to, refs, how = { by: "hand" }) {
    const l = await lookUp(to, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via);
    if (!l.encryptionKey) throw new Error(`${short2(to)} publishes no encryption key: nothing can be sealed to it. Nothing was sent.`);
    const inbox = l.inbox(spec) ?? (MESSAGES_SPECS.includes(spec) ? MESSAGES_SPECS.map((x) => l.inbox(x)).find((x) => x) : void 0) ?? [];
    if (!inbox.length) throw new Error(`${short2(to)} declares no inbox: nothing can be left for it. Nothing was sent.`);
    await this.current(me);
    let made;
    if (how.by === "lane") {
      const keys = await this.keys(me.id);
      const lane = keys.lanes?.find((x) => x.grant === how.grant);
      if (!lane) throw new Error("That lane\u2019s key is not held here. Nothing was signed.");
      try {
        made = signUnderGrant({ grant: lane.grant, grantor: me.id, secret: lane.secret, strand: lane.strand }, { spec, type, payload, public: false, to: [to], refs });
      } finally {
        await this.store.write(me.id, "keys", keys);
      }
    } else {
      try {
        made = await this.signAct(me, spec, type, payload, { public: false, to: [to], refs });
      } finally {
        await this.store.saveIdentity(me);
      }
    }
    book.acts[made.id] = { act: base64(made.act), key: base64(made.key), from: me.id };
    (book.how ??= {})[made.id] = how;
    const sealed = sealFor(made.act, made.key, [{ id: to, key: l.encryptionKey }]);
    let left = 0;
    for (const h of inbox) {
      try {
        await relayAt(h, s.via).putSealed(sealed);
        left++;
      } catch {
      }
    }
    await leaveAtHomes(me, made, { via: s.via, lockedOnly: how.by === "lane" && !(this.opts.app && me.f.signingSecret) });
    await this.store.saveIdentity(me);
    if (!left) throw new Error(`${short2(to)}\u2019s inbox (${inbox.join(", ")}) took nothing. It was signed and kept here; try again later.`);
    return made.id;
  }
  /**
   * How a payer's act is signed here: inside another app (Dub), only under
   * a lane it holds, or refused saying why; in Damgar, by hand, or, for what
   * Damgar does by itself (a referral share), under its payouts lane.
   */
  async payerHow(me, s, spec, type, payload, auto) {
    if (this.opts.app) {
      const f2 = await this.laneFor(me, s, spec, type, payload, "app");
      if ("why" in f2) throw new Error(`${f2.why}. Nothing was signed.`);
      return { by: "lane", grant: f2.lane.grant };
    }
    if (!auto) return { by: "hand" };
    if (s.manual) throw new Error("Every step is followed by hand here: it waits for you.");
    const f = await this.laneFor(me, s, spec, type, payload, "payouts");
    if ("why" in f) throw new Error(f.why);
    return { by: "lane", grant: f.lane.grant };
  }
  /** How the payee's act is signed by Damgar itself: under its receipts lane, unless every step is followed by hand. Its cap is judged on the act itself by the grant limits cMIP (`laneFor`): a receipt's amount, an answer's (draft 3, F352). Null: it waits for the person. */
  async payeeAuto(me, s, spec, type, payload) {
    const f = await this.payeeLane(me, s, spec, type, payload);
    return "why" in f ? null : f;
  }
  /** As `payeeAuto`, with why it waits. */
  async payeeLane(me, s, spec, type, payload) {
    if (s.manual || this.opts.app) return { why: "every step is followed by hand" };
    const f = await this.laneFor(me, s, spec, type, payload, "receipts");
    if ("why" in f) return f;
    return { by: "lane", grant: f.lane.grant };
  }
};
var REVOKE_SAY = (label, acts) => [
  `Revoking \u201C${label}\u201D signs one public act: from it on, nothing signed under the lane counts.`,
  `It cites the ${acts} act${acts === 1 ? "" : "s"} signed under the lane that your homes and relays hold, each by its id, so every payment already made under it keeps counting for the one paid, who holds only their own (Agreements rule 76).`
];
var REVOKE_COST = "The cost: the revocation is public and lists the id of every act it cites (what each says stays sealed); a lane used long makes a long revocation; an act signed under the lane that Damgar does not find at your homes and relays is not cited, and is void from then on.";
function referralShare(words2) {
  const m = words2?.match(/Referral: (\d{1,2})% of the price to the repost the buyer names\./);
  return m ? Number(m[1]) : null;
}
function railSaid(module2, address) {
  if (module2 === SPEC.lightning.hash) {
    const a = readLightningAddress(address);
    return a ? `the node ${a.node.slice(0, 16)}\u2026 on ${NETWORKS[a.network]}` : "an address this Module does not read";
  }
  if (module2 === SPEC.onchain.hash) {
    const a = readOnchainAddress(address);
    return a ? `the Bitcoin key ${a.key.slice(0, 16)}\u2026 on ${NETWORKS[a.network]}, its requests signed by the key ${a.request.slice(0, 16)}\u2026 Damgar holds` : "an address this Module does not read";
  }
  return "a rail Module Damgar does not implement";
}
var NETWORKS = ["Bitcoin", "testnet", "signet", "regtest"];
function newSecret() {
  for (; ; ) {
    const s = new Uint8Array(randomBytes(32));
    try {
      onchainKey(s);
      return s;
    } catch {
    }
  }
}
async function digestOf(s) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function findOutput(tx, script) {
  let p = 4;
  const varint = () => {
    const b = tx[p++];
    if (b < 253) return b;
    const n = b === 253 ? 2 : b === 254 ? 4 : 8;
    let v = 0;
    for (let i = 0; i < n; i++) v += tx[p + i] * 2 ** (8 * i);
    p += n;
    return v;
  };
  const ins = varint();
  for (let i = 0; i < ins; i++) {
    p += 36;
    {
      const n = varint();
      p += n;
    }
    p += 4;
  }
  const outs = varint();
  for (let i = 0; i < outs; i++) {
    p += 8;
    const n = varint();
    if (hex(tx.slice(p, p + n)) === script) return i;
    p += n;
  }
  return null;
}

// ../barebone/src/sealed.ts
var SEALED_TEXT = POST_SPECS.text;
var SEALED_PICTURE = POST_SPECS.jpeg;
var MEDIA_SPEC = { text: SEALED_TEXT, picture: SEALED_PICTURE };
var mediaOf = (spec) => spec === SEALED_TEXT ? "text" : spec === SEALED_PICTURE ? "picture" : null;
function lockWork(a) {
  let bytes = a.bytes;
  let removed = [];
  if (a.media === "picture") {
    const s = strip(a.bytes);
    bytes = s.bytes;
    removed = s.removed;
  } else {
    bytes = new TextEncoder().encode(new TextDecoder("utf-8", { fatal: true }).decode(a.bytes));
  }
  const l = lockMedia(bytes);
  const m = /* @__PURE__ */ new Map([
    [0, unhex(MEDIA_SPEC[a.media])],
    [1, unhex(l.workHash)],
    [2, unhex(l.lockedHash)],
    [3, bytes.length],
    [4, l.nonce],
    [6, a.relays],
    [7, [unhex(a.price.unit), a.price.value]]
  ]);
  if (a.forId) m.set(8, unhex(a.forId));
  return { payload: cborEncode(m), locked: l.locked, key: hex(l.key), work: l.workHash, size: bytes.length, removed };
}
function offerPayload(a) {
  const m = /* @__PURE__ */ new Map();
  if (a.under) m.set(0, unhex(a.under));
  m.set(1, ["publication" in a.sells ? [0, unhex(a.sells.publication)] : [3, unhex(a.sells.vow)]]);
  m.set(2, [unhex(a.price.unit), a.price.value]);
  if (a.payee) m.set(3, unhex(a.payee));
  m.set(4, a.words);
  return cborEncode(m);
}
var OFFER = 6;
var KEY_DELIVERY = 1;
function offerWords(price, referral) {
  return `A sealed post, opened once paid: ${price}.${referral ? ` Referral: ${referral}% of the price to the repost the buyer names.` : ""}`;
}
async function postSealed(by, a) {
  const w = lockWork(a.picture ? { media: "picture", bytes: a.picture, price: a.price, relays: a.relays } : { media: "text", bytes: new TextEncoder().encode(a.text ?? ""), price: a.price, relays: a.relays });
  for (const hint of a.relays) {
    for (const x of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(x);
      } catch {
      }
    }
  }
  const publication = await by.publish(POST_SPECS.envelopes, PUBLICATION, w.payload, { public: true, relays: a.relays });
  for (const hint of a.relays) await relayAt(hint, by.via).putMedia(w.locked);
  const offer = await by.publish(MIRS.agreements, OFFER, offerPayload({ sells: { publication: publication.id }, price: a.price, words: a.words }), { public: true, relays: a.relays });
  const post3 = await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(a.teaser), { public: true, relays: a.relays, refs: [referenceTo(publication.act), referenceTo(offer.act)] });
  return { publication: publication.id, offer: offer.id, post: post3.id, key: w.key, acts: { publication: publication.act, offer: offer.act, post: post3.act }, removed: w.removed };
}
function readSealed(act) {
  const d = describeAct(act);
  if (d.spec !== POST_SPECS.envelopes || d.type !== PUBLICATION || !d.payload || !d.signer) return null;
  const m = cborDecode(d.payload);
  const media = m.get(0);
  const kind = media instanceof Uint8Array ? mediaOf(hex(media)) : null;
  if (!kind || m.has(5)) return null;
  const price = m.get(7);
  return {
    publication: d.id,
    media: kind,
    seller: d.signer,
    price: Array.isArray(price) && price[0] instanceof Uint8Array ? { unit: hex(price[0]), value: Number(price[1]) } : null,
    work: hex(m.get(1)),
    lockedHash: hex(m.get(2)),
    nonce: m.get(4),
    size: Number(m.get(3)),
    places: Array.isArray(m.get(6)) ? m.get(6).filter((x) => typeof x === "string") : []
  };
}
function readOffer(act, seller, publication, coOwners = false) {
  const d = describeAct(act);
  if (d.spec !== MIRS.agreements || d.type !== OFFER || d.signer !== seller || !d.payload) return null;
  try {
    const m = cborDecode(d.payload);
    if (m.has(0) && !coOwners) return null;
    const sells = m.get(1).some((x) => x[0] === 0 && x[1] instanceof Uint8Array && hex(x[1]) === publication);
    const price = m.get(2);
    if (!sells) return null;
    const under = m.get(0);
    const payee = m.get(3);
    return {
      offer: d.id,
      price: { unit: hex(price[0]), value: Number(price[1]) },
      words: typeof m.get(4) === "string" ? m.get(4) : null,
      ...under instanceof Uint8Array ? { under: hex(under) } : {},
      ...payee instanceof Uint8Array ? { payee: hex(payee) } : {}
    };
  } catch {
    return null;
  }
}
function keyDeliveryPayload2(publication, key) {
  return cborEncode(
    /* @__PURE__ */ new Map([
      [0, unhex(publication)],
      [1, unhex(key)],
      [2, true]
    ])
  );
}
function readKeyDelivery2(payload) {
  try {
    const m = cborDecode(payload);
    const p = m.get(0);
    const k = m.get(1);
    if (!(p instanceof Uint8Array) || !(k instanceof Uint8Array) || k.length !== 32 || m.get(2) !== true) return null;
    return { publication: hex(p), key: hex(k) };
  } catch {
    return null;
  }
}
async function openSealedBytes(s, key, hints, via2 = {}) {
  let locked = null;
  for (const h of [.../* @__PURE__ */ new Set([...hints, ...s.places])]) {
    try {
      locked = await relayAt(h, via2).getMedia(s.lockedHash);
      if (locked) break;
    } catch {
    }
  }
  if (!locked) throw new Error("its locked bytes were not found at the relays asked");
  let plain;
  try {
    plain = openMedia(locked, unhex(key), s.nonce);
  } catch {
    throw new Error("the key delivered does not open its bytes");
  }
  if (workHash(plain) !== s.work || plain.length !== s.size) throw new Error("its bytes do not match the work hash and size it was published with");
  return plain;
}
async function repost(by, a) {
  for (const hint of a.relays) {
    for (const x of [...a.seller, ...by.chainActs(), a.publication, a.offer]) {
      try {
        await relayAt(hint, a.via ?? by.via).putAct(x);
      } catch {
      }
    }
    if (a.locked) {
      try {
        await relayAt(hint, a.via ?? by.via).putMedia(a.locked);
      } catch {
      }
    }
  }
  return by.publish(POST_SPECS.text, TEXT_ACT, textPayload(a.text), { public: true, relays: a.relays, refs: [referenceTo(a.publication), referenceTo(a.offer)] });
}

// src/delivery.ts
var message4 = (e3) => e3 instanceof Error ? e3.message : String(e3);
var list3 = (xs) => [...new Set(xs.filter(Boolean))];
async function salesTold(me, via2) {
  const secrets = [...me.f.encryption].reverse().map((e3) => unhex(e3.secret));
  const out = [];
  for (const h of me.f.homes.map((x) => x.hint)) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via2).feed({ to: me.id, after });
        for (const it of page.items) {
          if (it.kind !== "sealed") continue;
          for (const sec of secrets) {
            let o;
            try {
              o = openSealed(it.item, me.id, sec);
            } catch {
              continue;
            }
            const d = o.described;
            if (d.signer === me.id && d.spec === MESSAGES_SPEC && d.type === TYPES.sale && d.payload) {
              const x = readSale(d.payload);
              if (!out.some((y) => y.publication === x.publication && y.buyer === x.buyer)) out.push({ publication: x.publication, buyer: x.buyer });
            }
            break;
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  return out;
}
async function deliverSold(me, sold, a) {
  const out = [];
  let checked = false;
  for (const x of await salesTold(me, a.via)) {
    const mine = sold[x.publication];
    if (!mine || mine.delivered[x.buyer]) continue;
    if (!checked) {
      await a.current();
      checked = true;
    }
    try {
      mine.delivered[x.buyer] = await deliverKey(me, x.buyer, x.publication, mine.key, { ...a, current: async () => void 0 });
      out.push(`The key of your sealed ${mine.media === "picture" ? "picture" : "post"} was delivered to ${x.buyer.slice(0, 8)}\u2026, sealed to them: a sale your Damgar signed the receipt for.`);
    } catch (e3) {
      out.push(`The key could not be delivered to ${x.buyer.slice(0, 8)}\u2026 yet: ${message4(e3)}`);
    }
  }
  return out;
}
async function deliverKey(me, buyer, publication, key, a) {
  await a.current();
  const hints = list3([...me.f.homes.map((h) => h.hint), ...a.relays]);
  const l = await lookUp(buyer, hints, a.via);
  if (!l.encryptionKey) throw new Error("the buyer publishes no encryption key");
  const inbox = l.inbox(SPECS.envelopes) ?? [];
  if (!inbox.length) throw new Error("the buyer declares no inbox");
  let made;
  try {
    made = me.sign(SPECS.envelopes, KEY_DELIVERY, keyDeliveryPayload2(publication, key), { public: false, to: [buyer] });
  } finally {
    await a.save();
  }
  const sealed = sealFor(made.act, made.key, [{ id: buyer, key: l.encryptionKey }]);
  let left = 0;
  for (const h of inbox) {
    try {
      await relayAt(h, a.via).putSealed(sealed);
      left++;
    } catch {
    }
  }
  await leaveAtHomes(me, made, { via: a.via });
  await a.save();
  if (!left) throw new Error("its inbox took nothing");
  return made.id;
}

// src/vows.ts
var VOW = 5;
var CONTEST = 14;
var CLAIM = 3;
function readVow(act) {
  const d = describeAct(act);
  if (d.spec !== SPECS.envelopes || d.type !== VOW || !d.payload || !d.signer) return null;
  try {
    const m = cborDecode(d.payload);
    const words2 = m.get(0);
    if (typeof words2 !== "string") return null;
    const own = (d.objects ?? []).filter(([c]) => c !== d.signer);
    return { name: own.length ? own[0][0] : d.id, signer: d.signer, words: words2, genesis: !own.length };
  } catch {
    return null;
  }
}
function readVowOffer(act, seller, vow) {
  const d = describeAct(act);
  if (d.spec !== MIRS.agreements || d.type !== OFFER || d.signer !== seller || !d.payload) return null;
  try {
    const m = cborDecode(d.payload);
    const sells = m.get(1).some((x) => x[0] === 3 && x[1] instanceof Uint8Array && hex(x[1]) === vow);
    if (!sells) return null;
    const price = m.get(2);
    const under = m.get(0);
    return { offer: d.id, price: { unit: hex(price[0]), value: Number(price[1]) }, words: typeof m.get(4) === "string" ? m.get(4) : null, ...under instanceof Uint8Array ? { under: hex(under) } : {} };
  } catch {
    return null;
  }
}
async function contestSale(by, a) {
  const made = await by.publish(MIRS.agreements, CONTEST, vowContestPayload(a.vow, a.sale, a.promise?.trim() || void 0), { public: true, relays: a.relays, objects: [[a.vow, a.vow]] });
  return made.id;
}
async function vowSales(identity, relays, via2 = {}) {
  const problems = [];
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const held = /* @__PURE__ */ new Map();
  const add = (a) => {
    try {
      v.add(a);
      held.set(describeAct(a).id, a);
    } catch {
    }
  };
  const chains = /* @__PURE__ */ new Set();
  const hold = async (id) => {
    if (chains.has(id)) return;
    chains.add(id);
    let places = relays;
    try {
      const l = await lookUp(id, relays, via2, v);
      places = [.../* @__PURE__ */ new Set([...relays, ...l.resolution.homes.map((h) => h.hint)])];
    } catch {
    }
    for (const a of await allBy(id, places, via2)) add(a);
  };
  await hold(identity);
  const byKind = async (spec, type) => {
    const out2 = [];
    for (const h of relays) {
      let after;
      try {
        for (; ; ) {
          const page = await relayAt(h, via2).feed({ spec, type, after });
          for (const it of page.items) if (it.kind === "act") out2.push(it.item);
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
        problems.push(`${h} did not answer.`);
      }
    }
    return out2;
  };
  const claims = await byKind(MIRS.money, CLAIM);
  const contests = await byKind(MIRS.agreements, CONTEST);
  const vows = [];
  for (const a of held.values()) {
    const x = readVow(a);
    if (x?.genesis && x.signer === identity) vows.push({ name: x.name, words: x.words });
  }
  for (const a of [...claims, ...contests]) {
    const d = describeAct(a);
    if (d.signer) await hold(d.signer);
    add(a);
  }
  const accepted = ACCEPTABLE.flatMap((x) => x.hashes);
  const railValid = [];
  const limits = [];
  const amounts = /* @__PURE__ */ new Map();
  for (const a of claims) {
    const d = describeAct(a);
    try {
      const j = v.moneyJudge(d.id, { money: MIRS.money, accepted });
      if (j.rail.answer !== "valid") continue;
      const c = moneyRead(CLAIM, d.payload).act;
      amounts.set(d.id, c.amount);
      const p = readPaymentProof(new Uint8Array(c.proof));
      const to = paidToOf(p.paidTo);
      if (to) railValid.push([d.id, to[0], to[1]]);
      const w = limitsOf(held, d, a);
      if (w !== null) limits.push([d.id, w]);
    } catch {
    }
  }
  const specs = withGrantLimits({ ...AGREEMENTS_SPECS, railValid }, limits);
  const out = [];
  for (const x of vows) {
    try {
      const e3 = v.agreementsVow(specs, x.name);
      out.push({
        name: e3.name,
        signer: e3.signer,
        void: e3.void,
        words: e3.words,
        offers: e3.offers,
        sales: e3.sales.map((s) => ({ ...s, promise: s.state === "contested" ? promiseOf(contests, s.by) : null, amount: amounts.get(s.act) ?? null })),
        unsigned: e3.unsigned.length
      });
    } catch (err) {
      problems.push(`The vow ${x.name.slice(0, 8)}\u2026 could not be read: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { vows: out, asked: relays, problems };
}
function paidToOf(p) {
  const x = p;
  if (x.flow) return [x.flow.pointer, null];
  if (x.vault) return [x.vault.declaredBy, x.vault.entry];
  if (typeof x.pointer === "string") return [x.pointer, null];
  if (typeof x.declaredBy === "string") return [x.declaredBy, x.entry ?? 0];
  return null;
}
function limitsOf(held, d, act) {
  const b = describeAct(act).binding;
  if (!b) return null;
  try {
    const g = held.get(b);
    const gd = g ? describeAct(g) : null;
    if (!gd || gd.spec !== MIRS.agreements || gd.type !== 9 || !gd.payload) return null;
    const grant = readGrant(gd.payload);
    if (!grant.limits) return null;
    const w = judge(grant.limits, { id: d.id, ...describeAct(act) }, MIRS.money);
    return w.within === null ? null : w.within;
  } catch {
    return null;
  }
}
function promiseOf(contests, by) {
  for (const a of contests) {
    const d = describeAct(a);
    if (!by.includes(d.id) || !d.payload) continue;
    try {
      const p = cborDecode(d.payload).get(1);
      if (typeof p === "string") return p;
    } catch {
    }
  }
  return null;
}

// src/money.ts
var LANE_KINDS = [
  { spec: MESSAGES_SPEC, type: TYPES.invoiceRequest },
  { spec: MONEY, type: 3 }
];
var LANE_SAY = [
  "A lane lets Dub pay by itself, without opening Damgar: a tip, or a sealed post, up to a cap per payment, until a date if you give one.",
  "Dub makes a key of its own for the lane and asks Damgar for it, sealed to yourself. Damgar shows you the lane in plain words; only once you grant it there can Dub sign with it. Every payment Dub signs under it is shown, in Damgar and to every reader, as signed under this lane, not with your own key.",
  "Revoke it in Damgar (Lanes) at any time: one public act ends it.",
  "Its key is kept in this app\u2019s folder: someone who takes that folder can pay within the cap until you revoke the lane.",
  "Money still moves only in your own wallet: Dub shows the invoice to pay, and takes the proof back."
];
var DamgarKeepInDub = class {
  constructor(s) {
    this.s = s;
  }
  held() {
    return this.s.held();
  }
  active() {
    return this.s.active();
  }
  setActive(id) {
    return this.s.setActive(id);
  }
  identity(id) {
    return this.s.identity(id);
  }
  saveIdentity(id) {
    return this.s.saveIdentity(id);
  }
  async read(id, name) {
    if (name === "settings") {
      const st = await this.s.settings(id);
      return { ...await this.s.money(id, "settings") ?? {}, relays: st.relays, via: st.via };
    }
    return this.s.money(id, name);
  }
  async write(id, name, v) {
    if (name === "settings") {
      const { relays: _, via: __, ...rest } = v;
      return this.s.saveMoney(id, "settings", rest);
    }
    return this.s.saveMoney(id, name, v);
  }
  async forget() {
  }
  exclusive(f) {
    return f();
  }
};
var now2 = () => Math.floor(Date.now() / 1e3);
var message5 = (e3) => e3 instanceof Error ? e3.message : String(e3);
var list4 = (xs) => [...new Set(xs.filter(Boolean))];
var DubMoney = class {
  constructor(store, opts) {
    this.store = store;
    this.engine = new Damgar(new DamgarKeepInDub(store), { web: opts.web, app: opts.app });
  }
  engine;
  async keys(id) {
    return await this.store.money(id, "keys") ?? { request: null, earlier: [] };
  }
  // ------------------------------------------------------------ the lane
  /**
   * Ask Damgar for a lane (the money messages cMIP draft 2, type 5): a grant
   * key made here, its secret kept here, and the request sealed to this
   * identity at its homes, where Damgar finds it. Nothing is signed for
   * money; the request itself is signed with the identity's key.
   */
  async askLane(me, s, a) {
    if (!Number.isSafeInteger(a.cap) || a.cap <= 0) throw new Error("A lane needs a cap per payment: a whole amount above zero. Nothing was asked.");
    const total = a.total === null || a.total === void 0 ? null : { unit: a.unit, value: a.total };
    if (total && (!Number.isSafeInteger(total.value) || total.value < a.cap)) throw new Error("The cap in all is a whole amount, at least the cap per payment. Nothing was asked.");
    const limits = { cap: { unit: a.unit, value: a.cap } };
    if (a.until !== null) {
      if (!a.clock || !/^[0-9a-f]{64}$/.test(a.clock)) throw new Error("An expiry is judged on a timestamp clock: give its ID, or leave Until empty. Nothing was asked.");
      limits.expiry = { clock: "timestamp", identity: a.clock, time: a.until };
    }
    encodeLimits(limits);
    const k = makeGrantKey();
    const keys = await this.keys(me.id);
    const label = a.label.trim().slice(0, 80) || a.app;
    const asked = { key: hex(k.public[1]), secret: hex(k.secret), label, limits, total, request: "", at: now2() };
    keys.asked = [...keys.asked ?? [], asked];
    await this.store.saveMoney(me.id, "keys", keys);
    const r = await sendToSelf(me, TYPES.laneRequest, laneRequestPayload({ key: asked.key, label, kinds: LANE_KINDS, limits: askedValue(limits, total, encodeLimits), app: a.app }), { via: s.via, save: () => this.store.saveIdentity(me) });
    asked.request = r.id;
    await this.store.saveMoney(me.id, "keys", keys);
    return [`Asked, not granted: the lane \u201C${label}\u201D, sealed to this identity and left at its homes (${r.left.join(", ")}).`, "Open Damgar with this identity: the lane waits in To sign, read in plain words, to be granted or declined. Until then Dub pays nothing by itself."];
  }
  /** The lanes asked here, as they stand: a grant found for each key at the identity's places (then held), revoked or past its expiry. */
  async lanes(me, s, hints) {
    const keys = await this.keys(me.id);
    let changed = false;
    for (const a of [...keys.asked ?? []]) {
      const found = (await grantsForKey(me.id, a.key, hints, s.via).catch(() => []))[0];
      if (!found) continue;
      keys.lanes = [...keys.lanes ?? [], { grant: found.id, label: a.label, secret: a.secret, strand: [], kinds: LANE_KINDS, limits: found.grant.limits ?? a.limits, role: "app", total: a.total ?? null }];
      keys.asked = (keys.asked ?? []).filter((x) => x !== a);
      changed = true;
    }
    if (changed) await this.store.saveMoney(me.id, "keys", keys);
    const shown = (l, state, grant) => ({
      label: l.label,
      state,
      cap: l.limits?.cap ? say({ unit: l.limits.cap.unit, value: l.limits.cap.value }, /* @__PURE__ */ new Set([l.limits.cap.unit])) : "no cap",
      total: l.total ? say(l.total, /* @__PURE__ */ new Set([l.total.unit])) : null,
      until: l.limits?.expiry?.clock === "timestamp" ? l.limits.expiry.time : null,
      grant
    });
    const out = (keys.asked ?? []).map((a) => shown(a, "asked", null));
    for (const l of keys.lanes ?? []) {
      const revoked = (await revocationsOf(me.id, l.grant, hints, s.via).catch(() => [])).length > 0;
      const expired = l.limits?.expiry?.clock === "timestamp" && now2() > l.limits.expiry.time;
      out.push(shown(l, revoked ? "revoked" : expired ? "past its expiry" : "in force", l.grant));
    }
    return out;
  }
  // ------------------------------------------------------------ paying, under the lane
  /** A tip on a post, paid now under the lane: the invoice request signed with the lane's key; refused before signing past its cap or expiry, saying why. */
  async tip(a) {
    const r = await this.engine.payUnderLane({ payee: a.signer, amount: a.amount, whatFor: a.whatFor, refs: [[a.post, a.signer]] });
    return r.lines.map((l) => l.text);
  }
  /** The payments asked here: answered ones to pay in the wallet, the others waiting, after a look for answers and receipts. */
  async payments() {
    const looked = await this.engine.look().catch((e3) => ({ lines: [], problems: [message5(e3)] }));
    const pay = (await this.engine.pay()).payments;
    const done = (await this.engine.account()).payments.filter((p) => p.side === "out" && !pay.some((x) => x.key === p.key)).slice(0, 10);
    return { payments: pay, done, problems: looked.problems };
  }
  /** The proof pasted back from the wallet: checked, and the claim signed under the lane. */
  async paid(key, proof) {
    return (await this.engine.paid(key, proof)).lines.map((l) => l.text);
  }
  // ------------------------------------------------------------ pay-per-view, the seller's side
  /** Seal a post with a price: the publication, its offer, the post naming both; the key kept here, to be delivered on each sale. */
  async sell(me, s, a) {
    if (!Number.isSafeInteger(a.price.value) || a.price.value <= 0) throw new Error("A price is a whole amount above zero. Nothing was posted.");
    if (a.referral !== null && (!Number.isInteger(a.referral) || a.referral < 1 || a.referral > 99)) throw new Error("A referral share is a whole percentage, 1 to 99. Nothing was posted.");
    const priceSaid = say(a.price, /* @__PURE__ */ new Set([a.price.unit]));
    const made = await postSealed(me, { text: a.text, teaser: a.teaser, price: a.price, words: offerWords(priceSaid, a.referral), relays: s.relays });
    const sold = await this.store.money(me.id, "sold") ?? {};
    sold[made.publication] = { key: made.key, offer: made.offer, post: made.post, delivered: {} };
    await this.store.saveMoney(me.id, "sold", sold);
    return {
      post: made.post,
      publication: made.publication,
      offer: made.offer,
      lines: [
        `Posted, sealed: ${priceSaid} to open it. Its words are public; its text opens only with its key, which Dub keeps and delivers to each buyer once your Damgar has signed the receipt.`,
        a.referral ? `Your offer promises ${a.referral}% of the price to the repost a buyer names: Damgar prepares that payment when it signs the receipt. A promise in words, not judged by the core (F351).` : "No referral share."
      ]
    };
  }
  /**
   * Deliver the keys of sales the seller's Damgar told of (type 6, sealed to
   * oneself): each a key delivery (Envelopes type 1), sealed to the buyer
   * and left in its inbox (`delivery.ts`, shared with Edubba's Publishing tab).
   */
  async deliver(me, s, current) {
    const sold = await this.store.money(me.id, "sold") ?? {};
    if (!Object.keys(sold).length) return [];
    const out = await deliverSold(me, sold, { relays: s.relays, via: s.via, save: () => this.store.saveIdentity(me), current });
    await this.store.saveMoney(me.id, "sold", sold);
    return out;
  }
  // ------------------------------------------------------------ pay-per-view, the buyer's side
  /** A sealed post a feed item names, read: its publication and offer, as this identity stands with it. */
  async read(me, hints, via2, refs) {
    let pub = null;
    const acts = [];
    for (const r of refs) {
      try {
        const a = (await followRef(r.signer ? [r.id, r.signer] : r.id, hints, via2)).act;
        acts.push(a);
        const x = readSealed(a);
        if (x && !pub) pub = { act: a, s: x };
      } catch {
      }
    }
    if (!pub) return null;
    const p = pub.s;
    const offer = acts.map((a) => readOffer(a, p.seller, p.publication, true)).find(Boolean) ?? null;
    const sold = await this.store.money(me.id, "sold") ?? {};
    const bought = await this.store.money(me.id, "bought") ?? {};
    const price = offer?.price ?? p.price;
    const out = {
      publication: p.publication,
      offer: offer?.offer ?? null,
      seller: p.seller,
      price: price ? say(price, /* @__PURE__ */ new Set([price.unit])) : "no price stated",
      words: offer?.words ?? null,
      state: "for sale",
      media: p.media,
      text: null,
      picture: null,
      problem: offer ? null : "no offer of its seller selling it was found: it cannot be bought here"
    };
    const key = p.seller === me.id ? sold[p.publication]?.key : bought[p.publication]?.key;
    if (p.seller === me.id) out.state = "yours";
    else if (bought[p.publication]?.payment && !key) out.state = "paying";
    if (key) {
      try {
        const bytes = await openSealedBytes(p, key, hints, via2);
        if (p.media === "picture") out.picture = `data:image/jpeg;base64,${base64(bytes)}`;
        else out.text = new TextDecoder().decode(bytes);
        if (out.state !== "yours") out.state = "opened";
      } catch (e3) {
        out.problem = `its key is here, but ${message5(e3)}`;
      }
    }
    return out;
  }
  /** Buy a sealed post under the lane: an invoice request following the seller's offer, naming the repost followed (Money claim field 6) where it was found through one. */
  async buy(me, hints, via2, a) {
    const pubAct = (await followRef([a.publication, a.seller], hints, via2)).act;
    const p = readSealed(pubAct);
    if (!p) throw new Error("That is not a sealed post. Nothing was signed.");
    if (p.seller === me.id) throw new Error("That post is your own. Nothing was signed.");
    const offerId = await this.offerFor(a, hints, via2);
    if (!offerId) throw new Error("No offer of its seller selling it was found. Nothing was signed.");
    const offer = readOffer((await followRef([offerId, a.seller], hints, via2)).act, a.seller, a.publication, true);
    let purchase = null;
    if (offer.under) {
      const now4 = await collectiveNow(a.seller, await collectivePlaces(a.seller, hints, via2), via2).catch(() => null);
      purchase = [offer.under, now4?.agreement ?? offer.under];
    }
    const r = await this.engine.payUnderLane({ payee: a.seller, amount: offer.price, whatFor: "a sealed post", fulfils: offer.offer, refs: [[a.publication, a.seller]], referral: a.repost ? { identity: a.repost.by, evidence: a.repost.id } : null, purchase });
    const bought = await this.store.money(me.id, "bought") ?? {};
    bought[a.publication] = { key: null, payment: r.key, seller: a.seller, offer: offer.offer };
    await this.store.saveMoney(me.id, "bought", bought);
    return [...r.lines.map((l) => l.text), ...a.repost ? [`Your claim will name the repost you followed, by ${a.repost.by.slice(0, 8)}\u2026: it earns the referral share the offer states, if the seller pays it.`] : []];
  }
  /** The offer selling a publication, named beside it in the post or repost that names it. */
  async offerFor(a, hints, via2) {
    const from = a.repost ? [a.repost.id, a.repost.by] : a.post ? [a.post, a.seller] : null;
    const names = [];
    if (from) {
      const d = describeAct((await followRef(from, hints, via2)).act);
      names.push(...d.refs ?? []);
    }
    for (const id of names) {
      try {
        const o = readOffer((await followRef([id, a.seller], hints, via2)).act, a.seller, a.publication, true);
        if (o) return o.offer;
      } catch {
      }
    }
    return null;
  }
  /** Key deliveries arrived in this identity's inbox (Envelopes type 1), each from the seller of the post it opens: kept here. */
  async keysArrived(me, s, inbox) {
    const bought = await this.store.money(me.id, "bought") ?? {};
    const waiting = Object.entries(bought).filter(([, b]) => !b.key);
    if (!waiting.length) return [];
    const secrets = [...me.f.encryption].reverse().map((e3) => unhex(e3.secret));
    const out = [];
    for (const h of list4([...inbox, ...me.f.homes.map((x) => x.hint)])) {
      let after;
      try {
        for (; ; ) {
          const page = await relayAt(h, s.via).feed({ to: me.id, after });
          for (const it of page.items) {
            if (it.kind !== "sealed") continue;
            for (const sec of secrets) {
              let o;
              try {
                o = openSealed(it.item, me.id, sec);
              } catch {
                continue;
              }
              const d = o.described;
              if (d.spec === SPECS.envelopes && d.type === KEY_DELIVERY && d.payload) {
                const k = readKeyDelivery2(d.payload);
                const b = k ? bought[k.publication] : void 0;
                if (k && b && !b.key && d.signer === b.seller) {
                  b.key = k.key;
                  out.push("The key of a sealed post you bought arrived from its seller: it opens in the feed.");
                }
              }
              break;
            }
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
      }
    }
    await this.store.saveMoney(me.id, "bought", bought);
    return out;
  }
  /** A repost of a sealed post, at this identity's relays, with what it names held there too (F272), so a reader of those relays alone finds it. */
  async repost(me, s, hints, a) {
    const postAct = (await followRef([a.post, a.signer], hints, s.via)).act;
    const d = describeAct(postAct);
    const named = await Promise.all((d.refs ?? []).map(async (id, i) => (await followRef(d.refSigners?.[i] ? [id, d.refSigners[i]] : id, hints, s.via)).act));
    const pubAct = named.find((x) => readSealed(x));
    if (!pubAct) throw new Error("That post names no sealed post. Nothing was reposted.");
    const p = readSealed(pubAct);
    const offerAct = named.find((x) => readOffer(x, p.seller, p.publication, true));
    if (!offerAct) throw new Error("That post names no offer selling it. Nothing was reposted.");
    const seller = await lookUp(p.seller, hints, s.via);
    const chain = await servedChain(p.seller, seller.resolution.homes, s.via).catch(() => []);
    let locked = null;
    for (const h of list4([...hints, ...p.places])) {
      try {
        locked = await relayAt(h, s.via).getMedia(p.lockedHash);
        if (locked) break;
      } catch {
      }
    }
    let made;
    try {
      made = await repost(me, { publication: pubAct, offer: offerAct, seller: chain, text: "Reposted: a sealed post.", relays: s.relays, locked, via: s.via });
    } finally {
      await this.store.saveIdentity(me);
    }
    return { id: made.id, lines: [`Reposted at your relays (${s.relays.join(", ")}), with the sealed post and its offer held there too: a reader of those relays finds it through you. A buyer who names your repost earns you the share its offer promises, if any.`] };
  }
  // ------------------------------------------------------------ vows (round 3)
  /** A vow a feed item names, read with its offer: null where the item names none. */
  async readVowRef(me, hints, via2, refs) {
    const acts = [];
    for (const r of refs) {
      try {
        acts.push((await followRef(r.signer ? [r.id, r.signer] : r.id, hints, via2)).act);
      } catch {
      }
    }
    const v = acts.map(readVow).find((x) => x?.genesis);
    if (!v) return null;
    const offer = acts.map((a) => readVowOffer(a, v.signer, v.name)).find(Boolean) ?? null;
    const bought = (await this.store.money(me.id, "vows") ?? {})[v.name];
    return {
      vow: v.name,
      offer: offer?.offer ?? null,
      seller: v.signer,
      words: v.words,
      price: offer ? say(offer.price, /* @__PURE__ */ new Set([offer.price.unit])) : "no price stated",
      state: v.signer === me.id ? "yours" : bought?.payment ? (await this.engine.payment(bought.payment))?.proof ? "bought" : "paying" : "for sale",
      problem: offer ? null : "no offer of its signer selling it was found: it cannot be bought here"
    };
  }
  /** Buy a vow under the lane: an invoice request following its offer; its claim, once paid, is also published, so its sale is seen (Agreements rule 13). */
  async buyVow(me, hints, via2, a) {
    const card2 = await this.readVowRef(me, hints, via2, [{ id: a.post, signer: a.seller }, ...(describeAct((await followRef([a.post, a.seller], hints, via2)).act).refs ?? []).map((id) => ({ id, signer: a.seller }))]);
    if (!card2 || card2.vow !== a.vow) throw new Error("That post names no vow. Nothing was signed.");
    if (card2.seller === me.id) throw new Error("That vow is your own. Nothing was signed.");
    if (!card2.offer || card2.problem) throw new Error(`${card2.problem ?? "No offer was found"}. Nothing was signed.`);
    const offer = readVowOffer((await followRef([card2.offer, card2.seller], hints, via2)).act, card2.seller, card2.vow);
    let purchase = null;
    if (offer.under) {
      const now4 = await collectiveNow(card2.seller, await collectivePlaces(card2.seller, hints, via2), via2).catch(() => null);
      purchase = [offer.under, now4?.agreement ?? offer.under];
    }
    const r = await this.engine.payUnderLane({ payee: card2.seller, amount: offer.price, whatFor: "a vow", fulfils: offer.offer, refs: [[card2.vow, card2.seller]], visible: true, purchase });
    const vows = await this.store.money(me.id, "vows") ?? {};
    vows[card2.vow] = { seller: card2.seller, offer: offer.offer, payment: r.key, post: a.post, words: card2.words };
    await this.store.saveMoney(me.id, "vows", vows);
    return [...r.lines.map((l) => l.text), "Once paid, your claim of the payment is published too: it is the sale, pending until you confirm or contest it, in its menu (Purchases)."];
  }
  /** The vows bought here, each with its sale's state as the relays asked read it (the look-up, `vows.ts`). */
  async vowsBought(me, hints, via2) {
    const vows = await this.store.money(me.id, "vows") ?? {};
    const out = [];
    const bySeller = /* @__PURE__ */ new Map();
    for (const [vow, b] of Object.entries(vows)) {
      const p = b.payment ? await this.engine.payment(b.payment) : null;
      const paid = !!p?.publicClaims?.length;
      let sale = null;
      let promise = null;
      if (paid) {
        if (!bySeller.has(b.seller)) bySeller.set(b.seller, await vowSales(b.seller, hints, via2).catch(() => ({ vows: [], asked: hints, problems: [] })));
        const x = bySeller.get(b.seller).vows.find((y) => y.name === vow)?.sales.find((y) => y.buyer === me.id);
        sale = x?.state ?? null;
        promise = x?.promise ?? null;
      }
      out.push({ vow, seller: b.seller, words: b.words, price: p ? say(p.amount, /* @__PURE__ */ new Set([p.amount.unit])) : null, paid, sale, promise });
    }
    return out;
  }
  /** Confirm a vow bought: a public claim of its payment acknowledging the vow (rule 13), under the lane. */
  async confirmVow(me, vow) {
    const b = (await this.store.money(me.id, "vows") ?? {})[vow];
    if (!b?.payment) throw new Error("No vow bought here by that name. Nothing was signed.");
    const r = await this.engine.confirmPurchase(b.payment, [vow]);
    return r.lines.map((l) => l.text);
  }
  /** Contest a vow bought: a contest naming its sale (the public claim), the promise not kept in words if given (F253). */
  async contestVow(me, s, vow, promise) {
    const vows = await this.store.money(me.id, "vows") ?? {};
    const b = vows[vow];
    const p = b?.payment ? await this.engine.payment(b.payment) : null;
    const sale = p?.publicClaims?.[0];
    if (!b || !sale) throw new Error("No sale of that vow is here to contest: it is contested once paid. Nothing was signed.");
    let id;
    try {
      id = await contestSale(me, { vow, sale, promise, relays: list4([...s.relays, ...me.f.homes.map((h) => h.hint)]) });
    } finally {
      await this.store.saveIdentity(me);
    }
    b.contests = [...b.contests ?? [], id];
    await this.store.saveMoney(me.id, "vows", vows);
    return ["Your contest of that sale is signed in public: it reads contested for anyone who looks. It voids nothing; the payment stays as it is."];
  }
};

// src/dub.ts
var CHAIN_WORDS_SAY = [
  "These are the chain key\u2019s words. Write them on paper, in order, and keep the paper away from anything that goes online. They are shown once: Dub keeps nothing of the chain key.",
  "The chain key is the only way to change this identity\u2019s signing key if it is ever stolen or lost. That is done in another app, Ki\u0161ib, never in Dub. Lost paper means no change of keys, ever.",
  "Never type these words into Dub, or into any app that goes online. They are not the signing key\u2019s words, which Dub shows on request.",
  "They are not a Bitcoin wallet. Never type them into one."
];
var CARRY_SAY = [
  "These are the signing key\u2019s words. With the ID, they bring this identity into Dub on another computer or device: choose \u201CBring an identity you have\u201D there.",
  "Whoever holds these words can post as this identity and read its private messages. The chain key is not in them.",
  "Write them on paper: if this app\u2019s storage is lost, they are the way back. They stop working when the signing key is changed.",
  "Each place you bring them keeps its own line of acts. A change of the signing key must keep every line, or that line\u2019s posts become void.",
  "They are not a Bitcoin wallet. Never type them into one."
];
var LINE_SAY2 = "This app keeps its own line of acts for this identity. If the signing key is ever changed (with the chain key, in Ki\u0161ib), that change must keep this line, or every post made here becomes void. The app making the change reads this line from the homes and relays and keeps it, unless you leave it out; if it cannot read it, give it this line\u2019s latest act, position and summary, shown in the identity window.";
var SPENT_SAY2 = "This identity\u2019s signing key was changed elsewhere, with its chain key, so the signing key\u2019s words this app holds no longer count. Nothing was signed. Changing keys is Ki\u0161ib\u2019s work, not Dub\u2019s. To go on here, give this app the new signing key\u2019s words.";
var RUNNER_OLD_KEY_SAY2 = "This identity\u2019s keys were changed with its chain key, and Ki\u0161ib\u2019s runner still holds the old signing key: nothing was signed. Give the runner the new signing key\u2019s words, in Ki\u0161ib (Runner, Identities held here). Dub then goes on, in new lines.";
var RUNNER_HOLDS_SAY2 = "Ki\u0161ib\u2019s runner holds this identity\u2019s signing key, on this Mac; Dub holds none of its keys. Its words are given and changed in Ki\u0161ib, never here.";
var RUNNER_NO_OPEN_SAY2 = "Ki\u0161ib does not let Dub open what is sealed to this identity: Dub sends its private messages, but cannot read the answers, nor keep its contacts list sealed to it. To allow it, in Ki\u0161ib: Runner, Apps, Dub, \u201Cmay open what is sealed to this identity\u201D.";
var RUNNER_OPENS_SAY = "Ki\u0161ib opens for Dub what is sealed to this identity: its private messages and its sealed contacts list are read here, Dub holding no key. Each opening is listed in Ki\u0161ib (Runner, Signed).";
var NO_KEY_SAY2 = "This app holds no encryption key for this identity, so its private messages cannot be opened here: its encryption key was not made from its signing key\u2019s words. Messages can still be sent from here.";
var READER = "https://reader.dubsar.org/";
var NO_SIGNING = () => ({ answered: {}, waiting: {}, received: {} });
var MONEY_KEPT = ["settings", "book", "keys", "sold", "bought", "vows", "anchors"];
var list5 = (xs) => [...new Set(xs.map((s) => s.trim()).filter(Boolean))];
var message6 = (e3) => e3 instanceof Error ? e3.message : String(e3);
var now3 = () => Math.floor(Date.now() / 1e3);
var fingerprint = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
function randomBelow(n) {
  const limit = Math.floor(4294967296 / n) * n;
  const x = new Uint32Array(1);
  do
    crypto.getRandomValues(x);
  while (x[0] >= limit);
  return x[0] % n;
}
var NAMES_FOR = 600;
var Dub = class _Dub {
  constructor(store, opts = {}) {
    this.store = store;
    this.opts = opts;
    this.money = new DubMoney(store, { web: !!opts.web, app: opts.web ? "Dub on the web" : "Dub on this computer" });
  }
  /** This app's line as the homes hold it, for its card (H80's question 2). */
  line = lineReader("Dub");
  /** This app's line: what waits sent first, in its own turn (the file read again there, the key checked first), then read back. Null where the homes could not be read. */
  async lineNow(me, via2) {
    if (Object.keys(me.f.unsent ?? {}).length) {
      await this.serial(async () => {
        const f = await this.load(me.id);
        if (!f) return;
        await this.current(f);
        await sendWaiting(f, via2);
        await this.store.saveIdentity(f);
        me.f.unsent = f.f.unsent;
      }).catch(() => void 0);
    }
    return this.line(me, via2).catch(() => null);
  }
  queue = Promise.resolve();
  /** Display names found, by ID, and when (this app's memory only). */
  names = /* @__PURE__ */ new Map();
  /** `web`: Dub's web client (F281). `reader`: where long-form documents open. */
  /** Money, round 2: a lane asked here, payments signed under it, sealed posts (`money.ts`). */
  money;
  /** An identity held here; one used through Kišib's runner signs by it (the Dubsar runner cMIP). */
  async load(id) {
    const me = await this.store.identity(id);
    if (me && !me.f.signingSecret && this.opts.runner) me.signer = this.opts.runner.signer();
    return me;
  }
  /** The encryption keys this app holds of an identity, newest first: none for one used through Kišib. */
  secrets(me) {
    return [...me.f.encryption].reverse().filter((e3) => e3.secret).map((e3) => unhex(e3.secret));
  }
  /**
   * How this app opens what is sealed to an identity: with the encryption
   * keys it holds; for one used through Kišib, through its runner, where
   * Kišib lets Dub (the Dubsar runner cMIP, draft 2, section 8). Where it
   * cannot, `open` is null and `problem` says why, plainly: Kišib does not
   * let Dub, is locked, or does not run; or no key is here.
   */
  async opener(me) {
    const secrets = this.secrets(me);
    if (secrets.length) return { open: openerOf(me.id, secrets), problem: null };
    const r = this.opts.runner;
    if (me.f.signingSecret || !r) return { open: null, problem: NO_KEY_SAY2 };
    let p;
    try {
      p = await r.paired();
    } catch (e3) {
      return { open: null, problem: message6(e3).replace(/ Nothing was signed\.$/, "") };
    }
    if (!p || p.state !== "approved" || !p.identities.some((x) => x.id === me.id)) return { open: null, problem: "Dub is not paired with Ki\u0161ib for this identity any more: its private messages are not opened here." };
    if (!p.open) return { open: null, problem: RUNNER_NO_OPEN_SAY2 };
    const open = async (sealed) => (await r.open(me.id, sealed)).map((o) => o ? { ...o, described: o.key ? openWithKey(o.act, o.key) : describeAct(o.act) } : null);
    return { open, problem: null };
  }
  /** One thing at a time: a sequence must never be signed twice at once. */
  serial(f) {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => void 0);
    return next;
  }
  // ------------------------------------------------------------ who is who
  /** Where this app found the identities it shows (its own relays): the hint an ID link carries where nothing better is known. */
  near = [];
  whoFrom(id, me, p) {
    const f = p?.follows.find((x) => x.id === id);
    const hints = [...p?.where?.[id] ?? [], ...this.near].filter((h) => /^https?:\/\//.test(h)).slice(0, 1);
    return {
      id,
      form: /^[0-9a-f]{64}$/.test(id) ? idForm(id) : id,
      link: /^[0-9a-f]{64}$/.test(id) ? idWhere(id, hints) : id,
      short: fingerprint(id),
      names: this.names.get(id)?.names ?? [],
      pet: f?.name ?? null,
      me: id === me,
      followed: !!f,
      muted: !!p?.muted.includes(id)
    };
  }
  /** Read the display names of these identities, where not read lately. A name not found is no name: silence proves nothing. */
  async warm(ids, places, via2) {
    const due = [...new Set(ids)].filter((id) => (this.names.get(id)?.at ?? 0) + NAMES_FOR < now3());
    await Promise.all(
      due.map(async (id) => {
        try {
          this.names.set(id, { names: (await namesOf(id, places, via2)).map((n) => n.name), at: now3() });
        } catch {
        }
      })
    );
  }
  // ------------------------------------------------------------ state
  async state() {
    const active = await this.store.active();
    const held = [];
    for (const id of await this.store.held()) {
      const s = await this.store.settings(id);
      held.push({ id, grouped: groupId(id), who: this.whoFrom(id, active, null), active: id === active, kind: s.kind });
    }
    const pend = await this.store.pending();
    const units = UNITS_MODULES.flatMap((m) => m.units.map((u2) => ({ hash: u2.hash, label: `${u2.many} (${m.name})`, regtest: u2.network === 3 })));
    units.sort((a, b) => Number(b.regtest) - Number(a.regtest));
    const out = { stage: "identity", held, units: units.map(({ hash: hash2, label }) => ({ hash: hash2, label })) };
    if (pend) {
      out.stage = "confirm";
      out.confirm = { positions: pend.positions, id: pend.identity.identity };
    }
    const me = active ? await this.load(active) : null;
    if (me) {
      const s = await this.store.settings(me.id);
      const p = await this.store.people(me.id);
      const line = await this.lineNow(me, s.via);
      if (!pend) out.stage = "ready";
      const { problem: opening } = await this.opener(me);
      out.identity = {
        id: me.id,
        grouped: groupId(me.id),
        form: idForm(me.id),
        where: idWhere(me.id, [...me.f.homes.map((h) => h.hint).slice(0, 1), ...s.relays.filter((r) => !me.f.homes.some((h) => h.hint === r)).slice(0, 1)]),
        who: this.whoFrom(me.id, me.id, p),
        kind: s.kind,
        homes: me.f.homes.map((h) => h.hint),
        relays: s.relays,
        encryption: !opening,
        opening,
        oldChainKey: !!me.f.safety.seeds,
        line: line ?? noLine(me.f),
        list: p.list,
        sealed: p.sealed ? { version: p.sealed.version, forked: !!p.sealed.forked } : null,
        signing: !!s.signing,
        follows: p.follows.map((f) => this.whoFrom(f.id, me.id, p)),
        muted: p.muted.map((m) => this.whoFrom(m, me.id, p)),
        collectives: (s.collectives ?? []).map((c) => ({ id: c.id, form: idForm(c.id), name: this.names.get(c.id)?.names[0] ?? null, available: c.available, why: c.why })),
        acting: s.acting ?? null,
        clock: s.clock ? { id: s.clock.id, form: idForm(s.clock.id), name: s.clock.name } : null
      };
      out.proposalsWaiting = p.inbox.items.filter((k) => k.talk && k.talk.thread === k.key && k.from && k.from !== me.id && k.refs.length).length;
    }
    return out;
  }
  async ctx() {
    const active = await this.store.active();
    const me = active ? await this.load(active) : null;
    if (!me) throw new Error("No identity in use: make one, or bring one, in the identity window.");
    const s = await this.store.settings(me.id);
    const p = await this.store.people(me.id);
    this.near = s.relays.slice(0, 1);
    return { me, s, p, hints: [.../* @__PURE__ */ new Set([...s.relays, ...me.f.homes.map((h) => h.hint), ...Object.values(p.where ?? {}).flat()])] };
  }
  /** Each home's operator, as it declares itself (relay transport cMIP, `info`). */
  async homes(hints, via2) {
    const out = [];
    for (const hint of hints) {
      if (!/^https?:\/\//.test(hint)) throw new Error(`\u201C${hint}\u201D: an address starts with https:// (or http://)`);
      let info;
      try {
        info = await relayAt(hint, via2).info();
      } catch (e3) {
        throw new Error(`${hint} did not answer: ${message6(e3)}`);
      }
      const op = info.get(0);
      if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator`);
      out.push({ operator: hex(op), hint });
    }
    return out;
  }
  // ------------------------------------------------------------ the identity window: a new identity
  /**
   * Make a new identity with the genesis client's code, and show its chain
   * key's words once (F332, amended): the chain key is derived from a seed
   * shown as words (the words seed Module) and kept nowhere, on the Mac as on
   * the web. Nothing is published until three of the words are typed back
   * (`confirm`). Starting again forgets the last one.
   */
  async begin(a) {
    const via2 = a.via ?? {};
    const name = a.name?.trim() ? readName(a.name) : void 0;
    const hints = list5(a.homes);
    if (!hints.length) throw new Error("Give at least one home address: where the identity lives, and anyone can check it.");
    const homes = await this.homes(hints, via2);
    const relays = list5(a.relays);
    for (const r of relays) if (!/^https?:\/\//.test(r)) throw new Error(`\u201C${r}\u201D: an address starts with https:// (or http://)`);
    const positions = threePositions(randomBelow);
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const chain = newChainKey(seed);
    const id = TestIdentity.create({ homes, via: via2, chainKey: chain.key });
    id.f.safety = { scheme: 0, seeds: "" };
    chain.key.seeds.fill(0);
    await this.store.savePending({ identity: id.f, positions, relays: relays.length ? relays : hints, via: via2, chainSeed: hex(seed), ...name ? { name } : {} });
    seed.fill(0);
    return { words: chain.words, positions, say: CHAIN_WORDS_SAY };
  }
  /** Forget a new identity before it was published. */
  async abandon() {
    await this.store.dropPending();
  }
  /**
   * The three words typed back. Refused, with nothing published, unless
   * each is the word at its position. Then the genesis goes to the homes; its
   * routes name the relays as its outbox and its inbox; its encryption key,
   * the one its signing key's words carry (the carry Module, draft 2, 2a.2),
   * is published, as the desk's identities have theirs at once; and it is the
   * identity in use.
   */
  confirm(typed) {
    return this.serial(async () => {
      const p = await this.store.pending();
      if (!p) throw new Error("No new identity is waiting.");
      if (!typedBack(toWords(unhex(p.chainSeed)), p.positions, typed)) {
        throw new Error(`Those are not words ${p.positions.join(", ")} as shown. Look at what you wrote down. Nothing has been published.`);
      }
      const id = new TestIdentity(p.identity, p.via);
      const sent = await id.publishGenesis();
      const lines2 = sent.map((x) => ({
        text: `${x.home}: ${x.result?.receipt ? "receipt signed" : `refused (${x.code ?? "?"}) ${x.error ?? ""}`}`,
        tone: x.result?.receipt ? "ok" : "bad"
      }));
      if (!sent.some((x) => x.result?.receipt)) {
        throw new Error(`No home took the identity, so it was not kept. ${lines2.map((l) => l.text).join("; ")}`);
      }
      await this.store.saveSettings(id.id, { kind: "made", relays: p.relays, via: p.via });
      await this.store.saveIdentity(id);
      await this.store.setActive(id.id);
      await this.store.dropPending();
      await id.publishRoutes([
        { scope: null, hints: p.relays, kind: 0 },
        { scope: null, hints: p.relays, kind: 1 }
      ]);
      await this.store.saveIdentity(id);
      await id.publishEncryptionKey(encryptionSecret(unhex(id.f.signingSecret)));
      await this.store.saveIdentity(id);
      for (const r of p.relays) {
        for (const act of id.chainActs()) {
          try {
            await relayAt(r, p.via).putAct(act);
          } catch {
          }
        }
      }
      lines2.push({ text: `Its posts are published at, and its inbox is, ${p.relays.join(", ")}. Its encryption key is published: private messages can be sealed to it.` });
      if (p.name) {
        try {
          lines2.push(...(await this.publishName(id, { relays: p.relays, via: p.via }, p.name)).lines);
        } catch (e3) {
          lines2.push({ text: `The display name was not published (${message6(e3)}). Give it again in the identity window.`, tone: "warn" });
        }
      }
      return { lines: lines2 };
    });
  }
  // ------------------------------------------------------------ the identity window: an identity made elsewhere
  /**
   * Bring an identity made elsewhere (the carry Module, section 4): read its
   * chain from its homes, starting at `address`, and keep it only if the
   * words give its current signing key; with its encryption key where the
   * words carry the one that counts (2a.3). Relays are asked for only where
   * its routes name none. This app starts its own line. An identity already
   * held here takes the new words instead (`renew`).
   */
  bring(a) {
    return this.serial(async () => {
      const via2 = a.via ?? {};
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
      const look = await this.lookCurrent(id, seed, [address], via2);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await this.servedChain(id, r.homes, via2);
      const named = list5(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : list5(a.relays ?? []);
      if (!relays.length) {
        throw new Error("This identity names no relays for its posts. Give one or more relay addresses, and bring it again.");
      }
      const enc2 = this.carriedKey(look, seed);
      const f = {
        label: TEST_LABEL,
        identity: id,
        position: binding.position,
        binding: binding.act,
        signingSecret: hex(seed),
        // The chain key never travels (the carry Module, 1.3): none is held here.
        safety: { scheme: 0, seeds: "" },
        chain: chain.map(base64),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: enc2 ? [enc2] : [],
        pending: null
      };
      await this.store.saveSettings(id, { kind: "brought", relays, via: via2 });
      await this.store.saveIdentity(new TestIdentity(f, via2));
      await this.store.setActive(id);
      return {
        lines: [
          { text: "Its current signing key matches the words.", tone: "ok" },
          enc2 ? { text: "Its encryption key is the one the words carry: its private messages open here.", tone: "ok" } : { text: NO_KEY_SAY2, tone: "warn" },
          { text: named.length ? `Its posts are published at the relays it names: ${relays.join(", ")}.` : `It names no relays: its posts are published at ${relays.join(", ")}.` },
          { text: LINE_SAY2, tone: "warn" }
        ]
      };
    });
  }
  lookCurrent(id, seed, hints, via2) {
    return lookCurrent(id, seed, hints, via2);
  }
  servedChain(id, homes, via2) {
    return servedChain(id, homes, via2);
  }
  carriedKey(look, seed) {
    return carriedKey(look, seed);
  }
  /**
   * The new signing key's words, after a rotation made elsewhere counts (the
   * carry Module, draft 2, 4.6; F332, amended): checked as any brought words
   * are, then this app signs with them in a new line under the new binding,
   * keeping what it held of the identity. Where this app published the
   * identity's last encryption key, it publishes the next one, from the new
   * words (2a.4).
   */
  renew(words2) {
    return this.serial(async () => {
      const active = await this.store.active();
      if (!active) throw new Error("No identity in use.");
      let seed;
      try {
        seed = fromWords(words2);
      } catch (e3) {
        if (e3 instanceof Refused) throw new Error(`${e3.message}. Nothing was kept.`);
        throw e3;
      }
      return this.renewHeld(active, seed);
    });
  }
  async renewHeld(id, seed) {
    const me = await this.load(id);
    const s = await this.store.settings(id);
    const look = await this.lookCurrent(id, seed, [.../* @__PURE__ */ new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via);
    if (hex(seed) === me.f.signingSecret) throw new Error("These are the signing key\u2019s words this app already holds, and they still count: nothing to change.");
    const r = look.resolution;
    const binding = r.links[r.links.length - 1];
    me.f.chain = (await this.servedChain(id, r.homes, s.via)).map(base64);
    me.f.position = binding.position;
    me.f.binding = binding.act;
    me.f.signingSecret = hex(seed);
    me.f.homes = r.homes;
    me.f.rule = r.rule ?? null;
    me.f.pending = null;
    freshLines(me.f);
    me.f.routes = me.f.routes && look.routes.act === me.f.routes.act ? me.f.routes : null;
    const lines2 = [{ text: "The new signing key\u2019s words give its current signing key. This app signs with them from now on, in a new line.", tone: "ok" }];
    const carried = this.carriedKey(look, seed);
    const last = me.f.encryption.at(-1);
    if (carried) {
      if (!me.f.encryption.some((e3) => e3.act === carried.act)) me.f.encryption.push(carried);
      lines2.push({ text: "Its encryption key is the one the new words carry.", tone: "ok" });
      await this.store.saveIdentity(me);
    } else if (last && look.encryptionKeyAct === last.act) {
      await this.store.saveIdentity(me);
      await me.publishEncryptionKey(encryptionSecret(seed));
      const resealed = await resealMemberKeys(me.id, me.f.encryption.slice(0, -1).map((e3) => unhex(e3.secret)), xwingPublic(encryptionSecret(seed)), me.f.homes.map((h) => h.hint), me.via).catch(() => 0);
      if (resealed) lines2.push({ text: `Its ${resealed} member key${resealed === 1 ? "" : "s"} for collectives, sealed to it, sealed again to the new encryption key: unchanged, so its apps still act with them (F353).`, tone: "ok" });
      await this.store.saveIdentity(me);
      lines2.push({ text: "Its encryption key was renewed from the new words: messages sealed from now on open only with them. Messages sealed before, to the old key, stay readable by whoever held the old words.", tone: "ok" });
    } else {
      await this.store.saveIdentity(me);
      lines2.push({ text: NO_KEY_SAY2, tone: "warn" });
    }
    lines2.push({ text: LINE_SAY2, tone: "warn" });
    return { lines: lines2 };
  }
  /**
   * Leave the identity in use (H28): nothing is forgotten, its keys stay
   * here; the identity window then opens with no identity in use, to choose
   * one held here, or make or bring another.
   */
  async leave() {
    await this.store.setActive(null);
  }
  /** Use another identity held here. */
  async use(id) {
    if (!(await this.store.held()).includes(id)) throw new Error("This app does not hold that identity.");
    await this.store.setActive(id);
  }
  /** Forget an identity here: its keys go. Only its signing key's words, written down, bring it back. Its posts stay published. */
  forget(id) {
    return this.serial(async () => {
      if (!(await this.store.held()).includes(id)) throw new Error("This app does not hold that identity.");
      const was = await this.store.active();
      await this.store.forget(id);
      if (was === id) await this.store.setActive((await this.store.held())[0] ?? null);
    });
  }
  // ------------------------------------------------------------ an identity used through Kišib (the Dubsar runner cMIP)
  /** Whether this Dub can use Kišib's runner: the computer's program only (decided), never the web client. */
  runner() {
    if (!this.opts.runner) throw new Error("Ki\u0161ib\u2019s runner is in the computer\u2019s program only, never the web client: this Dub cannot use it. Bring the identity with its signing key\u2019s words instead.");
    return this.opts.runner;
  }
  /** Where Dub's pairing with Kišib stands (2.4), for + Add, Use one from Kišib. */
  async runnerState() {
    if (!this.opts.runner) return { available: false, origin: null, state: null, code: null, identities: [], problem: null };
    const held = await this.store.held();
    try {
      const p = await this.opts.runner.paired();
      return { available: true, origin: this.opts.runner.origin(), state: p?.state ?? null, code: p?.code ?? null, identities: (p?.identities ?? []).map((x) => ({ id: x.id, form: idForm(x.id), name: x.name, held: held.includes(x.id) })), problem: null };
    } catch (e3) {
      return { available: true, origin: this.opts.runner.origin(), state: null, code: this.opts.runner.code(), identities: [], problem: message6(e3) };
    }
  }
  /** Ask Kišib to pair (2.1): the code to compare in Kišib, where it is approved. */
  async runnerPair() {
    return this.runner().pair();
  }
  /**
   * Use an identity Kišib's runner holds (approved for Dub in Kišib): its
   * chain and homes read as any reader would, its encryption key's public
   * half only; no key of it kept here. Dub keeps its lines (F376), and the
   * runner signs on them.
   */
  runnerTake(a) {
    return this.serial(async () => {
      const p = await this.runner().paired();
      if (!p || p.state !== "approved") throw new Error(p?.state === "waiting" ? "Ki\u0161ib has not approved Dub yet: approve it in Ki\u0161ib (Runner, Apps), comparing the code." : "Dub is not paired with Ki\u0161ib\u2019s runner: pair it first.");
      const k = p.identities.find((x) => x.id === a.id);
      if (!k) throw new Error("Ki\u0161ib does not let Dub use this identity: choose it for Dub in Ki\u0161ib (Runner, Apps).");
      if ((await this.store.held()).includes(k.id)) {
        await this.store.setActive(k.id);
        return { lines: [{ text: "Dub already uses this identity: it is the one in use now.", tone: "ok" }] };
      }
      const homes = k.homes;
      const look = await lookUp(k.id, homes, {});
      const r = look.resolution;
      if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): Dub cannot use it until they agree.");
      const binding = r.links[r.links.length - 1];
      if (!r.signingKey || hex(r.signingKey) !== k.key) throw new Error(RUNNER_OLD_KEY_SAY2);
      const chain = await this.servedChain(k.id, r.homes, {});
      const named = list5(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : r.homes.map((h) => h.hint);
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
        private: [],
        split: true,
        routes: null,
        encryption: look.encryptionKey && look.encryptionKeyAct ? [{ version: 1, act: look.encryptionKeyAct, secret: "", public: hex(look.encryptionKey) }] : [],
        pending: null
      };
      await this.store.saveSettings(k.id, { kind: "runner", relays, via: {} });
      await this.store.saveIdentity(new TestIdentity(f, {}));
      await this.store.setActive(k.id);
      return {
        lines: [
          { text: `Dub uses ${k.name ?? fingerprint(k.id)} through Ki\u0161ib\u2019s runner: Ki\u0161ib holds its signing key, Dub none. Each act is shown by Ki\u0161ib, in its panel here, before it is signed, unless you gave Dub a standing yes for that kind in Ki\u0161ib.`, tone: "ok" },
          p.open ? { text: RUNNER_OPENS_SAY, tone: "ok" } : { text: RUNNER_NO_OPEN_SAY2, tone: "warn" },
          { text: LINE_SAY2, tone: "warn" }
        ]
      };
    });
  }
  /** The request waiting for the person now, for the page to draw its panel (4.1). Not serial: it is asked while an act waits. */
  async runnerAsking() {
    const r = this.opts.runner;
    return { asking: r?.asking ?? null, origin: r?.origin() ?? null };
  }
  /** Withdraw the request waiting (the person chose not to sign it). */
  async runnerDrop(a) {
    this.opts.runner?.drop(a.request);
  }
  /** Forget the pairing with Kišib here, and tell it (2.5). The identities used through it stay listed, and sign no more. */
  async runnerUnpair() {
    await this.runner().unpair();
  }
  /** The identity's ID and its signing key's words (the carry Module), on request: the way to another app. */
  async carry() {
    const { me } = await this.ctx();
    if (!me.f.signingSecret) throw new Error(RUNNER_HOLDS_SAY2);
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)), say: CARRY_SAY };
  }
  // ------------------------------------------------------------ the key in use
  /**
   * Whether the signing key this app holds still counts (the carry Module,
   * 4.5): false once a rotation made elsewhere bound another key.
   */
  async check() {
    const { me } = await this.ctx();
    try {
      await this.current(me);
      return { current: true, say: null };
    } catch (e3) {
      if (message6(e3) === SPENT_SAY2) return { current: false, say: SPENT_SAY2 };
      throw e3;
    }
  }
  /** Refuse to sign once a rotation counts that this app did not see: the key it holds is spent. */
  async current(me) {
    if (!me.f.signingSecret) return this.runnerCurrent(me);
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
    if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing was signed.");
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) throw new Error(SPENT_SAY2);
  }
  /**
   * The key check for an identity used through Kišib's runner (H80; the
   * Dubsar runner cMIP, 3.5 and 7.4): the runner checks its own key before
   * signing; here, Dub follows a change of keys made since. Where the homes
   * now bind another key and the runner holds it (the new words given in
   * Kišib), Dub takes the new binding and starts new lines; where it does
   * not, nothing is signed.
   */
  async runnerCurrent(me) {
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
    if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing was signed.");
    const binding = r.links[r.links.length - 1];
    if (!binding || binding.act === me.f.binding) return;
    const p = await this.opts.runner?.paired().catch(() => null);
    const k = p?.identities.find((x) => x.id === me.id);
    if (!k || k.binding !== binding.act || !r.signingKey || hex(r.signingKey) !== k.key) throw new Error(RUNNER_OLD_KEY_SAY2);
    me.f.chain = (await this.servedChain(me.id, r.homes, me.via)).map(base64);
    me.f.position = binding.position;
    me.f.binding = binding.act;
    me.f.homes = r.homes;
    me.f.rule = r.rule ?? null;
    freshLines(me.f);
    me.f.routes = me.f.routes && look.routes.act === me.f.routes.act ? me.f.routes : null;
    if (look.encryptionKey && look.encryptionKeyAct && !me.f.encryption.some((e3) => e3.act === look.encryptionKeyAct)) me.f.encryption.push({ version: me.f.encryption.length + 1, act: look.encryptionKeyAct, secret: "", public: hex(look.encryptionKey) });
    await this.store.saveIdentity(me);
  }
  /** An act signed and kept: the sequence is saved before anything leaves. */
  async signed(me, f) {
    try {
      return await f();
    } finally {
      await this.store.saveIdentity(me);
    }
  }
  // ------------------------------------------------------------ one's own display name (the naming cMIP)
  /**
   * Publish a display name (the naming cMIP, section 1), then withdraw every
   * other name of this identity under that cMIP found counting (1.3). An
   * empty name withdraws them all.
   */
  setName(typed) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const name = typed.trim() ? readName(typed) : null;
      await this.current(me);
      return this.publishName(me, s, name);
    });
  }
  /** Publish `name` and withdraw every other counting name, for an identity whose key is current. Inside `serial`. */
  async publishName(me, s, name) {
    const hints = [.../* @__PURE__ */ new Set([...s.relays, ...me.f.homes.map((h) => h.hint)])];
    const before = await namesOf(me.id, hints, s.via);
    const lines2 = [];
    const send = async (act) => {
      for (const h of [...me.f.homes.map((x) => x.hint), ...s.relays]) {
        try {
          await relayAt(h, s.via).putAct(act);
        } catch {
        }
      }
    };
    if (name && !before.some((n) => n.name === name)) {
      const made = await this.signed(me, () => me.signNow(SPECS.identity, NAME, namePayload(name), { public: true }));
      await send(made.act);
      lines2.push({ text: `Your display name is \u201C${name}\u201D, shown beside your fingerprint, never instead of it. Anyone may take the same name.`, tone: "ok" });
    }
    for (const old of before.filter((n) => n.name !== name)) {
      const made = await this.signed(me, () => me.signNow(SPECS.identity, NAME_WITHDRAWAL, cborEncode(/* @__PURE__ */ new Map()), { public: true, objects: [[old.act, old.act]] }));
      await send(made.act);
      lines2.push({ text: `\u201C${old.name}\u201D withdrawn: it stays readable as an act, no longer as your name.` });
    }
    const names = (await namesOf(me.id, hints, s.via)).map((n) => n.name);
    this.names.set(me.id, { names, at: now3() });
    return { lines: lines2, names };
  }
  // ------------------------------------------------------------ the public side
  /**
   * Post a text, with a JPEG if one is given, then read it back from the
   * relays, verified. `to`, an identity's ID: a public message to it (F287):
   * the post names it and is left, unsealed, in its inbox too. `reply`, a
   * post: this one answers it (it names it in `refs`, with its signer), is
   * addressed to its signer, and left in its inbox where it has one. No
   * private switch here: the private side is its own tab.
   */
  post(a) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const { text: text3, changes } = compose(a.text);
      if (!text3.trim()) throw new Error("Write something to post.");
      if (a.jpeg && a.mp4) throw new Error("A picture or a film, one at a time. Nothing was posted.");
      if (s.acting) return this.postAsCollective(me, s, p, hints, text3, a);
      const to = [];
      for (const typed of (Array.isArray(a.to) ? a.to : [a.to ?? ""]).map((x) => x.trim()).filter(Boolean)) {
        let id;
        let where = [];
        try {
          ({ id, hints: where } = readIdWhere(typed));
        } catch (e3) {
          throw new Error(`To: ${message6(e3)}. Nothing was posted.`);
        }
        if (to.some((t) => t.id === id)) continue;
        if (id === me.id) throw new Error("To: that is this identity itself. Nothing was posted.");
        let inbox;
        try {
          inbox = (await lookUp(id, [...where, ...hints], s.via)).inbox(SPECS.text);
        } catch (e3) {
          throw new Error(`To: the identity ${shortId(id)} was not found: ${message6(e3)}. Nothing was posted.`);
        }
        if (!inbox?.length) throw new Error(`To: the identity ${shortId(id)} declares no inbox, so nothing can be left for it. Nothing was posted.`);
        to.push({ id, inbox });
      }
      let refs;
      if (a.reply) {
        const signer = readId(a.reply.signer);
        const id = readId(a.reply.id);
        let act;
        try {
          act = (await followRef([id, signer], [...hints, ...this.inboxPlaces(p)], s.via)).act;
        } catch (e3) {
          throw new Error(`The post answered could not be found: ${message6(e3)}. Nothing was posted.`);
        }
        const d = describeAct(act);
        refs = [[d.id, d.signer]];
        if (d.signer !== me.id && !to.some((t) => t.id === d.signer)) {
          try {
            to.push({ id: d.signer, inbox: (await lookUp(d.signer, hints, s.via)).inbox(SPECS.text) });
          } catch (e3) {
            to.push({ id: d.signer, inbox: null, why: message6(e3) });
          }
        }
      }
      await this.current(me);
      const made = await this.signed(me, () => post(me, { text: text3, jpeg: a.jpeg, mp4: a.mp4, relays: s.relays, to: to.length ? to.map((t) => t.id) : void 0, refs }));
      const lines2 = changes.map((c) => ({ text: `Text: ${c}.` }));
      for (const t of to) {
        if (!t.inbox?.length) {
          lines2.push({ text: `${shortId(t.id)} declares no inbox${t.why ? ` (${t.why})` : ""}: the reply is published, not left for it.`, tone: "warn" });
          continue;
        }
        const { left, failed } = await leaveInInbox(me, made.act, t.inbox);
        if (left.length) lines2.push({ text: `Left in the inbox of ${shortId(t.id)} too, unsealed: anyone may read it.`, tone: "ok" });
        if (failed.length) lines2.push({ text: `Its inbox did not take it at ${failed.map((f) => `${f.relay} (${f.reason})`).join(", ")}.`, tone: left.length ? "warn" : "bad" });
      }
      if (made.picture) {
        lines2.push({
          text: made.picture.removed.length ? `Taken out of the picture before publishing: ${made.picture.removed.map((c) => CARRIED_WORDS[c]).join("; ")}.` : "The picture carried nothing to take out.",
          tone: "ok"
        });
      }
      if (made.film) lines2.push({ text: made.film.removed.length ? `Taken out of the film before publishing: ${made.film.removed.join("; ")}.` : "The film carried nothing to take out.", tone: "ok" });
      const shown = await readPost(made.id, hints, s.via);
      return { post: this.item(shown, me.id, p, s, "feed", [], false), lines: lines2 };
    });
  }
  /**
   * A public post signed as the collective acted as, with this identity's
   * own member key (F353), in the area reaching public posts: text, and a
   * reply's reference. Where the area asks more keys than one, it counts
   * once its other holders sign it (in Edubba's To sign), said.
   */
  async postAsCollective(me, s, p, hints, text3, a) {
    const collective = s.acting;
    if (a.jpeg || a.mp4 || (Array.isArray(a.to) ? a.to.some((x) => x.trim()) : a.to?.trim())) throw new Error("As a collective, Dub posts text and replies only: no picture, film or address. Nothing was posted.");
    const k = await this.memberKeyHere(me, s, collective, hints);
    if (!k.key || k.why) throw new Error(`Dub cannot post as this collective: ${k.why ?? "no member key"} Nothing was posted.`);
    await this.current(me);
    const refs = a.reply ? [[readId(a.reply.id), readId(a.reply.signer)]] : [];
    const at = await chainFor(collective, k.key, k.places, s.via);
    const made = signAsMember(collective, k.key, at, { spec: POST_SPECS.text, type: TEXT_ACT, payload: textPayload(text3), public: true, ...refs.length ? { refs } : {} });
    const took = await publishAt([made.act], [.../* @__PURE__ */ new Set([...s.relays, ...k.places])], s.via);
    if (!took.length) throw new Error("No relay took the post. Nothing counts yet: try again.");
    const lines2 = [{ text: `Posted as the collective, with your own member key, at ${took.join(", ")}.`, tone: "ok" }];
    if (k.number > 1) lines2.push({ text: `Its area asks ${k.number} keys: it counts once another holder signs it too (Edubba, Collectives \u203A To sign).`, tone: "warn" });
    let item;
    try {
      item = this.item(await readPost(made.id, [...s.relays, ...k.places], s.via), me.id, p, s, "feed", [], false);
    } catch {
      item = { id: made.id, form: actForm(made.id), who: this.whoFrom(collective, me.id, p), standing: "unknown", text: text3, doc: null, pictures: [], answers: [], toMe: false, via: "feed", problem: null, seen: true };
    }
    return { post: item, lines: lines2 };
  }
  /** A post read and judged, as the page shows it. */
  item(sp, me, p, s, via2, answers, toMe) {
    const pictures = sp.refs.filter((r) => r.kind === "picture").map((r) => ({
      src: r.bytes && r.picture ? `data:image/jpeg;base64,${base64(r.bytes)}` : null,
      width: r.picture?.shownWidth ?? 0,
      height: r.picture?.shownHeight ?? 0,
      publication: r.publication,
      problem: r.problem,
      withdrawable: r.signer === me && sp.signer === me && !r.withdrawn && r.standing === "valid"
    }));
    const films = sp.refs.filter((r) => r.kind === "film").map((r) => ({ publication: r.publication, signer: r.signer, size: r.size, problem: r.problem, withdrawable: r.signer === me && sp.signer === me && !r.withdrawn && r.standing === "valid" }));
    const doc = isLongForm(sp.format) ? { title: titleOf(sp.text), link: makeLink(this.opts.reader ?? READER, sp.id, s.relays.filter((r) => /^https:\/\//.test(r))) } : null;
    return {
      id: sp.id,
      form: actForm(sp.id),
      who: this.whoFrom(sp.signer, me, p),
      standing: sp.standing,
      text: doc ? "" : sp.text,
      doc,
      pictures,
      films,
      answers,
      toMe,
      via: via2,
      problem: sp.standing === "valid" ? null : `not verified: ${sp.standing}`,
      seen: !toMe || p.seen.includes(sp.id)
    };
  }
  /**
   * The feed: this identity's own posts and those of the identities it
   * follows, muted ones left out (the people cMIP, 2.2), read and judged as
   * the site's feed reads them, in signed order (website cMIP, draft 6: MOR
   * has no clock; a reply comes after what it answers). Only text acts and
   * JPEG pictures are shown; a long-form document is named, with a link to
   * the reader.
   */
  async feed(fresh = false) {
    const { notes, changed: followsChanged } = await this.refreshFollows(fresh);
    const { me, s, p, hints } = await this.ctx();
    const authors = [me.id, ...s.acting ? [s.acting] : [], ...p.follows.map((f) => f.id).filter((id) => !p.muted.includes(id))].map((identity) => ({ identity, name: null }));
    const feed = await readFeed(authors, hints, s.via, void 0, s.clock ? { identity: s.clock.id, name: s.clock.name } : null);
    await this.warm([...feed.posts.map((x) => x.signer), ...[...feed.answered.values()].map((x) => x.signer).filter(Boolean)], hints, s.via);
    const items = [];
    for (const fp of feed.posts) {
      if (!fp.post) {
        items.push(this.unread(fp, me.id, p));
        continue;
      }
      const answers = fp.answers.map((id) => {
        const a = feed.answered.get(id);
        return { id, who: a?.signer ? this.whoFrom(a.signer, me.id, p) : null, snippet: a?.post ? snippet(a.post.text) : null };
      });
      const toMe = fp.signer !== me.id && answers.some((x) => x.who?.me);
      const it = { ...this.item(fp.post, me.id, p, s, "feed", fp.corrects ? answers.filter((x) => x.id !== fp.corrects) : answers, toMe), corrects: fp.corrects ?? null, correctedBy: fp.correctedBy ?? [] };
      it.when = fp.time ? timeWords(fp.time) : null;
      it.labels = await this.labelsOf(fp.post, me.id, p, [...hints, ...this.inboxPlaces(p)], s.via);
      if (fp.post.refs.some((r) => r.kind === "picture" && !r.bytes)) {
        const sealed = await this.money.read(me, [...hints, ...this.inboxPlaces(p)], s.via, fp.post.refs.map((r) => r.kind === "picture" || r.kind === "film" ? { id: r.publication, signer: r.signer || void 0 } : { id: r.id, signer: r.signer ?? r.actSigner })).catch(() => null);
        if (sealed) {
          it.sealed = sealed;
          it.pictures = it.pictures.filter((x) => x.publication !== sealed.publication);
          if (sealed.seller !== fp.signer) it.repost = { by: this.whoFrom(fp.signer, me.id, p), of: this.whoFrom(sealed.seller, me.id, p) };
        }
      }
      if (!it.sealed && fp.post.refs.some((r) => r.kind === "act")) {
        const vow = await this.money.readVowRef(me, [...hints, ...this.inboxPlaces(p)], s.via, fp.post.refs.filter((r) => r.kind === "act").map((r) => ({ id: r.id, signer: r.signer ?? r.actSigner }))).catch(() => null);
        if (vow) it.vow = vow;
      }
      items.push(it);
    }
    for (const it of items) {
      if (it.standing === "valid" || it.via !== "feed") continue;
      const a = await authorityOfId(it.id, hints, s.via, { names: (id) => this.whoFrom(id, me.id, p).pet ?? this.whoFrom(id, me.id, p).names[0] ?? shortId(id) }).catch(() => null);
      if (!a) continue;
      const backed = a.backing === "backed" || a.backing === "binds";
      it.authority = { words: a.words, backed };
      it.problem = backed ? null : it.problem;
    }
    const problems = feed.authors.filter((a) => a.problem).map((a) => `${shortId(a.identity)}: ${a.problem}`);
    if (feed.clock?.problem) problems.push(`${s.clock?.name ?? "The clock"}: ${feed.clock.problem}`);
    const clock = s.clock ? { name: s.clock.name, placed: feed.posts.filter((x) => x.time).length, shown: feed.posts.length } : null;
    return { items, more: feed.more, problems, notes, followsChanged, clock };
  }
  unread(fp, me, p) {
    return { id: fp.id, form: actForm(fp.id), who: this.whoFrom(fp.signer, me, p), standing: "unknown", text: "", doc: null, pictures: [], answers: [], toMe: false, via: "feed", problem: fp.problem, seen: true };
  }
  // ------------------------------------------------------------ the relay view (H29)
  /** What each relay was read up to, and its latest acts, by address (this app's memory only). */
  relays = /* @__PURE__ */ new Map();
  /**
   * Every public act at this identity's relays, newest first (H29: a filter
   * one chooses, never the default): each relay read from where it was left,
   * its latest acts kept here in memory, newest first in the order each relay
   * received them (its own order, not a signed time), several relays taken
   * in turn. Posts are read and judged as the feed's are; any other public act
   * is named by what it is. Muted identities are left out (the people cMIP,
   * 2.2), and counted. At most `max` shown.
   */
  async relay(max = 30, layers = RELAY_DEFAULT) {
    const { me, s, p, hints } = await this.ctx();
    const problems = [];
    const columns = [];
    for (const hint of s.relays) {
      const c = this.relays.get(hint) ?? { after: void 0, acts: [] };
      try {
        for (let pages = 0; pages < 50; pages++) {
          const page = await relayAt(hint, s.via).feed({ after: c.after });
          for (const it of page.items) {
            if (it.kind !== "act") continue;
            try {
              const d = describeAct(it.item);
              if (d.public && !c.acts.some((x) => x.id === d.id)) c.acts.push({ id: d.id, act: it.item });
            } catch {
            }
          }
          if (c.acts.length > 300) c.acts.splice(0, c.acts.length - 300);
          if (!page.items.length || page.next === c.after) break;
          c.after = page.next;
        }
      } catch (e3) {
        problems.push(`${hint}: ${message6(e3)}`);
      }
      this.relays.set(hint, c);
      columns.push([...c.acts].reverse().map((x) => ({ ...x, hint })));
    }
    const order = [];
    for (let i = 0; columns.some((c) => i < c.length); i++) for (const c of columns) if (c[i] && !order.some((x) => x.id === c[i].id)) order.push(c[i]);
    let hidden = 0;
    let left = 0;
    const picked = [];
    for (const x of order) {
      const d = describeAct(x.act);
      if (p.muted.includes(d.signer ?? d.id)) {
        hidden++;
        continue;
      }
      if (!layers.includes(layerOf(d))) {
        left++;
        continue;
      }
      if (picked.length < max) picked.push({ d, hint: x.hint });
    }
    const times = await this.clockTimes(s, hints);
    if (times.size) picked.sort((a, b) => (times.get(b.d.id) ?? -1) - (times.get(a.d.id) ?? -1));
    await this.warm(picked.map((x) => x.d.signer ?? x.d.id), hints, s.via);
    const judge2 = new Judge([.../* @__PURE__ */ new Set([...s.relays, ...hints])], s.via);
    const items = [];
    for (const { d, hint } of picked) {
      const who = this.whoFrom(d.signer ?? d.id, me.id, p);
      if (d.spec === POST_SPECS.text && d.type === TEXT_ACT && d.signer) {
        try {
          const shown = await readPost(d.id, [hint, ...s.relays, ...hints], s.via, judge2);
          items.push({ ...this.item(shown, me.id, p, s, "relay", [], false), what: null, labels: await this.labelsOf(shown, me.id, p, [hint, ...s.relays, ...hints], s.via) });
          continue;
        } catch (e3) {
          items.push({ id: d.id, form: actForm(d.id), who, standing: "unknown", text: "", doc: null, pictures: [], answers: [], toMe: false, via: "relay", problem: message6(e3), seen: true, what: "A post" });
          continue;
        }
      }
      items.push({ id: d.id, form: actForm(d.id), who, standing: "unknown", text: "", doc: null, pictures: [], answers: [], toMe: false, via: "relay", problem: null, seen: true, what: whatAct(d) });
    }
    for (const it of items) it.when = times.has(it.id) ? timeWords(times.get(it.id)) : null;
    const clock = s.clock ? { name: s.clock.name, placed: items.filter((x) => x.when).length, shown: items.length } : null;
    return { items, hidden, left, problems, clock };
  }
  // ------------------------------------------------------------ the inbox: "to you", and the private side
  inboxPlaces(p) {
    return Object.keys(p.inbox.after);
  }
  /**
   * Read this identity's inbox since last time: everything its inbox relays
   * hold addressed to it, sealed or not; each container opened with its
   * encryption keys, each act judged through its signer's chain. Kept here,
   * so each is read once. Silence proves nothing: what was not delivered to
   * the inbox is not found here.
   */
  async readInbox(me, s, p, hints) {
    const problems = [];
    let inbox = [];
    try {
      const l = await lookUp(me.id, hints, s.via);
      inbox = list5(l.routes.routes.filter((r) => r.kind === 1).flatMap((r) => r.hints));
    } catch (e3) {
      problems.push(`Its inbox could not be looked up: ${message6(e3)}`);
    }
    if (!inbox.length) {
      problems.push("This identity declares no inbox: nothing addressed to it can be found here.");
      return problems;
    }
    const { open, problem: cannot } = await this.opener(me);
    if (open && p.inbox.items.some((k) => k.retry)) {
      p.inbox.items = p.inbox.items.filter((k) => !k.retry);
      p.inbox.after = {};
    }
    const looked = /* @__PURE__ */ new Map();
    const judge2 = async (signer, act, id, key) => {
      let l = looked.get(signer);
      if (!l) looked.set(signer, l = lookUp(signer, hints, s.via));
      try {
        const x = await l;
        if (key) x.verifier.addWithKey(act, key);
        else x.verifier.add(act);
        return x.verifier.status(id);
      } catch (e3) {
        return `its signer was not found (${message6(e3)})`;
      }
    };
    for (const hint of inbox) {
      let after = p.inbox.after[hint];
      try {
        for (; ; ) {
          const page = await relayAt(hint, s.via).feed({ to: me.id, after });
          const sealed = page.items.filter((it) => it.kind === "sealed").map((it) => it.item);
          const opened = /* @__PURE__ */ new Map();
          if (open && sealed.length) (await open(sealed)).forEach((o, i) => opened.set(sealed[i], o));
          for (const it of page.items) {
            const k = await this.readItem(it.kind, it.item, me.id, it.kind === "sealed" ? opened.get(it.item) ?? null : null, open ? null : cannot, judge2);
            if (k && !p.inbox.items.some((x) => x.key === k.key)) p.inbox.items.push(k);
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
        p.inbox.after[hint] = after ?? 0;
      } catch (e3) {
        problems.push(`${hint}: ${message6(e3)}`);
      }
    }
    await this.store.savePeople(me.id, p);
    return problems;
  }
  /** One item of the inbox: a sealed container as opened (`opened`), or `cannot` say why nothing here opens it. */
  async readItem(kind, bytes, me, opened, cannot, judge2) {
    let act = bytes;
    let key;
    let d;
    if (kind === "sealed") {
      if (!opened) {
        return {
          key: `sealed:${sealedId(bytes)}`,
          kind: "other",
          from: null,
          text: null,
          standing: "unknown",
          refs: [],
          to: [],
          found: now3(),
          problem: cannot ?? "a sealed message that does not open with this identity\u2019s encryption keys",
          ...cannot ? { retry: true } : {}
        };
      }
      act = opened.act;
      key = opened.key;
      d = opened.described;
    } else {
      try {
        d = describeAct(bytes);
      } catch {
        return null;
      }
    }
    if (!d.signer || d.signer === me) return null;
    const isText = d.spec === POST_SPECS.text && d.type === TEXT_ACT && !!d.payload;
    let text3 = null;
    let format = null;
    if (isText) {
      const m = cborDecode(d.payload);
      const t = m.get(0);
      if (typeof t === "string") text3 = t;
      const f = m.get(1);
      if (f instanceof Uint8Array) format = hex(f);
    }
    const talk = readMessage(d);
    if (talk) text3 = talk.text;
    return {
      ...talk ? { talk: { thread: talk.thread, previous: talk.previous, acks: talk.acks } } : {},
      key: d.id,
      kind: !isText ? "other" : d.public ? "public" : "private",
      from: d.signer,
      text: text3,
      standing: await judge2(d.signer, act, d.id, key),
      refs: (d.refs ?? []).map((id, i) => ({ id, signer: d.refSigners?.[i] ?? null })),
      to: d.to ?? [],
      format,
      found: now3(),
      problem: d.payload ? void 0 : "a private act whose key was not delivered with it: it cannot be read here"
    };
  }
  /**
   * The inbox, read: on the public side, "to you" (public posts that answer
   * one of this identity's posts or are addressed to it); on the private
   * side, the messages sealed to it, with those sent from here. Muted
   * identities are left out (the people cMIP, 2.2), and counted.
   */
  async inbox() {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const problems = await this.readInbox(me, s, p, hints);
      const shown = p.inbox.items.filter((k) => !k.from || !p.muted.includes(k.from));
      const hidden = p.inbox.items.length - shown.length;
      await this.warm([...shown.map((k) => k.from).filter(Boolean), ...p.sent.map((x) => x.to)], hints, s.via);
      const places = [...hints, ...this.inboxPlaces(p)];
      const toYou = [];
      for (const k of shown.filter((x) => x.kind === "public").sort((a, b) => b.found - a.found).slice(0, 30)) {
        const answers = k.refs.filter((r) => r.signer === me.id || ownIds(me.f).includes(r.id));
        if (!answers.length && !k.to.includes(me.id)) continue;
        const ans = answers.map((r) => ({ id: r.id, who: this.whoFrom(me.id, me.id, p), snippet: null }));
        let item;
        try {
          item = this.item(await readPost(k.key, places, s.via), me.id, p, s, "inbox", ans, true);
        } catch {
          item = {
            id: k.key,
            form: actForm(k.key),
            who: this.whoFrom(k.from, me.id, p),
            standing: k.standing,
            text: k.text ?? "",
            doc: null,
            pictures: [],
            answers: ans,
            toMe: true,
            via: "inbox",
            problem: k.standing === "valid" ? null : `not verified: ${k.standing}`,
            seen: false
          };
        }
        item.seen = p.seen.includes(k.key);
        toYou.push(item);
      }
      const privates = shown.filter((k) => k.kind === "private" || k.kind === "other" && k.key.startsWith("sealed:"));
      const appended = [...privates.flatMap((k) => k.from && appendedOf(k.format, k.refs) ? [appendedOf(k.format, k.refs)] : []), ...p.sent.flatMap((x) => x.of ? [x.of] : [])];
      await this.warm([...appended, ...privates.flatMap((k) => k.to), ...p.sent.flatMap((x) => x.cc ?? [])], hints, s.via);
      const ofFor = async (from, collective) => {
        if (!collective) return null;
        const m = await this.member(from, collective, hints, s.via);
        return { id: collective, name: this.names.get(collective)?.names[0] ?? null, checked: m.checked, why: m.why };
      };
      const unknown = { id: "", short: "unknown", names: [], pet: null, me: false, followed: false, muted: false, form: "", link: "" };
      const messages = [
        ...await Promise.all(
          privates.map(async (k) => ({
            key: k.key,
            form: k.key.startsWith("sealed:") ? "" : actForm(k.key),
            who: k.from ? this.whoFrom(k.from, me.id, p) : unknown,
            with: k.from ?? k.key,
            // Every recipient sees who else received it (decided: "all parties see it").
            cc: k.to.filter((x) => x !== me.id).map((x) => this.whoFrom(x, me.id, p)),
            of: k.from ? await ofFor(k.from, appendedOf(k.format, k.refs)) : null,
            dir: "in",
            text: k.text ?? "",
            standing: k.standing,
            at: k.found,
            seen: p.seen.includes(k.key),
            problem: k.problem ?? (k.standing === "valid" ? null : `not verified: ${k.standing}`)
          }))
        ),
        ...await Promise.all(
          p.sent.map(async (x) => ({
            key: x.id,
            form: actForm(x.id),
            who: this.whoFrom(me.id, me.id, p),
            with: x.to,
            cc: (x.cc ?? []).map((y) => this.whoFrom(y, me.id, p)),
            of: await ofFor(me.id, x.of ?? null),
            dir: "out",
            text: x.text,
            standing: "valid",
            at: x.at,
            seen: true,
            problem: null
          }))
        )
      ].sort((a, b) => b.at - a.at);
      const { problem: opening } = await this.opener(me);
      return { toYou, messages, encryption: !opening, opening, hidden, problems };
    });
  }
  /**
   * A private message (F293): a private text act addressed to one identity,
   * sealed to its current encryption key and left in its inbox. Only it can
   * open it. Kept here as sent; the act itself, locked, goes to this
   * identity's homes too, so this app's line can be rebuilt by whoever
   * changes its keys (Identity rule 35), and it shows only that a private act
   * exists.
   */
  message(a) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      if (s.acting) throw new Error("A collective writes in public only, from Dub: write in your own name, and append the collective to your message. Nothing was sent.");
      const read3 = (typed, label) => {
        try {
          return readIdWhere(typed);
        } catch (e3) {
          throw new Error(`${label}: ${message6(e3)}. Nothing was sent.`);
        }
      };
      const first = read3(a.to, "To");
      const all = [first, ...(a.cc ?? []).filter((x) => x.trim()).map((x) => read3(x, "Cc"))];
      const to = first.id;
      const ids = [...new Set(all.map((x) => x.id))];
      if (ids.includes(me.id)) throw new Error("To or Cc: that is this identity itself. Nothing was sent.");
      const { text: text3 } = compose(a.text);
      if (!text3.trim()) throw new Error("Write something to send.");
      let of = null;
      if (a.collective) {
        of = readId(a.collective);
        if (!(s.collectives ?? []).some((c) => c.id === of)) throw new Error("Only a collective added under this identity can be appended. Nothing was sent.");
      }
      const reach = [];
      for (const x of all.filter((y, i) => all.findIndex((z) => z.id === y.id) === i)) {
        let l;
        try {
          l = await lookUp(x.id, [...x.hints, ...hints], s.via);
        } catch (e3) {
          throw new Error(`The identity ${shortId(x.id)} was not found: ${message6(e3)}. Nothing was sent.`);
        }
        if (!l.encryptionKey) throw new Error(`The identity ${shortId(x.id)} has published no encryption key, so nothing can be sealed to it. Nothing was sent.`);
        const inbox = l.inbox(SPECS.text);
        if (!inbox?.length) throw new Error(`The identity ${shortId(x.id)} declares no inbox. Nothing was sent.`);
        reach.push({ id: x.id, key: l.encryptionKey, inbox });
      }
      await this.current(me);
      const made = await this.signed(
        me,
        () => me.signNow(SPECS.text, TEXT_ACT, textPayload(text3, of ? APPENDED_FORMAT : null), { public: false, to: ids, ...of ? { refs: [appendedRef(of)] } : {} })
      );
      const sealed = sealFor(made.act, made.key, reach.map((r) => ({ id: r.id, key: r.key })));
      const lines2 = [];
      let left = 0;
      for (const r of reach) {
        let here = 0;
        for (const h of r.inbox) {
          try {
            await relayAt(h, s.via).putSealed(sealed);
            here++;
          } catch (e3) {
            lines2.push({ text: `${h} did not take it: ${message6(e3)}`, tone: "warn" });
          }
        }
        if (here) left++;
        else if (r.id !== to) lines2.push({ text: `No inbox of ${shortId(r.id)} (Cc) took it.`, tone: "bad" });
      }
      if (!left) throw new Error(`No inbox took the message: ${lines2.map((x) => x.text).join("; ")}. It is signed, not delivered.`);
      await this.signed(me, () => leaveAtHomes(me, made, { via: s.via }));
      const cc = ids.filter((x) => x !== to);
      p.sent.push({ id: made.id, to, text: text3, at: now3(), ...cc.length ? { cc } : {}, ...of ? { of } : {} });
      await this.store.savePeople(me.id, p);
      lines2.unshift({ text: cc.length ? `Sealed to ${this.nameOf(to, me.id, p)} and, in Cc, ${cc.map((x) => this.nameOf(x, me.id, p)).join(", ")}, and left in each inbox: only they can open it, and each sees who else received it.` : `Sealed to ${this.nameOf(to, me.id, p)} and left in their inbox: only they can open it.`, tone: "ok" });
      if (of) lines2.push({ text: `Written in your own name, with the collective ${this.nameOf(of, me.id, p)} appended: it binds nothing, and the reader\u2019s app shows it only where your membership checks.` });
      return { lines: lines2 };
    });
  }
  /** Mark what the person has seen, for the counts on the tabs. */
  // ------------------------------------------------------------ the Signing tab (H18)
  /** Turn the Signing tab on or off for the identity in use (off by default, F59). */
  setSigning(on) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.store.saveSettings(me.id, { ...s, signing: on });
      return { lines: [{ text: on ? `Signing is on. ${SIGNING_SAY}` : "Signing is off. Proposals wait in your inbox, unread, until it is on again.", tone: on ? "warn" : void 0 }] };
    });
  }
  /** How this app names an identity in a reading: the name given here or its display name, beside its fingerprint; "you" for itself. */
  namer(me, p) {
    return (id) => {
      const w = this.whoFrom(id, me, p);
      const n = w.pet ?? w.names[0] ?? null;
      return `${id === me ? "you" : n ? n : "an identity"} [${w.short}]`;
    };
  }
  /** The proposals in this identity's inbox (negotiation messages opening a thread), each read in plain words; or, with Signing off, how many wait. */
  proposals() {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const problems = await this.readInbox(me, s, p, hints);
      const firsts = p.inbox.items.filter((k) => k.talk && k.talk.thread === k.key && k.from && k.from !== me.id && !p.muted.includes(k.from) && k.refs.length);
      if (!s.signing) return { on: false, waiting: firsts.length, proposals: [], problems, say: SIGNING_OFF_SAY };
      const st = await this.store.signing(me.id);
      await this.warm(firsts.map((k) => k.from), hints, s.via);
      const names = this.namer(me.id, p);
      const out = [];
      for (const k of firsts.sort((a, b) => b.found - a.found)) {
        const act = k.refs[0].id;
        const signer = k.refs[0].signer;
        const places = [.../* @__PURE__ */ new Set([...hints, ...await this.placesOf(signer ?? k.from, hints, s.via)])];
        const laterKept = p.inbox.items.filter((x) => x.talk?.thread === k.key && x.key !== k.key && x.from === k.from);
        const later = laterKept.map((x) => x.text ?? "");
        let reading = null;
        let problem = null;
        try {
          const got = await fetchAct3(act, places, s.via);
          if (!got) problem = `The act it asks you to sign (${act}) was not found at ${places.join(", ")}.`;
          else reading = await readProposal(got.act, names, places, s.via);
        } catch (e3) {
          problem = `It could not be read: ${message6(e3)}`;
        }
        const ans = st.answered[k.key] ?? null;
        const w = st.waiting[k.key];
        const r = st.received[k.key];
        let share2 = "none";
        if (r) share2 = r.byHand ? "byHand" : "received";
        else if (w?.shown) share2 = "shown";
        else if (w) {
          try {
            share2 = await openShare(unhex(w.secret), places, places, s.via) ? "ready" : "waiting";
          } catch {
            share2 = "waiting";
          }
        }
        out.push({
          thread: k.key,
          from: this.whoFrom(k.from, me.id, p),
          text: k.text ?? "",
          later,
          act,
          collective: this.collectiveOf(p, k.key) ?? reading?.collective ?? null,
          reading: reading ? { kind: reading.kind, title: reading.title, summary: reading.summary, sections: reading.sections, plain: reading.plain, risks: reading.risks, blocking: reading.blocking } : null,
          problem,
          answer: ans ? { verdict: ans.verdict, signature: ans.signature } : null,
          share: share2,
          positions: w?.shown ?? null,
          seen: p.seen.includes(k.key),
          left: st.left?.[k.key] ?? null
        });
      }
      return { on: true, waiting: firsts.filter((k) => !st.answered[k.key]).length, proposals: out, problems, say: SIGNING_SAY };
    });
  }
  /** The collective a thread is about, as the proposer's messages in it name it (their second reference). */
  collectiveOf(p, thread) {
    for (const x of p.inbox.items) if (x.talk?.thread === thread && x.refs[1]) return x.refs[1].id;
    return null;
  }
  /** Where an identity's acts are: its homes and the relays its routes name. */
  async placesOf(id, hints, via2) {
    try {
      const l = await lookUp(id, hints, via2);
      return [...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)];
    } catch {
      return [];
    }
  }
  /** The proposal a thread opens, from the inbox as read, with the act it names fetched again. */
  async proposal(me, s, p, hints, thread) {
    if (!s.signing) throw new Error(SIGNING_OFF_SAY);
    const k = p.inbox.items.find((x) => x.key === thread && x.talk?.thread === thread && x.from && x.refs.length);
    if (!k) throw new Error("No such proposal in this identity\u2019s inbox.");
    const act = k.refs[0].id;
    const places = [.../* @__PURE__ */ new Set([...hints, ...await this.placesOf(k.refs[0].signer ?? k.from, hints, s.via)])];
    const got = await fetchAct3(act, places, s.via);
    if (!got) throw new Error(`The act it asks you to sign (${act}) was not found. Nothing was signed.`);
    const reading = await readProposal(got.act, this.namer(me.id, p), places, s.via);
    const collective = k.refs[1]?.id ?? reading.collective;
    return { k, act, places, reading, collective, proposer: k.from };
  }
  /**
   * Sign what a proposal names, as read (Agreements rule 4): the member's own
   * signature act, public, at this identity's relays, where the act was
   * found and, for a collective's clone or release, at the collective's
   * homes; then the answer to the proposer, a negotiation message in its
   * thread, acknowledging it. For a founding or a member change, the answer
   * carries the public half of a one-time key made for this share alone
   * (H18), whose secret is held here until the share is shown and written
   * down.
   */
  signProposal(thread) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const st = await this.store.signing(me.id);
      if (st.answered[thread]) throw new Error(`You already ${st.answered[thread].verdict} it. Nothing more was signed.`);
      const { act, places, reading, collective, proposer } = await this.proposal(me, s, p, hints, thread);
      if (reading.blocking.length) throw new Error(`It cannot be signed here: ${reading.blocking.join(" ")} Nothing was signed.`);
      await this.current(me);
      const where = [.../* @__PURE__ */ new Set([...s.relays, ...places, ...collective ? await this.placesOf(collective, hints, s.via) : []])];
      const holds = reading.kind === "founding" || reading.kind === "clone" ? await holdsAnArea(act, places, me.id, s.via) : false;
      const key = holds ? makeMemberKey() : null;
      let own = null;
      if ((reading.kind === "act" || reading.kind === "release") && collective) {
        const keys = await readMemberKeys(me.id, this.secrets(me), me.f.homes.map((h) => h.hint), s.via).catch(() => []);
        own = keys.length ? await memberKeyFor(keys, collective, where, s.via).catch(() => null) : null;
      }
      let made;
      if (own) {
        const at = await chainFor(collective, own, where, s.via);
        const x = cosignAsMember(collective, own, at, act);
        const took = await publishAt([x.act], where, s.via);
        if (!took.length) throw new Error("No relay took your signature. Nothing counts yet: try again.");
        made = { id: x.id };
      } else made = await this.signed(me, () => sign(me, act, where, key?.public));
      const lines2 = [{ text: own ? `Signed for the collective with your own key (F353): the signature act ${made.id} is published at ${where.join(", ")}.` : `Signed: your signature act ${made.id} is published at ${where.join(", ")}.`, tone: "ok" }];
      if (key) {
        try {
          await this.signed(me, () => sealMemberKey(me, { terms: act, signature: made.id, public: key.public, secret: key.secret }, () => void 0));
          lines2.push({ text: `Your own key for this collective was made and named in your signature: once the collective is complete, it signs for you in the areas you hold, from any of your apps. Its private half is sealed to you at your homes (it sits there encrypted, a stated cost; F353).`, tone: "ok" });
        } catch (e3) {
          lines2.push({ text: `Your own key was named in your signature, but could not be sealed to you: ${message6(e3)}`, tone: "bad" });
        }
      }
      let oneTime;
      if (reading.kind === "founding" || reading.kind === "clone") {
        const k = TestIdentity.newBareKey();
        oneTime = k.public;
        st.waiting[thread] = { secret: hex(k.secret), since: now3(), act };
        lines2.push({ text: "A one-time key was made for your share of the collective\u2019s chain key: its secret stays in this app only until the share arrives and you have written it down, then it is destroyed." });
      }
      st.answered[thread] = { act, verdict: "signed", signature: made.id, reply: "", at: now3() };
      await this.store.saveSigning(me.id, st);
      const reach = await this.reach(proposer, hints, s.via);
      const reply = await this.signed(me, () => negotiate(me, reach, { text: acceptanceText(made.id, oneTime), thread, previous: this.lastFrom(p, thread, proposer), acks: [this.lastFrom(p, thread, proposer)] }));
      st.answered[thread].reply = reply.id;
      await this.store.saveSigning(me.id, st);
      lines2.push({ text: reply.left.length ? `Your answer was left in the proposer\u2019s inbox (${reply.left.join(", ")}).` : `Your answer could not be left in the proposer\u2019s inbox: ${reply.failed.map((f) => `${f.relay}: ${f.reason}`).join("; ")}.`, tone: reply.left.length ? void 0 : "bad" });
      return { lines: lines2, signature: made.id };
    });
  }
  /** Decline a proposal: a negotiation message in its thread saying so; nothing is signed for it. */
  declineProposal(thread, why = "") {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const st = await this.store.signing(me.id);
      if (st.answered[thread]) throw new Error(`You already ${st.answered[thread].verdict} it.`);
      const k = p.inbox.items.find((x) => x.key === thread && x.talk?.thread === thread && x.from);
      if (!k) throw new Error("No such proposal in this identity\u2019s inbox.");
      if (!s.signing) throw new Error(SIGNING_OFF_SAY);
      await this.current(me);
      const reach = await this.reach(k.from, hints, s.via);
      const last = this.lastFrom(p, thread, k.from);
      const reply = await this.signed(me, () => negotiate(me, reach, { text: why.trim() ? `${DECLINED}
${compose(why).text}` : DECLINED, thread, previous: last, acks: [last] }));
      st.answered[thread] = { act: k.refs[0]?.id ?? "", verdict: "declined", reply: reply.id, at: now3() };
      await this.store.saveSigning(me.id, st);
      return { lines: [{ text: "Declined: nothing was signed, and the proposer was told." }] };
    });
  }
  /**
   * Leaving a collective alone (Agreements rule 70, F354 question 2): read
   * back first. The collective is the one a founding (or member change) this
   * identity signed founded; its agreement in force read as anyone reads it;
   * the warnings rule 70 asks of the client before signing (the last voice;
   * the last constitutional voice, BQ5), counted with the resignations the
   * other parties published that no line registered yet (F187, 3). Nothing
   * is signed.
   */
  leaveRead(thread) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      if (!s.signing) throw new Error(SIGNING_OFF_SAY);
      const st = await this.store.signing(me.id);
      const ans = st.answered[thread];
      const collective = this.collectiveOf(p, thread);
      if (!ans || ans.verdict !== "signed" || !collective) throw new Error("Only a collective this identity signed into, once founded, can be left from here.");
      const places = [.../* @__PURE__ */ new Set([...hints, ...s.relays, ...await this.placesOf(collective, hints, s.via)])];
      const now4 = await collectiveNow(collective, places, s.via);
      if (!now4.agreement) throw new Error("The collective\u2019s agreement in force could not be read from its relays and homes: no resignation can name it. Nothing was signed.");
      if (!now4.parties.includes(me.id) || now4.departed.includes(me.id)) throw new Error("This identity is no member of it now: there is nothing to leave.");
      if (now4.resignations.some((r) => r.party === me.id && r.kind === "resigned")) throw new Error("This identity already published its resignation: it takes effect once the collective registers it.");
      const leaving = /* @__PURE__ */ new Set([me.id, ...now4.departed, ...now4.resignations.filter((r) => r.kind === "resigned").map((r) => r.party)]);
      const others = now4.parties.filter((x) => !leaving.has(x));
      const lines2 = [
        { text: `You resign from the collective ${shownId(collective)}, alone: nobody else\u2019s signature is needed (Agreements rule 70).`, tone: "warn" },
        { text: "It takes effect at the collective\u2019s line registering it: its founder\u2019s Edubba draws it, then proposes the change of members without you, which waits for Ki\u0161ib." },
        { text: "You keep your stake, and stay bound by what you signed: you become a departed holder, paid as every holder is, with no voice (rule 68)." },
        { text: "Your own key for this collective acts no more once the change without you is in force; a signature of yours placed before the line still counts for what it signed." }
      ];
      if (!others.length) {
        lines2.push({ text: "You are the last voice that remains: once you leave, the collective\u2019s works are frozen as they stand, and nobody will be able to change, release or move them (rule 70, F185). Leaving stays yours alone.", tone: "bad" });
      }
      const payload = resignationPayload(now4.agreement);
      return { collective, agreement: now4.agreement, lines: lines2, digest: sha2562(payload) };
    });
  }
  /** Sign the resignation read back by [`leaveRead`], publish it at the collective's places, and tell the proposer in the founding's thread. */
  leaveCollective(thread, digest) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const st = await this.store.signing(me.id);
      const collective = this.collectiveOf(p, thread);
      if (!collective) throw new Error("No such collective here.");
      const places = [.../* @__PURE__ */ new Set([...hints, ...s.relays, ...await this.placesOf(collective, hints, s.via)])];
      const now4 = await collectiveNow(collective, places, s.via);
      if (!now4.agreement || sha2562(resignationPayload(now4.agreement)) !== digest) throw new Error("The collective\u2019s agreement in force changed since it was read back: read it again. Nothing was signed.");
      await this.current(me);
      const made = await this.signed(me, () => resign(me, now4.agreement, places));
      const k = p.inbox.items.find((x) => x.key === thread && x.from);
      const lines2 = [{ text: `Your resignation is act ${made.id}, public at ${places.join(", ")}. It takes effect once the collective registers it.`, tone: "ok" }];
      if (k?.from) {
        try {
          const reach = await this.reach(k.from, hints, s.via);
          const last = this.lastFrom(p, thread, k.from);
          await this.signed(me, () => negotiate(me, reach, { text: `${RESIGNED}
${made.id}`, thread, previous: st.answered[thread]?.reply || last, acks: [last] }));
          lines2.push({ text: "The founder was told, in the founding\u2019s thread: their Edubba registers it and proposes the change of members without you." });
        } catch (e3) {
          lines2.push({ text: `The founder could not be told (${message6(e3)}): their Edubba still finds your resignation at the collective\u2019s relays.`, tone: "warn" });
        }
      }
      st.left = { ...st.left ?? {}, [thread]: made.id };
      await this.store.saveSigning(me.id, st);
      return { lines: lines2, resignation: made.id };
    });
  }
  /** The latest message of the other side in a thread, as this app read it: what an answer follows and acknowledges. */
  lastFrom(p, thread, from) {
    const theirs = p.inbox.items.filter((x) => x.talk?.thread === thread && x.from === from);
    const ids = new Set(theirs.map((x) => x.key));
    return theirs.find((x) => !theirs.some((y) => y.talk?.previous === x.key && ids.has(y.key)))?.key ?? thread;
  }
  async reach(id, hints, via2) {
    const l = await lookUp(id, hints, via2);
    if (!l.encryptionKey) throw new Error("The proposer has published no encryption key: no answer can be sealed to it. Nothing was sent.");
    const inbox = l.inbox(REPO_SPECS.agreements) ?? l.inbox(POST_SPECS.text);
    if (!inbox?.length) throw new Error("The proposer declares no inbox. Nothing was sent.");
    return { id, key: l.encryptionKey, inbox };
  }
  /** Open the share waiting for a thread with its one-time key. */
  async shareFor(me, s, hints, thread) {
    const st = await this.store.signing(me.id);
    const w = st.waiting[thread];
    if (!w) throw new Error("No share is waiting for this proposal here.");
    const places = [.../* @__PURE__ */ new Set([...hints, ...await this.inboxOf(me.id, hints, s.via)])];
    const got = await openShare(unhex(w.secret), places, places, s.via);
    if (!got) throw new Error("The share has not arrived yet: the founder\u2019s Edubba sends it once every member has signed.");
    const paper = shareOnPaper(got.share);
    return { st, w, paper };
  }
  async inboxOf(id, hints, via2) {
    try {
      return list5((await lookUp(id, hints, via2)).routes.routes.filter((r) => r.kind === 1).flatMap((r) => r.hints));
    } catch {
      return [];
    }
  }
  /**
   * Show a member's share once (H18): its number and 24 words, labelled as
   * the collective's chain key share, checked against the dealing first.
   * From then on it is never shown again; three of its words are asked back
   * (as H3), and only then is the one-time key destroyed.
   */
  shareShow(thread) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      if (!s.signing) throw new Error(SIGNING_OFF_SAY);
      const { st, w, paper } = await this.shareFor(me, s, hints, thread);
      if (w.shown) throw new Error("It was shown once already: type back the three words asked.");
      const positions = threePositions(randomBelow);
      w.shown = positions;
      await this.store.saveSigning(me.id, st);
      return {
        thread,
        x: paper.x,
        holders: paper.holders,
        threshold: paper.threshold,
        words: toWords(paper.value),
        fingerprint: paper.fingerprint.match(/.{1,4}/g).slice(0, 8).join(" "),
        collective: this.collectiveOf(p, thread),
        say: SHARE_SAY,
        positions
      };
    });
  }
  /** Three words of the share typed back: then the one-time key is destroyed, and the relays' copy can never be opened again. */
  shareConfirm(thread, typed) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const { st, w, paper } = await this.shareFor(me, s, hints, thread);
      if (!w.shown) throw new Error("The share has not been shown yet.");
      if (!typedBack(toWords(paper.value), w.shown, typed)) {
        throw new Error(`Those are not words ${w.shown.join(", ")} of your share as shown. Look at what you wrote down. The one-time key is kept until they are.`);
      }
      delete st.waiting[thread];
      st.received[thread] = { x: paper.x, fingerprint: paper.fingerprint, collective: this.collectiveOf(p, thread), at: now3() };
      await this.store.saveSigning(me.id, st);
      return { lines: [{ text: `Share ${paper.x} is written down. The one-time key is destroyed: the copy on the relays can never be opened again, by anyone. Keep the paper safe.`, tone: "ok" }] };
    });
  }
  /** The share came by hand, shown on the founder's screen: the one-time key is destroyed unused. */
  shareByHand(thread) {
    return this.serial(async () => {
      const { me } = await this.ctx();
      const st = await this.store.signing(me.id);
      const w = st.waiting[thread];
      if (!w) throw new Error("No share is waiting for this proposal here.");
      delete st.waiting[thread];
      st.received[thread] = { x: 0, fingerprint: "", collective: null, at: now3(), byHand: true };
      await this.store.saveSigning(me.id, st);
      return { lines: [{ text: "The one-time key is destroyed: a share sealed to it later could never be opened." }] };
    });
  }
  async seen(keys) {
    await this.serial(async () => {
      const { me, p } = await this.ctx();
      p.seen = [.../* @__PURE__ */ new Set([...p.seen, ...keys])];
      await this.store.savePeople(me.id, p);
    });
  }
  // ------------------------------------------------------------ follow and mute (the people cMIP)
  async people(f) {
    return this.serial(async () => {
      const { me, s, p } = await this.ctx();
      const lines2 = await this.syncFollows(me, s, p, (q) => f(q, me));
      if (p.list === "published") lines2.push(...await this.publishList(me, s, p, false));
      return { lines: lines2 };
    });
  }
  // ------------------------------------------------------------ the redesign (21 October 2026): what the act card's menus, the profile and the mailbox ask
  /** Memberships checked lately (the appended collective cMIP), by member and collective: this app's memory only. */
  checked = /* @__PURE__ */ new Map();
  /** Whether `member` is a member of `collective` now, read at most every ten minutes. */
  async member(member, collective, hints, via2) {
    const k = `${member}:${collective}`;
    const c = this.checked.get(k);
    if (c && c.at + NAMES_FOR > now3()) return c.r;
    const r = await membership(member, collective, hints, via2);
    this.checked.set(k, { at: now3(), r });
    return r;
  }
  /** Stamps read lately from the clock named (H54), by clock: this app's memory only, at most once a minute. */
  stamps = /* @__PURE__ */ new Map();
  /** When the clock this identity names says it held each act (its earliest stamp); empty where none is named or it cannot be read. */
  async clockTimes(s, hints) {
    if (!s.clock) return /* @__PURE__ */ new Map();
    const c = this.stamps.get(s.clock.id);
    if (c && c.at + 60 > now3()) return c.earliest;
    try {
      const places = [.../* @__PURE__ */ new Set([...await this.placesOf(s.clock.id, hints, s.via), ...hints])];
      const r = await readStamps(s.clock.id, places, new Judge(places, s.via), s.via);
      this.stamps.set(s.clock.id, { at: now3(), earliest: r.earliest });
      return r.earliest;
    } catch {
      return /* @__PURE__ */ new Map();
    }
  }
  /**
   * Name the timestamp clock this identity's feeds are ordered by (H54; the
   * timestamp clock Module, draft 2): its ID, and a name for it here. Empty:
   * none, each signer's own order. Nothing is signed.
   */
  setClock(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (!a.id.trim()) {
        await this.store.saveSettings(me.id, { ...s, clock: null });
        return { lines: [{ text: "No clock named: feeds are in each signer\u2019s own order, which is not a time." }] };
      }
      const id = readId(a.id);
      const name = a.name.trim().slice(0, 48) || `the clock ${shortId(id)}`;
      await this.store.saveSettings(me.id, { ...s, clock: { id, name } });
      this.stamps.delete(id);
      return { lines: [{ text: `Feeds are ordered by ${name}\u2019s clock: its word on when it held each act, never a verdict. Acts it did not stamp keep their signer\u2019s own order.`, tone: "ok" }] };
    });
  }
  /** Labels a post carries (H65): an agent's answer to a pick or under a nudge, and who gave it, read from the acts it names first. */
  async labelsOf(sp, me, p, places, via2) {
    const out = [];
    for (const r of sp.refs) {
      if (r.kind !== "act" || !r.actSigner || r.what === "a text act") continue;
      try {
        const act = (await followRef(r.signer ? [r.id, r.signer] : r.id, places, via2)).act;
        const d = describeAct(act);
        if (d.spec !== NUDGE_SPECS.nudge || !d.payload || !d.signer) continue;
        const name = this.nameOf(d.signer, me, p);
        if (d.type === NUDGE_TYPES2.pick && decodePick(d.payload).agent === sp.signer) out.push({ text: `a pick by ${name}` });
        if (d.type === NUDGE_TYPES2.nudge && decodeNudge(d.payload).agent === sp.signer) out.push({ text: `under a nudge from ${name}` });
      } catch {
      }
    }
    return out;
  }
  /** An identity's name as this app says it: the name given here, its display name, or its fingerprint. */
  nameOf(id, me, p) {
    const w = this.whoFrom(id, me, p);
    return id === me ? "you" : w.pet ?? w.names[0] ?? shortId(id);
  }
  /** One act, read and judged, as a card shows it: a post as the feed reads posts, any other act named by what it is. */
  async readOne(id, signer, me, p, s, places) {
    try {
      const sp = await readPost(id, places, s.via);
      const it = this.item(sp, me, p, s, "feed", [], false);
      await this.warm([sp.signer], places, s.via);
      it.who = this.whoFrom(sp.signer, me, p);
      it.labels = await this.labelsOf(sp, me, p, places, s.via);
      return it;
    } catch {
    }
    let act;
    try {
      act = (await followRef(signer ? [id, signer] : id, places, s.via)).act;
    } catch (e3) {
      throw new Error(`The act ${shortAct(id)} was not found: ${message6(e3)}. Silence proves nothing: another relay may hold it.`);
    }
    const d = describeAct(act);
    const by = d.signer ?? d.id;
    await this.warm([by], places, s.via);
    let standing2 = "unknown";
    try {
      const l = await lookUp(by, places, s.via);
      l.verifier.add(act);
      standing2 = l.verifier.status(d.id);
    } catch {
    }
    return { id: d.id, form: actForm(d.id), who: this.whoFrom(by, me, p), standing: standing2, text: d.public ? "" : "A private act: only its recipients can open it.", doc: null, pictures: [], answers: [], toMe: false, via: "relay", problem: standing2 === "valid" ? null : `not verified: ${standing2}`, seen: true, what: whatAct(d) };
  }
  /**
   * Open an act by its ID (H50, H74): what a post answers or corrects,
   * fetched from where its signer lives. Read, judged and returned as a card;
   * nothing is signed.
   */
  open(a) {
    return this.serial(async () => {
      const { me, p, s, hints } = await this.ctx();
      const id = readActId(a.id);
      const signer = a.signer ? readId(a.signer) : null;
      const places = [.../* @__PURE__ */ new Set([...hints, ...this.inboxPlaces(p), ...signer ? await this.placesOf(signer, hints, s.via) : []])];
      return { item: await this.readOne(id, signer, me.id, p, s, places) };
    });
  }
  /**
   * Why an act is valid, or not, in plain words (the act's menu): what it is,
   * who signed it and with what key their identity chain counts, its
   * standing as the core library judges it, and what it names. Nothing is
   * signed.
   */
  why(a) {
    return this.serial(async () => {
      const { me, p, s, hints } = await this.ctx();
      const id = readActId(a.id);
      const signer = a.signer ? readId(a.signer) : null;
      const places = [.../* @__PURE__ */ new Set([...hints, ...this.inboxPlaces(p), ...signer ? await this.placesOf(signer, hints, s.via) : []])];
      let act;
      try {
        act = (await followRef(signer ? [id, signer] : id, places, s.via)).act;
      } catch (e3) {
        return { title: "Not found", lines: [{ text: `The act ${shortAct(id)} was not found at ${places.join(", ")}: ${message6(e3)}. Silence proves nothing: another relay may hold it.`, tone: "warn" }] };
      }
      const d = describeAct(act);
      const by = d.signer ?? d.id;
      await this.warm([by], places, s.via);
      const lines2 = [{ text: `${whatAct(d)}, act ${actForm(d.id)}.` }];
      if (!d.signer) lines2.push({ text: "An identity\u2019s genesis: it makes the identity whose ID is its own." });
      else lines2.push({ text: `Signed by ${this.nameOf(by, me.id, p)} (${idForm(by)}).` });
      let standing2 = "unknown";
      try {
        const l = await lookUp(by, places, s.via);
        l.verifier.add(act);
        standing2 = l.verifier.status(d.id);
        if (l.resolution.stop === "contested") lines2.push({ text: "Its signer\u2019s homes disagree about its keys: its identity is contested.", tone: "bad" });
        else lines2.push({ text: `Its signer\u2019s identity chain was read from ${l.resolution.homes.length} home${l.resolution.homes.length === 1 ? "" : "s"}, ${l.resolution.links.length} act${l.resolution.links.length === 1 ? "" : "s"} long.` });
      } catch (e3) {
        lines2.push({ text: `Its signer was not found: ${message6(e3)}.`, tone: "warn" });
      }
      const w = standingWords(standing2);
      lines2.push({ text: w.words.replace(" in this browser", " here"), tone: w.ok ? "ok" : standing2 === "void" || standing2 === "invalid" ? "bad" : "warn" });
      if (standing2 !== "valid" && d.signer) {
        const auth = await authorityOfId(d.id, places, s.via, { names: (x) => this.nameOf(x, me.id, p) }).catch(() => null);
        if (auth) lines2.push({ text: auth.words, tone: auth.backing === "backed" || auth.backing === "binds" ? "ok" : "warn" });
      }
      if (d.refs?.length) lines2.push({ text: `It names ${d.refs.length} other act${d.refs.length === 1 ? "" : "s"}: ${d.refs.map((r) => shortAct(r)).join(", ")}.` });
      if (d.to?.length) lines2.push({ text: `It is addressed to ${d.to.map((x) => this.nameOf(x, me.id, p)).join(", ")}.` });
      lines2.push({ text: "A verdict rests on signatures and identity chains only: no clock, no relay and no app decides it." });
      return { title: w.ok ? "Why it\u2019s valid" : "Why it is not valid", lines: lines2 };
    });
  }
  /**
   * An identity's profile (decided: "light and friendly"): its name and
   * display name, where it lives (and since when, by the clock named, where
   * it stamped its genesis), trouble only where there is, and its posts.
   */
  profile(a) {
    return this.serial(async () => {
      const { me, p, s, hints } = await this.ctx();
      const { id, hints: where } = readIdWhere(a.id);
      const places = [.../* @__PURE__ */ new Set([...where, ...hints])];
      await this.warm([id], places, s.via);
      let lives = "Where it lives was not found.";
      let trouble = null;
      let theirs = [];
      try {
        const l = await lookUp(id, places, s.via);
        const homes = l.resolution.homes.map((h) => hostOf(h.hint));
        const relays = list5(l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints));
        theirs = [...l.resolution.homes.map((h) => h.hint), ...relays];
        lives = `Lives on ${homes.length === 1 ? "one home" : `${homes.length} homes`} (${homes.join(", ")}), reached through ${relays.length === 1 ? "one relay" : `${relays.length} relays`}.`;
        if (l.resolution.stop === "contested") trouble = "Its homes disagree about its keys: this identity is contested. Its acts may not be what they seem.";
        const t = await this.clockTimes(s, hints);
        const since = t.get(id);
        if (since) lives += ` Since ${timeWords(since)}, by ${s.clock.name}\u2019s clock.`;
      } catch (e3) {
        trouble = `It could not be looked up: ${message6(e3)}.`;
      }
      const feed = await readFeed([{ identity: id, name: null }], [.../* @__PURE__ */ new Set([...theirs, ...places])], s.via, void 0, s.clock ? { identity: s.clock.id, name: s.clock.name } : null);
      const items = [];
      for (const fp of feed.posts) {
        if (!fp.post) continue;
        const it = { ...this.item(fp.post, me.id, p, s, "feed", fp.answers.map((x) => ({ id: x, who: null, snippet: null })), false), corrects: fp.corrects ?? null, correctedBy: fp.correctedBy ?? [] };
        it.when = fp.time ? timeWords(fp.time) : null;
        items.push(it);
      }
      return {
        who: this.whoFrom(id, me.id, p),
        lives,
        trouble,
        items,
        clock: feed.clock ? { name: s.clock?.name ?? feed.clock.name ?? "the clock", placed: feed.posts.filter((x) => x.time).length, shown: feed.posts.length } : null,
        problems: feed.authors.filter((x) => x.problem).map((x) => x.problem)
      };
    });
  }
  /** Rely on an act, read back first (H77; Identity, the witness act): what it is, who signed it, and what signing says. Nothing is signed. */
  relyRead(a) {
    return this.serial(async () => {
      const { me, p, s, hints } = await this.ctx();
      const id = readActId(a.id);
      const signer = a.signer ? readId(a.signer) : null;
      const places = [.../* @__PURE__ */ new Set([...hints, ...this.inboxPlaces(p), ...signer ? await this.placesOf(signer, hints, s.via) : []])];
      const blocking = [];
      const lines2 = [];
      try {
        const act = (await followRef(signer ? [id, signer] : id, places, s.via)).act;
        const d = describeAct(act);
        lines2.push({ text: `${whatAct(d)}, act ${actForm(d.id)}, signed by ${this.nameOf(d.signer ?? d.id, me.id, p)}.` });
        if (d.signer === me.id || ownIds(me.f).includes(d.id)) blocking.push("It is this identity\u2019s own act: a witness act names other identities\u2019 acts.");
      } catch (e3) {
        blocking.push(`It was not found (${message6(e3)}): Dub relies only on an act it has read.`);
      }
      return { lines: lines2, explanation: WITNESS_EXPLANATION, blocking };
    });
  }
  /** Sign the witness act, once RELY is typed (as Edubba asks), its key checked first (H80). */
  rely(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (s.acting) throw new Error("A collective relies on nothing from Dub: switch back to the identity itself. Nothing was signed.");
      if (a.typed.trim() !== "RELY") throw new Error("Type RELY to sign the witness act. Nothing was signed.");
      const id = readActId(a.id);
      if (ownIds(me.f).includes(id)) throw new Error("It is this identity\u2019s own act. Nothing was signed.");
      await this.current(me);
      const made = await this.signed(me, () => me.witness([id], { shown: WITNESS_EXPLANATION, relays: s.relays }));
      if (!made.sent.some((x) => x.result)) throw new Error(`No home took the witness act: ${made.sent.map((x) => `${x.home}: ${x.error}`).join("; ")}. It is signed here, not published.`);
      return { lines: [{ text: `You rely on ${shortAct(id)}: witness act ${shortAct(made.id)}, public at this identity\u2019s homes and relays. It keeps that act visible as disputed should its author ever disown it.`, tone: "ok" }] };
    });
  }
  /** An anchoring service's standing offers (the anchoring cMIP, draft 5), read from its public acts; the person names the service. */
  anchorOffers(a) {
    return this.serial(async () => {
      const { s, hints } = await this.ctx();
      const service = readIdWhere(a.service);
      const found = await offers(service.id, [...service.hints, ...hints], s.via);
      return { offers: found.map((o) => ({ act: o.act, unit: o.unit, words: o.words, tiers: o.tiers.map((t, i) => ({ tier: i, words: `within ${t.blocks} block${t.blocks === 1 ? "" : "s"}, ${say({ unit: o.unit, value: t.price }, /* @__PURE__ */ new Set([o.unit]))}` })) })) };
    });
  }
  /**
   * Anchor an act (decided: beside Rely, on any act; the anchoring cMIP: "anyone
   * may anchor any act"): a payment prepared for Damgar, as Ummia and Edubba
   * prepare one (the money messages cMIP, an anchor draft), sealed to this
   * identity at its homes; its blind kept here. Dub signs no money act.
   */
  anchor(a) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const id = readActId(a.id);
      const service = readIdWhere(a.service);
      const offer = (await offers(service.id, [...service.hints, ...hints], s.via)).find((o) => o.act === a.offer);
      if (!offer) throw new Error("That offer was not found at the service\u2019s places. Nothing was prepared.");
      const tier = offer.tiers[a.tier];
      if (!tier) throw new Error("The offer has no such tier. Nothing was prepared.");
      await this.current(me);
      const blind = new Uint8Array(randomBytes(32));
      const leaf = anchoringLeaf(id, blind);
      const r = await sendDraft(me, { what: "anchor", other: service.id, amount: { unit: offer.unit, value: tier.price }, whatFor: `an anchor of ${shortAct(id)}`, app: "Dub", anchor: { offer: offer.act, tier: a.tier, leaf } }, { via: s.via, save: () => this.store.saveIdentity(me) });
      const kept = await this.store.money(me.id, "anchors") ?? [];
      kept.push({ act: id, blind: hex(blind), leaf, service: service.id, offer: offer.act, tier: a.tier, draft: r.id, at: now3() });
      await this.store.saveMoney(me.id, "anchors", kept);
      return {
        lines: [
          { text: `Asked: an anchor of ${shortAct(id)} on the Bitcoin chain, within ${tier.blocks} blocks, for ${say({ unit: offer.unit, value: tier.price }, /* @__PURE__ */ new Set([offer.unit]))}.`, tone: "ok" },
          { text: `The payment is prepared, not signed: sealed to you at your homes (${r.left.join(", ")}), it waits in Damgar, in Waiting. The blind that ties the anchor to this act is kept here.` }
        ]
      };
    });
  }
  /**
   * Correct one's own act (the corrections cMIP, draft 2): a new post naming
   * it first, labelled "Correction"; the old one stays as signed. Only this
   * identity's own acts.
   */
  correct(a) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const id = readActId(a.id);
      const { text: text3 } = compose(a.text);
      if (!text3.trim()) throw new Error("Write the correction. Nothing was signed.");
      let act;
      try {
        act = (await followRef([id, me.id], hints, s.via)).act;
      } catch (e3) {
        throw new Error(`The act to correct was not found: ${message6(e3)}. Nothing was signed.`);
      }
      if (describeAct(act).signer !== me.id) throw new Error("Only this identity\u2019s own acts are corrected here (a reply is the way to answer another\u2019s). Nothing was signed.");
      await this.current(me);
      const made = await this.signed(me, () => post(me, { text: text3, relays: s.relays, corrects: [id, me.id] }));
      return { lines: [{ text: `Correction ${shortAct(made.id)}, naming ${shortAct(id)}, which stays as it was signed: readers show it with \u201Ccorrected by\u201D.`, tone: "ok" }] };
    });
  }
  /** A film's bytes, when asked to play it (the video Module, rule 13): checked against its publication before they leave here. */
  film(a) {
    return this.serial(async () => {
      const { p, s, hints } = await this.ctx();
      const signer = a.signer ? readId(a.signer) : null;
      const r = await filmBytes(readActId(a.publication), signer, [...hints, ...this.inboxPlaces(p)], s.via);
      return { b64: base64(r.bytes), type: r.film.type };
    });
  }
  // ------------------------------------------------------------ collectives under the identity (acting as one: the same gesture as switching)
  /**
   * Add a collective this identity can act as from here, by its ID: its
   * member key (F353) read from this identity's homes, and the area of its
   * agreement in force that reaches public posts. Added even where it cannot
   * act yet, saying why.
   */
  collectiveAdd(a) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const { id, hints: where } = readIdWhere(a.id);
      if (id === me.id) throw new Error("That is this identity itself.");
      const r = await this.memberKeyHere(me, s, id, [...where, ...hints]);
      const rest = (s.collectives ?? []).filter((c) => c.id !== id);
      await this.store.saveSettings(me.id, { ...s, collectives: [...rest, { id, available: !r.why, why: r.why }] });
      await this.warm([id], [...where, ...hints], s.via);
      return { lines: [r.why ? { text: `Added, not usable yet: ${r.why}`, tone: "warn" } : { text: `${this.names.get(id)?.names[0] ?? shortId(id)} is under this identity: choose it in the identity panel to act as it.`, tone: "ok" }] };
    });
  }
  /** Forget a collective here (nothing is published); acting as it stops. */
  collectiveRemove(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.store.saveSettings(me.id, { ...s, collectives: (s.collectives ?? []).filter((c) => c.id !== a.id), acting: s.acting === a.id ? null : s.acting ?? null });
      return { lines: [{ text: "Removed from this app. Nothing is published; the collective and your membership are untouched." }] };
    });
  }
  /** Act as a collective under this identity, or (null) as the identity itself. */
  actAs(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (a.id) {
        const c = (s.collectives ?? []).find((x) => x.id === a.id);
        if (!c) throw new Error("That collective is not under this identity here.");
        if (!c.available) throw new Error(`Dub cannot act as it: ${c.why ?? "its member key is not here"}`);
      }
      await this.store.saveSettings(me.id, { ...s, acting: a.id });
      return { lines: [] };
    });
  }
  /** The member key this identity holds for a collective, and the area reaching public posts; `why` where it cannot act. */
  async memberKeyHere(me, s, collective, hints) {
    const places = [.../* @__PURE__ */ new Set([...await collectivePlaces(collective, hints, s.via).catch(() => []), ...hints])];
    const keys = await readMemberKeys(me.id, this.secrets(me), me.f.homes.map((h) => h.hint), s.via).catch(() => []);
    const key = keys.length ? await memberKeyFor(keys, collective, places, s.via).catch(() => null) : null;
    if (!key) return { key: null, places, why: "no member key of this identity for it was found at its homes (one is made when you sign its founding, in Edubba).", number: 0 };
    const reach = await areaReaching(collective, places, { spec: POST_SPECS.text, type: TEXT_ACT }, s.via).catch(() => ({ agreement: null, area: null }));
    if (!reach.area) return { key, places, why: "its agreement in force gives no area reaching public posts.", number: 0 };
    if (!reach.area.holders.includes(me.id)) return { key, places, why: `this identity holds no box in its area \u201C${reach.area.name}\u201D, which reaches public posts.`, number: 0 };
    return { key, places, why: null, number: reach.area.number };
  }
  // ------------------------------------------------------------ Purchases (decided, 21 October 2026)
  /** Files bought and vows purchased here, each as it stands: a file opened once its key arrived, a vow with its sale. */
  purchases() {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      const places = [.../* @__PURE__ */ new Set([...hints, ...this.inboxPlaces(p), ...s.relays])];
      const bought = await this.store.money(me.id, "bought") ?? {};
      const problems = [];
      const items = [];
      await this.warm(Object.values(bought).map((b) => b.seller), places, s.via);
      for (const [publication, b] of Object.entries(bought)) {
        const x = await this.money.read(me, places, s.via, [{ id: publication, signer: b.seller }]).catch((e3) => (problems.push(message6(e3)), null));
        items.push({
          kind: "file",
          id: publication,
          form: actForm(publication),
          seller: this.whoFrom(b.seller, me.id, p),
          what: x?.media === "picture" ? "picture" : "text",
          price: x?.price ?? null,
          state: x?.state === "opened" ? "opened: its key came with the receipt" : x?.state === "paying" ? "bought: pay it in your wallet; its key comes with the receipt" : x?.problem ?? "bought",
          text: x?.state === "opened" ? x.text : null,
          picture: x?.state === "opened" ? x.picture : null
        });
      }
      const vows = await this.money.vowsBought(me, places, s.via).catch((e3) => (problems.push(message6(e3)), []));
      await this.warm(vows.map((v) => v.seller), places, s.via);
      for (const v of vows) {
        items.push({
          kind: "vow",
          id: v.vow,
          form: actForm(v.vow),
          seller: this.whoFrom(v.seller, me.id, p),
          what: "vow",
          price: v.price,
          state: !v.paid ? "not paid yet" : v.sale === "confirmed" ? "confirmed: it was kept" : v.sale === "contested" ? `contested${v.promise ? `: \u201C${v.promise}\u201D` : ""}` : "not yet confirmed: confirm or contest it in its menu",
          text: v.words,
          picture: null,
          sale: v.sale,
          paid: v.paid
        });
      }
      return { items, problems };
    });
  }
  // ------------------------------------------------------------ paying from Dub, three ways (decided, 21 October 2026)
  /**
   * The ways open for one payment (decided: "Dub has no money signing by
   * default, everything has to be done in Damgar… now we're looking at
   * using more to do something closer to a prototype"): under Dub's lane,
   * with what is left of it; Ask Damgar, a money message it queues; by
   * hand, the draft shown to copy for Damgar. A purchase names its offer,
   * which a money message cannot carry yet: only the lane buys.
   */
  payWays(a) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      const lanes = await this.money.lanes(me, s, hints).catch(() => []);
      const lane = lanes.find((l) => l.state === "in force");
      const purchase = a.kind === "buy" || a.kind === "vow";
      const noDraft = "A purchase names the seller\u2019s offer, which a money message to Damgar cannot carry yet: buy it under Dub\u2019s lane.";
      let spent3 = null;
      let left = null;
      let total = null;
      const held = lane?.grant ? ((await this.store.money(me.id, "keys"))?.lanes ?? []).find((x) => x.grant === lane.grant) : void 0;
      if (lane?.grant && held?.total) {
        const used = await this.money.engine.laneSpent(me.id, lane.grant, held.total.unit);
        total = say(held.total, /* @__PURE__ */ new Set([held.total.unit]));
        left = say({ unit: held.total.unit, value: Math.max(0, held.total.value - used) }, /* @__PURE__ */ new Set([held.total.unit]));
      }
      if (lane?.grant) {
        const book = await this.store.money(me.id, "book") ?? {};
        const by = /* @__PURE__ */ new Map();
        for (const x of Object.values(book.payments ?? {})) if (x.side === "out" && x.how?.by === "lane" && x.how.grant === lane.grant && x.stage !== "refused" && x.stage !== "declined") by.set(x.amount.unit, (by.get(x.amount.unit) ?? 0) + x.amount.value);
        spent3 = by.size ? [...by].map(([unit, value]) => say({ unit, value }, /* @__PURE__ */ new Set([unit]))).join(", ") : "nothing yet";
      }
      return {
        lane: lane ? { open: true, why: null, label: lane.label, perPayment: lane.cap, until: lane.until, spent: spent3, total, left } : { open: false, why: lanes.some((l) => l.state === "asked") ? "Dub\u2019s lane is asked, not yet granted in Damgar." : "Dub has no lane from Damgar: ask for one in the identity\u2019s menu (A lane from Damgar).", label: null, perPayment: null, until: null, spent: null, total: null, left: null },
        damgar: purchase ? { open: false, why: noDraft } : { open: true, why: null, wakes: !!this.opts.damgar },
        hand: purchase ? { open: false, why: noDraft } : { open: true, why: null }
      };
    });
  }
  /**
   * Pay, the way chosen: under Dub's lane (Dub signs with the lane's key,
   * refused past its cap or expiry); Ask Damgar (a money message sealed to
   * this identity, which Damgar queues); or by hand (the same draft, shown
   * to copy, signed and sent by nothing here). Tip a post, pay an identity
   * (from its profile), buy a file or a vow.
   */
  pay(a) {
    if (a.kind === "buy" && a.how === "lane") return this.buy({ publication: a.publication ?? "", seller: a.signer, post: a.post, repost: a.repost, reposter: a.reposter });
    if (a.kind === "vow" && a.how === "lane") return this.buyVow({ vow: a.vow ?? "", seller: a.signer, post: a.post ?? "" });
    if (a.kind === "buy" || a.kind === "vow") return Promise.reject(new Error("A purchase is made under Dub\u2019s lane: a money message to Damgar cannot carry its offer yet. Nothing was signed."));
    if (a.how === "lane" && a.kind === "tip") return this.tipNow({ post: a.post ?? "", signer: a.signer, value: a.value ?? "", unit: a.unit ?? "", whatFor: a.whatFor });
    if (a.how === "lane") return this.payNow({ signer: a.signer, value: a.value ?? "", unit: a.unit ?? "", whatFor: a.whatFor ?? "" });
    if (a.how === "damgar") return this.askDamgar({ other: a.signer, post: a.post, value: a.value ?? "", unit: a.unit ?? "", whatFor: a.whatFor });
    return this.byHand({ signer: a.signer, value: a.value ?? "", unit: a.unit ?? "", whatFor: a.whatFor ?? "" });
  }
  /**
   * The second way, Ask Damgar: the payment left on MOR as a draft sealed to
   * this identity, which Damgar queues in Waiting (2); on this computer,
   * Damgar is then woken and draws its panel inside Dub's window, where the
   * person authorises it (2A). Not running, or the web client: it waits in
   * Damgar, said.
   */
  async askDamgar(a) {
    const r = await this.moneyDraft({ what: "pay", ...a });
    const d = this.opts.damgar;
    if (!d || !r.draft) return { lines: r.lines };
    try {
      const { me } = await this.ctx();
      const woken = await d.wake({ identity: me.id, draft: r.draft });
      return { lines: [{ text: "Damgar found the payment on MOR: authorise it in Damgar\u2019s panel, here.", tone: "ok" }], woken };
    } catch (e3) {
      return { lines: [...r.lines, { text: message6(e3), tone: "warn" }] };
    }
  }
  /** Where Damgar's panel stands (2A): waiting, signed, declined or expired. */
  async damgarAnswer(request2) {
    if (!this.opts.damgar) return { answer: "expired", lines: [] };
    const r = await this.opts.damgar.answer(request2);
    return { answer: r.answer, lines: r.lines.map((l) => ({ text: l.text, tone: l.tone === "warn" ? "warn" : l.tone === "ok" ? "ok" : void 0 })) };
  }
  /** Pay an identity now, under the lane (from its profile): the invoice request signed with the lane's key. */
  payNow(a) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      await this.money.lanes(me, s, hints);
      const payee = readId(a.signer);
      if (payee === me.id) throw new Error("That is this identity itself. Nothing was signed.");
      const whatFor = a.whatFor.trim() ? compose(a.whatFor.trim()).text.slice(0, 280) : null;
      const r = await this.money.engine.payUnderLane({ payee, amount: { unit: a.unit, value: readValue(a.value) }, whatFor });
      return { lines: r.lines.map((l) => ({ text: l.text, tone: "ok" })) };
    });
  }
  /**
   * The third way, by hand: the payment as a draft of the money messages
   * cMIP (section 2.1), written out to copy into Damgar. Nothing is signed or
   * sent from here. Damgar's "paste an act to sign" is its own round's.
   */
  byHand(a) {
    return this.serial(async () => {
      const { me, p } = await this.ctx();
      const other = readId(a.signer);
      if (other === me.id) throw new Error("That is this identity itself. Nothing was prepared.");
      if (!UNITS_MODULES.some((m) => m.units.some((u2) => u2.hash === a.unit))) throw new Error("Choose a unit. Nothing was prepared.");
      const amount = { unit: a.unit, value: readValue(a.value) };
      const d = { what: "pay", other, amount, whatFor: a.whatFor.trim() ? compose(a.whatFor.trim()).text.slice(0, 280) : null, app: "Dub", anchor: null };
      return {
        lines: [{ text: "Shown, not signed and not sent: copy it into Damgar, which reads it to you and signs it there." }],
        hand: {
          text: base64(draftPayload(d)),
          said: [`To ${this.nameOf(other, me.id, p)} (${idForm(other)})`, `Amount: ${say(amount, /* @__PURE__ */ new Set([amount.unit]))}`, ...d.whatFor ? [`What for: ${d.whatFor}`] : [], "From: this identity, paid in your own wallet"]
        }
      };
    });
  }
  // ------------------------------------------------------------ money, prepared here and signed in Damgar (F338)
  /**
   * A tip on a post, or a request to be paid, prepared here and never
   * signed here as money (F338: "the other apps need to be able to offer to
   * create the acts without signing them"): a draft of the money messages
   * cMIP, a private act sealed to this identity itself and left at its
   * homes, where Damgar, holding the same identity, picks it up, reads it in
   * plain words, and signs or declines it. Dub signs only the draft.
   */
  moneyDraft(a) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      let other;
      try {
        other = readId(a.other);
      } catch (e3) {
        throw new Error(`${a.what === "pay" ? "Whom to tip" : "Whom to ask"}: ${message6(e3)}. Nothing was prepared.`);
      }
      if (other === me.id) throw new Error("That is this identity itself. Nothing was prepared.");
      if (!UNITS_MODULES.some((m) => m.units.some((u2) => u2.hash === a.unit))) throw new Error("Choose a unit. Nothing was prepared.");
      const value = readValue(a.value);
      const whatFor = a.whatFor?.trim() ? compose(a.whatFor.trim()).text.slice(0, 280) : null;
      let refs;
      if (a.post) {
        const d = describeAct((await followRef([readId(a.post), other], [...hints, ...this.inboxPlaces(await this.store.people(me.id))], s.via)).act);
        if (d.signer !== other) throw new Error("The post tipped is not signed by the identity tipped. Nothing was prepared.");
        refs = [[d.id, other]];
      }
      await this.current(me);
      const r = await sendDraft(me, { what: a.what, other, amount: { unit: a.unit, value }, whatFor, app: "Dub", anchor: null }, { refs, via: s.via, save: () => this.store.saveIdentity(me) });
      return {
        lines: [
          { text: `Prepared, not signed: ${a.what === "pay" ? "a tip" : "a request to be paid"}, sealed to this identity and left at its homes (${r.left.join(", ")}).`, tone: "ok" },
          { text: "Open Damgar with this identity: the draft waits there, in Waiting, to be read and signed or declined. Dub signs no money act." }
        ],
        draft: r.id
      };
    });
  }
  // ------------------------------------------------------------ where it lives (H39)
  /** Said where relays are changed: homes are the chain key's (H39). */
  static HOMES_SAY = "Its homes are named in its identity chain and change only with the chain key: in Ki\u0161ib, \u201CChange an identity\u2019s keys\u201D, from the chain key\u2019s paper.";
  /**
   * Read back new relays for this identity (H39): a new routes act
   * (Identity type 3), its outbox and inbox the relays given. Only for an
   * identity Dub made and whose routes Dub wrote (reading 5: a second writer
   * would fork its routes). Nothing is signed until `relaysPublish` with the
   * same digest.
   */
  async relaysReview(relays) {
    const { me, s } = await this.ctx();
    const r = list5(relays);
    if (!r.length) throw new Error("Give at least one relay.");
    for (const x of r) if (!/^https?:\/\//.test(x)) throw new Error(`\u201C${x}\u201D: an address starts with https:// (or http://)`);
    if (s.kind !== "made" || !me.f.routes) throw new Error("This identity was brought here, or its routes were written by another app: Dub publishes no routes for it (Dub\u2019s reading 5: a second writer would fork them). Change them in the app that made it.");
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
    if (look.routes.act !== me.f.routes.act) throw new Error("Its routes in force are not the version Dub wrote: another app changed them. Nothing to sign here.");
    const lines2 = [
      { text: `Its acts will be found at ${r.join(", ")} (its outbox), and others will leave what is for it there (its inbox).` },
      { text: `A new routes act, version ${me.f.routes.version + 1}, public, replacing version ${me.f.routes.version} (now: ${list5(look.routes.routes.flatMap((x) => x.hints)).join(", ") || "none"}). Its identity chain and its acts stay as they are.` },
      { text: "Those who follow it find its new relays through its homes; a where-it-lives form copied before still names the old ones (hints guide, never decide)." },
      { text: _Dub.HOMES_SAY }
    ];
    return { digest: await digestOf2(JSON.stringify({ me: me.id, r, act: me.f.routes.act })), lines: lines2 };
  }
  relaysPublish(relays, digest) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const r = list5(relays);
      if (!me.f.routes || await digestOf2(JSON.stringify({ me: me.id, r, act: me.f.routes.act })) !== digest) throw new Error("This is not what was read back: read it back again.");
      await this.current(me);
      const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
      if (look.routes.act !== me.f.routes.act) throw new Error("Its routes changed meanwhile, from another app. Nothing was signed.");
      const made = await this.signed(me, () => me.publishRoutes([
        { scope: null, hints: r, kind: 0 },
        { scope: null, hints: r, kind: 1 }
      ]));
      await this.store.saveSettings(me.id, { ...s, relays: r });
      for (const x of r) {
        for (const act of me.chainActs()) {
          try {
            await relayAt(x, s.via).putAct(act);
          } catch {
          }
        }
      }
      return { lines: [{ text: `New routes published (act ${made.id.slice(0, 12)}\u2026): its relays are now ${r.join(", ")}.`, tone: "ok" }] };
    });
  }
  // ------------------------------------------------------------ money under a lane, round 2 (F338, F351)
  /** Ask Damgar for a lane (sealed to oneself); nothing is paid until it is granted there. */
  laneAsk(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.current(me);
      if (!UNITS_MODULES.some((m) => m.units.some((u2) => u2.hash === a.unit))) throw new Error("Choose a unit. Nothing was asked.");
      const lines2 = await this.money.askLane(me, s, { label: a.label, cap: readValue(a.cap), total: a.total?.trim() ? readValue(a.total) : null, unit: a.unit, until: a.until, clock: a.clock.trim().toLowerCase() || null, app: this.money.engine.opts.app });
      return { lines: lines2.map((text3) => ({ text: text3, tone: "ok" })) };
    });
  }
  /** The lanes asked here, and where each stands. */
  lanes() {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      return { lanes: await this.money.lanes(me, s, hints), say: LANE_SAY };
    });
  }
  /** A tip on a post, paid now under the lane (refused, saying why, past its cap or expiry). */
  tipNow(a) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      await this.money.lanes(me, s, hints);
      const signer = readId(a.signer);
      if (signer === me.id) throw new Error("That is this identity itself. Nothing was signed.");
      const whatFor = a.whatFor?.trim() ? compose(a.whatFor.trim()).text.slice(0, 280) : "a tip";
      const lines2 = await this.money.tip({ post: readId(a.post), signer, amount: { unit: a.unit, value: readValue(a.value) }, whatFor });
      return { lines: lines2.map((text3) => ({ text: text3, tone: "ok" })) };
    });
  }
  /** Payments signed here under the lane: to pay in the wallet, or done. */
  payments() {
    return this.serial(async () => {
      await this.ctx();
      return this.money.payments();
    });
  }
  /** The proof from the wallet: checked, and the claim signed under the lane. */
  paidNow(key, proof) {
    return this.serial(async () => {
      await this.ctx();
      return { lines: (await this.money.paid(key, proof)).map((text3) => ({ text: text3, tone: "ok" })) };
    });
  }
  /** A post sealed with a price (pay-per-view), its offer, its key kept here for each buyer. */
  sell(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.current(me);
      const text3 = compose(a.text.trim()).text;
      if (!text3) throw new Error("Write the sealed text. Nothing was posted.");
      const teaser = compose((a.teaser ?? "").trim() || "A sealed post.").text;
      const referral = a.referral?.trim() ? Number(a.referral) : null;
      const r = await this.money.sell(me, s, { text: text3, teaser, price: { unit: a.unit, value: readValue(a.value) }, referral });
      return { post: r.post, lines: r.lines.map((t) => ({ text: t, tone: "ok" })) };
    });
  }
  /** Buy a sealed post under the lane, naming the repost it was found through, if any. */
  buy(a) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      await this.money.lanes(me, s, hints);
      const repost2 = a.repost && a.reposter ? { id: readId(a.repost), by: readId(a.reposter) } : null;
      const lines2 = await this.money.buy(me, [...hints, ...this.inboxPlaces(p)], s.via, { publication: readId(a.publication), seller: readId(a.seller), repost: repost2, post: a.post ? readId(a.post) : null });
      return { lines: lines2.map((text3) => ({ text: text3, tone: "ok" })) };
    });
  }
  /** Buy a vow under the lane (round 3): its claim, once paid, is published too, the sale anyone can read. */
  buyVow(a) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      await this.money.lanes(me, s, hints);
      const lines2 = await this.money.buyVow(me, [...hints, ...this.inboxPlaces(p)], s.via, { vow: readId(a.vow), seller: readId(a.seller), post: readId(a.post) });
      return { lines: lines2.map((text3) => ({ text: text3, tone: "ok" })) };
    });
  }
  /** The vows bought here, each sale as the relays read it (round 3; the Signing tab). */
  vowsBought() {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      return { vows: await this.money.vowsBought(me, [...hints, ...this.inboxPlaces(p), ...s.relays], s.via) };
    });
  }
  /** Confirm a vow bought: its sale reads confirmed (rule 13). */
  confirmVow(vow) {
    return this.serial(async () => {
      const { me, s, hints } = await this.ctx();
      await this.money.lanes(me, s, hints);
      return { lines: (await this.money.confirmVow(me, readId(vow))).map((text3) => ({ text: text3, tone: "ok" })) };
    });
  }
  /** Contest a vow bought: its sale reads contested, the promise not kept in words if given (F253). */
  contestVow(vow, promise) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.current(me);
      return { lines: (await this.money.contestVow(me, s, readId(vow), promise.trim() || null)).map((text3) => ({ text: text3, tone: "ok" })) };
    });
  }
  /** Repost a sealed post at this identity's relays, holding what it names there too. */
  repost(a) {
    return this.serial(async () => {
      const { me, s, p, hints } = await this.ctx();
      await this.current(me);
      const r = await this.money.repost(me, s, [...hints, ...this.inboxPlaces(p)], { post: readId(a.post), signer: readId(a.signer) });
      return { id: r.id, lines: r.lines.map((text3) => ({ text: text3, tone: "ok" })) };
    });
  }
  /** Keys to deliver for sales the seller's Damgar told of; keys arrived for posts bought. */
  moneyLook() {
    return this.serial(async () => {
      const { me, s, p } = await this.ctx();
      const inbox = await this.inboxOf(me.id, [.../* @__PURE__ */ new Set([...s.relays, ...me.f.homes.map((h) => h.hint)])], s.via).catch(() => this.inboxPlaces(p));
      const lines2 = [...await this.money.deliver(me, s, () => this.current(me)), ...await this.money.keysArrived(me, s, inbox)];
      return { lines: lines2.map((text3) => ({ text: text3, tone: "ok" })) };
    });
  }
  /** When the sealed list was last read, by identity (this app's memory only). */
  synced = /* @__PURE__ */ new Map();
  /**
   * The follow list sealed to the identity itself (the people cMIP, draft 2,
   * section 3): read from its homes; this app's list replaced by it, or, the
   * first time, this app's own list carried over into it (3.7); `change`
   * applied to it; and, where it changed, the next version signed, sealed to
   * the identity's own encryption key and left at its homes. Inside `serial`.
   * Where this app holds no encryption key of the identity, the list stays
   * in this app, said.
   */
  async syncFollows(me, s, p, change) {
    const homes = me.f.homes.map((h) => h.hint);
    const { open, problem: cannot } = await this.opener(me);
    const save = async () => {
      this.synced.set(me.id, now3());
      await this.store.savePeople(me.id, p);
    };
    if (!open) {
      change?.(p);
      await save();
      return [{ text: me.f.signingSecret || !this.opts.runner ? "This app holds no encryption key of this identity, so its follow list cannot be sealed to it: the list stays in this app only." : `The follow list stays in this app only, not sealed to this identity: ${cannot}`, tone: "warn" }];
    }
    const found = await readSealedList(me.id, open, homes, s.via);
    const ours = p.sealed?.version ?? 0;
    const lines2 = [];
    let base = p.follows;
    if (found.act && found.version >= ours) {
      base = found.follows.map((f) => ({ ...f }));
      if (!p.carried) {
        for (const f of p.follows) if (!base.some((x) => x.id === f.id)) base.push({ ...f });
      }
      p.sealed = { version: found.version, act: found.act, forked: found.forked };
    }
    if (found.forked) lines2.push({ text: "The follow list kept at this identity\u2019s homes was forked: two apps changed it at once. The longer branch is shown; follow again anyone missing.", tone: "warn" });
    const before = JSON.stringify(found.act ? found.follows : null);
    p.follows = base;
    change?.(p);
    const homesSilent = !found.act && found.problems.length >= homes.length;
    const needed = JSON.stringify(p.follows) !== before && !(found.act === null && !p.follows.length && !p.sealed);
    if (!needed || homesSilent) {
      if (homesSilent && needed) lines2.push({ text: `The follow list was not sealed to the homes, which did not answer (${found.problems.join("; ")}): it is kept here and sealed at the next change.`, tone: "warn" });
      if (found.act || !p.follows.length) p.carried = true;
      await save();
      return lines2;
    }
    await this.current(me);
    const look = await lookUp(me.id, homes, s.via);
    const held = me.f.encryption.find((e3) => look.encryptionKey && (e3.secret ? hex(xwingPublic(unhex(e3.secret))) : e3.public) === hex(look.encryptionKey));
    if (!held || !look.encryptionKey) {
      await save();
      return [...lines2, { text: "The encryption key this identity publishes is not one this app holds: the follow list stays in this app, not sealed.", tone: "warn" }];
    }
    const version2 = Math.max(found.version, ours) + 1;
    const previous = found.act && found.version >= ours ? found.act : p.sealed?.act ?? null;
    const made = await this.signed(me, () => me.signNow(PEOPLE_SPEC, SEALED_LIST, sealedListPayload({ version: version2, previous, follows: p.follows }), { public: false, to: [me.id] }));
    const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
    let left = 0;
    for (const h of homes) {
      try {
        await relayAt(h, s.via).putSealed(sealed);
        left++;
      } catch {
      }
    }
    await this.signed(me, () => leaveAtHomes(me, made, { via: s.via, sealed: left > 0 }));
    p.sealed = { version: version2, act: made.id };
    p.carried = true;
    await save();
    lines2.push(
      left ? { text: `The follow list, with the names you gave, is sealed to this identity and kept at its homes (version ${version2}): any app holding this identity reads it; nobody else can.`, tone: "ok" } : { text: "No home took the sealed follow list: it is kept here, and sealed again at the next change.", tone: "warn" }
    );
    return lines2;
  }
  /** Read the sealed follow list again, outside a change (for the feed): at most once a minute, or now when `fresh` (Look again). */
  async refreshFollows(fresh) {
    const active = await this.store.active();
    if (!active || !fresh && (this.synced.get(active) ?? 0) + 60 > now3()) return { notes: [], changed: false };
    try {
      return await this.serial(async () => {
        const { me, s, p } = await this.ctx();
        const was = JSON.stringify(p.follows);
        const notes = (await this.syncFollows(me, s, p)).filter((l) => l.tone === "warn" || l.tone === "ok").map((l) => l.text);
        return { notes, changed: JSON.stringify(p.follows) !== was };
      });
    } catch (e3) {
      return { notes: [`The follow list kept at this identity\u2019s homes could not be read: ${message6(e3)}`], changed: false };
    }
  }
  /** Follow an identity, by its ID or the signer of an act shown; a name for it, if given, stays in this app. */
  follow(a) {
    const { id, hints } = readIdWhere(a.id);
    const name = a.name?.trim() ? a.name.trim().slice(0, 64) : null;
    return this.people((p, me) => {
      if (id === me.id) throw new Error("That is this identity itself: its own posts are always in its feed.");
      if (hints.length) (p.where ??= {})[id] = [.../* @__PURE__ */ new Set([...p.where?.[id] ?? [], ...hints])];
      const f = p.follows.find((x) => x.id === id);
      if (f) f.name = name ?? f.name;
      else p.follows.push({ id, name });
    });
  }
  unfollow(id) {
    return this.people((p) => {
      p.follows = p.follows.filter((x) => x.id !== id);
    });
  }
  /** Your own name for an identity you follow: in this app only, never published. */
  callIt(a) {
    return this.people((p) => {
      const f = p.follows.find((x) => x.id === a.id);
      if (!f) throw new Error("Follow it first.");
      f.name = a.name.trim() ? a.name.trim().slice(0, 64) : null;
    });
  }
  /** Mute an identity: nothing of it is shown here. Never published, never told. */
  async mute(id) {
    const x = readId(id);
    return this.serial(async () => {
      const { me, p } = await this.ctx();
      if (x === me.id) throw new Error("That is this identity itself.");
      if (!p.muted.includes(x)) p.muted.push(x);
      await this.store.savePeople(me.id, p);
      return { lines: [] };
    });
  }
  async unmute(id) {
    return this.serial(async () => {
      const { me, p } = await this.ctx();
      p.muted = p.muted.filter((m) => m !== id);
      await this.store.savePeople(me.id, p);
      return { lines: [] };
    });
  }
  /**
   * The follow list's option (the people cMIP, 1.3): private (the default)
   * or published. Published is chosen only with the warning shown, word for
   * word (3.5); back to private publishes one last, empty, withdrawn version
   * (3.4).
   */
  listOption(a) {
    return this.serial(async () => {
      const { me, s, p } = await this.ctx();
      if (a.published === (p.list === "published")) return { lines: [] };
      if (a.published && a.shown !== PUBLISH_WARNING) throw new Error("The follow list is published only once its warning was shown. Nothing was signed.");
      const lines2 = await this.publishList(me, s, p, !a.published);
      p.list = a.published ? "published" : "private";
      await this.store.savePeople(me.id, p);
      return { lines: lines2 };
    });
  }
  async publishList(me, s, p, withdrawn) {
    await this.current(me);
    let last = p.published;
    try {
      const found = await readFollowList(me.id, s.relays, s.via);
      if (found.act && found.version >= (last?.version ?? 0)) last = { version: found.version, act: found.act };
    } catch {
    }
    const version2 = (last?.version ?? 0) + 1;
    const payload = followListPayload({ version: version2, previous: last?.act ?? null, ids: p.follows.map((f) => f.id), withdrawn });
    const made = await this.signed(me, async () => me.publish(PEOPLE_SPEC, FOLLOW_LIST, payload, { public: true, relays: s.relays }));
    p.published = { version: version2, act: made.id };
    await this.store.savePeople(me.id, p);
    return [
      withdrawn ? { text: `The follow list is private again: a last, empty version (${version2}) says so. What was published stays published.`, tone: "warn" } : { text: `The follow list is published (version ${version2}): ${p.follows.length} identit${p.follows.length === 1 ? "y" : "ies"}, by ID only. The names you gave them stay here.`, tone: "ok" }
    ];
  }
  // ------------------------------------------------------------ pictures
  /** Withdraw a picture this identity published (Envelopes, "Withdrawal"): readers stop showing it; the post stands. */
  withdraw(publication) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      if (!/^[0-9a-f]{64}$/.test(publication)) throw new Error("not a publication id");
      let act = null;
      for (const r of s.relays) {
        try {
          act = await relayAt(r, s.via).getAct(publication);
          if (act) break;
        } catch {
        }
      }
      if (!act) throw new Error("That picture was not found at the relays.");
      if (describeAct(act).signer !== me.id) throw new Error("That picture was published by another identity: only its signer can withdraw it.");
      await this.current(me);
      return this.signed(me, () => withdraw(me, publication, s.relays));
    });
  }
};
var RELAY_DEFAULT = ["text", "envelopes"];
function layerOf(d) {
  if (d.spec === POST_SPECS.text) return "text";
  if (d.spec === SPECS.envelopes) return "envelopes";
  if (d.spec === SPECS.identity) return "identity";
  if (d.spec === MIRS.agreements) return "agreements";
  if (d.spec === MIRS.money) return "money";
  if (d.spec === MIRS.development) return "development";
  return "other";
}
function whatAct(d) {
  if (d.spec === SPECS.identity) {
    if (d.type === IDENTITY_TYPES.genesis) return "A new identity (its genesis)";
    if (d.type === IDENTITY_TYPES.rotation) return "A change of keys (a rotation)";
    if (d.type === IDENTITY_TYPES.routes) return "Where its acts and inbox are (its routes)";
    if (d.type === IDENTITY_TYPES.witness) return "A witness act: it relies on another act";
    if (d.type === NAME) return "A display name";
    if (d.type === NAME_WITHDRAWAL) return "A display name withdrawn";
    return "An Identity act";
  }
  if (d.spec === SPECS.envelopes) {
    if (d.type === PUBLICATION) return "A publication (a picture or a file)";
    if (d.type === WITHDRAWAL) return "A publication withdrawn";
    if (d.type === 4) return "Its encryption key";
    return "An Envelopes act";
  }
  if (d.spec === POST_SPECS.text) return "A text act";
  if (d.spec === MIRS.agreements) return "An Agreements act (an agreement, a signature, or talk about one)";
  if (d.spec === MIRS.money) return "A Money act";
  if (d.spec === MIRS.development) return "A Development act";
  if (d.spec === PEOPLE_SPEC || d.spec === PEOPLE_SPEC_1) return d.type === FOLLOW_LIST ? "A published follow list" : "A people act";
  return "An act of another specification";
}
function shortId(id) {
  const f = shownId(id);
  return f.length > 16 ? `${f.slice(0, 8)}\u2026${f.slice(-3)}` : f;
}
function shortAct(id) {
  const f = shownAct(id);
  return f.length > 16 ? `${f.slice(0, 8)}\u2026${f.slice(-3)}` : f;
}
function hostOf(hint) {
  try {
    return new URL(hint).host;
  } catch {
    return hint;
  }
}
function timeWords(t) {
  const d = new Date(t * 1e3);
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()];
  return `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}, ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
}
function titleOf(text3) {
  const first = text3.split("\n").find((l) => l.trim()) ?? "";
  return first.replace(/^#+\s*/, "").trim().slice(0, 120) || "A document";
}
function snippet(text3) {
  const one2 = text3.replace(/\s+/g, " ").trim();
  return one2.length > 80 ? `${one2.slice(0, 79)}\u2026` : one2;
}
async function digestOf2(x) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(x));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// src/ops.ts
var text2 = (v) => typeof v === "string" ? v : "";
var list6 = (v) => Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : [];
var untilOf = (v) => {
  if (v === void 0 || v === null || v === "") return null;
  if (typeof v === "number") return Math.floor(v);
  const t = Date.parse(String(v));
  if (Number.isNaN(t)) throw new Error("Until: a date and time, or nothing.");
  return Math.floor(t / 1e3);
};
var payKind = (v) => v === "tip" || v === "buy" || v === "vow" || v === "pay" ? v : "pay";
async function run(dub2, op, a, p) {
  switch (op) {
    case "state":
      return dub2.state();
    case "begin":
      return dub2.begin({ homes: list6(a.homes), relays: list6(a.relays), via: p.via(a.via), name: text2(a.name) });
    case "confirm":
      return dub2.confirm(list6(a.typed));
    case "abandon":
      await dub2.abandon();
      return {};
    case "bring":
      return dub2.bring({ id: text2(a.id), words: text2(a.words), address: text2(a.address), relays: list6(a.relays), via: p.via(a.via) });
    case "renew":
      return dub2.renew(text2(a.words));
    case "use":
      await dub2.use(text2(a.id));
      return {};
    case "leave":
      await dub2.leave();
      return {};
    case "relay":
      return dub2.relay(30, Array.isArray(a.layers) ? list6(a.layers) : void 0);
    case "forget":
      await dub2.forget(text2(a.id));
      return {};
    // An identity used through Kišib's runner (the Dubsar runner cMIP): the computer's program only, never the web client.
    case "runner":
      return dub2.runnerState();
    case "runner pair":
      return dub2.runnerPair();
    case "runner take":
      return dub2.runnerTake({ id: text2(a.id) });
    case "runner asking":
      return dub2.runnerAsking();
    case "runner drop":
      await dub2.runnerDrop({ request: text2(a.request) });
      return {};
    case "runner unpair":
      await dub2.runnerUnpair();
      return {};
    case "carry":
      return dub2.carry();
    case "check":
      return dub2.check();
    case "name":
      return dub2.setName(text2(a.name));
    case "post": {
      const reply = a.reply && typeof a.reply === "object" ? a.reply : null;
      return dub2.post({
        text: text2(a.text),
        jpeg: text2(a.jpeg) ? p.bytes(text2(a.jpeg)) : void 0,
        mp4: text2(a.mp4) ? p.bytes(text2(a.mp4)) : void 0,
        to: Array.isArray(a.to) ? list6(a.to) : text2(a.to),
        reply: reply ? { id: text2(reply.id), signer: text2(reply.signer) } : void 0
      });
    }
    case "feed":
      return dub2.feed(a.fresh === true);
    case "inbox":
      return dub2.inbox();
    case "message":
      return dub2.message({ to: text2(a.to), text: text2(a.text), cc: list6(a.cc), collective: text2(a.collective) || null });
    case "seen":
      await dub2.seen(list6(a.keys));
      return {};
    case "follow":
      return dub2.follow({ id: text2(a.id), name: text2(a.name) });
    case "unfollow":
      return dub2.unfollow(text2(a.id));
    case "call":
      return dub2.callIt({ id: text2(a.id), name: text2(a.name) });
    case "mute":
      return dub2.mute(text2(a.id));
    case "unmute":
      return dub2.unmute(text2(a.id));
    case "list":
      return dub2.listOption({ published: a.published === true, shown: text2(a.shown) });
    case "withdraw":
      return dub2.withdraw(text2(a.publication));
    case "signing":
      return dub2.setSigning(a.on === true);
    case "proposals":
      return dub2.proposals();
    case "accept":
      return dub2.signProposal(text2(a.thread));
    case "decline":
      return dub2.declineProposal(text2(a.thread), text2(a.why));
    case "leave read":
      return dub2.leaveRead(text2(a.thread));
    case "leave collective":
      return dub2.leaveCollective(text2(a.thread), text2(a.digest));
    case "share":
      return dub2.shareShow(text2(a.thread));
    case "shareback":
      return dub2.shareConfirm(text2(a.thread), list6(a.typed));
    case "sharehand":
      return dub2.shareByHand(text2(a.thread));
    case "tip":
      return dub2.moneyDraft({ what: "pay", other: text2(a.signer), post: text2(a.post), value: text2(a.value), unit: text2(a.unit), whatFor: text2(a.whatFor) });
    case "relays review":
      return dub2.relaysReview(list6(a.relays));
    case "relays publish":
      return dub2.relaysPublish(list6(a.relays), text2(a.digest));
    case "lane ask":
      return dub2.laneAsk({ label: text2(a.label), cap: text2(a.cap), total: text2(a.total), unit: text2(a.unit), until: untilOf(a.until), clock: text2(a.clock) });
    case "lanes":
      return dub2.lanes();
    case "tip now":
      return dub2.tipNow({ post: text2(a.post), signer: text2(a.signer), value: text2(a.value), unit: text2(a.unit), whatFor: text2(a.whatFor) });
    case "payments":
      return dub2.payments();
    case "paid":
      return dub2.paidNow(text2(a.key), text2(a.proof));
    case "sell":
      return dub2.sell({ text: text2(a.text), teaser: text2(a.teaser), value: text2(a.value), unit: text2(a.unit), referral: text2(a.referral) });
    case "buy":
      return dub2.buy({ publication: text2(a.publication), seller: text2(a.seller), post: text2(a.post) || void 0, repost: text2(a.repost) || void 0, reposter: text2(a.reposter) || void 0 });
    case "vow buy":
      return dub2.buyVow({ vow: text2(a.vow), seller: text2(a.seller), post: text2(a.post) });
    case "vows bought":
      return dub2.vowsBought();
    case "vow confirm":
      return dub2.confirmVow(text2(a.vow));
    case "vow contest":
      return dub2.contestVow(text2(a.vow), text2(a.promise));
    case "repost":
      return dub2.repost({ post: text2(a.post), signer: text2(a.signer) });
    case "money look":
      return dub2.moneyLook();
    case "ask paid":
      return dub2.moneyDraft({ what: "ask", other: text2(a.to), value: text2(a.value), unit: text2(a.unit), whatFor: text2(a.whatFor) });
    case "open":
      return dub2.open({ id: text2(a.id), signer: text2(a.signer) || void 0 });
    case "why":
      return dub2.why({ id: text2(a.id), signer: text2(a.signer) || void 0 });
    case "profile":
      return dub2.profile({ id: text2(a.id) });
    case "rely read":
      return dub2.relyRead({ id: text2(a.id), signer: text2(a.signer) || void 0 });
    case "rely":
      return dub2.rely({ id: text2(a.id), signer: text2(a.signer) || void 0, typed: text2(a.typed) });
    case "anchor offers":
      return dub2.anchorOffers({ service: text2(a.service) });
    case "anchor":
      return dub2.anchor({ id: text2(a.id), service: text2(a.service), offer: text2(a.offer), tier: Number(a.tier) });
    case "correct":
      return dub2.correct({ id: text2(a.id), text: text2(a.text) });
    case "film":
      return dub2.film({ publication: text2(a.publication), signer: text2(a.signer) || void 0 });
    case "clock":
      return dub2.setClock({ id: text2(a.id), name: text2(a.name) });
    case "collective add":
      return dub2.collectiveAdd({ id: text2(a.id) });
    case "collective remove":
      return dub2.collectiveRemove({ id: text2(a.id) });
    case "act as":
      return dub2.actAs({ id: text2(a.id) || null });
    case "purchases":
      return dub2.purchases();
    case "damgar answer":
      return dub2.damgarAnswer(text2(a.request));
    case "pay ways":
      return dub2.payWays({ kind: payKind(a.kind) });
    case "pay":
      return dub2.pay({
        how: a.how === "lane" || a.how === "damgar" || a.how === "hand" ? a.how : (() => {
          throw new Error("Choose a way to pay.");
        })(),
        kind: payKind(a.kind),
        signer: text2(a.signer),
        post: text2(a.post) || void 0,
        publication: text2(a.publication) || void 0,
        vow: text2(a.vow) || void 0,
        repost: text2(a.repost) || void 0,
        reposter: text2(a.reposter) || void 0,
        value: text2(a.value),
        unit: text2(a.unit),
        whatFor: text2(a.whatFor)
      });
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
var KIT_STYLE = `@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(inter_light.woff2) format("woff2")}
@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(inter_regular.woff2) format("woff2")}
:root{color-scheme:dark;--k-bg:#06080c;--k-raise:#0d1017;--k-raise2:#131720;--k-pop:#0f131a;--k-line:#232a35;--k-edge:#323a47;--k-text:#d6dae1;--k-soft:#8a919d;--k-faint:#4f5663;--k-ink:#0a0c10;--k-bad:#c4645f;--k-id:#9aa8b8;--k-c:#e9dfcd;--k-p:#efe8dc;--k-wash:rgba(239,232,220,.06);--k-wash2:rgba(239,232,220,.13)}
${tints}
.k-page,.k-page *{box-sizing:border-box}
html:has(.k-page),body:has(.k-page){margin:0;height:100%;background:var(--k-bg);color:var(--k-text);overflow:hidden}
.k-page{font:300 15px/1.5 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:var(--k-text);background:var(--k-bg);position:relative;display:flex;flex-direction:column;height:100vh;height:100dvh;max-width:none;margin:0;padding:0}
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
.k-mono,:where(.k-page) code{font:12.5px/1.4 ui-monospace,"SF Mono",Menlo,monospace}
.k-soft{color:var(--k-soft)}.k-faint{color:var(--k-faint)}.k-small{font-size:13px}
.k-grow{flex:1}
.k-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0}
.k-bad{color:var(--k-bad)}
.k-offscreen{position:fixed;left:-9999px;top:0;opacity:0}

/* the top of every window: the app (or Contacts) left, a switch or tabs in the middle, the identity right */
.k-top{display:flex;align-items:center;gap:14px;height:56px;padding:0 20px;border-bottom:1px solid var(--k-line);flex:none;position:relative;z-index:5;background:var(--k-bg)}
.k-app{display:flex;align-items:center;gap:10px;font-size:16px;letter-spacing:.04em}
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
.k-me .k-s{font:11.5px ui-monospace,Menlo,monospace;color:var(--k-faint);white-space:nowrap}
.k-dot{width:26px;height:26px;border-radius:50%;background:var(--k-p);color:var(--k-ink);display:grid;place-items:center;font-size:12px;font-weight:400;flex:none}
.k-dot.k-c{border-radius:7px}
.k-dot.k-alt{background:var(--k-raise2);color:var(--k-text);border:1px solid var(--k-edge)}
.k-body{flex:1;min-height:0;display:flex;position:relative}
.k-tabs{display:flex;gap:4px}
.k-tab{padding:6px 14px;border-radius:999px;color:var(--k-soft);font-size:14px;display:flex;align-items:center;gap:8px}
.k-tab.k-on{background:var(--k-p);color:var(--k-ink);font-weight:400}

/* tiles: big, an icon and words, danger marks; the edge thickens with the level; never red but for an alarm */
.k-home{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:18px;padding:24px 28px 12px}
.k-tile{position:relative;border-radius:22px;background:linear-gradient(160deg,var(--k-wash2),var(--k-wash) 55%,rgba(255,255,255,.015));border:1px solid var(--k-line);padding:26px 28px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;text-align:left}
.k-tile:hover,.k-tile:focus-visible{outline:1px solid var(--k-p);outline-offset:-1px}
.k-tile .k-ic{position:absolute;left:26px;top:24px;width:58px;height:58px;color:var(--k-p)}
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
.k-act .k-sid,.k-act .k-actid{font:12px ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-id)}
.k-act .k-nm{font-size:15px;font-weight:400;color:var(--k-text)}
.k-act .k-dn{font-size:12.5px;color:var(--k-soft)}
.k-act .k-of{font-size:12.5px;color:var(--k-soft);border:1px solid var(--k-edge);border-radius:999px;padding:0 8px}
.k-act .k-when{float:right;font-size:12px;color:var(--k-faint)}
.k-act .k-txt{margin:4px 0 6px;font-size:15px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.k-act .k-label{font-size:12.5px;color:var(--k-soft);margin:2px 0}
.k-act .k-label.k-warn{color:var(--k-c)}
.k-act .k-kind{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--k-soft);border:1px solid var(--k-line);border-radius:5px;padding:1px 6px;margin-right:6px}
.k-act .k-foot{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--k-faint);flex-wrap:wrap}
.k-act .k-actid{margin-left:auto;padding:2px 0 2px 8px;border-radius:8px}
.k-act .k-v{color:var(--k-p);font-size:12px}
.k-act .k-alarmline{color:var(--k-bad);font-size:12.5px}
.k-act .k-signer.k-open,.k-act .k-actid.k-open{background:var(--k-wash2);outline:1px solid var(--k-p)}
.k-act.k-sel{background:var(--k-wash);border-radius:12px;padding-left:10px;padding-right:10px;border-bottom-color:transparent}
.k-act figure{margin:8px 0 4px}
.k-act img,.k-act video{display:block;max-width:100%;max-height:60vh;height:auto;border-radius:12px;image-orientation:from-image}
.k-act .k-doc{display:block;border:1px solid var(--k-line);border-radius:10px;padding:8px 12px;margin:6px 0;font-size:14px;text-decoration:none}
.k-act .k-box{border:1px solid var(--k-line);border-radius:10px;padding:8px 12px;margin:6px 0}

/* menus: what you take above a line, what changes something below */
.k-pop{position:fixed;z-index:40;min-width:236px;max-width:min(320px,calc(100vw - 16px));max-height:calc(100vh - 16px);overflow:auto;background:var(--k-pop);border:1px solid var(--k-edge);border-radius:14px;padding:6px;box-shadow:0 16px 40px rgba(0,0,0,.6)}
.k-pop .k-t{font:11.5px ui-monospace,Menlo,monospace;color:var(--k-faint);padding:6px 10px 4px;overflow-wrap:anywhere}
.k-pop button{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;font-size:14px;color:var(--k-text);width:100%;text-align:left}
.k-pop button:hover,.k-pop button:focus-visible{background:var(--k-wash);outline:none}
.k-pop button:disabled{color:var(--k-faint);opacity:1}
.k-pop button .k-k{margin-left:auto;font-size:11.5px;color:var(--k-faint)}
.k-pop hr{border:0;border-top:1px solid var(--k-edge);margin:5px 4px}
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
.k-idrow{display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;width:100%;text-align:left}
.k-idrow.k-on{background:var(--k-wash2)}
.k-idrow .k-n{font-size:14.5px}
.k-idrow .k-s{font:11.5px ui-monospace,Menlo,monospace;color:var(--k-faint)}
.k-idrow .k-tagc{font-size:11px;color:var(--k-soft);border:1px solid var(--k-line);border-radius:999px;padding:0 7px;margin-left:4px}
.k-idrow.k-sub{margin-left:26px;width:calc(100% - 26px)}
.k-idline{display:flex;align-items:center;gap:4px}
.k-idline>.k-idrow{flex:1;min-width:0}
.k-more{color:var(--k-soft);width:28px;height:28px;border-radius:8px;display:grid;place-items:center;border:1px solid var(--k-line);flex:none}
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
.k-say .k-more-text{margin:6px 0 2px;color:var(--k-soft);font-size:13px;max-width:48em}
.k-say .k-more-text p{margin:4px 0}
.k-alarmbox{border:1px solid var(--k-bad);border-radius:12px;padding:10px 12px;margin:8px 0;color:var(--k-text);font-size:14px}

/* notes the app says: done, error */
.k-note{margin:8px 0;padding:8px 12px;border-left:2px solid var(--k-line);font-size:14px;color:var(--k-soft)}
.k-note.k-done{border-left-color:var(--k-p);color:var(--k-text)}
.k-note.k-error{border-left-color:var(--k-bad);color:var(--k-text)}
.k-note ul{margin:4px 0 0;padding-left:1.1em}
.k-note li.k-bad,.k-note li.bad{color:var(--k-bad)}
.k-status{position:fixed;z-index:45;left:50%;top:64px;transform:translateX(-50%);width:min(560px,calc(100% - 24px));max-height:40vh;overflow:auto;background:var(--k-pop);border:1px solid var(--k-edge);border-radius:14px;box-shadow:0 16px 40px rgba(0,0,0,.6)}
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
.k-words{display:grid;grid-template-columns:repeat(4,1fr);gap:6px 16px;padding:14px 18px;border:1px solid var(--k-edge);border-radius:14px;font:14.5px ui-monospace,Menlo,monospace;margin:10px 0;background:var(--k-raise)}
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
  .k-home{grid-template-columns:1fr;grid-template-rows:repeat(4,1fr);gap:10px;padding:12px}
  .k-tile{padding:16px 18px;border-radius:18px}
  .k-tile .k-ic{width:40px;height:40px;left:18px;top:16px}
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
  .k-act .k-when{display:none}
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
function card(a, o = {}) {
  const s = a.signer;
  const name = s.name ?? (s.collective ? "a collective" : "");
  const signer = `<button type="button" class="k-signer" data-k-menu="signer" aria-haspopup="menu"><span class="k-sid">${e(shortForm(s.form))}</span>${name ? `<span class="k-nm" dir="auto">${e(name)}</span>` : ""}${s.ownName && s.ownName !== s.name ? `<span class="k-dn" dir="auto">\u201C${e(s.ownName)}\u201D</span>` : ""}${a.of ? `<span class="k-of" dir="auto">of ${e(a.of)}</span>` : ""}${s.me ? '<span class="k-dn">you</span>' : ""}</button>`;
  const labels = (a.labels ?? []).map((l) => `<div class="k-label${l.tone === "bad" ? " k-bad" : l.tone === "warn" ? " k-warn" : ""}">${e(l.text)}</div>`).join("");
  const kind = a.kind ? `<span class="k-kind">${e(a.kind)}</span>` : "";
  const text3 = a.text || kind ? `<div class="k-txt" dir="auto">${kind}${e(a.text ?? "")}</div>` : "";
  const foot = `<div class="k-foot">${a.verified && !a.alarm ? '<span class="k-v" title="verified">\u2713</span>' : ""}${a.alarm ? `<span class="k-alarmline">${e(a.alarm)}</span>` : ""}<button type="button" class="k-actid" data-k-menu="act" aria-haspopup="menu">${e(shortForm(a.form))}</button></div>`;
  return `<article class="k-act${o.selected ? " k-sel" : ""}" data-k-act="${e(a.id)}" data-k-signer="${e(s.id)}">${a.when ? `<span class="k-when">${e(a.when)}</span>` : ""}${signer}${labels}${text3}${a.html ?? ""}${foot}</article>`;
}
function signerMenu(app2, w, own) {
  const below = w.me ? own : [w.followed ? { key: "unfollow", label: "Following: remove from contacts" } : { key: "follow", label: "Follow: add to contacts" }, ...own, w.muted ? { key: "unmute", label: "Unmute" } : { key: "mute", label: "Mute" }];
  return menu(`${w.name ? `${w.name} \xB7 ` : ""}${shortForm(w.form)}`, [
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
function menu(title2, take, app2, below) {
  const item = (m) => `${m.line ? "<hr>" : ""}<button type="button" role="menuitem" data-k-item="${e(m.key)}"${m.disabled ? " disabled" : ""}>${e(m.label)}${m.hint ? `<span class="k-k">${e(m.hint)}</span>` : ""}</button>`;
  return `<div class="k-pop" role="menu"><div class="k-t">${e(title2)}</div>${take.map(item).join("")}${below.length ? `<hr><div class="k-own">${e(app2)}\u2019s own</div>${below.map(item).join("")}` : ""}</div>`;
}
function top(o) {
  return `<header class="k-top">${o.left}<span class="k-grow"></span>${o.center ?? ""}<span class="k-grow"></span>${o.right}</header>`;
}
function appMark(name, icon) {
  return `<div class="k-app">${icon ? `<img src="${e(icon)}" alt="">` : ""}<span class="k-nm">${e(name)}</span></div>`;
}
function switcher(parts, on) {
  return `<nav class="k-switch" aria-label="Views">${parts.map((p) => `<button type="button" data-k-part="${e(p.key)}" class="${p.key === on ? "k-on" : ""}"${p.key === on ? ' aria-current="page"' : ""}>${e(p.label)}<span class="k-count" data-k-count="${e(p.key)}"></span></button>`).join("")}</nav>`;
}
function meButton(o) {
  const shown = o.as ?? o;
  return `<button type="button" class="k-me" data-k-open="identity" aria-haspopup="dialog" title="Identities"><span class="k-n">${e(shown.name ?? "No name")}</span><span class="k-s">${e(shortForm(shown.form))}</span>${o.as ? `<span class="k-dot k-c k-alt">${e(initial(o.as.name, o.as.form))}</span>` : ""}<span class="k-dot">${e(initial(o.name, o.form))}</span></button>`;
}
function contactsButton(label = "Contacts") {
  return `<button type="button" class="k-menu-btn" data-k-open="contacts" aria-haspopup="dialog"><span aria-hidden="true">\u2630</span><span class="k-l">${e(label)}</span></button>`;
}
function lenses(ls, on, name = "lens") {
  return `<div class="k-controls" role="tablist">${ls.map((l) => `<button type="button" role="tab" class="k-lens${l.key === on ? " k-on" : ""}" data-k-${name}="${e(l.key)}" aria-selected="${l.key === on}">${e(l.label)}<span class="k-count" data-k-count="${e(l.key)}"></span></button>`).join("")}</div>`;
}
function pointRow(label, chips, name = "point") {
  return `<div class="k-point"><span class="k-lbl">${e(label)}</span>${chips.map((c) => `<button type="button" class="k-chip${c.on ? " k-on" : ""}" data-k-${name}="${e(c.key)}" aria-pressed="${!!c.on}">${e(c.label)}</button>`).join("")}</div>`;
}
function feedBox(o) {
  return `${o.above ?? ""}<div class="k-feedwrap"><div class="k-feed" id="${e(o.id)}" tabindex="0">${o.cards || `<p class="k-empty">${e(o.empty ?? "Nothing yet.")}</p>`}</div>${o.below ?? ""}</div>`;
}
function clockLine(c) {
  if (!c) return `<p class="k-clock">Ordered by each signer\u2019s own sequence: no clock is named, so this is not a time.</p>`;
  if (!c.placed) return `<p class="k-clock">No act shown here was stamped by ${e(c.name)}\u2019s clock: in each signer\u2019s own sequence, not a time.</p>`;
  return `<p class="k-clock">Ordered by ${e(c.name)}\u2019s clock: its word on when it held each act${c.placed < c.shown ? `; ${c.shown - c.placed} not stamped, kept in their signer\u2019s own order` : ""}.</p>`;
}
function typingBox(o) {
  return `<form class="k-typing" id="${e(o.id)}" autocomplete="off">${o.opts ? `<div class="k-opts">${o.opts}</div>` : ""}${o.extra ?? ""}<div class="k-line"><textarea name="${e(o.name ?? "text")}" rows="1" placeholder="${e(o.placeholder)}" autocomplete="off" autocapitalize="sentences" spellcheck="true"></textarea><div class="k-tools">${o.tools ?? ""}<button type="submit" class="k-btn k-p">${e(o.button)}</button></div></div></form>`;
}
function say2(line, more) {
  const rest = Array.isArray(more) ? more.map((m) => `<p>${e(m)}</p>`).join("") : more;
  return `<details class="k-say"><summary>${e(line)}<span class="k-help" aria-label="more">?</span></summary><div class="k-more-text">${rest}</div></details>`;
}
var note = (kind, html) => `<div class="k-note${kind ? ` k-${kind}` : ""}" role="status">${html}</div>`;
function profile(p) {
  const w = p.who;
  const name = w.name ?? w.ownName ?? shortForm(w.form);
  return `<div class="k-prof" data-k-profile="${e(w.id)}"><div class="k-row"><button type="button" class="k-btn k-q" data-k-back="profile">\u2190 Back</button></div>
<div class="k-hero"><span class="k-dot${w.collective ? " k-c" : ""}">${e(initial(name, w.form))}</span><div class="k-grow"><h2 dir="auto">${e(name)}</h2>${w.ownName && w.ownName !== name ? `<div class="k-own-name" dir="auto">calls itself \u201C${e(w.ownName)}\u201D</div>` : ""}<p class="k-soft">${e(p.lives)}</p><span class="k-mono k-soft">${e(shortForm(w.form))}</span> <button type="button" class="k-btn k-q k-small" data-k-copy="${e(w.link)}">Copy ID link</button></div>
<div class="k-row">${p.actions.map((a) => `<button type="button" class="k-btn${a.primary ? " k-p" : ""}" data-k-do="${e(a.key)}">${e(a.label)}</button>`).join("")}</div></div>
${p.trouble ? `<div class="k-alarmbox">${e(p.trouble)}</div>` : ""}
${feedBox({ id: "k-profile-feed", cards: p.cards, empty: p.empty ?? "Nothing found from them yet." })}${p.clock ?? ""}
<p class="k-small k-soft">Full record in Ki\u0161ib${p.record ? ` <span class="k-faint">\xB7 ${e(p.record)}</span>` : ""}</p></div>`;
}
function identityPanel(o) {
  const row = (x, sub, owner, why) => `<div class="k-idline"><button type="button" class="k-idrow${x.on ? " k-on" : ""}${sub ? " k-sub" : ""}" data-k-use="${e(x.id)}"${sub ? ` data-k-under="${e(owner)}"` : ""}${x.on ? ' aria-current="true"' : ""}${why ? " disabled" : ""}><span class="k-dot${sub ? " k-c" : ""}${x.on ? "" : " k-alt"}">${e(initial(x.name, x.form))}</span><span><span class="k-n" dir="auto">${e(x.name ?? "No name")}${sub ? '<span class="k-tagc">collective</span>' : ""}</span><br><span class="k-s">${e(shortForm(x.form))}</span>${why ? `<br><span class="k-small k-faint">${e(why)}</span>` : ""}</span></button>${sub ? "" : `<button type="button" class="k-more" data-k-idmenu="${e(x.id)}" aria-haspopup="menu" title="Its menu">\u22EF</button>`}</div>`;
  const ids = o.ids.map((x) => row(x, false, x.id) + x.collectives.map((c) => row(c, true, x.id, c.why)).join("")).join("");
  const add = `<button type="button" class="k-idrow${o.adding ? " k-on" : ""}" data-k-add="toggle"><span class="k-soft">+ Add</span></button>${o.adding ? `<div class="k-pane-in">${o.add.map((a) => `<button type="button" class="k-idrow" data-k-add="${e(a.key)}"${a.empty ? " disabled" : ""}><span><span class="k-n">${e(a.label)}</span><br><span class="k-small k-soft">${e(a.say)}</span></span></button>`).join("")}</div>` : ""}`;
  return `<div class="k-panel" role="dialog" aria-label="Identities" data-k-panel="identity">${ids || '<p class="k-small k-soft">No identity here yet.</p>'}${add}<div class="k-sepline"></div><div class="k-foot-note">${o.foot}</div>${o.inside ? `<div class="k-pane-in" data-k-inside>${o.inside}</div>` : ""}</div>`;
}
function removeSaid(app2, name) {
  return `<div class="k-box" data-k-remove><h4>Remove ${e(name)} from ${e(app2)}?</h4><p class="k-small k-soft">${e(app2)} forgets ${e(name)}\u2019s signing words, and what it kept about it, on this device. ${e(name)} itself is not touched: its acts, its homes and the other apps keep it. To use it here again, bring it with its words.</p><div class="k-row"><button type="button" class="k-btn k-p" data-k-remove-yes>Remove it</button><button type="button" class="k-btn k-q" data-k-remove-no>Keep it</button></div></div>`;
}
function labelOf2(c) {
  return c.name ?? c.names?.[0] ?? "No name";
}
function colliding(cs) {
  const seen = /* @__PURE__ */ new Map();
  for (const c of cs) seen.set(labelOf2(c).toLowerCase(), (seen.get(labelOf2(c).toLowerCase()) ?? 0) + 1);
  return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
}
function contactsPanel(o) {
  const twice = colliding(o.contacts);
  const rows = o.contacts.map((c) => `<div class="k-idline" data-k-contact="${e(c.id)}" data-k-name="${e([labelOf2(c), ...c.names ?? []].join(" ").toLowerCase())}"><button type="button" class="k-idrow" data-k-contact-open="${e(c.id)}"><span class="k-dot${c.collective ? " k-c" : ""} k-alt">${e(initial(labelOf2(c), c.form))}</span><span><span class="k-n" dir="auto">${e(labelOf2(c))}${c.collective ? '<span class="k-tagc">collective</span>' : ""}</span><br><span class="k-s">${e(shortForm(c.form))}${twice.has(labelOf2(c).toLowerCase()) ? "" : ""}</span></span></button>${o.action ? `<button type="button" class="k-btn k-q k-small" data-k-contact-do="${e(c.id)}">${e(o.action)}</button>` : ""}</div>`).join("");
  return `<div class="k-panel k-left" role="dialog" aria-label="Contacts" data-k-panel="contacts"><div class="k-row"><h4>Contacts</h4><span class="k-grow"></span><span class="k-small k-soft">${o.contacts.length}</span></div><input type="search" data-k-find placeholder="Find a contact by name\u2026" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Find a contact">${rows || '<p class="k-small k-soft">Nobody yet.</p>'}<div class="k-sepline"></div>${o.below}</div>`;
}
function suggestions(cs, title2 = "Contacts") {
  const twice = colliding(cs);
  return `<div class="k-pop" role="listbox" data-k-suggest><div class="k-t">${e(title2)}</div>${cs.map((c, i) => `<button type="button" role="option" data-k-pick="${e(c.id)}"${i === 0 ? ' aria-selected="true"' : ""}><span class="k-dot${c.collective ? " k-c" : ""} k-alt">${e(initial(labelOf2(c), c.form))}</span><span dir="auto">${e(labelOf2(c))}</span>${twice.has(labelOf2(c).toLowerCase()) ? `<span class="k-k">${e(shortForm(c.form))}</span>` : ""}</button>`).join("")}</div>`;
}
var SVG = (d) => `<svg class="k-ic" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
var ICONS = {
  identities: SVG('<circle cx="24" cy="17" r="8"/><path d="M9 41c2-9 8-13 15-13s13 4 15 13"/>'),
  runner: SVG('<rect x="7" y="13" width="20" height="22" rx="4"/><path d="M27 20h6a6 6 0 0 1 0 12h-6M33 26h8M14 22h6M14 27h6"/>'),
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
  const r = button.getBoundingClientRect();
  const w = pop.offsetWidth;
  const h = pop.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  let left = prefer === "above" ? r.right - w : r.left;
  left = Math.max(8, Math.min(left, vw - w - 8));
  let topAt = prefer === "below" ? r.bottom + 6 : r.top - h - 6;
  if (topAt + h > vh - 8) topAt = r.top - h - 6;
  if (topAt < 8) topAt = Math.min(r.bottom + 6, vh - h - 8);
  pop.style.left = `${Math.round(left)}px`;
  pop.style.top = `${Math.round(Math.max(8, topAt))}px`;
}
function popAt(button, html, prefer, pick, done) {
  closeMenu();
  const holder = document.createElement("div");
  holder.innerHTML = html;
  const pop = holder.firstElementChild;
  (button.closest(".k-page") ?? document.body).append(pop);
  place(pop, button, prefer);
  button.classList.add("k-open");
  button.setAttribute("aria-expanded", "true");
  openMenu = { pop, button, done };
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
  root.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-k-menu]");
    if (!b) return;
    const card2 = b.closest("[data-k-act]");
    if (!card2) return;
    ev.stopPropagation();
    if (openMenu?.button === b) return closeMenu();
    const a = host.act(card2.dataset.kAct);
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
  doc.addEventListener("click", (ev) => {
    if (!openMenu) return;
    const t = ev.target;
    if (openMenu.pop.contains(t) || openMenu.button.contains(t)) return;
    closeMenu();
  });
  doc.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape") return;
    if (openMenu) return closeMenu();
    if (panel) return closePanel();
    popup?.close();
  });
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
  shade.addEventListener("click", () => closePanel());
  panel = { el, shade, done };
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
  panel.el.replaceWith(el);
  panel.el = el;
  return el;
}
function closePanel() {
  if (!panel) return;
  closeMenu();
  panel.el.remove();
  panel.shade.remove();
  panel.done?.();
  panel = null;
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
  show(title2, html) {
    if (!this.box) {
      for (const st of this.page.querySelectorAll(".k-status")) if (st.querySelector(".k-done")) st.innerHTML = "";
      this.scroll = [...this.page.querySelectorAll(".k-feed")].map((el) => ({ el, top: el.scrollTop }));
      this.shade = document.createElement("div");
      this.shade.className = "k-shade";
      this.shade.addEventListener("click", () => this.close());
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
    }
    this.stack.push({ title: title2, html });
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
function attachNames(field, contacts, o) {
  field.setAttribute("autocomplete", "off");
  field.setAttribute("autocorrect", "off");
  let shown = [];
  let at = 0;
  const query = () => {
    const v = field.value;
    if (!o.mention) return v.trim();
    const caret = field.selectionStart ?? v.length;
    const m = /(^|\s)@([^\s@]*)$/.exec(v.slice(0, caret));
    return m ? m[2] : null;
  };
  const close = () => {
    if (openMenu?.button === field) closeMenu();
    shown = [];
  };
  const choose = (c) => {
    if (o.mention) {
      const caret = field.selectionStart ?? field.value.length;
      const before = field.value.slice(0, caret).replace(/@([^\s@]*)$/, `@${labelOf2(c)} `);
      field.value = before + field.value.slice(caret);
      field.setSelectionRange(before.length, before.length);
    } else {
      field.value = labelOf2(c);
      field.dataset.kId = c.id;
    }
    close();
    field.focus();
    o.picked(c);
  };
  const offer = () => {
    const q = query();
    if (!o.mention) delete field.dataset.kId;
    if (q === null || !o.mention && !q) return close();
    const ql = q.toLowerCase();
    shown = contacts().filter((c) => [labelOf2(c), ...c.names ?? []].some((n) => n.toLowerCase().split(/\s+/).some((w) => w.startsWith(ql)) || n.toLowerCase().startsWith(ql))).slice(0, 8);
    if (!shown.length) return close();
    at = 0;
    const pop = popAt(field, suggestions(shown, o.title ?? (o.mention ? "Mention" : "Contacts")), o.mention ? "above" : "below", () => void 0);
    pop.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-k-pick]");
      const c = b && shown.find((x) => x.id === b.dataset.kPick);
      if (c) choose(c);
    });
    field.focus({ preventScroll: true });
  };
  field.addEventListener("input", offer);
  field.addEventListener("keydown", (ev) => {
    if (!(ev instanceof KeyboardEvent)) return;
    if (!shown.length || openMenu?.button !== field) return;
    const items = [...openMenu.pop.querySelectorAll("[data-k-pick]")];
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      at = (at + (ev.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
      items.forEach((x, i) => x.setAttribute("aria-selected", String(i === at)));
    } else if (ev.key === "Enter" || ev.key === "Tab") {
      ev.preventDefault();
      ev.stopPropagation();
      choose(shown[at]);
    }
  });
}
function namedIn(field, contacts) {
  if (field.dataset.kId) return field.dataset.kId;
  const v = field.value.trim();
  const same = contacts.filter((c) => labelOf2(c).toLowerCase() === v.toLowerCase());
  return same.length === 1 ? same[0].id : v;
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
  const listen = (ev) => {
    if (ev.source === frame.contentWindow) o.message?.(ev.data);
  };
  window.addEventListener("message", listen);
  const slot = {
    frame,
    close() {
      window.removeEventListener("message", listen);
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

// ../genesis/src/card-words.ts
function cardWords(l, app2, e3) {
  const n = `${l.acts} act${l.acts === 1 ? "" : "s"}`;
  if (!l.latest) return n;
  const missing = l.missing ? ` ${l.missing === 1 ? "One act" : `${l.missing} acts`} of this line ${l.missing === 1 ? "is" : "are"} not at your homes, and ${app2} no longer holds ${l.missing === 1 ? "it" : "them"}: no reader can follow this line past ${l.missing === 1 ? "it" : "them"}, so a change of keys may lose what lives on it (a member key, notes, a list). Ki\u0161ib says so in red.` : "";
  if (l.card) return `${n}: ${l.card.includes(";") ? "its cards" : "its card"}, for Ki\u0161ib, <code class="card-line">${e3(l.card)}</code>${missing ? `<br>${e3(missing)}` : ""}`;
  if (l.atHomes === false) return `${n}: its latest act (<code>${e3(l.latest)}</code>) is not at your homes yet, so there is no card for Ki\u0161ib: ${e3(app2)} sends it again each time this window is read. Do not change your keys until the card shows.${missing ? `<br>${e3(missing)}` : ""}`;
  return `${n}: your homes did not answer, so there is no card for Ki\u0161ib now (latest <code>${e3(l.latest)}</code>). Look again before changing your keys.`;
}

// src/page/family.ts
var TEST_ONLY = "Test identities only, until MOR is frozen";
var WEB_BANNER = `<div class="banner" id="for-testing-only" role="note"><p><strong>For testing only.</strong> ${TEST_ONLY}. Two risks, in plain words:</p>
<ol><li>Whoever serves this page's code at the moment an identity is made here could copy its keys.</li>
<li>This browser's storage, where the identity's signing key is kept, can be lost, or read by what runs in this page.</li></ol>
<p>An identity that is to hold anything of value is made with a downloaded app, or with a chain key kept offline: never here.</p></div>`;
var STYLE = `@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(inter_light.woff2) format("woff2")}
@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(inter_regular.woff2) format("woff2")}
:root{color-scheme:dark;--bg:#06080c;--raise:#0f131b;--line:#2a313d;--edge:#3a4250;--text:#d6dae1;--soft:#7f8794;--faint:#4c5360;--identity:#8394a8;--envelopes:#9a92ad;--bad:#b4615f;--ok:#7f8794}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg);color:var(--text)}
body{font:300 15px/1.55 Inter,"Inter Variable",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:600px;margin:0 auto;padding:0 16px 64px}
a{color:var(--text);text-decoration:underline;text-decoration-color:var(--faint);text-underline-offset:3px}
h1,h2,h3{font-weight:400;letter-spacing:.01em;margin:0}
h2{font-size:17px;margin:28px 0 10px}
h3{font-size:15px;margin:0 0 6px}
p{margin:8px 0}
code,.mono{font:13px/1.4 ui-monospace,"SF Mono",Menlo,monospace}
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
.fp{font:12px/1.4 ui-monospace,"SF Mono",Menlo,monospace;color:var(--identity)}
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
.words{display:grid;grid-template-columns:repeat(auto-fill,minmax(8.5em,1fr));gap:6px 14px;margin:14px 0;padding:14px;border:1px solid var(--edge);border-radius:12px;font:15px ui-monospace,"SF Mono",Menlo,monospace}
.words span{white-space:nowrap}
.words b{display:inline-block;min-width:2em;color:var(--faint);font-weight:400}
.say{padding-left:1.1em;color:var(--soft);font-size:14px}
.say li{margin:4px 0}
.label{display:inline-block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--soft);margin:0 0 4px}
.typed{display:flex;flex-wrap:wrap;gap:10px}
.typed label{margin:0}
.typed input{width:10em}
.id{font:13px/1.5 ui-monospace,"SF Mono",Menlo,monospace;color:var(--identity);overflow-wrap:anywhere}
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

// src/page/view.ts
var NAME2 = "Dub";
var TEST_ONLY2 = "Test identities only, until MOR is frozen";
var TINT2 = { layer: APPS.dub.colour, pastel: APPS.dub.pastel };
var WEB_BANNER2 = `<details class="k-say dub-banner" id="for-testing-only" role="note"><summary><strong>For testing only.</strong> ${TEST_ONLY2}.<span class="k-help" aria-label="more">?</span></summary><div class="k-more-text"><p>Two risks, in plain words:</p>
<ol><li>Whoever serves this page\u2019s code at the moment an identity is made here could copy its keys.</li>
<li>This browser\u2019s storage, where the identity\u2019s signing key is kept, can be lost, or read by what runs in this page.</li></ol>
<p>An identity that is to hold anything of value is made with a downloaded app, or with a chain key kept offline: never here.</p></div></details>`;
var KEPT_SAY = "Its signing key and its encryption key are kept in this browser\u2019s storage (IndexedDB), as they are, not locked: the only lock this page could put on them is one it could open by itself, and so could whatever else runs in this page. Its signing key\u2019s words are the way out: write them down.";
var PAGE_STYLE2 = `${KIT_STYLE}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.dub-banner{flex:none;margin:0;padding:6px 16px;border-bottom:1px solid var(--k-line);background:var(--k-bg);font:300 12.5px/1.5 Inter,system-ui,sans-serif;color:var(--k-soft)}
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
.dub-thread .dub-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}
.dub-thread .dub-head h2{font-size:20px}
.dub-cc{font-size:12.5px;color:var(--k-soft)}
.dub-field{display:flex;gap:8px;align-items:center}
.dub-field input{flex:1}
.dub-modal-form textarea{min-height:5em}
.dub-ways{border-top:1px solid var(--k-line);margin:8px 0}
.dub-ways label{display:flex;gap:10px;align-items:flex-start;padding:10px 6px;border-bottom:1px solid var(--k-line);margin:0;color:var(--k-text);font-size:14.5px;cursor:pointer}
.dub-ways label.dub-closed{color:var(--k-faint);cursor:default}
.dub-ways input{margin-top:4px}
.dub-ways .k-small{display:block}
.dub-hand{width:100%;min-height:6em;font:12px ui-monospace,Menlo,monospace}
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
function kitWho(w, collective = false) {
  const own = w.names[0] ?? null;
  return { id: w.id, form: w.form, link: w.link, name: w.pet ?? own, ownName: w.pet && own && own !== w.pet ? own : null, me: w.me, followed: w.followed, muted: w.muted, collective };
}
var nameOf = (w) => w.me ? "you" : w.pet ?? w.names[0] ?? shortForm(w.form);
var bad = (standing2) => /void|contest|invalid|stolen/.test(standing2);
function itemAct(it, collectives = []) {
  const labels = [];
  if (it.repost) labels.push({ text: `\u21BB ${nameOf(it.repost.by)} reposted ${nameOf(it.repost.of)}\u2019s sealed post` });
  for (const a of it.answers) labels.push({ text: `\u21B3 answers ${a.who ? nameOf(a.who) : "an act not found"}${a.snippet ? ` \xB7 \u201C${a.snippet}\u201D` : ` \xB7 ${shortForm(a.id.length === 64 ? actFormOf(a.id) : a.id)}`}` });
  if (it.corrects) labels.push({ text: `Correction of ${shortForm(actFormOf(it.corrects))}, which stays as signed` });
  if (it.correctedBy?.length) labels.push({ text: `Corrected by ${it.correctedBy.map((c) => shortForm(actFormOf(c))).join(", ")}: shown as it was signed` });
  if (it.authority) labels.push({ text: it.authority.words, tone: it.authority.backed ? void 0 : "warn" });
  for (const l of it.labels ?? []) labels.push(l);
  if (it.toMe) labels.push({ text: "to you" });
  const alarm = it.problem && bad(it.problem) ? it.problem : null;
  if (it.problem && !alarm) labels.push({ text: it.problem, tone: "warn" });
  const html = [
    ...it.pictures.map((x) => x.src ? `<figure><img src="${e(x.src)}" width="${x.width}" height="${x.height}" alt=""></figure>` : `<div class="k-label k-warn">A picture not shown: ${e(x.problem ?? "unknown")}.</div>`),
    ...(it.films ?? []).map(
      (f) => f.problem ? `<div class="k-label k-warn">A film not shown: ${e(f.problem)}.</div>` : `<div class="dub-film" data-film="${e(f.publication)}" data-film-signer="${e(f.signer)}"><button type="button" class="k-btn k-p" data-action="play">\u25B6 Play the film</button><span>${e(sizeWords(f.size))}, checked before it plays</span></div>`
    ),
    it.doc ? `<a class="k-doc" href="${e(it.doc.link)}" target="_blank" rel="noopener noreferrer"><span dir="auto">${e(it.doc.title)}</span><br><span class="k-small k-soft">A long-form document: open it in the reader</span></a>` : "",
    it.sealed ? sealedBox(it) : "",
    it.vow ? vowBox(it) : ""
  ].join("");
  const answered = it.answers.find((a) => a.id !== it.corrects);
  return {
    id: it.id,
    form: it.form,
    signer: kitWho(it.who, collectives.includes(it.who.id)),
    when: it.when ?? null,
    kind: it.what ? it.what : it.vow ? "vow" : it.sealed ? `sealed ${it.sealed.media}` : null,
    labels,
    text: it.repost || it.what ? "" : it.text,
    html,
    verified: !alarm && (it.standing === "valid" || !!it.authority?.backed),
    alarm,
    answers: answered ? { id: answered.id, signer: answered.who?.id ?? null } : null,
    corrects: it.corrects ? { id: it.corrects, signer: it.who.id } : null,
    own: it.who.me
  };
}
function messageAct(m) {
  const labels = [];
  if (m.cc.length) labels.push({ text: `Cc: ${m.cc.map(nameOf).join(", ")}` });
  if (m.of && !m.of.checked) labels.push({ text: `appends a collective whose membership did not check (${m.of.why ?? "not checked"}): not shown as theirs`, tone: "warn" });
  const alarm = m.problem && bad(m.problem) ? m.problem : null;
  if (m.problem && !alarm) labels.push({ text: m.problem, tone: "warn" });
  return {
    id: m.key,
    form: m.form || m.key,
    signer: kitWho(m.who),
    of: m.of?.checked ? m.of.name ?? shortForm(actFormOf(m.of.id, "mid")) : null,
    when: whenWords(m.at),
    labels,
    text: m.text,
    verified: !alarm && m.standing === "valid",
    alarm,
    own: m.dir === "out"
  };
}
function purchaseAct(p) {
  return {
    id: p.id,
    form: p.form,
    signer: kitWho(p.seller),
    kind: `${p.what} \xB7 bought`,
    labels: [{ text: p.state }, ...p.price ? [{ text: p.price }] : []],
    text: p.kind === "vow" ? p.text : "",
    html: p.picture ? `<figure><img src="${e(p.picture)}" alt="The picture, opened"></figure>` : p.kind === "file" && p.text ? `<div class="dub-sealed"><div class="k-txt" dir="auto">${e(p.text)}</div></div>` : "",
    verified: true
  };
}
function sealedBox(p) {
  const x = p.sealed;
  const what = x.media === "picture" ? "picture" : "text";
  const state = x.state === "opened" || x.state === "yours" ? `${x.picture ? `<img src="${e(x.picture)}" alt="The picture, opened">` : `<div class="k-txt" dir="auto">${e(x.text ?? "")}</div>`}<div class="k-small k-soft">${x.state === "yours" ? "Yours, sealed: its key is here, delivered to each buyer once your Damgar signs the receipt." : `Opened: its key arrived from its seller, and its ${what} matches the fingerprint it was published with.`}</div>` : x.state === "paying" ? '<div class="k-small k-soft">Bought: pay it in your wallet (Payments, in Private). Its key arrives once the seller\u2019s Damgar signs the receipt.</div>' : `<div class="k-small k-soft">Sealed: its ${what} opens once paid. Buy it from the act\u2019s menu.</div>`;
  return `<div class="dub-sealed"><span class="k-small">${e(x.price)}</span>${x.words ? `<div class="k-small k-soft">${e(x.words)}</div>` : ""}${state}${x.problem ? `<div class="k-label k-warn">${e(x.problem)}</div>` : ""}</div>`;
}
function vowBox(p) {
  const x = p.vow;
  const state = x.state === "yours" ? "Your vow: each buyer confirms or contests their sale." : x.state === "bought" ? "You bought it: confirm or contest it in its menu." : x.state === "paying" ? "Bought: pay it in your wallet (Payments, in Private)." : x.problem ? "" : "Buy it from its menu.";
  return `<div class="dub-sealed"><span class="k-small">${e(x.price)}</span><div class="k-txt" dir="auto">${e(x.words)}</div>${state ? `<div class="k-small k-soft">${e(state)}</div>` : ""}${x.problem ? `<div class="k-label k-warn">${e(x.problem)}</div>` : ""}</div>`;
}
function actFormOf(hex3, label = "mact") {
  if (!/^[0-9a-f]{64}$/.test(hex3)) return hex3;
  const CHARSET2 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
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
  const polymod2 = (v) => {
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
  const pm = polymod2([...hrp.map((c) => c >> 5), 0, ...hrp.map((c) => c & 31), ...data, 0, 0, 0, 0, 0, 0]) ^ 734539939;
  const check = [0, 1, 2, 3, 4, 5].map((i) => pm >> 5 * (5 - i) & 31);
  return `${label}1${[...data, ...check].map((d) => CHARSET2[d]).join("")}`;
}
function sizeWords(n) {
  return n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MB` : n >= 1024 ? `${Math.round(n / 1024)} kB` : `${n} bytes`;
}
function whenWords(t) {
  const d = new Date(t * 1e3);
  const today = /* @__PURE__ */ new Date();
  return d.toDateString() === today.toDateString() ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function topBar(s, part) {
  const i = s.identity;
  const acting = i.acting ? i.collectives.find((c) => c.id === i.acting) : null;
  const left = `<div class="k-row">${contactsButton()}<span class="k-hide-phone">${appMark(NAME2, "icon.png")}</span></div>`;
  const center = switcher(
    [
      { key: "public", label: "Public" },
      { key: "private", label: "Private" },
      { key: "purchases", label: "Purchases" }
    ],
    part ?? ""
  );
  const right = meButton({ name: i.who.names[0] ?? null, form: i.form, as: acting ? { name: acting.name ?? "a collective", form: acting.form } : null });
  return top({ left, center, right });
}
function firstScreen(web, suggested2) {
  return `${top({ left: appMark(NAME2, "icon.png"), right: "" })}<div class="k-body"><section class="dub-first" id="first"><div id="status-here"></div>
<h2>Identity</h2><p class="k-soft">Dub opens once an identity is here.</p>
${makeForm(web, suggested2)}${bringForm(web)}${web ? "" : `<div class="k-box" id="from-kishib"><h4>Use one from Ki\u0161ib</h4><p class="k-small k-soft">Through Ki\u0161ib\u2019s runner, on this Mac: Ki\u0161ib keeps the signing key and shows each act before it signs it; Dub holds no key.</p><div class="k-row"><button type="button" class="k-btn" data-k-add="kishib">Use one from Ki\u0161ib</button></div></div>`}
${say2(`${TEST_ONLY2}.`, [`Every key is held in software${web ? " in this browser" : " in this program\u2019s folder"}: a prototype, never for a real identity.`])}</section></div>`;
}
var via = `<details class="k-say"><summary>Another way to reach an address (rarely needed)<span class="k-help">?</span></summary><div class="k-more-text"><label>One per line, as address=where (for example an onion home at its local port)</label><textarea name="via"></textarea></div></details>`;
var lns = (xs) => e((xs ?? []).join("\n"));
function makeForm(web, suggested2 = {}) {
  return `<form id="begin" class="k-box"><h4>Make a new identity</h4>
${say2("Dub shows you 24 words, once: the chain key\u2019s words, to write on paper.", [`Dub keeps nothing of the chain key. Its signing key stays in ${web ? "this browser" : "this app"}.`, "The chain key is the only way to change this identity\u2019s keys, in Ki\u0161ib, if a device is lost."])}
<label>Its home, where anyone can check it (one address per line)</label><textarea name="homes" required placeholder="https://">${lns(suggested2.homes)}</textarea>
<label>Relays for its posts and its inbox (one per line; empty: its home)</label><textarea name="relays">${lns(suggested2.relays)}</textarea>
<label>A display name, if you like (anyone can take the same name)</label><input name="name" type="text" maxlength="48" autocomplete="off" placeholder="No name: its fingerprint alone">
${web ? "" : via}
<div class="k-row"><button type="submit" class="k-btn k-p">Make it</button></div></form>`;
}
function bringForm(web) {
  return `<form id="bring" class="k-box"><h4>Bring an identity you have</h4>
${say2("Its ID and its signing key\u2019s words; Dub checks they give its current key.", ["Never type the chain key\u2019s words here: they belong to Ki\u0161ib, the app where a change of keys is done, and to paper.", ...web ? [KEPT_SAY] : []])}
<label>Its ID</label><input name="id" type="text" autocomplete="off" spellcheck="false" required>
<label>Its signing key\u2019s 24 words, in order</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" type="text" placeholder="https://" required>
<label>Relays for its posts (only if it names none; one per line)</label><textarea name="relays"></textarea>
${web ? "" : via}
<div class="k-row"><button type="submit" class="k-btn k-p">Bring it</button></div></form>`;
}
function words(ws, said) {
  return `${top({ left: appMark(NAME2, "icon.png"), right: "" })}<div class="k-body"><section class="dub-first"><h2>The chain key\u2019s words</h2>
<ul class="k-small k-soft">${said.map((s) => `<li>${e(s)}</li>`).join("")}</ul>
<div class="k-words" id="words">${ws.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join("")}</div>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="written">I have written them down</button><button type="button" class="k-btn k-q" data-action="abandon">Start again</button></div>
<p class="k-small k-faint">Once you go on, the words are hidden, and three of them are asked back.</p></section></div>`;
}
function typeBack(positions) {
  return `${top({ left: appMark(NAME2, "icon.png"), right: "" })}<div class="k-body"><section class="dub-first"><div id="status-here"></div><h2>Three of the chain key\u2019s words</h2>
<p class="k-soft">From what you wrote down. Nothing is published until these three are right.</p>
<form id="confirm"><div class="k-row">${positions.map((p) => `<label>Word ${p} <input name="w${p}" type="text" autocomplete="off" spellcheck="false" required></label>`).join("")}</div>
<div class="k-row"><button type="submit" class="k-btn k-p">Go on</button><button type="button" class="k-btn k-q" data-action="abandon">Start again with a new identity</button></div></form></section></div>`;
}
function alone(html) {
  return `${top({ left: appMark(NAME2, "icon.png"), right: "" })}<div class="k-body"><section class="dub-first">${html}</section></div>`;
}
var LAYERS2 = [
  { key: "text", label: "Text" },
  { key: "envelopes", label: "Envelopes" },
  { key: "identity", label: "Identity" },
  { key: "agreements", label: "Agreements" },
  { key: "money", label: "Money" },
  { key: "development", label: "Development" },
  { key: "other", label: "Other" }
];
function publicPart(s, lens, layers) {
  const i = s.identity;
  const acting = i.acting ? i.collectives.find((c) => c.id === i.acting) : null;
  const above = `${lenses(
    [
      { key: "following", label: "Following" },
      { key: "toyou", label: "To you" },
      { key: "relay", label: "Relay" }
    ],
    lens
  )}${lens === "relay" ? pointRow("Showing", LAYERS2.map((l) => ({ key: l.key, label: l.label, on: layers.includes(l.key) })), "layer") : ""}`;
  const tools = `<label title="A picture (JPEG)">\u25A3<span class="dub-l"> Picture</span><input name="picture" type="file" accept=".jpg,.jpeg,image/jpeg"></label><label title="A film (MP4)">\u25B6<span class="dub-l"> Video</span><input name="video" type="file" accept=".mp4,video/mp4"></label><button type="button" data-action="at" title="Mention someone">@</button><button type="button" data-action="address">To\u2026</button>`;
  return `<div class="k-body"><section class="k-pane dub-center" id="public">${feedBox({ id: "feed", above, cards: "", empty: "Reading the feed\u2026", below: '<div id="feed-foot"></div>' })}
${typingBox({ id: "post", placeholder: acting ? `Write something public, as ${acting.name ?? "the collective"}\u2026` : "Write something public\u2026", button: "Post", tools, opts: '<span id="replying"></span><span id="addressed"></span><span class="dub-picked" id="picked"></span>', extra: '<div class="dub-field" id="to-field" hidden><input id="to" placeholder="To: a contact\u2019s name, or an ID" aria-label="To" spellcheck="false"><button type="button" class="k-btn k-q" data-action="unaddress">Done</button></div>' })}</section></div>`;
}
function feedFoot(clock, notes, again = true) {
  return `${clockLine(clock)}${notes.map((n) => `<p class="k-clock">${e(n)}</p>`).join("")}${again ? '<button type="button" class="k-btn k-q k-small" data-action="look">Look again</button>' : ""}`;
}
var cards = (acts) => acts.map((a) => card(a)).join("");
function privatePart(s, convs, open, msgs) {
  const i = s.identity;
  const list8 = convs.map(
    (c) => `<button type="button" class="dub-conv${open?.with.id === c.with.id ? " k-on" : ""}" data-conv="${e(c.with.id)}"><span class="k-dot k-alt">${e((nameOf(c.with)[0] ?? "?").toUpperCase())}</span><span><span class="k-n" dir="auto">${e(nameOf(c.with))}</span>${c.unseen ? `<span class="k-count">${c.unseen}</span>` : ""}<span class="dub-l" dir="auto">${e(c.last?.text ?? "Nothing yet")}</span></span><span class="dub-w">${c.last ? e(whenWords(c.last.at)) : "new"}</span></button>`
  ).join("");
  const usable = i.collectives.filter((c) => c.available);
  const thread = open ? `<div class="dub-head"><button type="button" class="k-back" data-action="convs">\u2190 Back</button><h2 dir="auto">${e(nameOf(open.with))}</h2><span class="k-mono k-faint">${e(shortForm(open.with.form))}</span><span class="k-grow"></span>${open.last ? '<span class="k-small k-soft">sealed to each</span>' : '<span class="k-chip">new</span>'}</div>
${feedBox({ id: "thread", cards: msgs.length ? cards(msgs.map(messageAct)) : "", empty: `Nothing yet. What you write is sealed to ${nameOf(open.with)}: only they can open it.` })}
<p class="k-clock">In the order this app found or sent them: its own time, not a signed one.</p>
${typingBox({
    id: "message",
    placeholder: `Write to ${nameOf(open.with)}\u2026`,
    button: "Send",
    opts: `<span class="k-chip">As ${e(i.who.names[0] ?? "yourself")}</span>${usable.map((c) => `<button type="button" class="k-chip" data-append="${e(c.id)}" aria-pressed="false">+ of ${e(c.name ?? shortForm(c.form))}</button>`).join("")}<span id="ccs"></span><button type="button" class="k-chip" data-action="cc">+ Cc</button><button type="button" class="k-chip" data-action="askpaid">+ Ask to be paid</button>`,
    extra: '<div class="dub-field" id="cc-field" hidden><input id="cc" placeholder="Cc: a contact\u2019s name, or an ID" aria-label="Cc" spellcheck="false"><button type="button" class="k-btn k-q" data-action="uncc">Done</button></div>',
    tools: ""
  })}${usable.length ? '<p class="k-clock">A collective appended binds nothing; the reader\u2019s app shows it only where your membership checks. Everyone sees the Cc.</p>' : ""}` : '<p class="k-empty">Choose a conversation, or start a new one.</p>';
  return `<div class="k-body dub-private${open ? " k-chosen" : ""}"><aside class="dub-convs"><input class="dub-find" type="search" id="find-conv" placeholder="Find a conversation\u2026" autocomplete="off" aria-label="Find a conversation"><div class="dub-list">${list8}<button type="button" class="dub-conv" data-action="new-conv"><span class="k-soft">+ A new conversation</span></button></div><div id="private-notes"></div></aside><section class="dub-thread" id="private">${thread}</section></div>`;
}
function purchasesPart(shelf) {
  return `<div class="k-body"><section class="k-pane dub-center" id="purchases">${feedBox({
    id: "bought",
    above: lenses(
      [
        { key: "all", label: "All" },
        { key: "files", label: "Files" },
        { key: "vows", label: "Vows" }
      ],
      shelf,
      "shelf"
    ),
    cards: "",
    empty: "Reading what you bought\u2026"
  })}<div id="bought-foot"></div></section></div>`;
}
var lines = (ls) => `<ul class="k-small">${ls.map((l) => `<li class="${l.tone === "bad" ? "k-bad" : ""}">${e(l.text)}</li>`).join("")}</ul>`;
var unitOptions = (units = []) => units.map((u2) => `<option value="${e(u2.hash)}">${e(u2.label)}</option>`).join("");
function payChooser(o) {
  const w = o.ways;
  const first = w.lane.open ? "lane" : w.damgar.open ? "damgar" : w.hand.open ? "hand" : "";
  const way = (key, label, open, said) => `<label class="${open ? "" : "dub-closed"}"><input type="radio" name="how" value="${key}"${open ? "" : " disabled"}${key === first ? " checked" : ""}><span><span>${e(label)}</span><span class="k-small k-soft">${e(said)}</span></span></label>`;
  const laneSaid = w.lane.open ? `Dub signs it now, with its lane\u2019s key. Per payment: at most ${w.lane.perPayment}${w.lane.total ? ` \xB7 In all: ${w.lane.left} left of ${w.lane.total}` : ""}${w.lane.until ? ` \xB7 until ${new Date(w.lane.until * 1e3).toISOString().slice(0, 10)}` : ""} \xB7 paid under it so far: ${w.lane.spent} (Dub\u2019s own count${w.lane.total ? "; the cap in all is kept by Dub and counted in Damgar, not judged by verifiers" : ""}).` : w.lane.why ?? "";
  const amount = o.kind === "tip" || o.kind === "pay";
  return `<form class="dub-modal-form" id="pay" data-kind="${e(o.kind)}"><p class="k-small k-soft">${e(o.sub)}</p>
${amount ? `<div class="k-row"><input name="value" inputmode="numeric" placeholder="Amount" required class="k-grow"><select name="unit">${unitOptions(o.units)}</select></div><input name="whatFor" placeholder="What for (optional)" maxlength="280">` : `<p>${e(o.price ?? "")}</p>`}
<div class="dub-ways">${way("lane", "Under Dub\u2019s lane", w.lane.open, laneSaid)}${way("damgar", "Ask Damgar", w.damgar.open, w.damgar.open ? w.damgar.wakes ? "Dub leaves it on MOR, sealed to you, and wakes Damgar: Damgar pops up here, reads it to you, and you authorise it in its panel. It waits in Damgar\u2019s Waiting too." : "Dub leaves it on MOR, sealed to you; Damgar queues it in Waiting, reads it to you and signs it there." : w.damgar.why ?? "")}${way("hand", "By hand", w.hand.open, w.hand.open ? "Dub shows the payment to copy into Damgar; nothing is signed or sent from here." : w.hand.why ?? "")}</div>
<div class="k-row"><button type="submit" class="k-btn k-p"${first ? "" : " disabled"}>${o.kind === "tip" ? "Tip" : o.kind === "pay" ? "Pay" : "Buy it"}</button><span class="k-grow"></span><span class="k-small k-faint">the record goes to Damgar\u2019s account</span></div><div id="pay-said"></div></form>`;
}
function byHand(h) {
  return `<div class="k-box">${lines(h.said.map((text3) => ({ text: text3 })))}<label>The draft, as the money messages cMIP writes it (section 2.1), in base64: copy it into Damgar</label><textarea class="dub-hand" readonly>${e(h.text)}</textarea><div class="k-row"><button type="button" class="k-btn" data-copy-text="${e(h.text)}">Copy it</button></div>${say2("In Damgar: Waiting, + Paste an act to sign.", ["Damgar reads it to you in plain words, and you sign it or decline it there. Nothing is signed or sent from Dub."])}</div>`;
}
function relyForm(r) {
  return `${lines(r.lines)}<p class="k-small k-soft">${e(r.explanation)}</p>${r.blocking.length ? `<div class="k-alarmbox">It cannot be relied on from here:${lines(r.blocking.map((text3) => ({ text: text3 })))}</div>` : `<form id="rely" class="dub-modal-form"><label>Type RELY to sign the witness act</label><input name="typed" autocomplete="off" autocapitalize="characters" spellcheck="false" required><div class="k-row"><button type="submit" class="k-btn k-p">Sign the witness act</button></div></form>`}`;
}
function anchorForm(offers2, service = "") {
  return `<form id="anchor-offers" class="dub-modal-form">${say2("An anchor puts this act\u2019s fingerprint on the Bitcoin chain, through a pooled anchoring service, paid in Damgar.", ["Anyone may anchor any act (the anchoring cMIP). Dub prepares the payment; Damgar signs it; the blind that ties the anchor to this act is kept here. Round 1 runs on regtest: its coins are worth nothing."])}
<label>The anchoring service\u2019s ID</label><div class="k-row"><input name="service" value="${e(service)}" required spellcheck="false" autocomplete="off" class="k-grow"><button type="submit" class="k-btn">Read its offer</button></div></form>${offers2 === null ? "" : offers2.length ? `<form id="anchor" class="dub-modal-form" data-service="${e(service)}"><div class="dub-ways">${offers2.flatMap((o) => o.tiers.map((t, i) => `<label><input type="radio" name="tier" value="${e(o.act)}:${t.tier}"${i === 0 ? " checked" : ""}><span>${e(t.words)}${o.words ? `<span class="k-small k-soft">${e(o.words)}</span>` : ""}</span></label>`)).join("")}</div><div class="k-row"><button type="submit" class="k-btn k-p">Prepare the payment for Damgar</button></div></form>` : '<p class="k-small k-soft">No standing offer of that service was found.</p>'}`;
}
function correctForm() {
  return `<form id="correct" class="dub-modal-form">${say2("A correction is a new post naming the old one, labelled \u201CCorrection\u201D.", ["The old post stays as it was signed, shown with \u201Ccorrected by\u201D: nothing on MOR is changed or deleted. Apps that do not know the corrections cMIP show an ordinary post naming the old one."])}<textarea name="text" required placeholder="The correction"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Sign the correction</button></div></form>`;
}
function contestForm() {
  return `<form id="contest" class="dub-modal-form"><p class="k-small k-soft">A contest naming your sale is signed in public. It voids nothing; the payment stays as it is.</p><input name="promise" placeholder="What was not kept (optional)" maxlength="280"><div class="k-row"><button type="submit" class="k-btn k-alarm">Contest it</button></div></form>`;
}
function askPaidForm(units) {
  return `<form id="askpaid" class="dub-modal-form"><div class="k-row"><input name="value" inputmode="numeric" placeholder="Amount" required class="k-grow"><select name="unit">${unitOptions(units)}</select></div><input name="whatFor" placeholder="What for (optional)" maxlength="280">${say2("Prepared here, signed in Damgar.", ["Dub seals a request to this identity at its homes; Damgar reads it to you and signs it or not. A request is not a debt: they may pay it, accept it as a debt, or decline."])}<div class="k-row"><button type="submit" class="k-btn k-p">Prepare it for Damgar</button></div></form>`;
}
function nameForm(s) {
  return `<form id="name" class="dub-modal-form"><label>Your display name: shown beside your ID, never instead of it. Anyone can take the same name.</label><input name="name" maxlength="48" autocomplete="off" value="${e(s.identity.who.names.join(" / "))}" placeholder="No name: your ID alone"><div class="k-row"><button type="submit" class="k-btn k-p">Save</button></div></form>`;
}
function relaysForm(s) {
  const i = s.identity;
  return `<dl class="k-facts"><dt>Relays</dt><dd>${e(i.relays.join(", "))}</dd><dt>Homes</dt><dd>${e(i.homes.join(", "))}</dd></dl>${i.kind === "made" ? `<form id="relays" class="dub-modal-form"><label>Its relays, one per line: where its acts are found and its inbox is</label><textarea name="relays">${e(i.relays.join("\n"))}</textarea><div class="k-row"><button type="submit" class="k-btn">Read it back</button></div></form><div id="relays-review"></div>` : '<p class="k-small k-soft">This identity was brought here: Dub publishes no routes for it (a second writer would fork them). Change its relays in the app that made it.</p>'}${say2("Its homes change only with the chain key.", ["Its homes are named in its identity chain: they change in Ki\u0161ib, from the chain key\u2019s paper."])}`;
}
function carry(c) {
  return `<p class="k-mono k-soft">${e(c.grouped)}</p><ul class="k-small k-soft">${c.say.map((s) => `<li>${e(s)}</li>`).join("")}</ul><div class="k-words" id="carry-words">${c.words.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join("")}</div>`;
}
function lineFacts(s) {
  const i = s.identity;
  return `<dl class="k-facts"><dt>Its ID</dt><dd class="k-mono">${e(i.form)}</dd><dt>Made</dt><dd>${i.kind === "made" ? "Here. Its chain key was shown once as words, and is kept nowhere here." : "Elsewhere, brought here by its signing key\u2019s words. Its chain key is not here."}</dd>
${i.oldChainKey ? "<dt>Old chain key</dt><dd>Made by Dub before 16 October 2026: its chain key is still in this app\u2019s folder, unused and untouched.</dd>" : ""}
<dt>Private messages</dt><dd>${i.kind === "runner" ? e(i.encryption ? "Opened here through Ki\u0161ib, which holds its key: each opening is listed in Ki\u0161ib." : i.opening ?? "Not opened here.") : i.encryption ? "Its encryption key is here: its private messages open here." : "No encryption key here: its private messages cannot be opened here."}</dd>
<dt>Homes</dt><dd>${e(i.homes.join(", "))}</dd><dt>Relays</dt><dd>${e(i.relays.join(", "))}</dd>
<dt>This app\u2019s line</dt><dd>${cardWords(i.line, "Dub", e)}</dd></dl>
${say2("A change of keys must keep this line.", ["If the signing key is ever changed (in Ki\u0161ib, with the chain key\u2019s words), that change must keep this line, or the posts made here become void: take the line above to it."])}`;
}
function laneForm(s, web, said) {
  return `${say2("A lane lets Dub pay by itself, within a cap Damgar grants.", said)}<div id="lanes"><p class="k-small k-soft">Reading the lanes\u2026</p></div>
<form id="lane" class="dub-modal-form"><input name="label" value="${web ? "Dub on the web" : "Dub on this computer"}" maxlength="80" autocomplete="off">
<div class="k-row"><input name="cap" inputmode="numeric" placeholder="At most, per payment" required class="k-grow"><select name="unit">${unitOptions(s.units)}</select></div>
<div class="k-row"><input name="total" inputmode="numeric" placeholder="In all, for the whole lane (optional)" class="k-grow"></div>
<label>Until (optional), judged on a timestamp clock: its ID</label><div class="k-row"><input name="until" type="datetime-local"><input name="clock" class="k-grow" placeholder="the clock\u2019s ID" spellcheck="false" value="${e(s.identity.clock?.form ?? "")}"></div>
<div class="k-row"><button type="submit" class="k-btn k-p">Ask Damgar for this lane</button></div></form>
<h4>Payments under the lane</h4><div id="payments"><p class="k-small k-soft">Reading\u2026</p></div>`;
}
function lanesHere(ls) {
  return ls.length ? `<ul class="k-small">${ls.map((l) => `<li>${e(l.label)} \xB7 ${e(l.state)} \xB7 at most ${e(l.cap)} a payment${l.total ? ` \xB7 in all ${e(l.total)}` : ""}${l.until ? ` \xB7 until ${e(new Date(l.until * 1e3).toISOString().slice(0, 16).replace("T", " "))} UTC` : ""}</li>`).join("")}</ul>` : '<p class="k-small k-soft">No lane yet: Dub pays nothing by itself.</p>';
}
function paymentsHere(r, who) {
  const one2 = (p) => `<div class="k-box" data-payment="${e(p.key)}"><div class="k-row"><span class="k-small">to</span><span dir="auto">${e(nameOf(who(p.other.id)))}</span><span class="k-mono k-faint">${e(shortForm(who(p.other.id).form))}</span><span class="k-grow"></span><span class="k-small">${e(p.amount.said)}</span></div><p class="k-small k-soft">${e(p.stageSaid)}</p>
${p.pay?.invoice && !p.proofs.some((x) => x.kind === "claim") ? `<textarea class="dub-hand" readonly>${e(p.pay.invoice)}</textarea><div class="k-row"><button type="button" class="k-btn" data-copy-text="${e(p.pay.invoice)}">Copy the invoice</button></div><form class="dub-modal-form" id="paid" data-key="${e(p.key)}"><input name="proof" required spellcheck="false" autocomplete="off" placeholder="The preimage, from your wallet once paid"><div class="k-row"><button type="submit" class="k-btn k-p">Check it and sign the claim, under the lane</button></div></form>` : ""}
${p.proofs.length ? `<ul class="k-small">${p.proofs.map((x) => `<li>${x.kind === "claim" ? "Claim" : "Receipt"}: ${e(x.rail.answer)} \xB7 ${e(x.how)}</li>`).join("")}</ul>` : ""}</div>`;
  return `${r.payments.map(one2).join("")}${r.done.length ? `<h4>Done</h4>${r.done.map(one2).join("")}` : ""}${!r.payments.length && !r.done.length ? '<p class="k-small k-soft">No payment made from Dub yet.</p>' : ""}${r.problems.map((x) => `<p class="k-clock">${e(x)}</p>`).join("")}`;
}
function collectiveForm(s) {
  const cs = s.identity.collectives;
  return `${cs.length ? `<ul class="k-small">${cs.map((c) => `<li>${e(c.name ?? shortForm(c.form))} \xB7 ${c.available ? "usable" : e(c.why ?? "not usable")} <button type="button" class="k-btn k-q" data-action="collective-remove" data-id="${e(c.id)}">Remove</button></li>`).join("")}</ul>` : ""}
<form id="collective" class="dub-modal-form"><label>A collective this identity is a member of: its ID</label><input name="id" required spellcheck="false" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn k-p">Add it under this identity</button></div></form>
${say2("Acting as a collective is the same gesture as switching.", ["It is listed under this identity in the identity panel: choose it to post as it, with your own member key (made when you signed its founding). Where its area asks more keys than one, a post counts once another holder signs it, in Edubba."])}`;
}
function appFoot(s, web) {
  const c = s.identity?.clock;
  return `${web ? "" : `<h4>Browsers paired with this app</h4><div class="k-row"><button type="button" class="k-btn" data-action="code">A code for another browser on this machine</button><button type="button" class="k-btn k-q" data-action="unpair">Unpair this browser</button></div><div id="code"></div>`}
<h4>The clock feeds are ordered by</h4><form id="clock" class="dub-modal-form"><label>A timestamp clock\u2019s ID (empty: none, each signer\u2019s own order)</label><input name="id" value="${e(c?.form ?? "")}" spellcheck="false" autocomplete="off"><label>Its name here</label><input name="name" value="${e(c?.name ?? "")}" maxlength="48" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn">Save</button></div></form>
${say2("A clock orders what is shown; it never decides what is true.", ["A timestamp clock signs \u201CI held these acts at this time\u201D: its word only. Acts it did not stamp keep their signer\u2019s own order. Order is proven only inside a chain."])}
${say2(`${TEST_ONLY2}.`, [`Every key is held in software${web ? " in this browser" : " in this program\u2019s folder"}: a prototype, never for a real identity.`])}`;
}
function contactsBelow(s) {
  const i = s.identity;
  return `<form id="follow" class="dub-modal-form"><input name="id" autocomplete="off" spellcheck="false" placeholder="+ Add by ID (mid1\u2026, or an ID link)" required aria-label="Add by ID"><input name="name" autocomplete="off" placeholder="Your name for it (sealed to you)" aria-label="Your name for it"><div class="k-row"><button type="submit" class="k-btn">Add to contacts</button></div></form>
${i.muted.length ? `<details class="k-say"><summary>Muted (${i.muted.length})<span class="k-help">?</span></summary><div class="k-more-text">${i.muted.map((m) => `<div class="k-row"><span dir="auto">${e(nameOf(m))}</span><span class="k-mono k-faint">${e(shortForm(m.form))}</span><button type="button" class="k-btn k-q" data-action="unmute" data-id="${e(m.id)}">Unmute</button></div>`).join("")}</div></details>` : ""}
<label class="k-row"><input type="checkbox" id="publish-list" ${i.list === "published" ? "checked" : ""}> Publish whom ${e(i.who.names[0] ?? "this identity")} follows</label>
${say2(i.list === "published" ? "Published: anyone reads the IDs; your names for them stay sealed." : "Your names for them stay sealed to you. The same list in Public and Private.", [
    i.encryption ? `Whom it follows, with the names you gave, is a private act sealed to this identity and kept at its homes${i.sealed ? ` (version ${i.sealed.version})` : ""}: any app holding this identity reads it; nobody else can. Its homes and relays see only that a private act exists, and roughly how big it is; whoever holds the signing key\u2019s words reads it.` : i.kind === "runner" ? `The list stays in this app only, not sealed to this identity: ${i.opening ?? "Ki\u0161ib does not open for Dub."}` : "This app holds no encryption key of this identity, so the list stays in this app only.",
    "Muting stays in this app, always.",
    ...i.sealed?.forked ? ["The list was forked: two apps changed it at once. The longer branch is shown."] : []
  ])}`;
}
function spent2(said) {
  return `<div class="k-alarmbox" id="spent-box"><p>${e(said)}</p><form id="renew"><label>The new signing key\u2019s 24 words</label><textarea name="words" autocomplete="off" spellcheck="false" required></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Use the new words</button></div></form></div>`;
}
function runnerForm(r) {
  const intro = '<p class="k-small k-soft">Ki\u0161ib\u2019s runner keeps the identity\u2019s signing key on this Mac; Dub holds none of its keys. Each act Dub would sign is shown by Ki\u0161ib, in its own panel inside this window, before Ki\u0161ib signs it (unless you give Dub a standing yes for that kind, in Ki\u0161ib). Money, agreements, relying on another\u2019s act, and keys always ask. Where you let Dub, in Ki\u0161ib, Ki\u0161ib also opens what is sealed to the identity, so that Dub reads its private messages.</p>';
  if (!r.available) return `${intro}<p>Ki\u0161ib\u2019s runner is in the computer\u2019s program only, never in the web client.</p>`;
  const problem = r.problem ? `<div class="k-note k-error">${e(r.problem)}</div>` : "";
  if (r.state === "approved") {
    const ids = r.identities.map((x) => `<div class="k-idline"><span class="k-dot k-alt">${e((x.name ?? "M")[0].toUpperCase())}</span><span class="k-grow"><span class="k-n">${e(x.name ?? "No name")}</span><br><span class="k-s k-mono">${e(shortForm(x.form))}</span></span>${x.held ? '<span class="k-small k-faint">used here</span>' : `<button type="button" class="k-btn k-p" data-action="runner-take" data-id="${e(x.id)}">Use it</button>`}</div>`).join("");
    return `${intro}<p class="k-small">Dub is paired with Ki\u0161ib\u2019s runner. The identities Ki\u0161ib lets Dub use:</p><div class="k-list">${ids || '<p class="k-small k-soft">None: choose some for Dub in Ki\u0161ib (Runner, Apps).</p>'}</div><div class="k-row"><button type="button" class="k-btn k-q" data-action="runner-look">Look again</button></div>`;
  }
  if (r.state === "waiting") return `${intro}<p>Dub asked Ki\u0161ib to pair. Approve it in Ki\u0161ib (Runner, Apps), only if Ki\u0161ib shows the same code:</p><p class="k-mono dub-code" id="runner-code">${e(r.code ?? "")}</p><div class="k-row"><button type="button" class="k-btn k-p" data-action="runner-look">I approved it in Ki\u0161ib</button><button type="button" class="k-btn k-q" data-action="runner-pair">Ask again</button></div>`;
  const was = r.state === "revoked" ? '<p class="k-small k-soft">Ki\u0161ib no longer knows Dub: its pairing was revoked, or the runner was turned off.</p>' : r.state === "refused" ? '<p class="k-small k-soft">Ki\u0161ib refused Dub\u2019s pairing.</p>' : "";
  return `${intro}${problem}${was}<p class="k-small k-soft">First, Ki\u0161ib\u2019s runner must be on, and hold the identity (Ki\u0161ib: Runner; Identities, Held here). Then Dub asks to pair; you approve in Ki\u0161ib.</p><div class="k-row"><button type="button" class="k-btn k-p" data-action="runner-pair">Ask Ki\u0161ib to pair</button></div>`;
}
function runnerRemoveSaid(name) {
  return `<div class="k-box" data-k-remove><h4>Remove ${e(name)} from Dub?</h4><p class="k-small k-soft">Dub stops using ${e(name)} through Ki\u0161ib, and forgets what it kept about it on this device. Dub holds no key of it. Ki\u0161ib\u2019s runner keeps its key until you remove it there, or turn the runner off; ${e(name)} itself, its acts and its homes are not touched.</p><div class="k-row"><button type="button" class="k-btn k-p" data-k-remove-yes>Remove it</button><button type="button" class="k-btn k-q" data-k-remove-no>Keep it</button></div></div>`;
}
function runnerWords() {
  return "<p>Ki\u0161ib\u2019s runner holds this identity\u2019s signing key, on this Mac; Dub holds none of its keys. Its words are given and changed in Ki\u0161ib (Runner; Identities, Held here), never here.</p>";
}

// src/page/ui.ts
var SPENT = "This identity\u2019s signing key was changed elsewhere";
var errorOf = (err) => err instanceof Error ? err.message : String(err);
function mount(app2, b) {
  const $ = (id) => document.getElementById(id);
  app2.classList.add("k-page", "k-dub");
  let state = null;
  let slot = null;
  let closedAsk = null;
  const raw = b.ask.bind(b);
  const NOT_WATCHED = /* @__PURE__ */ new Set(["runner asking", "runner", "state", "runner drop"]);
  function showPanel(a, origin) {
    slot?.close();
    closedAsk = null;
    let s;
    try {
      s = openSlot(app2, {
        app: "kishib",
        by: "Ki\u0161ib",
        host: "Dub",
        src: a.panel,
        allowed: [origin, origin.replace("127.0.0.1", "localhost")],
        closed: () => {
          slot = null;
          closedAsk = { ...a, origin };
          say3("", `${e(a.title)}: Ki\u0161ib waits for your answer. It waits in Ki\u0161ib too (Runner, Waiting), for ten minutes. <button type="button" class="k-btn k-small" data-action="runner-again">Show the panel again</button> <button type="button" class="k-btn k-q k-small" data-action="runner-drop">Do not sign</button>`);
        }
      });
    } catch (e3) {
      closedAsk = { ...a, origin };
      return say3("error", e(errorOf(e3)));
    }
    slot = { close: () => s.close(), request: a.request };
  }
  function damgarPanel(w) {
    let s;
    let over = false;
    try {
      s = openSlot(app2, {
        app: "damgar",
        by: "Damgar",
        host: "Dub",
        src: w.panel,
        allowed: [w.origin, w.origin.replace("127.0.0.1", "localhost")],
        closed: () => {
          over = true;
          say3("", `${e(w.title)}: it waits in Damgar, in Waiting, to be signed or declined there.`);
        }
      });
    } catch (e3) {
      return say3("error", e(errorOf(e3)));
    }
    void (async () => {
      while (!over) {
        await new Promise((r) => setTimeout(r, 1e3));
        if (over) return;
        const a = await raw("damgar answer", { request: w.request }).catch(() => null);
        if (!a || a.answer === "waiting") continue;
        over = true;
        await new Promise((r) => setTimeout(r, 1500));
        s.close();
        say3(a.answer === "signed" ? "done" : "", a.answer === "signed" ? `Damgar signed it. ${lines(a.lines)}` : a.answer === "declined" ? "Declined in Damgar: nothing was signed." : "Damgar\u2019s panel waited past its ten minutes: the payment still waits in Damgar.");
        return;
      }
    })();
  }
  b.ask = async (op, a) => {
    if (b.web || NOT_WATCHED.has(op) || state?.identity?.kind !== "runner") return raw(op, a);
    let over = false;
    const watch = (async () => {
      while (!over) {
        await new Promise((r) => setTimeout(r, 300));
        if (over) break;
        const w = await raw("runner asking").catch(() => null);
        if (!over && w?.asking && w.origin && slot?.request !== w.asking.request && closedAsk?.request !== w.asking.request) showPanel(w.asking, w.origin);
      }
    })();
    try {
      return await raw(op, a);
    } finally {
      over = true;
      await watch;
      slot?.close();
      slot = null;
      closedAsk = null;
    }
  };
  let part = "public";
  let lens = "following";
  let layers = ["text", "envelopes"];
  let shelf = "all";
  let feed = [];
  let inbox = null;
  let relayItems = null;
  let relayFoot = "";
  let feedFoot2 = "";
  let bought = null;
  let conv = null;
  let fresh = null;
  let replying = null;
  let addressed = [];
  let cc = [];
  let appended = null;
  let shown = null;
  let profileOf = null;
  const drawn = /* @__PURE__ */ new Map();
  const popup2 = new Popup(app2);
  function say3(kind, html) {
    let s = $("status");
    if (!s) {
      s = document.createElement("div");
      s.id = "status";
      s.className = "k-status";
      s.setAttribute("aria-live", "polite");
      app2.append(s);
    }
    s.innerHTML = html ? `${note(kind, html)}<button type="button" class="k-round k-close" data-action="unsay" aria-label="Close">\xD7</button>` : "";
    clearTimeout(fading);
    if (kind === "done") fading = setTimeout(() => s?.isConnected && s.querySelector(".k-done") && (s.innerHTML = ""), 9e3);
  }
  let fading;
  async function fail(err) {
    if (b.unpaired?.(err)) {
      void b.start();
      return;
    }
    const m = errorOf(err);
    if (m.startsWith(SPENT)) {
      await check();
      say3("", "");
      return;
    }
    say3("error", e(m));
  }
  const fill = (id, html) => {
    const el = $(id);
    if (el) el.innerHTML = html;
  };
  let working = false;
  async function busy(words2, f) {
    working = true;
    say3("", `<span class="k-small">${e(words2)}</span>`);
    const was = [...app2.querySelectorAll("button")].map((x) => [x, x.disabled]);
    app2.querySelectorAll("button").forEach((x) => x.disabled = true);
    try {
      const r = await f();
      say3("", "");
      return r;
    } catch (err) {
      await fail(err);
      return void 0;
    } finally {
      for (const [x, d] of was) if (x.isConnected) x.disabled = d;
      working = false;
    }
  }
  const keep2 = (act, more) => {
    drawn.set(act.id, { act, ...more });
    return act;
  };
  const collectives = () => state?.identity?.collectives.map((c) => c.id) ?? [];
  const itemCards = (items) => items.map((it) => card(keep2(itemAct(it, collectives()), { item: it }))).join("");
  function contacts() {
    return (state?.identity?.follows ?? []).map((w) => ({ id: w.id, form: w.form, name: w.pet ?? w.names[0] ?? null, names: w.names, collective: collectives().includes(w.id) }));
  }
  function toYou() {
    const out = [...inbox?.toYou ?? []];
    for (const p of feed) if (p.toMe && !out.some((x) => x.id === p.id)) out.push(p);
    return out;
  }
  function counts() {
    const n = (k) => k ? String(k) : "";
    const unseen = toYou().filter((x) => !x.seen).length;
    app2.querySelectorAll('[data-k-count="toyou"]').forEach((x) => x.textContent = n(unseen));
    app2.querySelectorAll('[data-k-count="public"]').forEach((x) => x.textContent = n(unseen));
    app2.querySelectorAll('[data-k-count="private"]').forEach((x) => x.textContent = n((inbox?.messages ?? []).filter((m) => !m.seen && m.dir === "in").length));
  }
  const films = /* @__PURE__ */ new Map();
  function showFilms() {
    for (const box2 of app2.querySelectorAll("[data-film]")) {
      const url = films.get(box2.dataset.film ?? "");
      if (!url) continue;
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.src = url;
      video.dataset.checked = "yes";
      box2.replaceWith(video);
    }
  }
  function drawFeed() {
    if (part !== "public" || profileOf) return;
    const box2 = $("feed");
    if (!box2) return;
    if (lens === "relay") {
      box2.innerHTML = relayItems ? relayItems.length ? itemCards(relayItems) : '<p class="k-empty">Nothing of these layers at this identity\u2019s relays yet.</p>' : '<p class="k-empty">Reading every public act at this identity\u2019s relays\u2026</p>';
      fill("feed-foot", relayFoot);
      showFilms();
      return;
    }
    const items = lens === "toyou" ? toYou() : feed;
    box2.innerHTML = items.length ? itemCards(items) : `<p class="k-empty">${lens === "toyou" ? "Nothing addressed to you yet: replies to your posts, and public messages to you, come here." : "Nothing yet. Write something, or follow someone."}</p>`;
    fill("feed-foot", feedFoot2);
    showFilms();
  }
  async function readFeed2(again = false) {
    try {
      const r = await b.ask("feed", { fresh: again });
      feed = r.items;
      if (r.followsChanged) {
        state = await b.ask("state");
        if (panelOpen()?.dataset.kPanel === "contacts") openContacts();
      }
      feedFoot2 = feedFoot(r.clock, [...r.notes ?? [], ...r.problems]);
      drawFeed();
    } catch (err) {
      if (lens !== "relay") fill("feed", note("error", e(errorOf(err))));
    }
    counts();
  }
  async function readRelay() {
    relayItems = null;
    drawFeed();
    try {
      const r = await b.ask("relay", { layers });
      relayItems = r.items;
      relayFoot = feedFoot(r.clock, [
        "At this identity\u2019s relays, newest first: by the clock named where it stamped them, else in each relay\u2019s own order, not a signed time. Anyone\u2019s acts, not only those you follow.",
        ...r.left ? [`${r.left} of other layers, behind the filter.`] : [],
        ...r.hidden ? [`${r.hidden} from muted identities, not shown.`] : [],
        ...r.problems
      ]);
      drawFeed();
    } catch (err) {
      if (lens === "relay") fill("feed", note("error", e(errorOf(err))));
    }
  }
  async function readInbox() {
    try {
      inbox = await b.ask("inbox");
      const st = await b.ask("state");
      if (state && st.identity?.id === state.identity?.id) state.proposalsWaiting = st.proposalsWaiting;
      if (lens === "toyou") drawFeed();
      if (part === "private") drawPrivate();
    } catch (err) {
      if (part === "private") fill("private-notes", note("error", e(errorOf(err))));
    }
    counts();
  }
  async function readBought() {
    try {
      const r = await b.ask("purchases");
      bought = r.items;
      drawBought();
      fill("bought-foot", `${r.problems.map((p) => `<p class="k-clock">${e(p)}</p>`).join("")}<button type="button" class="k-btn k-q k-small" data-action="look">Look again</button>`);
    } catch (err) {
      fill("bought", note("error", e(errorOf(err))));
    }
  }
  function drawBought() {
    const box2 = $("bought");
    if (!box2 || !bought) return;
    const shown2 = bought.filter((x) => shelf === "all" || (shelf === "files" ? x.kind === "file" : x.kind === "vow"));
    box2.innerHTML = shown2.length ? shown2.map((p) => card(keep2(purchaseAct(p), { purchase: p }))).join("") : '<p class="k-empty">Nothing bought here yet. A file or a vow you buy shows here.</p>';
  }
  async function readPayments() {
    try {
      await b.ask("money look");
    } catch (err) {
      if (errorOf(err).startsWith(SPENT)) await fail(err);
    }
  }
  let paymentsAgain;
  async function showPayments() {
    if (!$("payments")) return;
    try {
      await readPayments();
      const r = await b.ask("payments");
      const box2 = $("payments");
      if (!box2) return;
      if (box2.querySelector("form#paid input[name=proof]:focus")) return;
      box2.innerHTML = paymentsHere(r, whoOf);
      clearTimeout(paymentsAgain);
      if (r.payments.some((p) => !p.pay?.invoice && !p.proofs.length)) paymentsAgain = setTimeout(() => void showPayments(), 4e3);
    } catch (err) {
      fill("payments", note("error", e(errorOf(err))));
    }
  }
  async function check() {
    try {
      const c = await b.ask("check");
      const old = $("spent-box");
      if (c.current) old?.remove();
      else if (!old) {
        const holder = document.createElement("div");
        holder.innerHTML = spent2(c.say ?? "");
        app2.querySelector(".k-top")?.after(holder.firstElementChild);
      }
    } catch {
    }
  }
  async function seen(keys) {
    if (!keys.length) return;
    try {
      await b.ask("seen", { keys });
      for (const x of [...toYou(), ...inbox?.messages ?? []]) if (keys.includes("key" in x ? x.key : x.id)) x.seen = true;
      for (const x of feed) if (keys.includes(x.id)) x.seen = true;
    } catch {
    }
    counts();
  }
  async function refresh() {
    state = await b.ask("state");
    await show(state);
  }
  async function show(s) {
    state = s;
    popup2.close();
    closePanel();
    if (s.stage === "confirm") {
      app2.innerHTML = typeBack(shown?.positions ?? s.confirm.positions);
      return;
    }
    if (s.stage === "identity" && !s.identity) {
      app2.innerHTML = firstScreen(b.web, b.suggested?.() ?? {});
      if (s.held.length) openIdentities();
      return;
    }
    draw();
    void check();
    await Promise.all([readFeed2(), readInbox(), readPayments().then(() => part === "purchases" ? readBought() : void 0)]);
  }
  function draw() {
    const s = state;
    const body = profileOf ? `<div class="k-body"><section class="k-pane" id="profile"><p class="k-empty">Reading the profile\u2026</p></section></div>` : part === "public" ? publicPart(s, lens, layers) : part === "private" ? "" : purchasesPart(shelf);
    app2.innerHTML = `${topBar(s, profileOf ? null : part)}${body}`;
    if (part === "private" && !profileOf) drawPrivate();
    if (part === "public" && !profileOf) {
      drawFeed();
      drawTyping();
      wireNames();
    }
    if (part === "purchases") drawBought();
    counts();
  }
  function drawTyping() {
    fill("replying", replying ? `<span class="k-chip k-on">Replying to ${e(replying.name)}<button type="button" class="k-x" data-action="unreply" aria-label="Not a reply">\xD7</button></span>` : "");
    fill("addressed", addressed.map((a) => `<span class="k-chip k-on">To ${e(a.name)}<button type="button" class="k-x" data-action="unaddress-one" data-id="${e(a.id)}" aria-label="Not to them">\xD7</button></span>`).join(""));
  }
  function wireNames() {
    const ta = app2.querySelector("#post textarea");
    if (ta) attachNames(ta, contacts, { mention: true, picked: (c) => addTo(c) });
    const to = $("to");
    if (to) attachNames(to, contacts, { mention: false, picked: (c) => (addTo(c), to.value = "", drawTyping()) });
    const ccf = $("cc");
    if (ccf) attachNames(ccf, contacts, { mention: false, title: "Cc", picked: (c) => (addCc(c), ccf.value = "") });
    const cf = $("find-conv");
    cf?.addEventListener("input", () => {
      const q = cf.value.trim().toLowerCase();
      app2.querySelectorAll("[data-conv]").forEach((x) => x.hidden = !!q && !x.innerText.toLowerCase().includes(q));
    });
  }
  const addTo = (c) => {
    if (!addressed.some((a) => a.id === c.id)) addressed.push({ id: c.id, name: c.name ?? shortForm(c.form) });
    drawTyping();
  };
  const addCc = (c) => {
    if (!cc.some((a) => a.id === c.id)) cc.push({ id: c.id, name: c.name ?? shortForm(c.form) });
    drawCc();
  };
  const drawCc = () => fill("ccs", cc.map((a) => `<span class="k-chip k-on">Cc: ${e(a.name)}<button type="button" class="k-x" data-action="uncc-one" data-id="${e(a.id)}" aria-label="Not in Cc">\xD7</button></span>`).join(""));
  function conversations() {
    const me = state.identity.who;
    const byWith = /* @__PURE__ */ new Map();
    for (const m of inbox?.messages ?? []) {
      if (!m.with) continue;
      const c = byWith.get(m.with) ?? { with: m.dir === "in" ? m.who : state.identity.follows.find((f) => f.id === m.with) ?? m.cc[0] ?? whoOf(m.with), last: null, unseen: 0 };
      if (m.dir === "out" && c.with.id !== m.with) c.with = whoOf(m.with);
      if (!c.last || m.at > c.last.at) c.last = m;
      if (m.dir === "in" && !m.seen) c.unseen++;
      byWith.set(m.with, c);
    }
    if (fresh && !byWith.has(fresh.id)) byWith.set(fresh.id, { with: fresh, last: null, unseen: 0 });
    void me;
    return [...byWith.values()].sort((a, b2) => (b2.last?.at ?? Infinity) - (a.last?.at ?? Infinity));
  }
  function whoOf(id) {
    const f = state?.identity?.follows.find((x) => x.id === id);
    if (f) return f;
    for (const m of inbox?.messages ?? []) {
      if (m.who.id === id) return m.who;
      const c = m.cc.find((x) => x.id === id);
      if (c) return c;
    }
    return { id, short: `${id.slice(0, 8)}\u2026${id.slice(-4)}`, names: [], pet: null, me: false, followed: false, muted: false, form: actFormOf(id, "mid"), link: actFormOf(id, "mid") };
  }
  function drawPrivate() {
    if (part !== "private" || profileOf) return;
    const all = conversations();
    const open = conv ? all.find((c) => c.with.id === conv) ?? null : null;
    const msgs = open ? (inbox?.messages ?? []).filter((m) => m.with === open.with.id).sort((a, b2) => a.at - b2.at) : [];
    const body = app2.querySelector(".k-body");
    const html = privatePart(state, all, open, msgs.map((m) => (keep2(messageAct(m), { message: m }), m)));
    if (body) body.outerHTML = html;
    else app2.insertAdjacentHTML("beforeend", html);
    const notes = [
      ...inbox && !inbox.encryption ? [inbox.opening ?? "No encryption key for this identity is here, so its private messages cannot be opened here: it was brought by words that do not carry the one it publishes."] : [],
      ...inbox?.hidden ? [`${inbox.hidden} from muted identities, not shown.`] : [],
      ...state?.proposalsWaiting ? [`${state.proposalsWaiting === 1 ? "A proposal to sign waits" : `${state.proposalsWaiting} proposals to sign wait`} in this identity\u2019s inbox: sign them in Edubba, Collectives \u203A To sign.`] : [],
      ...inbox?.problems ?? []
    ];
    fill("private-notes", notes.map((n) => `<p class="k-clock">${e(n)}</p>`).join(""));
    const t = $("thread");
    if (t) t.scrollTop = t.scrollHeight;
    if (appended) app2.querySelector(`[data-append="${CSS.escape(appended)}"]`)?.classList.add("k-on");
    drawCc();
    wireNames();
    if (open) void seen(msgs.filter((m) => !m.seen && m.dir === "in").map((m) => m.key));
  }
  async function openProfile(id) {
    profileOf = id;
    popup2.close();
    closePanel();
    draw();
    try {
      const r = await b.ask("profile", { id });
      if (profileOf !== id) return;
      const me = r.who.me;
      fill(
        "profile",
        profile({
          who: kitWho(r.who, collectives().includes(r.who.id)),
          lives: r.lives,
          trouble: r.trouble,
          actions: me ? [] : [r.who.followed ? { key: "unfollow", label: "Following" } : { key: "follow", label: "Follow", primary: true }, { key: "message", label: "Message" }, { key: "pay", label: "Pay" }],
          cards: itemCards(r.items),
          empty: "Nothing found from them yet at the places asked.",
          record: "its homes, keys and lines",
          clock: feedFoot(r.clock, r.problems)
        })
      );
    } catch (err) {
      fill("profile", `<div class="k-row"><button type="button" class="k-btn k-q" data-k-back="profile">\u2190 Back</button></div>${note("error", e(errorOf(err)))}`);
    }
  }
  attachClosing();
  attachCards(app2, {
    app: NAME2,
    act: (id) => drawn.get(id)?.act,
    signerItems: (a) => a.signer.me ? [] : [{ key: "message", label: "Message" }],
    actItems(a) {
      const d = drawn.get(a.id);
      const it = d?.item;
      const before = [];
      const after = [];
      if (it || d?.message) before.push({ key: "reply", label: "Reply" });
      if (it?.sealed && !it.who.me && it.sealed.seller === it.who.id) before.push({ key: "repost", label: "Repost" });
      if (!a.signer.me && (it || d?.message)) after.push({ key: "tip", label: "Tip" });
      if (it?.sealed?.state === "for sale" && !it.who.me) after.push({ key: "buy", label: "Buy" });
      if (it?.vow?.state === "for sale" && !it.who.me && !it.vow.problem) after.push({ key: "buy-vow", label: "Buy" });
      for (const p of it?.pictures.filter((x) => x.withdrawable) ?? []) after.push({ key: `withdraw:${p.publication}`, label: "Withdraw the picture" });
      for (const f of it?.films?.filter((x) => x.withdrawable) ?? []) after.push({ key: `withdraw:${f.publication}`, label: "Withdraw the film" });
      const vow = it?.vow?.state === "bought" ? it.vow.vow : d?.purchase?.kind === "vow" && d.purchase.paid && d.purchase.sale !== "confirmed" && d.purchase.sale !== "contested" ? d.purchase.id : null;
      if (vow) after.push({ key: `confirm:${vow}`, label: "Confirm: it was kept", line: true }, { key: `contest:${vow}`, label: "Contest it\u2026" });
      return { before, after };
    },
    choose: (key, a) => void choose(key, a)
  });
  async function choose(key, a) {
    const d = drawn.get(a.id);
    const signer = a.signer.id;
    switch (key) {
      case "profile":
        return openProfile(signer);
      case "open": {
        const target = a.corrects ?? a.answers;
        if (!target) return;
        const title2 = a.corrects ? `What ${a.signer.name ?? "it"}\u2019s correction corrects` : `What ${a.signer.me ? "your" : `${a.signer.name ?? "this"}\u2019s`} ${d?.message ? "message" : "post"} answers`;
        popup2.show(title2, '<p class="k-empty">Reading it from where its signer lives\u2026</p>');
        try {
          const r = await b.ask("open", { id: target.id, signer: target.signer ?? "" });
          popup2.replace(`${'<div class="k-feedwrap"><div class="k-feed">'}${itemCards([r.item])}${card(a, { selected: true })}</div></div><p class="k-clock">The same card, the same two menus. Back returns; closing returns to where you were.</p>`);
        } catch (err) {
          popup2.replace(note("error", e(errorOf(err))));
        }
        return;
      }
      case "why": {
        popup2.show("Why it\u2019s valid", '<p class="k-empty">Reading it, and its signer\u2019s identity chain\u2026</p>');
        try {
          const r = await b.ask("why", { id: a.id, signer });
          popup2.replace(`<h4>${e(r.title)}</h4>${lines(r.lines)}`);
        } catch (err) {
          popup2.replace(note("error", e(errorOf(err))));
        }
        return;
      }
      case "follow":
      case "unfollow":
      case "mute":
      case "unmute":
        return people(key, signer);
      case "message":
        return startConversation(whoOf(signer).id === signer && state?.identity?.follows.some((f) => f.id === signer) ? whoOf(signer) : d?.item?.who ?? d?.message?.who ?? whoOf(signer));
      case "reply": {
        popup2.close();
        if (d?.message) {
          conv = d.message.with;
          part = "private";
          profileOf = null;
          draw();
          app2.querySelector("#message textarea")?.focus();
          return;
        }
        replying = { id: a.id, signer, name: a.signer.me ? "yourself" : a.signer.name ?? shortForm(a.signer.form) };
        part = "public";
        profileOf = null;
        draw();
        app2.querySelector("#post textarea")?.focus();
        return;
      }
      case "repost": {
        const r = await busy("Reposting, with the sealed post held at your relays\u2026", () => b.ask("repost", { post: a.id, signer }));
        if (r) say3("done", lines(r.lines)), await readFeed2();
        return;
      }
      case "rely": {
        popup2.show("Rely on it", '<p class="k-empty">Reading it back\u2026</p>');
        try {
          const r = await b.ask("rely read", { id: a.id, signer });
          const body = popup2.replace(relyForm(r));
          body?.querySelector("#rely")?.setAttribute("data-act", a.id);
          body?.querySelector("#rely")?.setAttribute("data-signer", signer);
        } catch (err) {
          popup2.replace(note("error", e(errorOf(err))));
        }
        return;
      }
      case "anchor": {
        const body = popup2.show("Anchor it", anchorForm(null));
        body.dataset.act = a.id;
        return;
      }
      case "correct": {
        const body = popup2.show("Correct it", correctForm());
        body.dataset.act = a.id;
        return;
      }
      case "tip":
        return payOpen("tip", a, d);
      case "buy":
        return payOpen("buy", a, d);
      case "buy-vow":
        return payOpen("vow", a, d);
    }
    if (key.startsWith("withdraw:")) {
      const publication = key.slice("withdraw:".length);
      if (!confirm("Withdraw it? Readers stop showing it; the post stays. It cannot be undone.")) return;
      const r = await busy("Withdrawing\u2026", () => b.ask("withdraw", { publication }));
      if (r) say3("done", `Withdrawn (act <code>${e(shortForm(actFormOf(r.id)))}</code>).`), await readFeed2();
      return;
    }
    if (key.startsWith("confirm:")) {
      const vow = key.slice("confirm:".length);
      if (!confirm("Confirm that this vow was kept? Your claim of its payment, acknowledging the vow, is signed in public.")) return;
      const r = await busy("Signing your confirmation\u2026", () => b.ask("vow confirm", { vow }));
      if (r) say3("done", lines(r.lines)), await Promise.all([readFeed2(), readBought()]);
      return;
    }
    if (key.startsWith("contest:")) {
      const body = popup2.show("Contest it", contestForm());
      body.dataset.vow = key.slice("contest:".length);
    }
  }
  async function people(op, id) {
    if (op === "mute" && !confirm("Mute this identity? Nothing of it is shown here any more. Nobody is told; it is never published.")) return;
    const r = await busy("Saving\u2026", () => b.ask(op, { id }));
    if (!r) return;
    state = await b.ask("state");
    if (op === "follow") say3("done", `<strong>Added to contacts.</strong>${r.lines.length ? lines(r.lines) : ""}`);
    else if (r.lines.length) say3("done", lines(r.lines));
    if (panelOpen()?.dataset.kPanel === "contacts") openContacts();
    if (profileOf) return openProfile(profileOf);
    await readFeed2();
  }
  function startConversation(w) {
    popup2.close();
    closePanel();
    profileOf = null;
    part = "private";
    conv = w.id;
    if (!(inbox?.messages ?? []).some((m) => m.with === w.id)) fresh = w;
    cc = [];
    appended = null;
    draw();
    app2.querySelector("#message textarea")?.focus();
  }
  let paying = null;
  async function payOpen(kind, a, d, to) {
    const it = d?.item;
    const who = to ?? whoOf(a.signer.id);
    paying = { kind, signer: who.id };
    if (kind === "tip" && a) paying.post = a.id;
    if (kind === "buy" && it?.sealed) Object.assign(paying, { publication: it.sealed.publication, signer: it.sealed.seller, ...it.repost ? { repost: it.id, reposter: it.repost.by.id } : { post: it.id } });
    if (kind === "vow" && it?.vow) Object.assign(paying, { vow: it.vow.vow, signer: it.vow.seller, post: it.id });
    const name = nameOf(who);
    const title2 = kind === "tip" ? `Tip ${name}` : kind === "pay" ? `Pay ${name}` : kind === "vow" ? `Buy ${name}\u2019s vow` : `Buy ${name}\u2019s sealed ${it?.sealed?.media ?? "file"}`;
    popup2.show(title2, '<p class="k-empty">Reading the ways open\u2026</p>');
    try {
      const ways = await b.ask("pay ways", { kind });
      popup2.replace(payChooser({ title: title2, sub: `${kind === "tip" && a ? `For ${shortForm(a.form)} \xB7 ` : ""}${name} \xB7 ${shortForm(who.form)}`, kind, ways, units: state?.units ?? [], price: it?.vow?.price ?? it?.sealed?.price ?? null }));
    } catch (err) {
      popup2.replace(note("error", e(errorOf(err))));
    }
  }
  function panelIds() {
    const s = state;
    const ids = s.held.map((h) => {
      const on = h.active;
      const cs = on ? s.identity?.collectives ?? [] : [];
      return {
        id: h.id,
        form: actFormOf(h.id, "mid"),
        name: h.who.names[0] ?? null,
        on: on && !s.identity?.acting,
        collectives: cs.map((c) => ({ id: c.id, form: c.form, name: c.name, on: s.identity?.acting === c.id, why: c.available ? null : c.why }))
      };
    });
    return ids;
  }
  const ADD = [
    { key: "make", label: "Make one", say: "its chain key\u2019s words shown once" },
    { key: "bring", label: "Bring one", say: "its ID and its signing key\u2019s words" },
    b.web ? { key: "kishib", label: "Use one from Ki\u0161ib", say: "through Ki\u0161ib\u2019s runner, in the computer\u2019s program only: never in the web client", empty: true } : { key: "kishib", label: "Use one from Ki\u0161ib", say: "through Ki\u0161ib\u2019s runner, on this Mac: Dub holds no key" }
  ];
  function identityHtml(adding = false, inside = "") {
    return identityPanel({ ids: panelIds(), adding, add: ADD, foot: '<button type="button" class="k-btn k-q k-small" data-action="this-app">This app: paired browsers, the clock, homes and relays</button>', inside });
  }
  function openIdentities() {
    openPanel(app2, identityHtml(false));
  }
  function openContacts() {
    const html = contactsPanel({ contacts: contacts(), action: "Message", below: contactsBelow(state) });
    if (panelOpen()?.dataset.kPanel === "contacts") redrawPanel(html);
    else openPanel(app2, html);
  }
  function identityMenu(button, id) {
    const s = state;
    const inUse = s.identity?.id === id;
    const h = s.held.find((x) => x.id === id);
    const name = h?.who.names[0] ?? "this identity";
    const items = inUse ? [
      ["name", "Name", s.identity.who.names[0] ?? "none"],
      ["relays", "Relays", String(s.identity.relays.length)],
      ["words", "Words", "the signing words"],
      ["line", "Line and homes", ""],
      ["lane", "A lane from Damgar", ""],
      ["collective", "A collective under it", String(s.identity.collectives.length || "")]
    ] : [["use", "Use this one", ""]];
    popAt(
      button,
      `<div class="k-pop" role="menu"><div class="k-t">${e(name)} \xB7 ${e(shortForm(actFormOf(id, "mid")))}</div>${items.map(([k, l, hint]) => `<button type="button" role="menuitem" data-k-item="${k}">${e(l)}${hint ? `<span class="k-k">${e(hint)}</span>` : ""}</button>`).join("")}<hr><button type="button" role="menuitem" data-k-item="remove">Remove from Dub\u2026</button></div>`,
      "below",
      (key) => void identityChoice(key, id, name)
    );
  }
  async function runnerPopup() {
    const body = popup2.show("Use one from Ki\u0161ib", '<p class="k-small k-soft">Asking Ki\u0161ib, on this Mac\u2026</p>');
    const r = await raw("runner").catch((e3) => ({ available: true, origin: null, state: null, code: null, identities: [], problem: errorOf(e3) }));
    if (body.isConnected) popup2.replace(runnerForm(r));
  }
  async function identityChoice(key, id, name) {
    const s = state;
    const runnerKind = s.held.find((x) => x.id === id)?.kind === "runner";
    switch (key) {
      case "use":
        return use(id, null);
      case "remove":
        redrawPanel(identityHtml(false, runnerKind ? runnerRemoveSaid(name) : removeSaid("Dub", name)));
        app2.querySelector("[data-k-remove-yes]").dataset.id = id;
        return;
      case "name":
        closePanel();
        popup2.show("Name", nameForm(s));
        return;
      case "relays":
        closePanel();
        popup2.show("Relays", relaysForm(s));
        return;
      case "words": {
        closePanel();
        if (runnerKind) return void popup2.show("The signing key\u2019s words", runnerWords());
        const r = await busy("Reading the identity\u2026", () => b.ask("carry"));
        if (r) popup2.show("The signing key\u2019s words", carry(r));
        return;
      }
      case "line":
        closePanel();
        popup2.show("Line and homes", lineFacts(s));
        return;
      case "lane": {
        closePanel();
        const r = await b.ask("lanes").catch(() => null);
        const body = popup2.show("A lane from Damgar", laneForm(s, b.web, r?.say ?? []));
        const l = body.querySelector("#lanes");
        if (l) l.innerHTML = r ? lanesHere(r.lanes) : "";
        await showPayments();
        return;
      }
      case "collective":
        closePanel();
        popup2.show("A collective under it", collectiveForm(s));
        return;
    }
  }
  async function use(id, as) {
    closePanel();
    const s = state;
    if (s.identity?.id !== id) {
      const r = await busy("Switching\u2026", () => b.ask("use", { id }));
      if (!r) return;
      feed = [];
      inbox = null;
      relayItems = null;
      bought = null;
      conv = null;
      fresh = null;
    }
    if (as !== (state?.identity?.acting ?? null) || s.identity?.id !== id) {
      const r = await busy(as ? "Acting as the collective\u2026" : "Acting as the identity itself\u2026", () => b.ask("act as", { id: as ?? "" }));
      if (!r) return refresh();
    }
    replying = null;
    addressed = [];
    profileOf = null;
    await refresh();
  }
  app2.addEventListener("change", async (ev) => {
    const el = ev.target;
    if (el.name === "picture" || el.name === "video") {
      const other = app2.querySelector(`#post input[name="${el.name === "picture" ? "video" : "picture"}"]`);
      if (other && el.files?.[0]) other.value = "";
      fill("picked", el.files?.[0] ? `${el.name === "video" ? "Film" : "Picture"}: ${e(el.files[0].name)} <button type="button" class="k-x" data-action="unpick" aria-label="Not this file">\xD7</button>` : "");
    }
    if (el.id === "publish-list") {
      const on = el.checked;
      if (on && !confirm(PUBLISH_WARNING)) {
        el.checked = false;
        return;
      }
      const r = await busy(on ? "Publishing the follow list\u2026" : "Making the follow list private again\u2026", () => b.ask("list", { published: on, shown: on ? PUBLISH_WARNING : "" }));
      if (r) {
        state = await b.ask("state");
        openContacts();
        say3("done", lines(r.lines));
      } else el.checked = !on;
    }
  });
  app2.addEventListener("click", async (ev) => {
    const t = ev.target;
    const partB = t.closest("[data-k-part]");
    if (partB) {
      part = partB.dataset.kPart;
      profileOf = null;
      draw();
      if (part === "purchases") void readPayments().then(readBought);
      if (part === "private") void readInbox();
      return;
    }
    const lensB = t.closest("[data-k-lens]");
    if (lensB) {
      lens = lensB.dataset.kLens;
      app2.querySelectorAll("[data-k-lens]").forEach((x) => (x.classList.toggle("k-on", x === lensB), x.setAttribute("aria-selected", String(x === lensB))));
      draw();
      if (lens === "relay") void readRelay();
      if (lens === "toyou") void seen(toYou().filter((x) => !x.seen).map((x) => x.id));
      return;
    }
    const layerB = t.closest("[data-k-layer]");
    if (layerB) {
      const k = layerB.dataset.kLayer;
      layers = layers.includes(k) ? layers.filter((x) => x !== k) : [...layers, k];
      if (!layers.length) layers = ["text", "envelopes"];
      draw();
      void readRelay();
      return;
    }
    const shelfB = t.closest("[data-k-shelf]");
    if (shelfB) {
      shelf = shelfB.dataset.kShelf;
      app2.querySelectorAll("[data-k-shelf]").forEach((x) => x.classList.toggle("k-on", x === shelfB));
      drawBought();
      return;
    }
    const opener = t.closest("[data-k-open]");
    if (opener?.dataset.kOpen === "identity") return openIdentities();
    if (opener?.dataset.kOpen === "contacts") return openContacts();
    const useB = t.closest("[data-k-use]");
    if (useB) return use(useB.dataset.kUnder ?? useB.dataset.kUse, useB.dataset.kUnder ? useB.dataset.kUse : null);
    const more = t.closest("[data-k-idmenu]");
    if (more) {
      ev.stopPropagation();
      return identityMenu(more, more.dataset.kIdmenu);
    }
    const add = t.closest("[data-k-add]");
    if (add) {
      const k = add.dataset.kAdd;
      if (k === "toggle") return void redrawPanel(identityHtml(!add.classList.contains("k-on")));
      closePanel();
      if (k === "make") popup2.show("Make a new identity", makeForm(b.web, b.suggested?.() ?? {}));
      if (k === "bring") popup2.show("Bring an identity you have", bringForm(b.web));
      if (k === "kishib") await runnerPopup();
      return;
    }
    if (t.closest("[data-k-remove-no]")) return void redrawPanel(identityHtml(false));
    const yes = t.closest("[data-k-remove-yes]");
    if (yes) {
      const id = yes.dataset.id;
      closePanel();
      if (await busy("Removing it from Dub\u2026", () => b.ask("forget", { id }))) {
        feed = [];
        inbox = null;
        bought = null;
        await b.start();
        say3("done", "Removed from Dub: its keys and what Dub kept about it are gone from this device. Its acts, its homes and the other apps keep it.");
      }
      return;
    }
    const contactOpen = t.closest("[data-k-contact-open]");
    if (contactOpen) return openProfile(contactOpen.dataset.kContactOpen);
    const contactDo = t.closest("[data-k-contact-do]");
    if (contactDo) return startConversation(whoOf(contactDo.dataset.kContactDo));
    const prof = t.closest("[data-k-do]");
    if (prof && profileOf) {
      const k = prof.dataset.kDo;
      if (k === "follow" || k === "unfollow") return people(k, profileOf);
      if (k === "message") return startConversation(whoOf(profileOf));
      if (k === "pay") return payOpen("pay", null, void 0, whoOf(profileOf));
    }
    if (t.closest('[data-k-back="profile"]')) {
      profileOf = null;
      draw();
      void readFeed2();
      return;
    }
    const copyB = t.closest("[data-k-copy],[data-copy-text]");
    if (copyB) {
      const was = copyB.textContent;
      copyB.textContent = await copy(copyB.dataset.kCopy ?? copyB.dataset.copyText ?? "") ? "Copied" : "Select it and copy it";
      setTimeout(() => copyB.textContent = was, 1500);
      return;
    }
    const convB = t.closest("[data-conv]");
    if (convB) {
      conv = convB.dataset.conv;
      cc = [];
      appended = null;
      return drawPrivate();
    }
    const appendB = t.closest("[data-append]");
    if (appendB) {
      appended = appended === appendB.dataset.append ? null : appendB.dataset.append;
      app2.querySelectorAll("[data-append]").forEach((x) => (x.classList.toggle("k-on", x.dataset.append === appended), x.setAttribute("aria-pressed", String(x.dataset.append === appended))));
      return;
    }
    const el = t.closest("[data-action]");
    if (!el) return;
    const d = el.dataset;
    switch (d.action) {
      case "unsay":
        return say3("", "");
      case "runner-again":
        if (closedAsk) showPanel(closedAsk, closedAsk.origin);
        return say3("", "");
      case "runner-drop":
        if (closedAsk) await raw("runner drop", { request: closedAsk.request }).catch(() => void 0);
        closedAsk = null;
        return say3("", "");
      case "runner-pair": {
        const r = await busy("Asking Ki\u0161ib\u2026", () => raw("runner pair"));
        if (r) await runnerPopup();
        return;
      }
      case "runner-look":
        return runnerPopup();
      case "runner-take": {
        const r = await busy("Reading the identity from its homes\u2026", () => raw("runner take", { id: d.id }));
        if (!r) return;
        popup2.close();
        await b.start();
        say3("done", lines(r.lines));
        return;
      }
      case "written":
        app2.innerHTML = typeBack(shown.positions);
        return;
      case "abandon":
        if (!confirm("Forget this new identity? Nothing of it was published. A new one will show new words.")) return;
        shown = null;
        try {
          await b.ask("abandon");
          await b.start();
        } catch (err) {
          await fail(err);
        }
        return;
      case "this-app": {
        closePanel();
        popup2.show("This app", appFoot(state, b.web));
        return;
      }
      case "code": {
        const r = await busy("Making a code\u2026", () => b.ask("code"));
        if (r) fill("code", note("", `Code for another browser, valid ten minutes, once: <code>${e(r.code)}</code>`));
        return;
      }
      case "unpair":
        if (!confirm("Unpair this browser? It will need a new link from the app.")) return;
        try {
          await b.unpair?.();
          await b.start();
        } catch (err) {
          await fail(err);
        }
        return;
      case "collective-remove": {
        const r = await busy("Removing it\u2026", () => b.ask("collective remove", { id: d.id }));
        if (r) await refresh(), say3("done", lines(r.lines));
        return;
      }
      case "at": {
        const ta = app2.querySelector("#post textarea");
        if (!ta) return;
        const at = ta.selectionStart ?? ta.value.length;
        const before = ta.value.slice(0, at);
        ta.value = `${before}${before && !/\s$/.test(before) ? " " : ""}@${ta.value.slice(at)}`;
        ta.focus();
        ta.setSelectionRange(ta.value.length - (ta.value.length - at) + (before && !/\s$/.test(before) ? 2 : 1), ta.value.length - (ta.value.length - at) + (before && !/\s$/.test(before) ? 2 : 1));
        ta.dispatchEvent(new Event("input"));
        return;
      }
      case "address":
        $("to-field").hidden = false;
        $("to")?.focus();
        return;
      case "unaddress": {
        const to = $("to");
        if (to?.value.trim()) addressed.push({ id: namedIn(to, contacts()), name: to.value.trim() });
        if (to) to.value = "";
        $("to-field").hidden = true;
        return drawTyping();
      }
      case "unaddress-one":
        addressed = addressed.filter((a) => a.id !== d.id);
        return drawTyping();
      case "unreply":
        replying = null;
        return drawTyping();
      case "unpick":
        app2.querySelectorAll("#post input[type=file]").forEach((x) => x.value = "");
        return fill("picked", "");
      case "cc":
        $("cc-field").hidden = false;
        $("cc")?.focus();
        return;
      case "uncc": {
        const f = $("cc");
        if (f?.value.trim()) cc.push({ id: namedIn(f, contacts()), name: f.value.trim() });
        if (f) f.value = "";
        $("cc-field").hidden = true;
        return drawCc();
      }
      case "uncc-one":
        cc = cc.filter((a) => a.id !== d.id);
        return drawCc();
      case "askpaid":
        popup2.show(`Ask ${conv ? nameOf(whoOf(conv)) : "them"} to pay you`, askPaidForm(state?.units ?? []));
        return;
      case "convs":
        conv = null;
        return drawPrivate();
      case "new-conv": {
        const body = popup2.show("A new conversation", '<form id="new-conv" class="dub-modal-form"><label>To: a contact\u2019s name, or an ID</label><input name="to" id="new-to" autocomplete="off" spellcheck="false" required><div class="k-row"><button type="submit" class="k-btn k-p">Open it</button></div></form>');
        const f = body.querySelector("#new-to");
        attachNames(f, contacts, { mention: false, picked: () => void 0 });
        f.focus();
        return;
      }
      case "unmute":
        return people("unmute", d.id);
      case "play": {
        const box2 = el.closest("[data-film]");
        el.textContent = "Reading and checking the film\u2026";
        try {
          const r = await b.ask("film", { publication: box2.dataset.film, signer: box2.dataset.filmSigner });
          const bytes = Uint8Array.from(atob(r.b64), (c) => c.charCodeAt(0));
          films.set(box2.dataset.film, URL.createObjectURL(new Blob([bytes], { type: "video/mp4" })));
          showFilms();
        } catch (err) {
          box2.innerHTML = `<span class="k-label k-warn">The film is not played: ${e(errorOf(err))}</span>`;
        }
        return;
      }
      case "look":
        say3("", "");
        await readPayments();
        if (part === "purchases") return readBought();
        if (lens === "relay") void readRelay();
        await Promise.all([readFeed2(true), readInbox()]);
        return;
    }
  });
  const text3 = (s) => typeof s === "string" ? s.trim() : "";
  const linesOf2 = (s) => text3(s).split(/\s+/).filter(Boolean);
  const viaOf = (s) => text3(s).split("\n").map((x) => x.trim()).filter(Boolean);
  function base642(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ""));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
  }
  app2.addEventListener("keydown", (ev) => {
    const ta = ev.target;
    if (ev.key === "Enter" && !ev.shiftKey && ta instanceof HTMLTextAreaElement && ta.closest(".k-typing") && !app2.querySelector("[data-k-suggest]")) {
      ev.preventDefault();
      ta.closest("form")?.requestSubmit();
    }
  });
  app2.addEventListener("submit", async (ev) => {
    const form2 = ev.target;
    const name = form2.getAttribute("id");
    if (name === "pair") return;
    ev.preventDefault();
    const d = new FormData(form2);
    const body = form2.closest(".k-mbody");
    switch (name) {
      case "begin": {
        const r = await busy(
          "Asking each home who runs it, and making the identity\u2026",
          () => b.ask("begin", { homes: linesOf2(d.get("homes")), relays: linesOf2(d.get("relays")), via: viaOf(d.get("via")), name: String(d.get("name") ?? "") })
        );
        if (r) {
          popup2.close();
          shown = { positions: r.positions };
          app2.innerHTML = words(r.words, r.say);
        }
        return;
      }
      case "confirm": {
        const typed = [...form2.querySelectorAll("input")].map((i) => i.value);
        const r = await busy("Checking the words, then sending the genesis to the homes\u2026", () => b.ask("confirm", { typed }));
        if (r) {
          shown = null;
          part = "public";
          await b.start();
          say3("done", `<strong>The identity is born.</strong>${lines(r.lines)}`);
        }
        return;
      }
      case "bring": {
        const r = await busy("Reading the identity from its homes\u2026", () => b.ask("bring", { id: text3(d.get("id")), words: text3(d.get("words")), address: text3(d.get("address")), relays: linesOf2(d.get("relays")), via: viaOf(d.get("via")) }));
        if (r) {
          popup2.close();
          feed = [];
          inbox = null;
          part = "public";
          await b.start();
          say3("done", `<strong>The identity is here.</strong>${lines(r.lines)}`);
        }
        return;
      }
      case "renew": {
        const r = await busy("Checking the new words at its homes\u2026", () => b.ask("renew", { words: text3(d.get("words")) }));
        if (r) await refresh(), say3("done", `<strong>The new words are in use.</strong>${lines(r.lines)}`);
        return;
      }
      case "name": {
        const r = await busy("Publishing the name\u2026", () => b.ask("name", { name: String(d.get("name") ?? "") }));
        if (r) await refresh(), say3("done", r.lines.length ? lines(r.lines) : "Nothing changed.");
        return;
      }
      case "relays": {
        const relays = linesOf2(d.get("relays"));
        const r = await busy("Reading it back\u2026", () => b.ask("relays review", { relays }));
        if (r && body) {
          const rv = body.querySelector("#relays-review");
          if (rv) rv.innerHTML = `<div class="k-box">${lines(r.lines)}<form id="relays-publish" data-digest="${e(r.digest)}" data-relays="${e(relays.join("\n"))}"><button type="submit" class="k-btn k-p">Sign and publish the new routes</button></form></div>`;
        }
        return;
      }
      case "relays-publish": {
        const r = await busy("Publishing the new routes\u2026", () => b.ask("relays publish", { relays: (form2.dataset.relays ?? "").split("\n"), digest: form2.dataset.digest }));
        if (r) await refresh(), say3("done", lines(r.lines));
        return;
      }
      case "lane": {
        const until = String(d.get("until") ?? "");
        const r = await busy(
          "Sealing the lane\u2019s request to this identity\u2026",
          () => b.ask("lane ask", { label: String(d.get("label") ?? ""), cap: String(d.get("cap") ?? ""), total: String(d.get("total") ?? ""), unit: String(d.get("unit") ?? ""), until: until ? Math.floor(new Date(until).getTime() / 1e3) : "", clock: String(d.get("clock") ?? "") })
        );
        if (r) {
          popup2.close();
          say3("done", lines(r.lines));
        }
        return;
      }
      case "collective": {
        const r = await busy("Reading the collective and your member key\u2026", () => b.ask("collective add", { id: text3(d.get("id")) }));
        if (r) await refresh(), say3("done", lines(r.lines));
        return;
      }
      case "clock": {
        const r = await busy("Saving\u2026", () => b.ask("clock", { id: text3(d.get("id")), name: text3(d.get("name")) }));
        if (r) await refresh(), say3("done", lines(r.lines));
        return;
      }
      case "follow": {
        const r = await busy("Following\u2026", () => b.ask("follow", { id: text3(d.get("id")), name: text3(d.get("name")) }));
        if (r) {
          state = await b.ask("state");
          openContacts();
          say3("done", `<strong>Added to contacts.</strong>${r.lines.length ? lines(r.lines) : ""}`);
          void readFeed2();
        }
        return;
      }
      case "post": {
        const pic = form2.elements.namedItem("picture").files?.[0];
        const film = form2.elements.namedItem("video").files?.[0];
        const reply = replying ? { id: replying.id, signer: replying.signer } : void 0;
        const to = $("to");
        if (to?.value.trim()) addressed.push({ id: namedIn(to, contacts()), name: to.value.trim() });
        const r = await busy(
          film ? "Checking the film, stripping it, publishing, and reading it back\u2026" : pic ? "Stripping the picture, publishing, and reading it back\u2026" : "Publishing, and reading it back\u2026",
          async () => b.ask("post", { text: String(d.get("text") ?? ""), jpeg: pic ? await base642(pic) : "", mp4: film ? await base642(film) : "", to: addressed.map((a) => a.id), reply })
        );
        if (r) {
          form2.reset();
          replying = null;
          addressed = [];
          if (to) to.value = "", $("to-field").hidden = true;
          fill("picked", "");
          drawTyping();
          feed = [r.post, ...feed.filter((x) => x.id !== r.post.id)];
          lens = "following";
          draw();
          await readFeed2();
          say3("done", `<strong>Posted.</strong>${lines(r.lines)}`);
        }
        return;
      }
      case "message": {
        if (!conv) return;
        const f = $("cc");
        if (f?.value.trim()) cc.push({ id: namedIn(f, contacts()), name: f.value.trim() });
        const r = await busy("Sealing it, and leaving it in each inbox\u2026", () => b.ask("message", { to: conv, text: String(d.get("text") ?? ""), cc: cc.map((x) => x.id), collective: appended ?? "" }));
        if (r) {
          fresh = null;
          cc = [];
          appended = null;
          say3("done", `<strong>Sent.</strong>${lines(r.lines)}`);
          await readInbox();
          drawPrivate();
        }
        return;
      }
      case "new-conv": {
        const f = form2.querySelector("input");
        const id = namedIn(f, contacts());
        let who;
        if (/^[0-9a-f]{64}$/.test(id)) who = whoOf(id);
        else {
          const typed = id.trim();
          who = { id: typed, short: shortForm(typed), names: [], pet: null, me: false, followed: false, muted: false, form: typed.split("?")[0], link: typed };
        }
        startConversation(who);
        return;
      }
      case "askpaid": {
        const r = await busy("Sealing the request to this identity\u2026", () => b.ask("ask paid", { to: conv ?? "", value: String(d.get("value") ?? ""), unit: String(d.get("unit") ?? ""), whatFor: String(d.get("whatFor") ?? "") }));
        if (r) popup2.close(), say3("done", lines(r.lines));
        return;
      }
      case "pay": {
        if (!paying) return;
        const how = String(d.get("how") ?? "");
        const r = await busy(
          how === "lane" ? "Signing under Dub\u2019s lane\u2026" : how === "damgar" ? "Sealing the payment for Damgar\u2026" : "Writing it out\u2026",
          () => b.ask("pay", { ...paying, how, value: String(d.get("value") ?? ""), unit: String(d.get("unit") ?? ""), whatFor: String(d.get("whatFor") ?? "") })
        );
        if (!r) return;
        if (r.hand) {
          popup2.replace(`${lines(r.lines)}${byHand(r.hand)}`);
          return;
        }
        if (r.woken) {
          popup2.close();
          damgarPanel(r.woken);
          return;
        }
        if (how === "lane") {
          popup2.replace(`${lines(r.lines)}<div id="payments"><p class="k-small k-soft">Reading\u2026</p></div>`);
          await showPayments();
        } else {
          popup2.close();
          say3("done", lines(r.lines));
        }
        await Promise.all([readFeed2(), part === "purchases" ? readBought() : Promise.resolve()]);
        return;
      }
      case "rely": {
        const r = await busy("Signing the witness act\u2026", () => b.ask("rely", { id: form2.dataset.act, signer: form2.dataset.signer, typed: String(d.get("typed") ?? "") }));
        if (r) popup2.close(), say3("done", lines(r.lines));
        return;
      }
      case "anchor-offers": {
        const service = text3(d.get("service"));
        const r = await busy("Reading the service\u2019s standing offers\u2026", () => b.ask("anchor offers", { service }));
        if (r && body) {
          const act = body.dataset.act;
          popup2.replace(anchorForm(r.offers, service));
          const nb = app2.querySelector(".k-mbody");
          if (nb && act) nb.dataset.act = act;
        }
        return;
      }
      case "anchor": {
        const [offer, tier] = String(d.get("tier") ?? ":").split(":");
        const r = await busy("Preparing the payment for Damgar\u2026", () => b.ask("anchor", { id: body?.dataset.act, service: form2.dataset.service, offer, tier: Number(tier) }));
        if (r) popup2.close(), say3("done", lines(r.lines));
        return;
      }
      case "correct": {
        const r = await busy("Signing the correction\u2026", () => b.ask("correct", { id: body?.dataset.act, text: String(d.get("text") ?? "") }));
        if (r) popup2.close(), say3("done", lines(r.lines)), await readFeed2();
        return;
      }
      case "contest": {
        if (!confirm("Contest this sale? A contest naming it is signed in public. It voids nothing.")) return;
        const r = await busy("Signing your contest\u2026", () => b.ask("vow contest", { vow: body?.dataset.vow, promise: String(d.get("promise") ?? "") }));
        if (r) popup2.close(), say3("done", lines(r.lines)), await Promise.all([readFeed2(), readBought()]);
        return;
      }
      case "paid": {
        const r = await busy("Checking the proof, then signing the claim under the lane\u2026", () => b.ask("paid", { key: form2.dataset.key, proof: String(d.get("proof") ?? "") }));
        if (r) say3("done", lines(r.lines)), await showPayments(), await Promise.all([readFeed2(), readBought()]);
        return;
      }
    }
  });
  return { show };
}

// src/web/keep.ts
var DB = "dub";
var STORE = "keep";
var LOCK = "dub-signing";
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
  waiting = null;
  static async open() {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    const k = new _WebKeep(await request(r));
    await k.migrate();
    return k;
  }
  async get(key) {
    return request(this.db.transaction(STORE).objectStore(STORE).get(key));
  }
  async write(f) {
    const t = this.db.transaction(STORE, "readwrite");
    f(t.objectStore(STORE));
    await new Promise((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error ?? new Error("the browser refused to keep it"));
    });
  }
  put(key, value) {
    return this.write((s) => s.put(JSON.parse(JSON.stringify(value)), key));
  }
  /** The single identity kept before 16 October 2026, moved under its ID and put in use. */
  async migrate() {
    const f = await this.get("identity");
    if (!f || f.label !== TEST_LABEL) return;
    const s = await this.get("settings");
    await this.write((st) => {
      st.put(f, `identity:${f.identity}`);
      if (s) st.put(s, `settings:${f.identity}`);
      st.put(f.identity, "active");
      st.delete("identity");
      st.delete("settings");
    });
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
  async settings(id) {
    return await this.get(`settings:${id}`) ?? { kind: "made", relays: [], via: {} };
  }
  async saveSettings(id, s) {
    await this.put(`settings:${id}`, { kind: s.kind, relays: s.relays, via: {}, ...s.signing ? { signing: true } : {} });
  }
  async people(id) {
    return { ...NO_PEOPLE(), ...await this.get(`people:${id}`) ?? {} };
  }
  async savePeople(id, p) {
    await this.put(`people:${id}`, p);
  }
  /** The Signing tab's state, `signing:ID`: a one-time key's secret only while its share waits (H18). */
  async signing(id) {
    return { ...NO_SIGNING(), ...await this.get(`signing:${id}`) ?? {} };
  }
  async saveSigning(id, s) {
    await this.put(`signing:${id}`, s);
  }
  /** What Dub keeps for money (round 2), `money-NAME:ID`: its lane's key and strand, the payments signed under it, the keys of posts sold or bought. */
  async money(id, name) {
    return await this.get(`money-${name}:${id}`) ?? null;
  }
  async saveMoney(id, name, v) {
    await this.put(`money-${name}:${id}`, v);
  }
  /** Forget an identity in this browser: its keys and everything kept about it. Only its signing key's words, if written down, bring it back. */
  async forget(id) {
    await this.write((s) => {
      for (const k of ["identity", "settings", "people", "signing", ...MONEY_KEPT.map((m) => `money-${m}`)]) s.delete(`${k}:${id}`);
    });
  }
  async pending() {
    return this.waiting;
  }
  async savePending(p) {
    this.waiting = p;
  }
  async dropPending() {
    this.waiting = null;
  }
  /**
   * One signer at a time across every tab of this site: two tabs signing at
   * once would put two acts at one position of a line. Each signer reads
   * the identity afresh inside the lock (`Dub` does).
   */
  exclusive(f) {
    if (!navigator.locks) return f();
    return navigator.locks.request(LOCK, f);
  }
};

// src/web/app.ts
var app = document.getElementById("app");
var keep;
var dub;
var list7 = (x) => Array.isArray(x) ? x.map(String) : [];
var platform = { bytes: (b643) => Uint8Array.from(atob(b643), (ch) => ch.charCodeAt(0)), via: () => ({}) };
var ask = (op, a = {}) => run(dub, op, a, platform);
async function deployer() {
  try {
    const r = await fetch("dub.json", { cache: "no-store" });
    if (!r.ok) return {};
    const j = await r.json();
    const urls = (x) => list7(x).filter((s) => /^https:\/\/[^\s]+$/.test(s));
    return { homes: urls(j.homes), relays: urls(j.relays), reader: urls([j.reader])[0] };
  } catch {
    return {};
  }
}
var suggested = {};
var ui = mount(app, { web: true, ask, start, suggested: () => suggested });
async function start() {
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    app.innerHTML = `${alone(note("error", "This page keeps a key in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it."))}`;
    return;
  }
  try {
    keep ??= await WebKeep.open();
  } catch (err) {
    app.innerHTML = `${alone(note("error", `This browser does not let the page keep anything (${e(err instanceof Error ? err.message : String(err))}). A private window may not.`))}`;
    return;
  }
  if (!dub) {
    const d = await deployer();
    suggested = { homes: d.homes, relays: d.relays };
    dub = new Dub(keep, { web: true, reader: d.reader });
  }
  let state;
  try {
    state = await dub.state();
  } catch (err) {
    app.innerHTML = `${alone(note("error", e(err instanceof Error ? err.message : String(err))))}`;
    return;
  }
  await ui.show(state);
}
void start();
