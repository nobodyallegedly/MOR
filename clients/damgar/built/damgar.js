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
  agreementsChoose(specs, payee, amount2, accepted) {
    const ptr0 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArrayJsValueToWasm0(accepted, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsChoose(this.__wbg_ptr, specs, ptr0, len0, amount2, ptr1, len1);
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
  agreementsForkAlarm(specs, payment2, held) {
    const ptr0 = passStringToWasm0(payment2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
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
  agreementsPayerSplit(specs, agreement, object, amount2) {
    const ptr0 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(object) ? 0 : passStringToWasm0(object, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_agreementsPayerSplit(this.__wbg_ptr, specs, ptr0, len0, ptr1, len1, amount2);
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
  agreementsSplitTurns(specs, service, agreement, stake, holders, previous) {
    const ptr0 = passStringToWasm0(service, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(agreement, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(holders, wasm.__wbindgen_malloc);
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
  moneyChoose(money_spec, payee, amount2, accepted) {
    const ptr0 = passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(payee, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArrayJsValueToWasm0(accepted, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ret = wasm.verifier_moneyChoose(this.__wbg_ptr, ptr0, len0, ptr1, len1, amount2, ptr2, len2);
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
function anchoringCheckTicket(offer_act, ticket, commitment, leaf, now2) {
  const ptr0 = passArray8ToWasm0(offer_act, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(ticket, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ptr2 = passArray8ToWasm0(commitment, wasm.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN;
  const ptr3 = passStringToWasm0(leaf, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len3 = WASM_VECTOR_LEN;
  const ret = wasm.anchoringCheckTicket(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, now2);
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
function encryptionKeyPayload(version, previous, _public) {
  var ptr0 = isLikeNone(previous) ? 0 : passStringToWasm0(previous, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len0 = WASM_VECTOR_LEN;
  const ptr1 = passArray8ToWasm0(_public, wasm.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN;
  const ret = wasm.encryptionKeyPayload(version, ptr0, len0, ptr1, len1);
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
function railCheck(module2, commitment, amount2, address, rail_proof, chain) {
  const ptr0 = passStringToWasm0(module2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ptr1 = passStringToWasm0(commitment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len1 = WASM_VECTOR_LEN;
  const ptr2 = passArray8ToWasm0(address, wasm.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN;
  const ptr3 = passArray8ToWasm0(rail_proof, wasm.__wbindgen_malloc);
  const len3 = WASM_VECTOR_LEN;
  const ret = wasm.railCheck(ptr0, len0, ptr1, len1, amount2, ptr2, len2, ptr3, len3, chain);
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
      const table = wasm.__wbindgen_externrefs;
      const offset = table.grow(4);
      table.set(0, void 0);
      table.set(offset + 0, void 0);
      table.set(offset + 1, null);
      table.set(offset + 2, true);
      table.set(offset + 3, false);
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
  } catch (e2) {
    const idx = addToExternrefTable0(e2);
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
      } catch (e2) {
        const validResponse = expectedResponseType(module2.type);
        if (validResponse && module2.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e2);
        } else {
          throw e2;
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
  const message3 = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message3);
  throw new RangeError(message3);
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
      let acts = [];
      try {
        const e2 = cborDecode(body);
        code = e2.get(0);
        reason = e2.get(1) ?? reason;
        acts = bytesList(e2.get(2));
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
    } catch (e2) {
      if (e2 instanceof RelayError && e2.code === CODE.notHeld) return null;
      throw e2;
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
    } catch (e2) {
      if (e2 instanceof RelayError && e2.code === CODE.notHeld) return null;
      throw e2;
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
  const ownPrev = new Map(o.own.map((id, i) => [id, i ? o.own[i - 1] : null]));
  const prevOf = (id) => {
    if (ownPrev.has(id)) return { known: true, prev: ownPrev.get(id) };
    const d = held.get(id);
    if (!d || d.spec === void 0) return { known: false, prev: null };
    return { known: true, prev: d.prev ?? null };
  };
  const named = /* @__PURE__ */ new Set();
  for (const id of [...held.keys(), ...o.own]) {
    const p = prevOf(id);
    if (p.prev) named.add(p.prev);
  }
  const ownTip = o.own[o.own.length - 1];
  const tips = [...held.values()].filter((d) => !named.has(d.id) && d.binding === o.binding).map((d) => d.id);
  if (ownTip && !tips.includes(ownTip) && !named.has(ownTip)) tips.push(ownTip);
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
    const position = d?.position ?? (ownPrev.has(tip) ? o.own.indexOf(tip) + 1 : void 0);
    if (!why && position !== void 0 && position !== ids.length) why = `its latest act says position ${position}, but ${ids.length} acts were found behind it`;
    out.push({
      tip,
      own: tip === ownTip,
      readable: !why,
      card: why ? null : { act: tip, position: ids.length, summary: runningSummary(ids) },
      latest,
      ...why ? { why } : {}
    });
  }
  return out.sort((a, b) => Number(b.own) - Number(a.own) || (a.tip < b.tip ? -1 : 1));
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
  const kept = [];
  const left = [];
  const shown = [];
  for (const l of lines2) {
    const card = cards.find((c) => c.act === l.tip) ?? l.card;
    if (leaveOut.has(l.tip)) {
      left.push(l);
      shown.push({ text: `${lineWords(l)} Left out by name: its acts become void.`, tone: "bad" });
    } else if (card) {
      kept.push(card);
      shown.push({ text: l.readable ? `${lineWords(l)} Kept.` : `${lineWords(l)} Kept by the card given: position ${card.position}, summary ${card.summary}.`, tone: l.readable ? "ok" : "warn" });
    } else {
      left.push(l);
      shown.push({ text: `${lineWords(l)} No card was given, so it is left out: its acts become void.`, tone: "bad" });
    }
  }
  for (const c of cards) {
    if (lines2.some((l) => l.tip === c.act)) continue;
    kept.push(c);
    shown.push({ text: `A line ending at ${c.act}, not found at the identity's homes or relays: kept by the card given (position ${c.position}, summary ${c.summary}).`, tone: "warn" });
  }
  return { kept, left, shown, warning: left.length ? voidWarning(left) : null };
}
function checkWarned(plan, warned) {
  if (plan.warning && warned !== plan.warning) {
    throw new Error(`Nothing was signed. ${plan.warning} Show this to the owner and pass it back to leave ${plan.left.length === 1 ? "it" : "them"} out, or give a card for each line to keep.`);
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
async function lookUp(identity, hints, via = {}, into) {
  const v = into ?? new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const asked = /* @__PURE__ */ new Set();
  const unreachable = [];
  const notTried = [];
  const operatorActs = /* @__PURE__ */ new Map();
  const heldBytes = /* @__PURE__ */ new Map();
  const keep = (acts) => {
    for (const a of acts) {
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
  const e2 = v.latest(identity, SPECS.envelopes, ENVELOPES_TYPES.encryptionKey);
  let encryptionKey = null;
  if (e2.payload) {
    const p = cborDecode(e2.payload);
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
    encryptionKeyAct: e2.act ?? null,
    encryptionKey,
    inbox(spec) {
      const inboxes = routes.filter((x) => x.kind === 1);
      const hit = inboxes.find((x) => x.scope === spec) ?? inboxes.find((x) => x.scope === null);
      return hit ? hit.hints : null;
    }
  };
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
var TEST_RAIL = test("a test rail Module, no real rail");
var TEST_TIME = test("a test time reference, no real clock");
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
  } catch (e2) {
    throw new NotAStamp(`not CBOR (${e2 instanceof Error ? e2.message : e2})`);
  }
  if (!(m instanceof Map)) throw new NotAStamp("not a map");
  for (const k of m.keys()) if (k !== 0 && k !== 1) throw new NotAStamp(`${String(k)} is not one of its fields`);
  const time = m.get(0);
  if (typeof time !== "number" || !Number.isSafeInteger(time) || time < 0) throw new NotAStamp("its time (field 0) is not a whole number of seconds");
  const list3 = m.get(1);
  if (!Array.isArray(list3) || !list3.length) throw new NotAStamp("its acts (field 1) are not a list of at least one");
  if (list3.length > MOST_PER_STAMP) throw new NotAStamp(`it names more than ${MOST_PER_STAMP} acts`);
  const acts = list3.map((x, i) => {
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
  } catch (e2) {
    if (e2 instanceof NotAStamp) return null;
    throw e2;
  }
}
function earliest(stamps) {
  const out = /* @__PURE__ */ new Map();
  for (const s of stamps) for (const a of s.acts) if (!out.has(a) || s.time < out.get(a)) out.set(a, s.time);
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
    const e2 = m.get(1);
    if (!Array.isArray(e2) || e2.length !== 3 || !h32(e2[0]) || typeof e2[2] !== "number") throw new Error("the expiry is not [clock, reference, point]");
    if (hex(e2[0]) === CLOCKS.timestamp) {
      if (!h32(e2[1])) throw new Error("a timestamp clock is named by its identity");
      out.expiry = { clock: "timestamp", identity: hex(e2[1]), time: e2[2] };
    } else {
      if (typeof e2[1] !== "number") throw new Error("a Bitcoin clock is named by its network");
      out.expiry = { clock: "height", spec: hex(e2[0]), network: e2[1], height: e2[2] };
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
      } catch (e2) {
        limitsProblem = `its limits cannot be read: ${e2 instanceof Error ? e2.message : String(e2)}`;
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
var fetchAct = async (id, hints, via) => {
  for (const h of hints) {
    try {
      const a = await relayAt(h, via).getAct(id);
      if (a) return a;
    } catch {
    }
  }
  return null;
};
async function stampsOf(clock, hints, via = {}) {
  const judgeStamp = {
    standing: async (act, id, signer) => {
      const l = await lookUp(signer, hints, via);
      l.verifier.add(act);
      return l.verifier.status(id);
    }
  };
  return (await readStamps(clock, hints, judgeStamp, via)).earliest;
}
async function authorityOf(act, hints, via = {}, opts = {}) {
  const d = opts.key ? openWithKey(act, opts.key) : describeAct(act);
  if (!d.signer || !d.binding) return null;
  const grantBytes = await fetchAct(d.binding, hints, via);
  if (!grantBytes) return null;
  const gd = describeAct(grantBytes);
  if (gd.spec !== MIRS.agreements || gd.type !== AGREEMENTS_TYPES.grant || !gd.payload) return null;
  const g = readGrant(gd.payload);
  const names = opts.names ?? ((id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`);
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  for (const id of [d.signer, g.grantee]) {
    try {
      await lookUp(id, hints, via, v);
    } catch {
    }
  }
  v.add(grantBytes);
  for (const a of await allBy(g.grantee, hints, via)) {
    const x = describeAct(a);
    if (x.spec === MIRS.agreements && x.type === AGREEMENTS_TYPES.signature && x.objects?.some((o) => o[0] === d.binding)) v.add(a);
  }
  for (const a of await allBy(d.signer, hints, via)) {
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
        stamps.set(g.limits.expiry.identity, await stampsOf(g.limits.expiry.identity, hints, via));
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

// ../grants/src/lanes.ts
function reaches(kinds, spec, type, layerOf) {
  if (!kinds?.length) return true;
  return kinds.some((k) => "layer" in k ? layerOf(spec) === k.layer : k.spec === spec && k.type === type);
}
async function revocationsOf(grantor, grant, hints, via = {}) {
  const out = [];
  for (const a of await allBy(grantor, hints, via)) {
    const d = describeAct(a);
    if (d.spec !== MIRS.agreements || d.type !== REVOCATION || !d.payload) continue;
    const named = cborDecode(d.payload).get(0);
    if (named instanceof Uint8Array && hex(named) === grant && !out.includes(d.id)) out.push(d.id);
  }
  return out;
}
async function actsUnder(grantor, grant, hints, via = {}) {
  const out = [];
  for (const a of await allBy(grantor, hints, via)) {
    const d = describeAct(a);
    if (d.binding === grant && !out.some((x) => x.id === d.id)) out.push({ id: d.id, public: d.public, spec: d.spec, type: d.type });
  }
  return out;
}

// src/link-say.ts
var LINK_SAY = [
  "Damgar can answer a Lightning payment to you by itself, if you let it make invoices on your node. It needs a permission from your node that makes invoices and does nothing else: it cannot pay, cannot read your balance, cannot move money.",
  "On lnd: bake it with \u201Clncli bakemacaroon invoices:write invoices:read\u201D, and give its file here with the node\u2019s address and certificate. Damgar asks the node for its balance with it first, and refuses a permission that can read it.",
  "Its cost: whoever steals it can make invoices in your node\u2019s name, never take anything. Remove it here at any time; without it, you make each invoice in your wallet, as before.",
  "An invoice is made by itself only below the cap of your receipts lane, and only while \u201CFollow every step by hand\u201D is off."
];

// src/web/node-fs.ts
var none = (name) => () => {
  throw new Error(`${name}: there are no files in a browser`);
};
var readFileSync = none("readFileSync");
var writeFileSync = none("writeFileSync");
var renameSync = none("renameSync");

// ../genesis/src/kex.ts
var kexLog = { recording: false, entries: [] };
function record(e2) {
  if (kexLog.recording) kexLog.entries.push(e2);
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
var AGREEMENTS_RECORD = 17;
var b64 = (b) => base64(b);
var unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
var TestIdentity = class _TestIdentity {
  constructor(f, via = {}) {
    this.f = f;
    this.via = via;
  }
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
      } catch (e2) {
        if (e2 instanceof RelayError && e2.code === CODE.missingPredecessor) {
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
        out.push(failure(h.hint, e2));
      }
    }
    return out;
  }
  /** Send the genesis to every home it names; each signs a receipt. */
  async publishGenesis() {
    return this.submitChainAct(this.chainActs()[0], this.f.homes);
  }
  // ------------------------------------------------------------ everyday acts
  everyday(spec, type, payload, opts) {
    if (opts.acks?.length && !ACK_SPECS.includes(spec)) {
      throw new Error("only Identity, Money and Agreements acts may acknowledge (Envelopes rule 4a, F110): to rely on this act, sign a witness act");
    }
    const isRecord = spec === MIRS.agreements && type === AGREEMENTS_RECORD;
    let objects = opts.objects;
    if (this.f.cites && spec !== SPECS.identity && !isRecord && !objects?.some((o) => o[0] === this.f.identity)) {
      objects = [...objects ?? [], ...this.f.cites.map((d) => [this.f.identity, d])];
    }
    const made = makeEveryday({
      signingSecret: unhex(this.f.signingSecret),
      signer: this.f.identity,
      binding: this.f.binding,
      spec,
      type,
      payload,
      sequence: this.f.sequence,
      public: opts.public,
      to: opts.to,
      objects,
      refs: opts.refs,
      acks: opts.acks
    });
    this.f.sequence.push(made.id);
    if (this.f.cites && isRecord) this.f.cites = [made.id];
    return made;
  }
  /** Send an everyday identity act to every home: its standing depends on it (Envelopes, "How acts reach people"). */
  async toHomes(act) {
    const out = [];
    for (const h of this.f.homes) {
      try {
        out.push({ home: h.hint, result: await this.relay(h.hint).putAct(act) });
      } catch (e2) {
        out.push(failure(h.hint, e2));
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
    const version = (this.f.routes?.version ?? 0) + 1;
    const payload = routesPayload({ version, previous: this.f.routes?.act, routes });
    const made = this.everyday(SPECS.identity, IDENTITY_TYPES.routes, payload, { public: true });
    this.f.routes = { version, act: made.id };
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
    if (acts.some((a) => this.f.sequence.includes(a))) throw new Error("a witness act names other identities' acts, not this one's");
    const made = this.everyday(SPECS.identity, IDENTITY_TYPES.witness, cborEncode(/* @__PURE__ */ new Map()), { public: true, acks: acts });
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
    const version = (last?.version ?? 0) + 1;
    const secret = given ?? newEncryptionSecret();
    const payload = encryptionKeyPayload(version, last?.act, xwingPublic(secret));
    const made = this.everyday(SPECS.envelopes, ENVELOPES_TYPES.encryptionKey, payload, { public: true });
    this.f.encryption.push({ version, act: made.id, secret: hex(secret) });
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
    return linesOf({ identity: this.f.identity, binding: this.f.binding, own: this.f.sequence, acts: await actsBy(this.f.identity, at, this.via), specs: o.specs });
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
      } catch (e2) {
        unanchored = e2.message;
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
      } catch (e2) {
        if (!(e2 instanceof TypeError) && !(e2 instanceof RelayError)) throw e2;
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
    const made = this.everyday(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, payload, {
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
    const made = this.everyday(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, payload, { public: false });
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
  /**
   * Publish an act on this identity's own relays, for example a private
   * post whose key it will deliver. Returns the act id and its content key.
   */
  async publish(spec, type, payload, opts) {
    const made = this.everyday(spec, type, payload, {
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
    const known = /* @__PURE__ */ new Set([...this.f.sequence, ...this.chainActs().map((a) => actId(a))]);
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
    const secrets = [...this.f.encryption].reverse().map((e2) => unhex(e2.secret));
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
  } catch (e2) {
    return { sealed: id, opened: false, error: String(e2) };
  }
  const index = me === null ? 0 : parts.to.indexOf(me);
  if (index < 0) return { sealed: id, opened: false, error: "not addressed to this identity" };
  let lastError = "no key";
  for (const secret of secrets) {
    record({ kind: "decapsulate", secret, ct: parts.capsules[index] });
    let o;
    try {
      o = openSealed(sealed, me ?? void 0, secret);
    } catch (e2) {
      lastError = String(e2);
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
      } catch (e2) {
        r.status = `sender not found: ${e2}`;
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
function failure(home, e2) {
  if (e2 instanceof RelayError) return { home, error: e2.reason, code: e2.code };
  return { home, error: String(e2) };
}

// ../repo/src/proposals.ts
var NEGOTIATION = 18;
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
    } catch (e2) {
      failed.push({ relay: hint, reason: e2 instanceof Error ? e2.message : String(e2) });
    }
  }
  return { id: made.id, act: made.act, key: made.key, sealed: sealedId(sealed), left, failed };
}

// ../grants/src/member.ts
var MEMBER_KEYS_SPEC = sha2562("Member keys cMIP, draft 1, test value until publication");
var MEMBER_KEY = 0;
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
async function readMemberKeys(identity, secrets, homes, via = {}) {
  const out = /* @__PURE__ */ new Map();
  if (!secrets.length) return [];
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l;
  try {
    l = await lookUp(identity, homes, via, v);
  } catch {
    return [];
  }
  const at = [.../* @__PURE__ */ new Set([...homes, ...l.resolution.homes.map((h) => h.hint)])];
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via).feed({ to: identity, after });
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
async function rootOf(terms, hints, via) {
  let cur = terms;
  for (let i = 0; i < 64; i++) {
    let a = null;
    for (const h of hints) {
      a = await relayAt(h, via).getAct(cur).catch(() => null);
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
async function memberKeyFor(keys, collective, hints, via = {}) {
  const { founding } = await foundingOf(collective, hints, via);
  for (const k of [...keys].reverse()) if (await rootOf(k.terms, hints, via) === founding) return k;
  return null;
}
async function chainFor(collective, k, hints, via = {}) {
  const { links } = await foundingOf(collective, hints, via);
  const latest = links[links.length - 1];
  let decision = latest;
  let best = -1;
  const strand = [];
  for (const a of await allBy(collective, hints, via)) {
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
    objects: [...a.objects ?? [], [collective, at.decision]],
    refs: a.refs?.length ? a.refs : void 0
  });
  at.strand.push(made.id);
  return made;
}
async function publishAt(acts, places, via = {}) {
  const ok = [];
  for (const p of places) {
    try {
      for (const a of acts) await relayAt(p, via).putAct(a);
      ok.push(p);
    } catch {
    }
  }
  return ok;
}
async function collectiveVerifier(collective, hints, via = {}, acts = []) {
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
  for (const id of acts) {
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
  return { v, founding, parties: [...parties] };
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
async function signAndAsk(me, collective, key, act, ask2, text3, hints, via = {}) {
  const at = await chainFor(collective, key, hints, via);
  const made = signAsMember(collective, key, at, { ...act, public: true });
  const places = await publishAt([made.act], hints, via);
  if (!places.length) throw new Error("No relay took the act: nothing counts. Try again.");
  const asked = [];
  const notAsked = [];
  for (const h of ask2) {
    try {
      const l = await lookUp(h, hints, via);
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
async function collectivePointer(collective, hints, via = {}, pay) {
  const places = await collectivePlaces(collective, hints, via);
  const { v, founding } = await collectiveVerifier(collective, places, via).catch(() => ({ v: null, founding: null }));
  if (!v || !founding) return null;
  const pointers = [];
  for (const a of await allBy(collective, places, via)) {
    const d = describeAct(a);
    if (d.spec === MIRS.money && d.type === 0) pointers.push([d.id, true]);
  }
  const specs = withGrantLimits(AGREEMENTS_SPECS, pointers);
  const p = v.agreementsPointer(specs, collective);
  const choice = pay ? v.agreementsChoose(specs, collective, pay.amount, pay.accepted) : null;
  return { pointer: p.act ?? null, version: p.version ?? 0, why: p.why ?? null, choice };
}
async function judgeCollective(collective, acts, hints, via = {}, limits = []) {
  const { v } = await collectiveVerifier(collective, hints, via, acts);
  const out = /* @__PURE__ */ new Map();
  for (const id of acts) {
    try {
      out.set(id, v.agreementsConsent(withGrantLimits(AGREEMENTS_SPECS, limits), id));
    } catch (e2) {
      out.set(id, { kind: "unread", reason: e2 instanceof Error ? e2.message : String(e2), met: false, areas: [] });
    }
  }
  return out;
}
async function collectivePlaces(collective, hints, via = {}) {
  try {
    const l = await lookUp(collective, hints, via);
    return [.../* @__PURE__ */ new Set([...hints, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)])];
  } catch {
    return [...new Set(hints)];
  }
}
var LAYER_OF = { [MIRS.text]: 1, [MIRS.envelopes]: 1, [MIRS.money]: 2, [MIRS.agreements]: 3, [MIRS.development]: 4 };
async function termsAt(agreement, places, via = {}) {
  for (const h of places) {
    const a = await relayAt(h, via).getAct(agreement).catch(() => null);
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
async function splitServiceOf(agreement, payee, places, via = {}) {
  const t = await termsAt(agreement, places, via);
  if (!t) return null;
  const grants = t.splitGrant ? [t.splitGrant] : t.payeeGrants ?? [];
  for (const g of grants) {
    for (const h of places) {
      const a = await relayAt(h, via).getAct(g).catch(() => null);
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

// src/collective.ts
var MONEY_LAYER = 2;
function capOf(hexed) {
  if (!hexed) return null;
  try {
    const m = cborDecode(unhex(hexed));
    const c = m instanceof Map ? m.get(0) : null;
    return Array.isArray(c) && c[0] instanceof Uint8Array && typeof c[1] === "number" ? { unit: hex(c[0]), value: c[1] } : null;
  } catch {
    return null;
  }
}
async function termsOf(id, hints, via) {
  for (const h of hints) {
    const a = await relayAt(h, via).getAct(id).catch(() => null);
    if (!a) continue;
    const d = describeAct(a);
    if (d.spec !== REPO_SPECS.agreements || d.type !== 0 || !d.payload) return null;
    return readTerms(d.payload, AGREEMENTS_SPECS);
  }
  return null;
}
async function readCollective(me, id, hints, via) {
  const now2 = await collectiveNow(id, hints, via);
  if (!now2.agreement) return { id, agreement: null, area: null, key: null, why: "Its agreement in force could not be read from its relays and homes." };
  const t = await termsOf(now2.agreement, hints, via);
  const a = t?.areas.find((x) => x.kinds.some((k) => k.form === "layer" && k.layer === MONEY_LAYER || k.spec === AGREEMENTS_SPECS.money));
  const area = a ? { id: a.id, name: a.name, holders: a.holders, number: a.threshold, cap: capOf(a.limits) } : null;
  const keys = await readMemberKeys(me.id, me.f.encryption.map((e2) => unhex(e2.secret)), me.f.homes.map((h) => h.hint), via).catch(() => []);
  const key = keys.length ? await memberKeyFor(keys, id, hints, via).catch(() => null) : null;
  let why = null;
  if (!area) why = "Its constitution draws no Money area: the collective\u2019s money acts count on its own key, held by its founder\u2019s Edubba.";
  else if (!area.holders.includes(me.id)) why = `You hold no box in its Money area (\u201C${area.name}\u201D): your key does not count there.`;
  else if (!key) why = "No key of yours for this collective was found sealed to you at your homes: it is made when you sign its founding or a member change.";
  return { id, agreement: now2.agreement, area, key, why };
}
var withinCap = (area, amount2) => !area.cap || area.cap.unit === amount2.unit && amount2.value <= area.cap.value;
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
async function signPromise(me, c, payload, ask2, text3, hints, via) {
  return signAndAsk(me, c.id, c.key, { spec: AGREEMENTS_SPECS.money, type: 1, payload }, ask2, text3, hints, via);
}
async function standing(c, act, amount2, hints, via) {
  const area = c.area;
  const verdicts = area?.cap ? [[act, withinCap(area, amount2)]] : [];
  return (await judgeCollective(c.id, [act], hints, via, verdicts)).get(act);
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
var form = (label, hex2) => formEncode(label, unhex(hex2));
var idForm = (id) => form("mid", id);
function readForm(typed, want) {
  const t = typed.trim();
  const squeezed = t.replace(/\s+/g, "");
  if (want !== "mkey" && /^[0-9a-fA-F]{64}$/.test(squeezed)) return { hex: squeezed.toLowerCase(), hints: [], bare: true };
  if (!/^m[a-z]+1/i.test(t)) throw new Refused(`${WHAT[want]} is 64 characters, 0 to 9 and a to f (spaces do not matter), or its form written for people, ${want}1\u2026`);
  try {
    const r = formRead(t, want);
    return { hex: r.data, hints: r.hints, bare: r.bare };
  } catch (e2) {
    throw new Refused(e2 instanceof Error ? e2.message : String(e2));
  }
}
var WHAT = { mid: "an ID", mact: "an act id", mkey: "a key", mspec: "a spec hash", mwork: "a work hash" };
var readId = (typed) => readForm(typed, "mid").hex;

// ../dub/src/carryin.ts
var message = (e2) => e2 instanceof Error ? e2.message : String(e2);
var NOT_CURRENT = "These words do not give this identity\u2019s current signing key: they are another identity\u2019s, an earlier key\u2019s, or written wrong. Nothing was kept. If these are your chain key\u2019s words, they must never be typed into an online app.";
async function lookCurrent(id, seed, hints, via) {
  let pub;
  try {
    pub = signingPublic(seed);
  } catch {
    throw new Error("The words do not hold a signing key. Nothing was kept.");
  }
  let look;
  try {
    look = await lookUp(id, hints, via);
  } catch (e2) {
    throw new Error(`This identity was not found at ${hints.join(", ")}: ${message(e2)}`);
  }
  const r = look.resolution;
  if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing can be signed for it until they agree.");
  if (r.stop === "pending" || r.waiting.length) throw new Error("A change of its keys is waiting for its homes: bring it once that change counts, with the new words.");
  if (!r.signingKey || !r.links.length) throw new Error(`Its chain could not be read (${r.stop}).`);
  if (hex(r.signingKey) !== hex(pub)) throw new Error(NOT_CURRENT);
  return look;
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
function carriedKey(look, seed) {
  const secret = encryptionSecret(seed);
  if (!look.encryptionKey || !look.encryptionKeyAct || hex(xwingPublic(secret)) !== hex(look.encryptionKey)) return null;
  const e2 = look.verifier.latest(look.resolution.identity, SPECS.envelopes, 4);
  const version = e2.payload ? Number(cborDecode(e2.payload).get(0)) : 1;
  return { version, act: look.encryptionKeyAct, secret: hex(secret) };
}

// src/units.ts
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

// src/specs.ts
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
var labelOf = (hash) => {
  const a = ACCEPTABLE.find((x) => x.hashes.includes(hash));
  if (!a) return void 0;
  if (a.hashes.length === 1) return `${a.name} ${a.kind}, draft ${a.draft}`;
  const u2 = BITCOIN_UNITS.units.find((x) => x.hash === hash);
  return `${a.name}, draft ${a.draft}: ${u2?.name ?? "a unit"}`;
};
var isAccepted = (a, accepted) => a.hashes.every((h) => accepted.has(h));

// src/accepted.ts
var SEALED_LIST = 1;
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
    const version = m.get(0);
    if (typeof version !== "number" || version < 1) return null;
    const prev = m.get(1);
    if (version === 1 !== (prev === void 0)) return null;
    const entries = /* @__PURE__ */ new Map();
    for (const x of m.get(2)) {
      if (!Array.isArray(x) || !(x[0] instanceof Uint8Array) || x[0].length !== 32) return null;
      entries.set(hex(x[0]), typeof x[1] === "string" ? x[1].slice(0, 120) : null);
    }
    const merged = (m.get(3) ?? []).map((x) => {
      if (!(x instanceof Uint8Array) || x.length !== 32) throw new Error("merged");
      return hex(x);
    });
    return { id, version, previous: prev instanceof Uint8Array ? hex(prev) : null, merged, entries };
  } catch {
    return null;
  }
}
async function readActs(identity, secrets, homes, via) {
  const acts = /* @__PURE__ */ new Map();
  const problems = [];
  if (!secrets.length) return { acts, problems: ["this app holds no encryption key of this identity"] };
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l;
  try {
    l = await lookUp(identity, homes, via, v);
  } catch (e2) {
    return { acts, problems: [`its homes did not answer (${e2 instanceof Error ? e2.message : String(e2)})`] };
  }
  const at = [.../* @__PURE__ */ new Set([...homes, ...l.resolution.homes.map((h) => h.hint)])];
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via).feed({ to: identity, after });
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
          if (!o || !d || acts.has(d.id) || d.public || d.signer !== identity || d.spec !== ACCEPTED_SPEC || d.type !== SEALED_LIST || !d.payload) continue;
          if (o.key) l.verifier.addWithKey(o.act, o.key);
          else l.verifier.add(o.act);
          if (l.verifier.status(d.id) !== "valid") continue;
          const x = readList(d.id, d.payload);
          if (x) acts.set(d.id, x);
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e2) {
      problems.push(`${h}: ${e2 instanceof Error ? e2.message : String(e2)}`);
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
async function readAccepted(identity, secrets, homes, via = {}) {
  const { acts, problems } = await readActs(identity, secrets, homes, via);
  const followed = /* @__PURE__ */ new Set();
  for (const a of acts.values()) {
    if (a.previous) followed.add(a.previous);
    for (const m of a.merged) followed.add(m);
  }
  const tips = [...acts.values()].filter((a) => !followed.has(a.id)).sort((x, y) => x.id < y.id ? -1 : 1);
  const version = Math.max(0, ...tips.map((t) => t.version));
  if (tips.length <= 1) return { entries: new Map(tips[0]?.entries ?? []), tips, merged: [], version, problems };
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
  return { entries, tips, merged: [...new Set(merged)], version, problems };
}
var sameTips = (a, b) => a.map((x) => x.id).join() === b.map((x) => x.id).join();
async function changeAccepted(me, change, opts) {
  const via = opts.via ?? {};
  const homes = me.f.homes.map((h) => h.hint);
  const secrets = [...me.f.encryption].reverse().map((e2) => unhex(e2.secret));
  if (!secrets.length) throw new Error("This app holds no encryption key of this identity, so its accepted list cannot be sealed to it. Nothing was changed.");
  for (let round = 0; round < 5; round++) {
    const read = await readAccepted(me.id, secrets, homes, via);
    if (read.problems.length >= homes.length && !read.tips.length) throw new Error(`The identity\u2019s homes did not answer (${read.problems.join("; ")}): the accepted list was not changed.`);
    const next = new Map(read.entries);
    change(next);
    const same = read.tips.length === 1 && JSON.stringify([...next].sort()) === JSON.stringify([...read.entries].sort());
    if (same || !read.tips.length && !next.size) return { written: null, list: read };
    const again = await readAccepted(me.id, secrets, homes, via);
    if (!sameTips(again.tips, read.tips)) continue;
    await opts.check();
    const look = await lookUp(me.id, homes, via);
    if (!look.encryptionKey || !me.f.encryption.some((e2) => hex(xwingPublic(unhex(e2.secret))) === hex(look.encryptionKey))) {
      throw new Error("The encryption key this identity publishes is not one this app holds: the accepted list cannot be sealed. Nothing was changed.");
    }
    const [first, ...others] = read.tips;
    const payload = listPayload({ version: read.version + 1, previous: first?.id ?? null, merged: others.map((t) => t.id), entries: next });
    let made;
    try {
      made = me.sign(ACCEPTED_SPEC, SEALED_LIST, payload, { public: false, to: [me.id] });
    } finally {
      await opts.save();
    }
    const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
    let left = 0;
    for (const h of homes) {
      try {
        await relayAt(h, via).putSealed(sealed);
        await relayAt(h, via).putAct(made.act);
        left++;
      } catch {
      }
    }
    if (!left) throw new Error("No home took the accepted list: nothing was changed. Try again.");
    return { written: made.id, list: { entries: next, tips: [{ id: made.id, version: read.version + 1, previous: first?.id ?? null, merged: others.map((t) => t.id), entries: next }], merged: read.merged, version: read.version + 1, problems: [] } };
  }
  throw new Error("Another app kept changing the accepted list while this one wrote: nothing was changed. Try again.");
}
async function publishAccepted(me, list3, relays, previous, withdrawn, save) {
  const payload = listPayload({ version: (previous?.version ?? 0) + 1, previous: previous?.act ?? null, merged: [], entries: withdrawn ? /* @__PURE__ */ new Map() : list3.entries }, withdrawn);
  let made;
  try {
    made = me.sign(ACCEPTED_SPEC, PUBLISHED_LIST, payload, { public: true });
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

// src/messages.ts
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
var asMap = (payload, what) => {
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
  const m = asMap(payload, "a draft");
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
async function sendToSelf(me, type, payload, opts) {
  const homes = me.f.homes.map((h) => h.hint);
  const look = await lookUp(me.id, homes, opts.via ?? {});
  if (!look.encryptionKey) throw new Error("This identity publishes no encryption key, so nothing can be sealed to it: the draft cannot travel to Damgar. Nothing was signed.");
  if (!me.f.encryption.some((e2) => hex(xwingPublic(unhex(e2.secret))) === hex(look.encryptionKey))) {
    throw new Error("The encryption key this identity publishes is not one this app holds: Damgar, holding the same words, could not open the draft either. Nothing was signed.");
  }
  let made;
  try {
    made = me.sign(MESSAGES_SPEC, type, payload, { public: false, to: [me.id], refs: opts.refs });
  } finally {
    await opts.save();
  }
  const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
  const left = [];
  for (const h of homes) {
    try {
      await relayAt(h, opts.via ?? {}).putSealed(sealed);
      await relayAt(h, opts.via ?? {}).putAct(made.act);
      left.push(h);
    } catch {
    }
  }
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
  const m = asMap(payload, "a request");
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
  const m = asMap(payload, "an invoice request");
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
  const m = asMap(payload, "an answer");
  closed(m, [0, 1, 2, 3, 4], "an answer");
  const b = m.get(2);
  if (!Array.isArray(b)) throw new Error("an answer: its bound");
  let bound;
  if (b[0] === 0 && b.length === 2 && typeof b[1] === "string") bound = { kind: "invoice", invoice: b[1] };
  else if (b[0] === 1 && (b.length === 2 || b.length === 3) && b[1] instanceof Uint8Array && b[1].length === 64) bound = { kind: "request", request: b[1], confirmations: b.length === 3 ? Number(b[2]) : null };
  else if (b[0] === 2 && b.length === 2) bound = { kind: "refused", why: text(b[1], "why") };
  else throw new Error("an answer: its bound");
  const amount2 = m.has(4) ? amountOf2(m.get(4)) : null;
  return { to: h322(m.get(0), "the request answered"), commitment: h322(m.get(1), "the commitment"), bound, ticket: m.has(3) ? h322(m.get(3), "the ticket") : null, amount: amount2 };
}
function readLaneRequest(payload) {
  const m = asMap(payload, "a lane request");
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

// src/damgar.ts
var LINE_SAY = "Damgar keeps its own line of acts for this identity (its money acts and messages). If the signing key is ever changed with the chain key, in Ki\u0161ib, that change must keep this line, or every claim and receipt signed here becomes void. Ki\u0161ib reads it from the homes and keeps it.";
var SPENT_SAY = "This identity\u2019s signing key was changed elsewhere, with its chain key, so the signing key\u2019s words Damgar holds no longer count. Nothing was signed. To go on here, give Damgar the new signing key\u2019s words.";
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
var list = (xs) => [...new Set(xs.map((s) => s.trim()).filter(Boolean))];
var message2 = (e2) => e2 instanceof Error ? e2.message : String(e2);
var now = () => Math.floor(Date.now() / 1e3);
var short = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
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
  queue = Promise.resolve();
  /** The accepted list as last read, by identity (memory only). */
  lists = /* @__PURE__ */ new Map();
  async keys(id) {
    return await this.store.read(id, "keys") ?? { request: null, earlier: [] };
  }
  serial(f) {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => void 0);
    return next;
  }
  who(id, me) {
    return { id, short: short(id), me: id === me };
  }
  async ctx() {
    const active = await this.store.active();
    const me = active ? await this.store.identity(active) : null;
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
      const via = a.via ?? {};
      let id;
      let seed;
      try {
        id = readId(a.id);
        seed = fromWords(a.words);
      } catch (e2) {
        if (e2 instanceof Refused) throw new Error(`${e2.message}. Nothing was kept.`);
        throw e2;
      }
      if ((await this.store.held()).includes(id)) return this.renewHeld(id, seed);
      const address = a.address.trim();
      if (!/^https?:\/\//.test(address)) throw new Error("Give an address where this identity is found (one of its homes), starting with https://.");
      const look = await lookCurrent(id, seed, [address], via);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await servedChain(id, r.homes, via);
      const named = list(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : list(a.relays ?? []);
      if (!relays.length) throw new Error("This identity names no relays. Give one or more relay addresses, and bring it again.");
      const enc = carriedKey(look, seed);
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
        encryption: enc ? [enc] : [],
        pending: null
      };
      await this.store.write(id, "settings", { relays, via });
      await this.store.saveIdentity(new TestIdentity(f, via));
      await this.store.setActive(id);
      return {
        lines: [
          { text: "Its current signing key matches the words.", tone: "ok" },
          enc ? { text: "Its encryption key is the one the words carry: drafts, requests and payments sealed to it open here.", tone: "ok" } : { text: NO_KEY_SAY, tone: "warn" },
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
      } catch (e2) {
        if (e2 instanceof Refused) throw new Error(`${e2.message}. Nothing was kept.`);
        throw e2;
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
    me.f.sequence = [];
    me.f.routes = null;
    const carried = carriedKey(look, seed);
    if (carried && !me.f.encryption.some((e2) => e2.act === carried.act)) me.f.encryption.push(carried);
    await this.store.saveIdentity(me);
    return {
      lines: [
        { text: "The new signing key\u2019s words give its current signing key. Damgar signs with them from now on, in a new line.", tone: "ok" },
        carried ? { text: "Its encryption key is the one the new words carry.", tone: "ok" } : { text: NO_KEY_SAY, tone: "warn" },
        { text: LINE_SAY, tone: "warn" }
      ]
    };
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
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)) };
  }
  /** Whether the signing key Damgar holds still counts. */
  async check() {
    const { me } = await this.ctx();
    try {
      await this.current(me);
      return { current: true, say: null };
    } catch (e2) {
      if (message2(e2) === SPENT_SAY) return { current: false, say: SPENT_SAY };
      throw e2;
    }
  }
  async current(me) {
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
    if (r.stop === "contested") throw new Error("Its homes disagree about its keys (contested): nothing was signed.");
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) throw new Error(SPENT_SAY);
  }
  /** Sign, then save the sequence before anything leaves. */
  signAct(me, spec, type, payload, o) {
    return me.sign(spec, type, payload, o);
  }
  // ------------------------------------------------------------ what is accepted (the accepted cMIP, F340)
  async accepted(me, fresh = false) {
    const c = this.lists.get(me.id);
    if (c && !fresh && c.at + 60 > now()) return c.list;
    const secrets = [...me.f.encryption].reverse().map((e2) => unhex(e2.secret));
    const l = await readAccepted(me.id, secrets, me.f.homes.map((h) => h.hint), me.via);
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
        { via: s.via, save: () => this.store.saveIdentity(me), check: () => this.current(me) }
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
    for (const id of await this.store.held()) held.push({ id, grouped: groupId(id), short: short(id), active: id === active });
    const me = active ? await this.store.identity(active) : null;
    const out = { web: !!this.opts.web, settingsSaved: false, stage: "identity", held, identity: null, accept: [], list: { version: 0, merged: [], published: false, problems: [] }, counts: { toSign: 0, toPay: 0 } };
    if (!me) return out;
    const s = await this.store.read(me.id, "settings") ?? { relays: [], via: {} };
    const book = { ...NO_BOOK(), ...await this.store.read(me.id, "book") ?? {} };
    const own = ownLine(me.f.sequence);
    out.identity = {
      id: me.id,
      grouped: groupId(me.id),
      form: idForm(me.id),
      short: short(me.id),
      homes: me.f.homes.map((h) => h.hint),
      relays: s.relays,
      encryption: me.f.encryption.length > 0,
      line: { acts: own.acts, latest: own.card?.act ?? null, summary: own.card?.summary ?? null }
    };
    let l;
    try {
      l = await this.accepted(me);
    } catch (e2) {
      l = { entries: /* @__PURE__ */ new Map(), tips: [], merged: [], version: 0, problems: [message2(e2)] };
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
        } catch (e2) {
          c = { id, agreement: null, area: null, key: null, why: message2(e2) };
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
  async collectivePlaces(id, hints, via) {
    try {
      const l = await lookUp(id, hints, via);
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
          { text: `Damgar acts for ${short(id)} in money, with your own key for it (F353).`, tone: "ok" },
          { text: `Its Money area, \u201C${area.name}\u201D: ${area.holders.map(short).join(", ")}; ${area.number} key${area.number === 1 ? "" : "s"}${area.cap ? `; above ${area.cap.value.toLocaleString("en")} an act, one more` : ""}.` }
        ]
      };
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
    const amount2 = { unit: a.unit || SPEC.units.regtest, value: readValue(a.value) };
    const acc = this.acceptedSet(await this.accepted(me));
    const pointer = (await this.payee(to, me, s)).look.verifier.moneyPointer(MONEY, to);
    if (!pointer.act) throw new Error(`${short(to)} publishes no payee pointer: there is nowhere the promise could be paid. Nothing was signed.`);
    const payload = promisePayload(c, { to, amount: amount2, pointer: pointer.act });
    const say_ = promiseSay(c, me.id, { to, amount: amount2, whatFor: a.whatFor.trim() }, short);
    if (!acc.has(amount2.unit)) say_.lines.push(`Its unit is not one you accept: shown ${say(amount2, acc)}.`);
    return { c, payload, say: say_, digest: promiseDigest(c, payload), to, amount: amount2, places };
  }
  /** Sign the promise read back, as the collective with your own key; where the lane needs more keys, the other holders are asked. */
  collectivePromise(a) {
    return this.serial(async () => {
      const { me, s, book, hints } = await this.ctx();
      await this.current(me);
      const r = await this.collectivePromiseMake(me, s, hints, a);
      if (r.digest !== a.digest) throw new Error("It is not the promise read back: read it again. Nothing was signed.");
      const text3 = `A promise of the collective ${short(r.c.id)} to pay ${short(r.to)} ${r.amount.value.toLocaleString("en")}${a.whatFor.trim() ? `, for ${a.whatFor.trim()}` : ""}: ${r.say.above ? "above its Money lane\u2019s cap, it" : "it"} needs your key too. Read it in your Signing tab, then sign it with your own key for the collective.`;
      const made = await signPromise(me, r.c, r.payload, r.say.others, text3, r.places, s.via);
      await this.store.saveIdentity(me);
      book.collectiveActs = { ...book.collectiveActs ?? {}, [made.act]: { collective: r.c.id, to: r.to, amount: r.amount, whatFor: a.whatFor.trim(), asked: made.asked, at: now() } };
      await this.saveBook(me.id, book);
      const st = await standing(r.c, made.act, r.amount, r.places, s.via).catch(() => null);
      const lines2 = [{ text: `Signed for the collective with your own key: act ${short(made.act)}, public at ${made.places.join(", ")}.`, tone: "ok" }];
      if (made.asked.length) lines2.push({ text: `Asked for their key: ${made.asked.map(short).join(", ")}, in their own app.` });
      if (made.notAsked.length) lines2.push({ text: `Not reached: ${made.notAsked.map(short).join(", ")} (no inbox or encryption key found).`, tone: "warn" });
      lines2.push(st?.met ? { text: "It counts for the collective: its Money lane is met.", tone: "ok" } : { text: `It does not count yet: ${st ? st.areas.map((x) => `${x.signers.length} of ${x.needed} keys`).join("; ") : "not read"}.`, tone: "warn" });
      return { lines: lines2, act: made.act };
    });
  }
  // ------------------------------------------------------------ reading what arrived
  /** Where this identity's inbox is, as its routes say. */
  async inboxOf(me, s) {
    const l = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
    return list([...l.inbox(MESSAGES_SPEC) ?? [], ...l.inbox(MONEY) ?? []]);
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
        if (l.encryptionKey && !me.f.encryption.some((e2) => hex(xwingPublic(unhex(e2.secret))) === hex(l.encryptionKey))) {
          const c = carriedKey(l, unhex(me.f.signingSecret));
          if (c) {
            me.f.encryption.push(c);
            await this.store.saveIdentity(me);
            lines2.push({ text: "This identity\u2019s encryption key was renewed elsewhere from the signing key\u2019s words Damgar holds: Damgar takes it, and what is sealed to it opens here.", tone: "ok" });
          } else problems.push("This identity publishes an encryption key Damgar does not hold (it was not made from the signing key\u2019s words held here): what is sealed to it does not open here.");
        }
      } catch {
      }
      const secrets = [...me.f.encryption].reverse().map((e2) => unhex(e2.secret));
      if (!secrets.length) return { lines: [{ text: NO_KEY_SAY, tone: "warn" }], problems };
      let unopened = 0;
      let inbox = [];
      try {
        inbox = await this.inboxOf(me, s);
      } catch (e2) {
        problems.push(`Its inbox could not be looked up: ${message2(e2)}`);
      }
      const places = list([...me.f.homes.map((h) => h.hint), ...inbox]);
      const fresh = [];
      for (const hint of places) {
        let after = book.after[hint];
        try {
          for (; ; ) {
            const page = await relayAt(hint, s.via).feed({ to: me.id, after });
            for (const it of page.items) {
              if (it.kind !== "sealed") continue;
              let opened = false;
              for (const sec of secrets) {
                try {
                  const o = openSealed(it.item, me.id, sec);
                  const d = o.described;
                  if ((d.spec && MESSAGES_SPECS.includes(d.spec) || d.spec === MONEY) && !book.acts[d.id] && !fresh.some((f) => f.described.id === d.id)) fresh.push(o);
                  opened = true;
                  break;
                } catch {
                }
              }
              if (!opened) unopened++;
            }
            if (!page.items.length || page.next === after) break;
            after = page.next;
          }
          book.after[hint] = after ?? 0;
        } catch (e2) {
          problems.push(`${hint}: ${message2(e2)}`);
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
        } catch (e2) {
          return `its signer was not found (${message2(e2)})`;
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
          problems.push(`An act from ${short(d.signer)} that does not count (${st}): set aside.`);
          continue;
        }
        book.acts[d.id] = { act: base64(o.act), key: o.key ? base64(o.key) : void 0, from: d.signer };
        try {
          await this.file(me, s, book, d, lines2);
        } catch (e2) {
          problems.push(`${short(d.signer)}: ${message2(e2)}`);
        }
      }
      if (unopened) problems.push(`${unopened} sealed act${unopened === 1 ? "" : "s"} addressed to this identity did not open with the encryption keys Damgar holds: sealed to a key it does not hold.`);
      await this.byItself(me, s, book, lines2, problems);
      await this.saveBook(me.id, book);
      return { lines: lines2, problems };
    });
  }
  /** On whose authority an act under a grant stands: its grant, its acceptance and the grantor's revocations read at these places and the signer's homes (`clients/grants`). */
  async authority(o, places, via) {
    const signer = o.described.signer;
    let hints = list(places);
    try {
      const l = await lookUp(signer, places, via);
      hints = list([...places, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints)]);
    } catch {
    }
    try {
      return await authorityOf(o.act, hints, via, { key: o.key, names: short });
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
        lines2.push({ text: `A money message from ${short(signer)} that Damgar cannot read: shown unknown, in To sign.`, tone: "warn" });
      };
      if ((d.type === TYPES.draft || d.type === TYPES.laneRequest || d.type === TYPES.sale) && signer !== me.id) return;
      if (d.type === TYPES.sale) return;
      const readers = { [TYPES.draft]: readDraft, [TYPES.request]: readRequest, [TYPES.invoiceRequest]: readInvoiceRequest, [TYPES.answer]: readAnswer };
      if (d.spec === MESSAGES_SPEC) readers[TYPES.laneRequest] = readLaneRequest;
      if (!readers[d.type]) return unread(`a message of type ${d.type}, which the money messages cMIP draft 1 does not define`);
      try {
        readers[d.type](d.payload);
      } catch (e2) {
        return unread(message2(e2));
      }
      if (d.type === TYPES.laneRequest) {
        (book.laneRequests ??= {})[d.id] = { found: t, stage: "new", grant: null };
        lines2.push({ text: `${readLaneRequest(d.payload).app} asks for a lane: in To sign, to be read and granted or declined.`, tone: "ok" });
        return;
      }
      if (d.type === TYPES.draft) {
        if (signer !== me.id) return;
        readDraft(d.payload);
        book.drafts[d.id] = { found: t, stage: "new", payment: null };
        lines2.push({ text: "A draft arrived, prepared in another app: in To sign.", tone: "ok" });
      } else if (d.type === TYPES.request) {
        readRequest(d.payload);
        book.requestsIn[d.id] = { from: signer, found: t, stage: "new", obligation: null, payment: null };
        lines2.push({ text: `A request to be paid, from ${short(signer)}: in To sign.`, tone: "ok" });
      } else if (d.type === TYPES.invoiceRequest) {
        book.invoices[d.id] = { from: signer, found: t, stage: "new", payment: null, why: null };
        await this.onInvoiceRequest(me, s, book, d.id, lines2);
      } else if (d.type === TYPES.answer) {
        const a2 = readAnswer(d.payload);
        const p = Object.values(book.payments).find((x) => x.side === "out" && x.invoiceRequest === a2.to);
        if (!p || p.other !== signer && p.service !== signer || p.key !== a2.commitment) throw new Error("an answer to no invoice request of this identity");
        if (a2.amount ? a2.amount.unit !== p.amount.unit || a2.amount.value !== p.amount.value : d.spec === MESSAGES_SPEC || d.spec === MESSAGES_SPEC_3) throw new Error("an answer naming no amount, or another than the payment\u2019s (the money messages cMIP draft 3, 5.1)");
        await this.onAnswer(me, s, book, p, d.id, a2.bound, a2.ticket);
        lines2.push({ text: p.stage === "to pay" ? `${short(signer)} answered: a payment is ready, in Pay.` : `${short(signer)} refused to bind the payment: ${p.bound?.kind === "refused" ? p.bound.why : ""}`, tone: p.stage === "to pay" ? "ok" : "warn" });
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
      lines2.push({ text: `${short(signer)} says they paid you ${say(a.amount, new Set(unitOf(a.amount.unit) ? [a.amount.unit] : []))}: check it, and sign the receipt, in To sign.`, tone: "ok" });
    } else if (a.type === "receipt" && a.payer === me.id) {
      const pr = readPaymentProof(new Uint8Array(a.proof));
      const key = paymentCommitment({ rail: a.rail, payee: a.payee, amount: a.amount, fulfils: a.fulfils, payer: me.id, paidTo: pr.paidTo, salt: pr.salt });
      const p = book.payments[key];
      if (!p) throw new Error("a receipt for no payment of this identity");
      if (!p.receipts.includes(d.id)) p.receipts.push(d.id);
      p.stage = "settled";
      lines2.push({ text: `${short(signer)} signed the receipt for your payment: in the account.`, tone: "ok" });
    } else if (a.type === "obligation" && a.creditor === me.id && a.debtor === signer) {
      const ask2 = Object.entries(book.requestsOut).find(([id, x]) => x.to === signer && !x.obligation && this.requestOf(book, id)?.pointer === a.pointer);
      if (ask2) ask2[1].obligation = d.id;
      lines2.push({ text: `${short(signer)} accepted a debt to you, signed: in the account. ${DEBT_SAY}`, tone: "ok" });
    }
  }
  requestOf(book, id) {
    try {
      return readRequest(this.opened(book, id).payload);
    } catch {
      return null;
    }
  }
  /** A kept act's description and payload, opened with its content key where private. */
  opened(book, id) {
    const k = book.acts[id];
    if (!k) throw new Error("that act is not kept here");
    const d = k.key ? openWithKey(b642(k.act), b642(k.key)) : describeAct(b642(k.act));
    if (!d.payload) throw new Error("an act kept without its content");
    return { d, payload: d.payload };
  }
  /** An identity's public acts at these places, held by its lookup's verifier; their payloads, by act. */
  async actsOf(id, places, via, l) {
    const out = /* @__PURE__ */ new Map();
    for (const h of list(places)) {
      let after;
      try {
        for (; ; ) {
          const page = await relayAt(h, via).feed({ signer: id, after });
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
    } catch (e2) {
      throw new Error(`${short(id)} was not found: ${message2(e2)}`);
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
      lines2.push({ text: `An invoice request from ${short(inv.from)} was refused: ${checked.why}.`, tone: "warn" });
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
        lines2.push({ text: `An on-chain invoice request from ${short(inv.from)} could not be answered: ${why}.`, tone: "warn" });
        return;
      }
      if (s.manual) {
        lines2.push({ text: `${short(inv.from)} asks where to pay you ${say(f.amount, acc)} on-chain: an address to give, in To sign (every step by hand).`, tone: "ok" });
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
      lines2.push({ text: `${short(inv.from)} asked where to pay you ${say(f.amount, acc)} on-chain: Damgar answered by itself with an address bound to that payment alone, signed with your request key${how.by === "lane" ? ", under your receipts lane" : ""}.`, tone: "ok" });
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
          lines2.push({ text: `${short(inv.from)} wants to pay you ${say(f.amount, acc)} on Lightning: Damgar answered by itself, with an invoice your node made through its receive-only link, under your receipts lane.`, tone: "ok" });
          return;
        } catch (e2) {
          lines2.push({ text: `Damgar could not make the invoice by itself (${message2(e2)}): make it in your wallet, in To sign.`, tone: "warn" });
          return;
        }
      }
      lines2.push({ text: `${short(inv.from)} wants to pay you ${say(f.amount, acc)} on Lightning: make an invoice in your wallet, in To sign.${lane && "why" in lane && !s.manual ? ` Not answered by itself: ${lane.why.replace(/\.? ?Nothing was signed\.?$/, "")}.` : ""}`, tone: "ok" });
    }
  }
  /** What keeps a Lightning invoice from binding this payment (the Lightning rail Module's rule, and the checks of the money messages cMIP, 5.3). */
  invoiceProblems(p, invoice) {
    const t = invoice.trim().toLowerCase().replace(/^lightning:/, "");
    let decoded;
    try {
      decoded = lightningInvoice(t);
    } catch (e2) {
      return [`${message2(e2)}. Copy the whole invoice from your wallet`];
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
      return { lines: [{ text: `An address bound to this payment alone was sent to ${short(inv.from)}, sealed, signed with your request key.`, tone: "ok" }] };
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
      const e2 = v && v.declaredBy === f.paidTo.declaredBy ? v.entries[f.paidTo.entry] : void 0;
      if (!e2 || e2.railModule !== f.rail || e2.unit !== f.amount.unit) return fail("it names no entry of the vault in force for this rail and unit");
      address = new Uint8Array(e2.source);
    } else return fail("a refund rail: not answered by Damgar in round 1");
    const network = f.rail === SPEC.lightning.hash ? readLightningAddress(address)?.network : readOnchainAddress(address)?.network;
    if (network === void 0 || unitOf(f.amount.unit)?.unit.network !== network) return fail("the rail does not carry the amount\u2019s unit");
    void book;
    return { ir, why: null, address };
  }
  /** An answer carries the amount it binds, the commitment's (draft 3, F352), so a lane's cap is judged on it by the grant limits cMIP. */
  async sendAnswer(me, s, book, to, commitment, bound, payer, ticket, how = { by: "hand" }, amount2 = book.payments[commitment]?.amount ?? null) {
    return this.deliver(me, s, book, MESSAGES_SPEC, TYPES.answer, answerPayload({ to, commitment, bound, ticket, amount: amount2 }), payer, void 0, how);
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
      return { lines: [{ text: `The invoice was checked and sent, sealed, to ${short(inv.from)}. When they pay it in their wallet, their Damgar sends you the claim; check it, and sign the receipt.`, tone: "ok" }] };
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
  async route(me, s, payee, amount2, acc) {
    const { look } = await this.payee(payee, me, s);
    let c = look.verifier.moneyChoose(MONEY, payee, amount2, [...acc]);
    let ptr = look.verifier.moneyPointer(MONEY, payee);
    const col = await collectivePointer(payee, [...s.relays, ...me.f.homes.map((h) => h.hint)], s.via, { amount: amount2, accepted: [...acc] }).catch(() => null);
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
          items.push(await this.readDraftItem(me, s, book, id, acc));
        } catch (e2) {
          problems.push(`A draft ${short(id)}: ${message2(e2)}`);
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
          { text: `${short(x.from)} asks you to pay ${say(r.amount, acc)}${r.whatFor ? `, for \u201C${r.whatFor}\u201D` : ""}.` },
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
        } catch (e2) {
          problems.push(`A lane asked ${short(id)}: ${message2(e2)}`);
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
              { text: `${short(x.from)} wants to pay you ${say(p.amount, acc)} on-chain${p.whatFor ? `, for \u201C${p.whatFor}\u201D` : ""}.` },
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
            { text: `${short(x.from)} wants to pay you ${say(p.amount, acc)} on Lightning${p.whatFor ? `, for \u201C${p.whatFor}\u201D` : ""}, to your ${p.address ? "payee pointer\u2019s node" : "node"}.` },
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
            { text: `${short(p.other)} says they paid you ${say(p.amount, acc)} on ${railName(p.rail)}, and sent their claim with the rail\u2019s proof.` },
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
    const about = (d.refs ?? []).map((r, i) => `${r.slice(0, 8)}\u2026${d.refSigners?.[i] ? ` by ${short(d.refSigners[i])}` : ""}`);
    if (dr.what === "confirm") {
      lines2.unshift({ text: `Prepared in ${dr.app}, not signed there: confirm your purchase from ${short(dr.other)}, ${say(dr.amount, acc)}: what was promised was kept.` });
      const c = await this.ownClaim(me, s, dr).catch((e2) => ({ why: message2(e2) }));
      if ("why" in c) {
        unknown = true;
        lines2.push({ text: `${c.why}: it cannot be signed.`, tone: "warn" });
      } else lines2.push({ text: `Signing signs your claim of that payment (${short(dr.confirm.claim)}) again, in public, acknowledging ${dr.confirm.acks.map(short).join(", ")}: the sale then reads confirmed for anyone who looks (Agreements rule 13). Nothing moves; it is public.`, tone: "ok" });
      return { id, kind: "draft", from: this.who(me.id, me.id), app: dr.app, title: "A purchase to confirm", lines: lines2, amount: { ...dr.amount, said: say(dr.amount, acc) }, unknown, offers: unknown ? ["decline"] : ["sign", "decline"], found: x.found };
    }
    if (dr.what === "ask") {
      lines2.unshift({ text: `Prepared in ${dr.app}, not signed there: ask ${short(dr.other)} to pay you ${say(dr.amount, acc)}${dr.whatFor ? `, for \u201C${dr.whatFor}\u201D` : ""}.` });
      lines2.push({ text: "Signing sends them a request to be paid, sealed to them, naming your payee pointer in force. It binds nobody: they may pay it, accept it as a debt, or decline." });
    } else {
      lines2.unshift({ text: `Prepared in ${dr.app}, not signed there: ${dr.what === "anchor" ? "pay an anchoring service" : "pay"} ${short(dr.other)} ${say(dr.amount, acc)}${dr.whatFor ? `, for \u201C${dr.whatFor}\u201D` : ""}${about.length ? ` (about ${about.join(", ")})` : ""}.` });
      if (!unknown) {
        try {
          const r = await this.route(me, s, dr.other, dr.amount, acc);
          lines2.push({ text: `On ${railName(r.module)}, to ${r.to === "flow" ? "their flow (their payee pointer in force)" : "their vault"}. ${r.why}`.trim(), tone: "ok" });
          lines2.push({ text: "Signing sends them an invoice request, sealed: the payment\u2019s fingerprint (the commitment: who pays whom, how much, for what, where), for their side to bind. Nothing is paid yet; you pay in your own wallet, from Pay." });
        } catch (e2) {
          unknown = true;
          lines2.push({ text: message2(e2), tone: "warn" });
        }
      }
      if (dr.what === "anchor" && dr.anchor) lines2.push({ text: `For an anchor of one act on the Bitcoin clock, through the service\u2019s standing offer ${short(dr.anchor.offer)}, tier ${dr.anchor.tier}. The service is sent the leaf (a fingerprint mixed with a random secret ${dr.app} keeps), never the act. Whether the payment follows its offer is Agreements\u2019 to judge: unknown here.` });
    }
    return { id, kind: "draft", from: this.who(me.id, me.id), app: dr.app, title: dr.what === "ask" ? "A request to send" : dr.what === "anchor" ? "A payment for an anchor" : "A payment to make", lines: lines2, amount: { ...dr.amount, said: say(dr.amount, acc) }, unknown, offers: unknown ? ["decline"] : ["sign", "decline"], found: x.found };
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
        return { lines: [{ text: `Your claim of that payment, acknowledging what you bought, is signed in public (${short(claim)}): its sale reads confirmed for anyone who looks.`, tone: "ok" }] };
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
        return { lines: [{ text: `The request was sent to ${short(dr.other)}, sealed. Their Damgar offers them to pay it, or accept it as a debt.`, tone: "ok" }] };
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
      return { lines: [{ text: `The invoice request was sent to ${short(dr.other)}, sealed. When they answer, the payment shows in Pay.`, tone: "ok" }] };
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
      return { lines: [{ text: `You signed the debt: you owe ${short(x.from)} ${say(r.amount, this.acceptedSet(await this.accepted(me)))}. It was sent to them, sealed.`, tone: "ok" }, { text: DEBT_SAY, tone: "warn" }] };
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
      return { lines: [{ text: `The invoice request was sent to ${short(x.from)}, sealed. When they answer, the payment shows in Pay.`, tone: "ok" }] };
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
      return { key: p.key, lines: [{ text: `Asked of ${p.service ? `${short(a.payee)}\u2019s split service, ${short(p.service)}, which answers for it (the money messages cMIP, draft 4)` : short(a.payee)}, under the lane: an invoice request for ${say(a.amount, acc)}, sealed. When they answer, pay it in your wallet.`, tone: "ok" }] };
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
      let verdict2;
      if (p.bound.kind === "invoice") {
        const pre = proof.trim().toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(pre)) throw new Error("The proof of a Lightning payment is its preimage: 64 hexadecimal characters, as your wallet shows it once paid. Nothing was signed.");
        rail = lightningProof(p.bound.invoice, unhex(pre));
        verdict2 = railCheck(p.rail, p.key, p.amount, b642(p.address), rail, null);
        if (verdict2.answer !== "valid") throw new Error(`The Lightning rail Module\u2019s rule says ${verdict2.answer}: ${verdict2.why}. Nothing was signed.`);
        p.preimage = pre;
      } else {
        const txid2 = proof.trim().toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(txid2)) throw new Error("The proof of an on-chain payment starts with its transaction\u2019s id: 64 hexadecimal characters, as your wallet shows it. Nothing was signed.");
        const built = await this.onchainRail(p, txid2);
        rail = built.rail;
        verdict2 = built.verdict;
        if (verdict2.answer === "invalid") throw new Error(`The on-chain rail Module\u2019s rule says invalid: ${verdict2.why}. Nothing was signed.`);
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
          { text: `The rail Module\u2019s rule says ${verdict2.answer}${verdict2.why ? ` (${verdict2.why})` : ""}.`, tone: verdict2.answer === "valid" ? "ok" : "warn" },
          { text: `Your payment claim (\u201CI paid ${short(p.other)} ${say(p.amount, acc)}\u201D, with the rail\u2019s proof) is signed and sent to them, sealed. Their Damgar checks it and offers them the receipt.`, tone: "ok" }
        ]
      };
    });
  }
  /** A transfer to the vault's record (F355): its claim, carrying the commitment and salt, sealed to oneself at one's homes. */
  async keepAtHomes(me, s, book, act) {
    const kept = book.acts[act];
    const enc = me.f.encryption[me.f.encryption.length - 1];
    if (!kept?.key || !enc) return;
    const sealed = sealFor(b642(kept.act), b642(kept.key), [{ id: me.id, key: xwingPublic(unhex(enc.secret)) }]);
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
        act = me.sign(MONEY, made.type, made.payload, { public: true, acks });
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
    const verdict2 = railCheck(p.rail, p.key, p.amount, b642(p.address), rail, headers);
    return { rail, verdict: verdict2, confirmations: have };
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
    for (const o of list(others)) {
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
    const lines2 = [{ text: `${as.by === "lane" ? "Damgar checked their claim from the rail\u2019s own evidence and signed your receipt by itself, under your receipts lane" : "Their claim verifies from the rail\u2019s own evidence. Your receipt is signed"} (\u201CI received ${say(p.amount, acc)} from ${short(p.other)}\u201D), and sent to them, sealed.`, tone: "ok" }];
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
    lines2.push({ text: `A sale of your offer ${short(c.fulfils)}: told to your own Dub, sealed to yourself, which delivers the key to ${short(p.other)}.`, tone: "ok" });
    const share = referralShare(offer.words);
    if (!c.referral || share === null) return lines2;
    const why = await this.repostProblem(me, s, c.referral, offer.publication);
    if (why) {
      lines2.push({ text: `The buyer names a repost they followed, but ${why}: no referral share is prepared.`, tone: "warn" });
      return lines2;
    }
    const amount2 = { unit: c.amount.unit, value: Math.floor(c.amount.value * share / 100) };
    if (amount2.value <= 0) return lines2;
    const draft = await sendToSelf(
      me,
      TYPES.draft,
      draftPayload({ what: "pay", other: c.referral.identity, amount: amount2, whatFor: `referral share, ${share}% of a sale of your offer`, app: "Damgar (a referral share)", anchor: null }),
      { refs: [[c.referral.evidence, c.referral.identity]], via: s.via, save }
    );
    (book.referrals ??= {})[p.claims[p.claims.length - 1]] = { reposter: c.referral.identity, evidence: c.referral.evidence, amount: amount2, draft: draft.id };
    lines2.push({ text: `The buyer followed a repost by ${short(c.referral.identity)}: your offer promises ${share}% to the reposter. Its payment is prepared (${say(amount2, /* @__PURE__ */ new Set([amount2.unit]))}): Damgar signs it by itself under your referral lane, or it waits in To sign. A promise in words, not judged by the core (F351).`, tone: "ok" });
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
    } catch (e2) {
      return `the reposter was not found (${message2(e2)})`;
    }
  }
  /**
   * What Damgar does by itself after a look (round 2, 2b), unless every step
   * is followed by hand: a receipt for each payment to this identity whose
   * claim verifies, under its receipts lane and within its cap; and each
   * referral share it prepared, bound under its payouts lane. Anything it
   * may not do waits in To sign.
   */
  async byItself(me, s, book, lines2, problems) {
    if (s.manual || this.opts.app) return;
    for (const p of Object.values(book.payments)) {
      if (p.side !== "in" || !p.claims.length || p.receipts.length) continue;
      try {
        lines2.push(...await this.receiptOf(me, s, book, p, null));
      } catch (e2) {
        problems.push(`A receipt Damgar could not sign by itself: ${message2(e2)}`);
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
        lines2.push({ text: `The referral share to ${short(dr.other)} is asked for by itself, under your referral lane: when they answer, it is in Pay, to pay in your wallet.`, tone: "ok" });
      } catch (e2) {
        lines2.push({ text: `The referral share to ${short(dr.other)} waits in To sign (${message2(e2)}).` });
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
      } catch (e2) {
        problems.push(`This identity could not be looked up: ${message2(e2)}`);
      }
      const opts = await this.judgeOpts(me);
      const payments = Object.values(book.payments).sort((a, b) => b.at - a.at).map((p) => {
        const proofs = [...p.claims.map((a) => ["claim", a]), ...p.receipts.map((a) => ["receipt", a])].map(([kind, act]) => {
          let j = { rail: { answer: "unknown", why: "not judged" }, beside: { answer: "unknown", why: "" }, standing: "unknown" };
          try {
            if (l) j = l.verifier.moneyJudge(act, opts);
          } catch (e2) {
            j.rail.why = message2(e2);
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
    const amount2 = { ...p.amount, said: say(p.amount, acc) };
    let pay = null;
    if (p.side === "out" && (p.stage === "to pay" || p.stage === "paid") && p.bound && p.bound.kind !== "refused") {
      if (p.bound.kind === "invoice") pay = { invoice: p.bound.invoice, amount: amount2 };
      else pay = { address: onchainPayTo(b642(p.address), p.key).address, amount: amount2 };
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
      amount: amount2,
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
    const read = { grantee: me.id, scope: 2, kinds: g.kinds, limits: g.limits, limitsProblem: null, key: "" };
    const kindSaid = (k) => k.spec === MONEY && k.type === 2 ? "receipts (\u201CI received this\u201D)" : k.spec === MONEY && k.type === 3 ? "payment claims (\u201CI paid this\u201D)" : MESSAGES_SPECS.includes(k.spec) && k.type === 3 ? "invoice requests (asking a payee where to pay)" : MESSAGES_SPECS.includes(k.spec) && k.type === 4 ? "answers to invoice requests (an invoice, or an address)" : `acts of type ${k.type} of ${k.spec.slice(0, 8)}\u2026`;
    const out = [
      `A lane named \u201C${g.label}\u201D, asked by ${g.app}: a grant of this identity to itself (Agreements draft 15, rule 73, F351), naming a key that ${g.app} made and holds. With it, ${g.app} signs in your name, by itself, without opening Damgar, within these limits only.`,
      `What it may sign: ${g.kinds.map(kindSaid).join("; ")}. Nothing else: never a grant, a revocation, a pointer, a debt or a post.`,
      g.limits?.cap ? `How much one act may move: at most ${say({ unit: g.limits.cap.unit, value: g.limits.cap.value }, acc)} (the grant limits cMIP, 2). An act above it is refused before it is signed, and one signed anyway counts for nothing.` : "How much one act may move: no cap. A lane without a cap is refused here.",
      g.limits?.expiry?.clock === "timestamp" ? grantInWords(read, me.id, short).find((l) => l.startsWith("Until")) ?? "" : "Until: no expiry; it ends only when you revoke it.",
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
      grant = me.sign(MIRS.agreements, AGREEMENTS_TYPES.grant, payload, { public: true });
      const a = acceptance(grant.id);
      acc = me.sign(a.spec, a.type, a.payload, { public: true, objects: a.objects });
    } finally {
      await this.store.saveIdentity(me);
    }
    let left = 0;
    for (const h of list([...s.relays, ...me.f.homes.map((x) => x.hint)])) {
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
  laneLimits(cap, until, clock) {
    if (!Number.isSafeInteger(cap.value) || cap.value <= 0) throw new Error("A lane needs a cap per act, a whole amount above zero.");
    const l = { cap: { unit: cap.unit, value: cap.value } };
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
    const lines2 = [];
    try {
      limits = r.limits === null ? null : readLimits(r.limits);
    } catch (e2) {
      lines2.push({ text: `Its limits cannot be read (${message2(e2)}): it cannot be granted.`, tone: "warn" });
    }
    const unknown = !acc.has(GRANT_LIMITS_SPEC) || !limits?.cap;
    if (!acc.has(GRANT_LIMITS_SPEC)) lines2.push({ text: "Lanes carry their limits under the grant limits cMIP, which you do not accept: accept it in Settings to grant a lane.", tone: "warn" });
    lines2.unshift(...this.laneWords(me, { label: r.label, app: r.app, kinds: r.kinds, limits }, acc).map((text3) => ({ text: text3 })));
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
      const limits = readLimits(r.limits);
      const grant = await this.grantLaneActs(me, s, { key: r.key, kinds: r.kinds, limits });
      (book.lanes ??= {})[grant] = { label: r.label, app: r.app, key: r.key, kinds: r.kinds, limits, at: now(), revoked: null, here: false, role: null };
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
        r = me.sign(MIRS.agreements, REVOCATION, revocationPayload(grant), { public: true, objects: under.length ? under.map((a) => [me.id, a.id]) : void 0 });
      } finally {
        await this.store.saveIdentity(me);
      }
      let left = 0;
      for (const h of list([...s.relays, ...me.f.homes.map((x) => x.hint)])) {
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
        out.push({ grant, label: l.label, app: l.app, here: l.here, state: revoked ? "revoked" : expired ? "past its expiry (this device\u2019s clock)" : "in force", words: this.laneWords(me, l, acc), acts });
      }
      void keys;
      return { lanes: out, manual: !!s.manual, link: !!keys.link, linkSay: LINK_SAY, clock: s.clock ?? null };
    });
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
    const { vault, pointer } = await this.ownVault(me, s);
    const blocking = [];
    const e2 = vault?.entries[a.entry];
    if (!vault) blocking.push("Your identity\u2019s chain declares no vault: declare one in Ki\u0161ib, in a change of keys (Money rule 2).");
    else if (!e2) blocking.push("Choose one of your vault\u2019s entries.");
    if (!pointer) blocking.push("You have no payee pointer yet: a transfer to your vault follows it (a reading: the payment cMIP\u2019s next draft will let it name the vault itself). Say where you are paid first.");
    const value = Number(a.value);
    if (!Number.isSafeInteger(value) || value <= 0) blocking.push("An amount is a whole number above zero.");
    if (e2 && !acc.has(e2.railModule)) blocking.push(`${railName(e2.railModule)} is not accepted for this identity (Settings).`);
    if (e2 && e2.railModule === SPEC.onchain.hash && value > 0 && value < 330) blocking.push("Amounts below 330 satoshis cannot be paid on the on-chain rail.");
    const amount2 = e2 && value > 0 ? { unit: e2.unit, value } : null;
    const lines2 = [];
    const costs = [];
    if (e2 && amount2) {
      const where = e2.railModule === SPEC.lightning.hash ? `its node ${readLightningAddress(e2.source)?.node.slice(0, 16) ?? "?"}\u2026` : `its Bitcoin key ${readOnchainAddress(e2.source)?.key.slice(0, 16) ?? "?"}\u2026`;
      lines2.push(
        { text: `To your vault: the entry on ${railName(e2.railModule)}, ${where}, declared in your chain (act ${vault.declaredBy.slice(0, 12)}\u2026) with the chain key.` },
        { text: `The amount: ${say(amount2, acc)}, from your wallet (on regtest, the test wallet). It is a payment from you to you: Damgar binds it, you pay it in your wallet and paste the proof back, and Damgar checks it as any payment (F355).` },
        e2.railModule === SPEC.lightning.hash ? { text: "The fee: your wallet\u2019s routing fee, which it shows before you pay. Damgar holds no wallet and cannot see it. Between two nodes with a direct channel it is usually none." } : { text: "The fee: the miners\u2019 fee your wallet sets when it sends, on top of the amount. Damgar holds no wallet and cannot see it; on regtest the test wallet chooses it." }
      );
      if (e2.railModule === SPEC.lightning.hash) lines2.push({ text: "Its invoice is made by your vault\u2019s node, not by Damgar: you make it there (on regtest, in the test wallet, on the vault\u2019s node) with the description hash Damgar shows, and paste it back." });
      costs.push(
        { text: "This money can then be spent only with the chain key and its record: the vault\u2019s own key, declared with your chain key in Ki\u0161ib, and the record Damgar keeps sealed to you at your homes (your claim of the payment, its commitment and salt included).", tone: "warn" },
        ...e2.railModule === SPEC.onchain.hash ? [{ text: "On-chain, the money sits at an address made from your vault\u2019s key and this payment\u2019s commitment: without the record, the vault\u2019s key alone does not find it.", tone: "warn" }] : [],
        { text: "One way only: Damgar never takes money out of the vault. Withdrawing needs the chain key and stays in Ki\u0161ib.", tone: "warn" }
      );
    }
    const digest = sha2562(cborEncode(["MOR Damgar transfer to the vault, version 1", me.id, a.entry, vault?.declaredBy ?? "", e2?.unit ?? "", value, pointer ?? ""]));
    return { lines: lines2, costs, blocking, digest, plan: e2 && amount2 && pointer && !blocking.length ? { entry: a.entry, amount: amount2, declaredBy: vault.declaredBy, module: e2.railModule, source: e2.source, pointer } : null };
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
   * `[1, declared-by, entry]`) and, as `fulfils`, its own payee pointer in
   * force (a reading, the build's, until the payment cMIP's next draft lets
   * it name the vault declaration). On-chain its address is made here, with
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
      const c = { rail: pl.module, payee: me.id, amount: pl.amount, fulfils: pl.pointer, payer: me.id, paidTo, salt };
      const commitment = commitmentCbor(c);
      const key = paymentCommitment(c);
      const p = {
        key,
        side: "out",
        other: me.id,
        amount: pl.amount,
        fulfils: pl.pointer,
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
        lines2.push({ text: "Bound: the address for this transfer alone is in Pay. Send exactly the amount from your wallet, then paste the transaction\u2019s id there.", tone: "ok" });
      } else {
        lines2.push({ text: `Bound: make an invoice on your vault\u2019s node for ${say(pl.amount, this.acceptedSet(await this.accepted(me)))} with the description hash ${key} (on regtest, in the test wallet, on the vault\u2019s node), and paste it in Pay.`, tone: "ok" });
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
      return { lines: [{ text: c ? `Lanes with an expiry are judged on the timestamp clock ${short(c)}.` : "No clock: a lane can have no expiry.", tone: "ok" }] };
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
          entries: v.entries.map((e2) => ({
            unit: { unit: e2.unit, value: 0, said: unitOf(e2.unit)?.unit.name ?? `unit ${e2.unit.slice(0, 8)}\u2026` },
            railName: railName(e2.railModule),
            limit: { unit: e2.unit, value: e2.limit, said: say({ unit: e2.unit, value: e2.limit }, acc) },
            said: e2.limit === 0 ? "every payment in this unit goes to the vault (flow off)" : `a single payment above ${say({ unit: e2.unit, value: e2.limit }, acc)} goes to your vault, not your flow`
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
        act = me.sign(MONEY, made.type, made.payload, { public: true });
      } finally {
        await this.store.saveIdentity(me);
      }
      let left = 0;
      for (const h of list([...s.relays, ...me.f.homes.map((x) => x.hint)])) {
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
      const r = list(relays);
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
    if (!l.encryptionKey) throw new Error(`${short(to)} publishes no encryption key: nothing can be sealed to it. Nothing was sent.`);
    const inbox = l.inbox(spec) ?? (MESSAGES_SPECS.includes(spec) ? MESSAGES_SPECS.map((x) => l.inbox(x)).find((x) => x) : void 0) ?? [];
    if (!inbox.length) throw new Error(`${short(to)} declares no inbox: nothing can be left for it. Nothing was sent.`);
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
        made = this.signAct(me, spec, type, payload, { public: false, to: [to], refs });
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
    for (const h of me.f.homes.map((x) => x.hint)) {
      try {
        await relayAt(h, s.via).putAct(made.act);
      } catch {
      }
    }
    if (!left) throw new Error(`${short(to)}\u2019s inbox (${inbox.join(", ")}) took nothing. It was signed and kept here; try again later.`);
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
function referralShare(words) {
  const m = words?.match(/Referral: (\d{1,2})% of the price to the repost the buyer names\./);
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

// src/ops.ts
var text2 = (v) => typeof v === "string" ? v : "";
var list2 = (v) => Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : typeof v === "string" ? v.split(/[\s,]+/).filter(Boolean) : [];
var untilOf = (v) => {
  if (v === void 0 || v === null || v === "") return null;
  if (typeof v === "number") return Math.floor(v);
  const t = Date.parse(String(v));
  if (Number.isNaN(t)) throw new Error("Until: a date and time, or nothing.");
  return Math.floor(t / 1e3);
};
var SETTINGS_SAVES = /* @__PURE__ */ new Set(["publish list", "rails publish", "relays", "manual", "clock", "link"]);
async function run(d, op, a) {
  const out = await runOp(d, op, a);
  if (SETTINGS_SAVES.has(op) || op === "accept" && a.where === "settings") await d.settingsSaved();
  return out;
}
async function runOp(d, op, a) {
  switch (op) {
    case "state":
      return d.state();
    case "bring":
      return d.bring({ id: text2(a.id), words: text2(a.words), address: text2(a.address), relays: list2(a.relays) });
    case "renew":
      return d.renew(text2(a.words));
    case "use":
      return d.use(text2(a.id));
    case "leave":
      return d.leave();
    case "forget":
      return d.forget(text2(a.id));
    case "carry":
      return d.carry();
    case "check":
      return d.check();
    case "accept":
      return d.setAccepted(list2(a.keys));
    case "publish list":
      return d.publishList(a.on === true);
    case "look":
      return d.look();
    case "to sign":
      return d.toSign();
    case "sign draft":
      return d.signDraft(text2(a.id));
    case "decline":
      return d.decline(text2(a.id));
    case "accept debt":
      return d.acceptDebt(text2(a.id));
    case "pay request":
      return d.payRequest(text2(a.id));
    case "answer invoice":
      return d.answerInvoice(text2(a.id), text2(a.invoice));
    case "refuse invoice":
      return d.refuseInvoice(text2(a.id), text2(a.why));
    case "pay":
      return d.pay();
    case "paid":
      return d.paid(text2(a.key), text2(a.proof));
    case "recheck":
      return d.recheck(text2(a.key));
    case "sign receipt":
      return d.signReceipt(text2(a.key));
    case "account":
      return d.account();
    case "rails":
      return d.rails();
    case "rails review":
      return d.railsReview({ lightning: text2(a.lightning), onchain: text2(a.onchain), network: Number(a.network ?? 3), newRequestKey: a.newRequestKey === true });
    case "rails publish":
      return d.publishRails({ lightning: text2(a.lightning), onchain: text2(a.onchain), network: Number(a.network ?? 3), newRequestKey: a.newRequestKey === true, digest: text2(a.digest) });
    case "relays":
      return d.setRelays(list2(a.relays));
    case "lanes":
      return d.lanes();
    case "collectives":
      return d.collectives();
    case "collective add":
      return d.collectiveAdd(text2(a.id));
    case "collective promise read":
      return d.collectivePromiseRead({ collective: text2(a.collective), to: text2(a.to), value: text2(a.value), unit: text2(a.unit), whatFor: text2(a.whatFor) });
    case "collective promise":
      return d.collectivePromise({ collective: text2(a.collective), to: text2(a.to), value: text2(a.value), unit: text2(a.unit), whatFor: text2(a.whatFor), digest: text2(a.digest) });
    case "grant lane":
      return d.grantLane(text2(a.id));
    case "own lane review":
      return d.ownLaneReview({ role: a.role === "payouts" ? "payouts" : "receipts", cap: text2(a.cap), unit: text2(a.unit), until: untilOf(a.until) });
    case "own lane":
      return d.ownLane({ role: a.role === "payouts" ? "payouts" : "receipts", cap: text2(a.cap), unit: text2(a.unit), until: untilOf(a.until), digest: text2(a.digest) });
    case "revoke lane review":
      return d.revokeLaneReview(text2(a.grant));
    case "revoke lane":
      return d.revokeLane(text2(a.grant));
    case "manual":
      return d.setManual(a.on === true);
    case "clock":
      return d.setClock(text2(a.clock));
    case "link":
      return d.setLink(a.remove === true ? null : { rest: text2(a.rest), macaroon: text2(a.macaroon).replace(/\s+/g, "").toLowerCase(), cert: text2(a.cert) });
    case "vault transfer read":
      return d.vaultTransferRead({ entry: Number(a.entry ?? 0), value: text2(a.value) });
    case "vault transfer":
      return d.vaultTransfer({ entry: Number(a.entry ?? 0), value: text2(a.value), digest: text2(a.digest) });
    case "vault invoice":
      return d.vaultInvoice(text2(a.key), text2(a.invoice));
    case "answer address":
      return d.answerAddress(text2(a.id));
    default:
      throw new Error(`unknown operation ${op}`);
  }
}

// ../manage/src/view.ts
function e(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// ../dub/src/page/view.ts
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
var NAME = "Damgar";
var TEST_ONLY2 = "Test identities and test networks only, until MOR is frozen. No real money";
var WEB_BANNER2 = `<div class="banner" id="for-testing-only" role="note"><p><strong>For testing only.</strong> ${TEST_ONLY2}. The risks, in plain words:</p>
<ol><li>Whoever serves this page\u2019s code at the moment you bring an identity here could copy its signing key, and the on-chain request key Damgar makes: with them, sign claims and receipts as you, and commit your side to payments you did not intend.</li>
<li>This browser\u2019s storage, where those keys are kept, can be lost, or read by what runs in this page.</li>
<li>Damgar holds no wallet: money moves only in your own wallet, on a test network. This page follows no chain, so an on-chain payment is shown paid, not yet checked against the chain.</li></ol>
<p>Never bring a real identity here, and never pay real money for anything it shows.</p></div>`;
var TINT2 = { layer: "#e8b33a", line: "#382e16", edge: "#4a3b1a", accent: "#8e6f28" };
var STYLE2 = `${STYLE}
:root{--line:${TINT2.line};--edge:${TINT2.edge};--tint:${TINT2.accent}}
button:hover,.door:hover{border-color:var(--tint)}
input:focus,textarea:focus{border-color:var(--tint)}
details>summary::before{color:var(--tint)}
.bar{border-bottom-color:var(--edge)}
.count{background:var(--edge)}
.card{background:var(--raise)}
.item{border:1px solid var(--edge);border-radius:12px;padding:12px 14px;margin:12px 0;background:var(--raise)}
.item h3{margin:0 0 4px;font-weight:400;font-size:15px}
.item .meta{font-size:12px;color:var(--soft)}
.item ul{margin:6px 0;padding-left:1.1em;font-size:14px}
.item li{margin:3px 0}
li.bad{color:var(--bad)}
li.warn{color:var(--soft)}
.amount{font-size:17px;margin:4px 0}
.unknown{border-color:var(--line)}
.unknown h3{color:var(--soft)}
.copy{font:12px/1.5 ui-monospace,"SF Mono",Menlo,monospace;color:var(--soft);overflow-wrap:anywhere;border:1px solid var(--edge);border-radius:10px;padding:8px 10px;background:var(--bg);margin:6px 0}
.v{font-size:12px;letter-spacing:.04em;text-transform:uppercase;padding:1px 8px;border-radius:999px;border:1px solid var(--edge);color:var(--soft)}
.v.valid{color:var(--text);border-color:var(--tint)}
.v.invalid{color:var(--bad);border-color:var(--bad)}
.proofs{border-top:1px solid var(--line);margin-top:8px;padding-top:6px;font-size:13px}
.proofs .p{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin:4px 0}
details.settled{border:1px solid var(--line);border-radius:12px;padding:8px 14px;margin:8px 0}
details.settled>summary{font-size:14px;color:var(--text);cursor:pointer}
details.setting{border-top:1px solid var(--line, rgba(127,127,127,.25));padding:2px 0}
details.setting>summary{cursor:pointer;list-style-position:outside}
details.setting>summary>h2{display:inline;margin:0}
details.setting[open]>summary{margin-bottom:6px}
details.settled[open]>summary{margin-bottom:4px}
details.settled .item{border:0;padding:0;margin:4px 0 0;background:none}
.totals{border:1px solid var(--edge);border-radius:12px;padding:10px 14px;margin:12px 0}
.totals dl{display:grid;grid-template-columns:max-content 1fr;gap:4px 16px;margin:0;font-size:14px}
.totals dt{color:var(--soft)}
.totals dd{margin:0}
.accept li{list-style:none;border:1px solid var(--edge);border-radius:12px;padding:10px 14px;margin:10px 0}
.accept ul{padding:0}
.accept .check{font-size:15px;color:var(--text)}
.accept .kind{font-size:12px;color:var(--soft);margin-left:6px}
.accept p{margin:4px 0 0 26px;font-size:13px;color:var(--soft)}
.accept .round{color:var(--faint)}
.costs{border:1px solid var(--bad);border-radius:12px;padding:10px 14px;margin:12px 0}
.costs h3{font-weight:400;margin:0 0 4px}`;
var note = (kind, html) => `<div class="note ${kind}">${html}</div>`;
var lines = (ls) => ls.length ? `<ul>${ls.map((l) => `<li class="${e(l.tone ?? "")}">${e(l.text)}</li>`).join("")}</ul>` : "";
function who(w) {
  return `<span class="who"><span class="fp" title="${e(w.id)}">${e(w.short)}</span>${w.me ? '<span class="you">you</span>' : ""}</span>`;
}
function testNotice(web) {
  return web ? "" : `<div class="banner" id="test-only">${TEST_ONLY2}. Damgar holds no wallet and no node: money moves only in your own wallet. The signing key and the on-chain request key are held in software in this program\u2019s folder: a prototype, never for a real identity.</div>`;
}
function top(web = false, back = false) {
  return `<header class="bar"><h1 class="mark">${NAME}</h1><span class="grow"></span>${back ? '<button class="quiet" data-action="back">Back to Damgar</button>' : `<span class="small">${web ? "web client, for testing only" : "this machine only"}</span>`}</header>
${testNotice(web)}`;
}
function pairing() {
  return `${top()}
<h2>Pair this browser</h2>
<p class="small">This page acts for the Damgar program running on this machine, which holds the keys. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="row"><input id="pair-code" class="grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit">Pair</button></form>
<div id="pair-status"></div>`;
}
function identityWindow(s, web) {
  const held = s.held.length ? `<h2>Identities held here</h2><div class="held"><ul>${s.held.map((h) => `<li><span class="fp" title="${e(h.id)}">${e(h.short)}</span>${h.active ? '<span class="small">in use</span>' : `<button data-action="use" data-id="${e(h.id)}">Use this one</button>`}<button class="quiet" data-action="forget" data-id="${e(h.id)}">Forget it here</button></li>`).join("")}</ul></div>` : "";
  const i = s.identity;
  const mine = i ? `<section class="card"><h3>In use</h3><p class="id">${e(i.form)}</p><p class="small">In hexadecimal, as before: <span class="fp">${e(i.grouped)}</span></p>
<dl class="facts"><dt>Homes</dt><dd>${e(i.homes.join(", "))}</dd><dt>Relays</dt><dd>${e(i.relays.join(", "))}</dd><dt>Damgar\u2019s line</dt><dd>${i.line.acts} act${i.line.acts === 1 ? "" : "s"}${i.line.latest ? `: its card, for Ki\u0161ib, <code class="card-line">${e(i.line.latest)} ${i.line.acts} ${e(i.line.summary ?? "")}</code>` : ""}</dd></dl>
<p class="small">Most of Damgar\u2019s acts are sealed, so Ki\u0161ib cannot read its line from the homes: when the signing key is changed there, give Ki\u0161ib this card (latest act, position, summary), or every claim and receipt signed here becomes void (Identity rule 35).</p>
${i.encryption ? "" : note("warn", "Damgar holds no encryption key for this identity: nothing sealed to it opens here.")}
<div class="row"><button data-action="carry">Show the signing key\u2019s words</button><button data-action="leave" class="quiet">Leave it</button><button data-action="back" class="primary">Back to Damgar</button></div>
<details><summary>Its signing key was changed elsewhere (in Ki\u0161ib): take the new words</summary><form id="renew"><label>The new signing key\u2019s 24 words</label><textarea name="words" required></textarea><div class="row"><button type="submit">Use the new words</button></div></form></details></section>` : "";
  return `${top(web, !!i)}
<h2>${i ? "The identity" : "First, an identity"}</h2>
<p class="small">Damgar never makes an identity and never holds a chain key. Bring one you have, by its ID and its signing key\u2019s words, as in Dub: Dub\u2019s identity window shows them (\u201CShow the signing key\u2019s words\u201D).</p>
${mine}
${held}
<section class="card"><h3>Bring an identity you have</h3>
<form id="bring"><label>Its ID (mid1\u2026, or its hexadecimal)</label><input name="id" autocomplete="off" spellcheck="false" required>
<label>Its signing key\u2019s 24 words (never the chain key\u2019s)</label><textarea name="words" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" placeholder="https://" required>
<details><summary>Relays, if it names none</summary><label>One per line</label><textarea name="relays"></textarea></details>
<div class="row"><button type="submit" class="primary">Bring it</button></div></form></section>
<div id="status"></div>`;
}
function carry(c, web) {
  return `${top(web, true)}<h2>The signing key\u2019s words</h2>
<p class="small">With the ID, they bring this identity into Damgar, Dub or Edubba on another device. Whoever holds them can sign claims and receipts as this identity and open what is sealed to it. They are not the chain key\u2019s words, and not a Bitcoin wallet\u2019s.</p>
<p class="id">${e(c.grouped)}</p><div class="words">${c.words.map((w, i) => `<span><b>${i + 1}</b>${e(w)}</span>`).join("")}</div>
<div class="row"><button data-action="back" class="primary">Back to Damgar</button></div>`;
}
function acceptList(items) {
  return `<div class="accept"><ul>${items.map(
    (a) => `<li><label class="check"><input type="checkbox" name="accept" value="${e(a.key)}"${a.accepted ? " checked" : ""}> ${e(a.name)}<span class="kind">${e(a.kind)}, draft ${a.draft}</span></label>
<p>${e(a.does)}</p><p>${e(a.here)}</p><p class="round">${e(a.text)}${a.built ? "" : " \xB7 not used by Damgar in round 1"}${a.needs.length ? ` \xB7 needs ${a.needs.map(e).join(", ")}` : ""}</p></li>`
  ).join("")}</ul></div>`;
}
function acceptScreen(s, web) {
  return `${top(web)}
<h2>What you accept</h2>
<p class="small">Every money act names the specifications it follows. Damgar reads, checks and signs only under those you accept here; an act under any other is shown unknown, and is never signed (as the core treats a specification it does not implement). Your choice is sealed to your identity and kept at its homes, so every app holding it reads the same list (F340); changeable in Settings.</p>
${s.list.problems.length ? note("warn", lines(s.list.problems.map((t) => ({ text: t, tone: "warn" })))) : ""}
<form id="accept">${acceptList(s.accept)}<div class="row"><button type="submit" class="primary">Accept these</button></div></form>
<div id="status"></div>`;
}
function app(s, web) {
  const i = s.identity;
  const tab = (k, label, count = "") => `<button class="tab${k === "sign" ? " on" : ""}" data-tab="${k}">${label}<span class="count" id="count-${k}">${count}</span></button>`;
  return `<header class="bar"><h1 class="mark">${NAME}</h1>
<nav class="tabs">${tab("sign", "To sign", s.counts.toSign ? String(s.counts.toSign) : "")}${tab("account", "The account")}${tab("pay", "Pay", s.counts.toPay ? String(s.counts.toPay) : "")}${tab("lanes", "Lanes")}${tab("collectives", "For a collective")}${tab("settings", "Settings")}</nav>
<button class="me" data-action="window" title="The identity">${who({ id: i.id, short: i.short, me: true })}</button></header>
${testNotice(web)}
<div id="spent"></div>
<div id="status"></div>
<section id="sign"><div class="row"><span class="grow small">Drafts prepared in Dub and Edubba, requests others sent, invoices to make, receipts to sign. Nothing is signed until you choose.</span><button class="quiet" data-action="look">Look again</button></div><div id="sign-list"><p class="empty">Looking\u2026</p></div></section>
<section id="account" hidden><div id="account-body"><p class="empty">Reading the account\u2026</p></div></section>
<section id="pay" hidden><p class="small">Damgar holds no wallet. For each payment it shows what to pay; pay it in your own wallet, then paste the proof back here.</p><div id="pay-list"><p class="empty">Reading\u2026</p></div></section>
<section id="lanes" hidden><p class="small">A lane lets an app (Dub, or Damgar itself) sign some of your money acts by itself, within a cap per act and until a date: a grant of your identity to itself, its key held by that app (F338, F351). Every act signed under one is shown so, here and to every reader. One revocation ends it.</p><div id="lanes-body"><p class="empty">Reading\u2026</p></div></section>
<section id="collectives" hidden><p class="small">For a collective whose Money area you hold: Damgar acts for it with your own key for it, made as you signed its founding and sealed to you at your homes (F353). Within the area\u2019s cap, your key alone; above it, another holder\u2019s key too, as its constitution writes it.</p><div id="collectives-body"><p class="empty">Reading\u2026</p></div></section>
<section id="settings" hidden><div id="settings-body"><p class="empty">Reading\u2026</p></div></section>`;
}
var amount = (a) => a ? `<p class="amount">${e(a.said)}</p>` : "";
var verdict = (v) => `<span class="v ${e(v.answer)}" title="${e(v.why)}">${e(v.answer)}</span>`;
function toSign(items, problems) {
  if (!items.length) return `<p class="empty">Nothing waits to be signed.</p>${problems.length ? note("warn", lines(problems.map((t) => ({ text: t, tone: "warn" })))) : ""}`;
  const btn = (o, id, label, primary = false) => `<button${primary ? ' class="primary"' : ""} data-action="${o}" data-id="${e(id)}">${label}</button>`;
  return items.map((t) => {
    const offers = t.offers.map((o) => {
      switch (o) {
        case "sign":
          return btn("sign draft", t.id, t.kind === "draft" && t.title.startsWith("A request") ? "Sign and send the request" : "Sign it", true);
        case "decline":
          return btn("decline", t.id, t.kind === "unknown" ? "Set it aside" : "Decline");
        case "debt":
          return btn("accept debt", t.id, "Accept as a debt (sign an obligation)");
        case "pay":
          return btn("pay request", t.id, "Pay it", true);
        case "receipt":
          return btn("sign receipt", t.id, "Check it, and sign the receipt", true);
        case "refuse":
          return btn("refuse invoice", t.id, "Refuse");
        case "grant":
          return btn("grant lane", t.id, "Grant this lane", true);
        case "address":
          return btn("answer address", t.id, "Give an address bound to it", true);
        default:
          return "";
      }
    }).join("");
    const invoice = t.offers.includes("invoice") ? `<label>The description hash to give your wallet</label><div class="copy" data-copy>${e(t.descriptionHash ?? "")}</div><button class="quiet" data-action="copy" data-text="${e(t.descriptionHash ?? "")}">Copy</button>
<form class="invoice" data-id="${e(t.id)}"><label>The invoice your wallet made (BOLT 11)</label><textarea name="invoice" required spellcheck="false" placeholder="lnbcrt\u2026"></textarea><div class="row"><button type="submit" class="primary">Check it and send it</button></div></form>` : "";
    return `<div class="item${t.unknown ? " unknown" : ""}" data-item="${e(t.id)}"><h3>${e(t.title)}</h3><div class="meta">${t.app ? `Prepared in ${e(t.app)} \xB7 ` : ""}from ${who(t.from)}</div>${amount(t.amount)}${lines(t.lines)}${invoice}<div class="row">${offers}</div></div>`;
  }).join("") + (problems.length ? note("warn", lines(problems.map((x) => ({ text: x, tone: "warn" })))) : "");
}
function payment(p, forPay = false) {
  const proofs = p.proofs.length ? `<div class="proofs">${p.proofs.map((x) => `<div class="p"><span>${x.kind === "claim" ? "Claim" : "Receipt"} by ${who(x.by)}</span><span class="small how">${e(x.how)}</span>${verdict(x.rail)}<span class="small">rail: ${e(x.rail.why || "the rail\u2019s own evidence holds")}</span>${x.confirmations ? `<span class="small">${x.confirmations[0]} of ${x.confirmations[1]} confirmations</span>` : ""}</div><div class="p small">Beside it: ${verdict(x.beside)} ${e(x.beside.why)}${x.standing !== "valid" ? ` \xB7 the act itself: ${e(x.standing)}` : ""}</div>`).join("")}</div>` : "";
  const pay = forPay && p.pay ? p.pay.invoice ? `<label>Pay this invoice in your wallet</label><div class="copy">${e(p.pay.invoice)}</div><button class="quiet" data-action="copy" data-text="${e(p.pay.invoice)}">Copy the invoice</button>
<form class="paid" data-key="${e(p.key)}"><label>The proof, from your wallet once paid: the preimage (64 hexadecimal characters)</label><input name="proof" required spellcheck="false" autocomplete="off"><div class="row"><button type="submit" class="primary">Check it and sign my claim</button></div></form>` : `<label>Pay exactly ${e(p.pay.amount.said)} to this address, from your wallet</label><div class="copy">${e(p.pay.address ?? "")}</div><button class="quiet" data-action="copy" data-text="${e(p.pay.address ?? "")}">Copy the address</button>
${p.stage === "paid" ? `<div class="row"><button data-action="recheck" data-key="${e(p.key)}" class="primary">Check the chain again</button></div>` : `<form class="paid" data-key="${e(p.key)}"><label>The proof, from your wallet once sent: the transaction\u2019s id (64 hexadecimal characters)</label><input name="proof" required spellcheck="false" autocomplete="off"><div class="row"><button type="submit" class="primary">Check it and sign my claim</button></div></form>`}` : "";
  const vaultInvoice = forPay && p.vaultInvoice ? `<p class="small">Make an invoice on your vault\u2019s node (${e(p.vaultInvoice.node.slice(0, 16))}\u2026) for exactly ${e(p.amount.said)}, with this description hash and no description (on regtest, in the test wallet, on the vault\u2019s node):</p><div class="copy">${e(p.vaultInvoice.descriptionHash)}</div>
<form class="vault-invoice" data-key="${e(p.key)}"><label>The invoice your vault\u2019s node made</label><input name="invoice" required spellcheck="false" autocomplete="off"><div class="row"><button type="submit" class="primary">Check it</button></div></form>` : "";
  const ticket = p.ticket ? `<p class="small">An anchor\u2019s ticket: batch ${p.ticket.batch}, tier ${p.ticket.tier}, on the chain by block ${p.ticket.deadline}.${p.ticket.checked ? "" : " Not checked here: this Damgar follows no chain, so whether that block is within the tier\u2019s reach of today\u2019s is unknown. Pay only if you trust the service on it, or check it in Damgar on a computer."}</p>` : "";
  return `<div class="item" data-payment="${e(p.key)}"><h3>${p.side === "out" ? "To" : "From"} ${who(p.other)} \xB7 ${e(p.railName)}${p.to === "vault" ? ", to the vault" : ""}</h3>
<div class="meta">${e(p.stageSaid)}</div>${amount(p.amount)}${p.whatFor ? `<p class="small">For \u201C${e(p.whatFor)}\u201D</p>` : ""}${ticket}${lines(p.lines)}${vaultInvoice}${pay}${proofs}</div>`;
}
var confirmed = (p) => p.stage === "settled" && ["claim", "receipt"].every((k) => p.proofs.some((x) => x.kind === k && x.rail.answer === "valid" && x.standing === "valid"));
function accountPayment(p) {
  if (!confirmed(p)) return payment(p);
  return `<details class="fold settled" data-settled="${e(p.key)}"><summary>${p.side === "out" ? "To" : "From"} ${e(p.other.short)} \xB7 ${e(p.railName)} \xB7 ${e(p.amount.said)} \xB7 <span class="v valid">paid and confirmed</span></summary>${payment(p)}</details>`;
}
function account(a) {
  const totals2 = `<div class="totals"><dl>${a.totals.map((t) => `<dt>${e(t.label)}</dt><dd>${t.amounts.length ? t.amounts.map((x) => e(x.said)).join("<br>") : '<span class="small">none</span>'}</dd>`).join("")}</dl></div>`;
  const asks = a.asks.length ? `<h2>Requests and debts</h2>${a.asks.map((x) => `<div class="item"><h3>${x.side === "out" ? "You asked" : "Asked of you by"} ${who(x.other)}</h3><div class="meta">${e(x.state)}</div>${amount(x.amount)}${x.whatFor ? `<p class="small">For \u201C${e(x.whatFor)}\u201D</p>` : ""}${lines(x.lines)}</div>`).join("")}` : "";
  return `<p class="small">Totals are per unit, never added across units.</p>${totals2}
<h2>Payments</h2>${a.payments.length ? `${a.payments.some(confirmed) ? '<p class="small">Payments paid and confirmed are folded: open one to see its record.</p>' : ""}${a.payments.map(accountPayment).join("")}` : '<p class="empty">No payment yet.</p>'}
${asks}
<details class="fold"><summary>What this account does not judge</summary>${lines(a.notes.map((t) => ({ text: t })))}</details>
${a.problems.length ? note("warn", lines(a.problems.map((t) => ({ text: t, tone: "warn" })))) : ""}`;
}
function payList(ps) {
  return ps.length ? ps.map((p) => payment(p, true)).join("") : '<p class="empty">Nothing to pay.</p>';
}
var fold = (name, title, body, open) => `<details class="fold setting" data-fold="${name}"${open ? " open" : ""}><summary><h2>${title}</h2></summary>${body}</details>`;
function settings(s, r, problem, l, opened = /* @__PURE__ */ new Set()) {
  const i = s.identity;
  const open = (name) => !s.settingsSaved || opened.has(name);
  const pointer = r?.pointer ? `<p>Your payee pointer in force: version ${r.pointer.version}${r.pointer.forked ? " (its chain is forked: the last pointer before the fork counts)" : ""}.</p>${lines(r.pointer.rails.map((x, n) => ({ text: `${n + 1}. ${x.name}: ${x.said}${x.accepted ? "" : " (a rail Module you do not accept)"}` })))}` : '<p class="small">You have no payee pointer yet: nobody can pay you until you say where.</p>';
  const vault = r?.vault ? `${lines(r.vault.entries.map((x) => ({ text: `${x.unit.said}, on ${x.railName}: ${x.said}.` })))}<p class="small">Declared in your identity\u2019s chain (act ${e(r.vault.declaredBy.slice(0, 12))}\u2026), with the chain key: it is changed only in Ki\u0161ib, in a change of keys, never here (Money rule 2).</p>` : '<p class="small">Your identity\u2019s chain declares no vault: every payment goes to your flow, and you have chosen no protection (Money rule 3). A vault, and its limit per unit, is declared with the chain key, in Ki\u0161ib.</p>';
  const paid = `${problem ? note("warn", e(problem)) : pointer}
<form id="rails"><label>Lightning: your wallet\u2019s node key (66 hexadecimal characters; the test wallet shows it)</label><input name="lightning" autocomplete="off" spellcheck="false">
<label>On-chain: a Bitcoin key of your wallet, x-only (64 hexadecimal characters)</label><input name="onchain" autocomplete="off" spellcheck="false">
<label>Network</label><select name="network"><option value="3" selected>regtest</option><option value="2">signet</option></select>
<label class="check"><input type="checkbox" name="newRequestKey"> Make a new on-chain request key (the old one then no longer counts for new payments)</label>
<div class="row"><button type="submit">Read it back</button></div></form><div id="rails-review"></div>
${r?.requestKey ? `<p class="small">The on-chain request key Damgar holds: <span class="fp">${e(r.requestKey.slice(0, 16))}\u2026</span></p>` : ""}`;
  const where = `<dl class="facts"><dt>Homes</dt><dd>${e(i.homes.join(", "))} (the identity\u2019s chain names them; changed in Ki\u0161ib)</dd><dt>The chain followed</dt><dd>${e(r?.chain ?? "")}</dd></dl>
<form id="relays"><label>Relays its money acts go to, one per line</label><textarea name="relays">${e(i.relays.join("\n"))}</textarea><div class="row"><button type="submit">Save the relays</button></div></form>`;
  const accept = `<p class="small">Sealed to your identity at its homes${s.list.version ? ` (version ${s.list.version})` : ""}: every app holding it reads it, each for its part. Damgar changes only the Money layer\u2019s part.</p>
${s.list.merged.length ? note("warn", `Two apps changed it at once; merged: ${lines(s.list.merged.map((t) => ({ text: t })))}`) : ""}
<form id="accept">${acceptList(s.accept)}<div class="row"><button type="submit" class="primary">Save what I accept</button></div></form>
<div class="row"><span class="grow small">${s.list.published ? "Published: anyone can read which specifications you accept." : "Private: sealed to yourself (the default)."}</span><button data-action="publish list" data-on="${s.list.published ? "false" : "true"}">${s.list.published ? "Make it private again" : "Publish it"}</button></div>`;
  return [
    fold("paid", "Where you are paid", paid, open("paid")),
    fold("vault", "The vault", `${vault}${r?.vault ? vaultTransferForm(r.vault.entries) : ""}`, open("vault")),
    fold("relays", "Homes and relays", where, open("relays")),
    ...l ? byHand(l, s.web).map(([name, title, body]) => fold(name, title, body, open(name))) : [],
    fold("accept", "What you accept", accept, open("accept"))
  ].join("\n");
}
function vaultTransferForm(entries) {
  return `<h3>Transfer to the vault</h3><p class="small">From your wallet to your vault, one way only: Damgar binds the payment, you pay it in your wallet (on regtest, the test wallet) and paste the proof back. Withdrawing needs the chain key and stays in Ki\u0161ib.</p>
<form id="vault-transfer"><label>To</label><select name="entry">${entries.map((x, i) => `<option value="${i}">${e(x.railName)}, ${e(x.unit.said)}</option>`).join("")}</select>
<label>Amount (whole units)</label><input name="value" inputmode="numeric" autocomplete="off" required>
<div class="row"><button type="submit">Read it back</button></div></form><div id="vault-review"></div>`;
}
function vaultReview(r) {
  return `<div class="item"><h3>Transfer to your vault, read back</h3>${lines(r.lines)}</div>
${r.costs.length ? `<div class="costs"><h3>Before you send</h3>${lines(r.costs)}</div>` : ""}
${r.blocking.length ? note("warn", lines(r.blocking.map((t) => ({ text: t, tone: "warn" })))) : `<div class="row"><button class="primary" data-action="vault transfer" data-digest="${e(r.digest)}">Bind it, then pay it in Pay</button></div>`}`;
}
function railsReview(r) {
  return `<div class="item"><h3>Your new payee pointer</h3>${lines(r.lines)}</div>
${r.costs.length ? `<div class="costs"><h3>What each rail costs you, stated by its Module</h3>${lines(r.costs)}</div>` : ""}
<div class="row"><button class="primary" data-action="rails publish" data-digest="${e(r.digest)}">Sign and publish it</button></div>`;
}
function spent(say2) {
  return note("spent", `${e(say2)} <button data-action="window">Give the new words</button>`);
}
function lanes(r, units) {
  const list3 = r.lanes.length ? r.lanes.map(
    (l) => `<div class="item lane${l.state === "in force" ? "" : " unknown"}" data-lane="${e(l.grant)}"><h3>${e(l.label)}</h3><div class="meta">${e(l.state)} \xB7 its key held by ${e(l.here ? "this Damgar" : l.app)} \xB7 grant <span class="fp" title="${e(l.grant)}">${e(l.grant.slice(0, 8))}\u2026</span></div>
${lines(l.words.map((text3) => ({ text: text3 })))}
<details class="fold"><summary>Signed under it: ${l.acts.length} act${l.acts.length === 1 ? "" : "s"}</summary>${l.acts.length ? lines(l.acts.map((a) => ({ text: `${a.said} \xB7 ${a.id.slice(0, 12)}\u2026` }))) : '<p class="small">None yet.</p>'}</details>
${l.state === "in force" ? `<div data-revoke="${e(l.grant)}"><div class="row"><button data-action="revoke lane review" data-grant="${e(l.grant)}">Revoke it</button></div></div>` : ""}</div>`
  ).join("") : '<p class="empty">No lane yet. An app asks for one (in Dub: its identity window, \u201CPaying from Dub: a lane from Damgar\u201D), and it waits in To sign.</p>';
  const unitOptions = units.map((u2) => `<option value="${e(u2.hash)}"${/regtest/.test(u2.label) ? " selected" : ""}>${e(u2.label)}</option>`).join("");
  const own = (role, title, say2) => `<form class="own-lane" data-role="${role}"><h3>${title}</h3><p class="small">${say2}</p>
<div class="row"><label>At most, per act <input name="cap" inputmode="numeric" required></label><label>Unit <select name="unit">${unitOptions}</select></label></div>
<label>Until (optional; judged on the timestamp clock named in Settings)</label><input name="until" type="datetime-local">
<div class="row"><button type="submit">Read it back</button></div></form>`;
  return `${r.manual ? note("warn", "Every step is followed by hand (Settings): the lanes Damgar holds sign nothing until you turn it off. Lanes other apps hold still sign there.") : ""}
<h2>Your lanes</h2>${list3}
<h2>Damgar by itself</h2>
<p class="small">With these, a payment to you needs nothing from you: Damgar answers and signs the receipt by itself, below the cap. Without them, everything waits in To sign, as in round 1.</p>
${own("receipts", "Receipts and invoices, by itself", "Damgar checks a payment to you from the rail\u2019s own evidence and signs the receipt; it answers an invoice request with an address, or with an invoice your node made through its receive-only link (Settings).")}
${own("payouts", "Referral shares, by itself", "When someone buys your work through a repost and your offer promises the reposter a share, Damgar asks for that payment by itself; you still pay it in your wallet, from Pay.")}
<div id="lane-review"></div>`;
}
function revokeReview(grant, said) {
  return `<div class="item"><h3>The revocation, read back</h3>${lines(said)}</div><div class="row"><button class="primary" data-action="revoke lane" data-grant="${e(grant)}">Sign the revocation</button></div>`;
}
function laneReview(r) {
  return `<div class="item"><h3>The lane, read back</h3>${lines(r.lines)}</div><div class="row"><button class="primary" data-action="own lane" data-digest="${e(r.digest)}">Sign this lane</button></div>`;
}
function byHand(r, web) {
  return [
    ["manual", "Every step by hand", `<p class="small">For those who want to follow the real process step by step: every signature waits for you, as in round 1. Off by default.</p>
<label class="check"><input type="checkbox" id="manual"${r.manual ? " checked" : ""}> Follow every step by hand (a clear demonstration of the real process)</label>`],
    ["clock", "The clock for lanes", `<p class="small">A lane\u2019s expiry is judged on a timestamp clock you name (the grant limits cMIP, 3.1): until it stamps an act, whether it came before the expiry is unknown.</p>
<form id="clock" class="row"><input name="clock" class="grow" placeholder="its ID" value="${e(r.clock ?? "")}" spellcheck="false"><button type="submit">Save the clock</button></form>`],
    ["link", "Making invoices by itself (receive-only)", `${lines(r.linkSay.map((text3) => ({ text: text3 })))}
${web ? note("warn", "The web client never makes a link to a node: use Damgar on your computer.") : r.link ? `<p>A receive-only link is kept.</p><div class="row"><button data-action="link remove">Remove it</button></div>` : `<form id="link"><label>Your node\u2019s REST address</label><input name="rest" placeholder="https://127.0.0.1:8080" spellcheck="false" required>
<label>The receive-only permission\u2019s file (on lnd, the macaroon baked with invoices:write and invoices:read)</label><input name="macaroonFile" spellcheck="false" required>
<label>The node\u2019s certificate file (tls.cert)</label><input name="certFile" spellcheck="false" required>
<div class="row"><button type="submit">Check it and keep it</button></div></form>`}`]
  ];
}
function collectives(r) {
  const one = (c) => {
    const area = c.area;
    const acts = c.acts.length ? lines(
      c.acts.map((a) => {
        const st = a.standing;
        const keys = st?.areas[0];
        return { text: `${a.amount.value.toLocaleString("en")} to ${a.to.slice(0, 8)}\u2026${a.whatFor ? ` (${a.whatFor})` : ""}: ${st ? st.met ? "counts for the collective" : "does not count yet" : "not read"}${keys ? `, ${keys.signers.length} of ${keys.needed} keys${keys.limits === "above" ? ", above the cap" : ""}` : ""} \xB7 ${a.act.slice(0, 12)}\u2026`, tone: st?.met ? "ok" : "warn" };
      })
    ) : '<p class="small">No promise signed here yet.</p>';
    return `<div class="item" data-collective="${e(c.id)}"><h3>Collective <span class="fp" title="${e(c.id)}">${e(c.id.slice(0, 8))}\u2026${e(c.id.slice(-4))}</span></h3>
${area ? `<p class="small">Its Money area, \u201C${e(area.name)}\u201D: ${area.holders.length} holder${area.holders.length === 1 ? "" : "s"}, ${area.number} key${area.number === 1 ? "" : "s"}${area.cap ? `; above ${area.cap.value.toLocaleString("en")} an act, one more` : ""}.</p>` : ""}
${c.why ? note("warn", e(c.why)) : `<form class="collective-promise" data-collective="${e(c.id)}"><h4>A promise to pay, from the collective</h4>
<label>To whom (an ID)</label><input name="to" type="text" required autocomplete="off" spellcheck="false">
<div class="row"><label>How much (regtest satoshis) <input name="value" type="text" inputmode="numeric" required class="narrow"></label></div>
<label>What for</label><input name="whatFor" type="text">
<div class="row"><button type="submit">Read it back</button></div><div class="promise-read"></div></form>`}
<h4>Promises signed here</h4>${acts}</div>`;
  };
  return `${r.collectives.map(one).join("") || '<p class="empty">No collective yet.</p>'}
<form id="collective-add" class="row"><input name="id" type="text" class="grow" placeholder="A collective\u2019s ID (mid1\u2026 or hex)" autocomplete="off" spellcheck="false" required><button type="submit">Act for it</button></form>`;
}
function promiseRead(r) {
  return `${lines(r.lines)}<div class="row"><button class="primary" data-action="collective-promise" data-digest="${e(r.digest)}">Sign it for the collective, with my own key</button></div>`;
}

// src/page/ui.ts
var TABS = ["sign", "account", "pay", "lanes", "collectives", "settings"];
function mount(app3, b) {
  const $ = (id) => document.getElementById(id);
  let state = null;
  let screen = "app";
  let tab = "sign";
  let timer = null;
  let reviewed = null;
  let vaultAsked = null;
  let laneAsked = null;
  try {
    const t = sessionStorage.getItem("damgar:tab");
    if (t && TABS.includes(t)) tab = t;
  } catch {
  }
  const say2 = (kind, html) => {
    const s = $("status");
    if (s) {
      s.innerHTML = note(kind, html);
      s.scrollIntoView({ block: "nearest" });
    } else app3.insertAdjacentHTML("beforeend", note(kind, html));
  };
  const fail = (err) => {
    if (b.unpaired?.(err)) {
      app3.innerHTML = pairing();
      return;
    }
    const m = err instanceof Error ? err.message : String(err);
    if (/^This identity’s signing key was changed elsewhere/.test(m)) {
      const sp = $("spent");
      if (sp) sp.innerHTML = spent(m);
    }
    say2("error", e(m));
  };
  const done = (r) => {
    if (r?.lines?.length) say2("done", lines(r.lines));
  };
  async function act(f) {
    app3.querySelectorAll("button").forEach((x) => x.disabled = true);
    try {
      return await f();
    } catch (err) {
      fail(err);
      return void 0;
    } finally {
      app3.querySelectorAll("button").forEach((x) => x.disabled = false);
    }
  }
  async function show(s) {
    state = s;
    if (timer) clearInterval(timer);
    timer = null;
    if (s.stage === "identity" || screen === "window") {
      app3.innerHTML = identityWindow(s, b.web);
      return;
    }
    if (s.stage === "accept") {
      app3.innerHTML = acceptScreen(s, b.web);
      return;
    }
    app3.innerHTML = app(s, b.web);
    void b.ask("check").then((c) => {
      const sp = $("spent");
      if (sp && !c.current && c.say) sp.innerHTML = spent(c.say);
    }).catch(() => void 0);
    await open(tab);
    timer = setInterval(() => {
      if (document.visibilityState === "visible" && tab === "sign" && !app3.querySelector("textarea:focus,input:focus")) void refreshSign(true);
    }, 2e4);
  }
  async function counts() {
    const s = await b.ask("state");
    state = s;
    const c = (id, n) => {
      const x = $(id);
      if (x) x.textContent = n ? String(n) : "";
    };
    c("count-sign", s.counts.toSign);
    c("count-pay", s.counts.toPay);
  }
  async function refreshSign(quiet = false) {
    const box = $("sign-list");
    if (!box) return;
    const looked = await b.ask("look").catch((err) => {
      if (!quiet) fail(err);
      return null;
    });
    const r = await b.ask("to sign");
    const target = $("sign-list");
    if (!target) return;
    const typed = [...target.querySelectorAll("form[data-id] [name]")].filter((x) => x.value).map((x) => ({ form: x.form.dataset.id, name: x.name, value: x.value, focused: document.activeElement === x }));
    target.innerHTML = toSign(r.items, [...r.problems, ...looked?.problems ?? []]);
    for (const t of typed) {
      const x = target.querySelector(`form[data-id="${CSS.escape(t.form ?? "")}"] [name="${CSS.escape(t.name)}"]`);
      if (!x) continue;
      x.value = t.value;
      if (t.focused) x.focus();
    }
    if (looked?.lines.length && !quiet) say2("done", lines(looked.lines));
    await counts();
  }
  async function open(t) {
    tab = t;
    try {
      sessionStorage.setItem("damgar:tab", t);
    } catch {
    }
    for (const x of TABS) {
      const sec = $(x);
      if (sec) sec.hidden = x !== t;
    }
    app3.querySelectorAll(".tabs .tab").forEach((x) => x.classList.toggle("on", x.dataset.tab === t));
    if (t === "sign") await act(() => refreshSign());
    if (t === "account") {
      const a = await act(() => b.ask("account"));
      if (a) $("account-body").innerHTML = account(a);
    }
    if (t === "pay") {
      await act(() => b.ask("look"));
      const p = await act(() => b.ask("pay"));
      if (p) $("pay-list").innerHTML = payList(p.payments);
      await counts();
    }
    if (t === "lanes") {
      const l = await act(() => b.ask("lanes"));
      const units = (state?.accept ?? []).filter((x) => x.key === "bitcoin-units").flatMap((x) => x.hashes.map((h, i) => ({ hash: h, label: ["Bitcoin", "testnet", "signet", "regtest"][i] ?? h.slice(0, 8) })));
      if (l) $("lanes-body").innerHTML = lanes(l, units);
    }
    if (t === "collectives") {
      const r = await act(() => b.ask("collectives"));
      if (r) $("collectives-body").innerHTML = collectives(r);
    }
    if (t === "settings") {
      let r = null;
      let problem = null;
      try {
        r = await b.ask("rails");
      } catch (err) {
        problem = err instanceof Error ? err.message : String(err);
      }
      const l = await b.ask("lanes").catch(() => null);
      state = await b.ask("state").catch(() => state);
      $("settings-body").innerHTML = settings(state, r, problem, l, opened);
    }
  }
  const opened = /* @__PURE__ */ new Set();
  app3.addEventListener(
    "toggle",
    (ev) => {
      const d = ev.target;
      if (!(d instanceof HTMLDetailsElement) || !d.classList.contains("setting")) return;
      if (d.open) opened.add(d.dataset.fold);
      else opened.delete(d.dataset.fold);
    },
    true
  );
  const form2 = (f) => new FormData(f);
  const str = (fd, k) => String(fd.get(k) ?? "");
  app3.addEventListener("click", async (ev) => {
    const el = ev.target.closest("[data-action],[data-tab]");
    if (!el) return;
    if (el.dataset.tab) {
      await open(el.dataset.tab);
      return;
    }
    const a = el.dataset.action;
    const id = el.dataset.id ?? "";
    switch (a) {
      case "collective-promise": {
        const f = el.closest("form.collective-promise");
        if (!f) return;
        const fd = form2(f);
        const r = await act(() => b.ask("collective promise", { collective: f.dataset.collective, to: str(fd, "to"), value: str(fd, "value"), unit: "", whatFor: str(fd, "whatFor"), digest: el.dataset.digest }));
        if (r) {
          await open("collectives");
          done(r);
        }
        return;
      }
      case "window":
        screen = "window";
        await show(await b.ask("state"));
        return;
      case "back":
        screen = "app";
        await show(await b.ask("state"));
        return;
      case "carry": {
        const c = await act(() => b.ask("carry"));
        if (c) app3.innerHTML = carry(c, b.web);
        return;
      }
      case "use":
      case "forget":
      case "leave": {
        if (a === "forget" && !confirm("Forget this identity here? Its keys, its request key and its account go from this app. What it signed stays where it was sent.")) return;
        await act(() => b.ask(a, { id }));
        screen = a === "use" ? "app" : "window";
        await show(await b.ask("state"));
        return;
      }
      case "copy":
        try {
          await navigator.clipboard.writeText(el.dataset.text ?? "");
          el.textContent = "Copied";
        } catch {
          el.textContent = "Select it and copy it";
        }
        return;
      case "look":
        await act(() => refreshSign());
        return;
      case "revoke lane review": {
        const r = await act(() => b.ask("revoke lane review", { grant: el.dataset.grant }));
        const at = app3.querySelector(`[data-revoke="${CSS.escape(el.dataset.grant ?? "")}"]`);
        if (r && at) at.innerHTML = revokeReview(el.dataset.grant ?? "", r.lines);
        return;
      }
      case "revoke lane": {
        const r = await act(() => b.ask("revoke lane", { grant: el.dataset.grant }));
        if (r) {
          await open("lanes");
          done(r);
        }
        return;
      }
      case "own lane": {
        if (!laneAsked) return;
        const r = await act(() => b.ask("own lane", { ...laneAsked, digest: el.dataset.digest }));
        if (r) {
          laneAsked = null;
          await open("lanes");
          done(r);
        }
        return;
      }
      case "link remove": {
        const r = await act(() => b.ask("link", { remove: true }));
        if (r) {
          await open("settings");
          done(r);
        }
        return;
      }
      case "sign draft":
      case "decline":
      case "accept debt":
      case "pay request":
      case "grant lane":
      case "answer address":
      case "sign receipt": {
        const r = await act(() => b.ask(a, a === "sign receipt" ? { key: id } : { id }));
        if (r) {
          await act(() => refreshSign(true));
          done(r);
        }
        return;
      }
      case "refuse invoice": {
        const why = prompt("Why (sent to them, sealed)?", "not expected") ?? "";
        const r = await act(() => b.ask("refuse invoice", { id, why }));
        if (r) {
          await act(() => refreshSign(true));
          done(r);
        }
        return;
      }
      case "recheck": {
        const r = await act(() => b.ask("recheck", { key: el.dataset.key }));
        if (r) {
          await open("pay");
          done(r);
        }
        return;
      }
      case "publish list": {
        const r = await act(() => b.ask("publish list", { on: el.dataset.on === "true" }));
        if (r) {
          state = await b.ask("state");
          await open("settings");
          done(r);
        }
        return;
      }
      case "vault transfer": {
        if (!vaultAsked) return;
        const r = await act(() => b.ask("vault transfer", { ...vaultAsked, digest: el.dataset.digest }));
        if (r) {
          vaultAsked = null;
          await open("pay");
          done(r);
        }
        return;
      }
      case "rails publish": {
        if (!reviewed) return;
        const r = await act(() => b.ask("rails publish", { ...reviewed, digest: el.dataset.digest }));
        if (r) {
          reviewed = null;
          await open("settings");
          done(r);
        }
        return;
      }
    }
  });
  app3.addEventListener("change", async (ev) => {
    const el = ev.target;
    if (el.id !== "manual") return;
    done(await act(() => b.ask("manual", { on: el.checked })));
  });
  app3.addEventListener("submit", async (ev) => {
    const f = ev.target;
    const fid = f.getAttribute("id");
    if (fid === "pair") return;
    ev.preventDefault();
    const fd = form2(f);
    if (fid === "collective-add") {
      const r = await act(() => b.ask("collective add", { id: str(fd, "id") }));
      if (r) {
        await open("collectives");
        done(r);
      }
      return;
    }
    if (f.classList.contains("collective-promise")) {
      const args = { collective: f.dataset.collective, to: str(fd, "to"), value: str(fd, "value"), unit: "", whatFor: str(fd, "whatFor") };
      const r = await act(() => b.ask("collective promise read", args));
      const box = f.querySelector(".promise-read");
      if (r && box) box.innerHTML = promiseRead(r);
      return;
    }
    if (fid === "bring") {
      const r = await act(() => b.ask("bring", { id: str(fd, "id"), words: str(fd, "words"), address: str(fd, "address"), relays: str(fd, "relays") }));
      if (r) {
        screen = "app";
        await show(await b.ask("state"));
        done(r);
      }
    } else if (fid === "renew") {
      const r = await act(() => b.ask("renew", { words: str(fd, "words") }));
      if (r) {
        screen = "app";
        await show(await b.ask("state"));
        done(r);
      }
    } else if (fid === "accept") {
      const keys = [...f.querySelectorAll("input[name=accept]:checked")].map((x) => x.value);
      const r = await act(() => b.ask("accept", { keys, where: state?.stage === "accept" ? "first" : "settings" }));
      if (r) {
        const s = await b.ask("state");
        if (state?.stage === "accept") {
          await show(s);
        } else {
          state = s;
          await open("settings");
        }
        done(r);
      }
    } else if (f.classList.contains("invoice")) {
      const r = await act(() => b.ask("answer invoice", { id: f.dataset.id, invoice: str(fd, "invoice") }));
      if (r) {
        await act(() => refreshSign(true));
        done(r);
      }
    } else if (f.classList.contains("paid")) {
      const r = await act(() => b.ask("paid", { key: f.dataset.key, proof: str(fd, "proof") }));
      if (r) {
        await open("pay");
        done(r);
      }
    } else if (fid === "vault-transfer") {
      const a = { entry: Number(str(fd, "entry") || 0), value: str(fd, "value") };
      const r = await act(() => b.ask("vault transfer read", a));
      if (r) {
        vaultAsked = a;
        $("vault-review").innerHTML = vaultReview(r);
      }
    } else if (f.classList.contains("vault-invoice")) {
      const r = await act(() => b.ask("vault invoice", { key: f.dataset.key, invoice: str(fd, "invoice") }));
      if (r) {
        await open("pay");
        done(r);
      }
    } else if (fid === "rails") {
      const a = { lightning: str(fd, "lightning"), onchain: str(fd, "onchain"), network: Number(str(fd, "network") || 3), newRequestKey: fd.get("newRequestKey") === "on" };
      const r = await act(() => b.ask("rails review", a));
      if (r) {
        reviewed = a;
        $("rails-review").innerHTML = railsReview(r);
      }
    } else if (f.classList.contains("own-lane")) {
      const until = str(fd, "until");
      const a = { role: f.dataset.role, cap: str(fd, "cap"), unit: str(fd, "unit"), until: until ? Math.floor(new Date(until).getTime() / 1e3) : null };
      const r = await act(() => b.ask("own lane review", a));
      if (r) {
        laneAsked = a;
        $("lane-review").innerHTML = laneReview(r);
      }
    } else if (fid === "clock") {
      done(await act(() => b.ask("clock", { clock: str(fd, "clock") })));
    } else if (fid === "link") {
      const r = await act(() => b.ask("link", { rest: str(fd, "rest"), macaroonFile: str(fd, "macaroonFile"), certFile: str(fd, "certFile") }));
      if (r) {
        await open("settings");
        done(r);
      }
    } else if (fid === "relays") {
      const r = await act(() => b.ask("relays", { relays: str(fd, "relays") }));
      if (r) {
        state = await b.ask("state");
        done(r);
      }
    }
  });
  return { show };
}

// src/web/keep.ts
var DB = "damgar";
var STORE = "keep";
var LOCK = "damgar-signing";
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
      for (const k of ["identity", "settings", "keys", "book"]) s.delete(`${k}:${id}`);
    });
  }
  exclusive(f) {
    if (!navigator.locks) return f();
    return navigator.locks.request(LOCK, f);
  }
};

// src/web/app.ts
var app2 = document.getElementById("app");
var damgar;
var ask = (op, a = {}) => run(damgar, op, a);
var ui = mount(app2, { web: true, ask, start });
async function start() {
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    app2.innerHTML = `${top(true)}${note("error", "This page keeps a key in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it.")}`;
    return;
  }
  try {
    damgar ??= new Damgar(await WebKeep.open(), { web: true, chain: null });
  } catch (err) {
    app2.innerHTML = `${top(true)}${note("error", `This browser does not let the page keep anything (${e(err instanceof Error ? err.message : String(err))}).`)}`;
    return;
  }
  try {
    await ui.show(await damgar.state());
  } catch (err) {
    app2.innerHTML = `${top(true)}${note("error", e(err instanceof Error ? err.message : String(err)))}`;
  }
}
void start();
