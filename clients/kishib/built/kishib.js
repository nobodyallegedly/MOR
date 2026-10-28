var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

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
  agreementsForkAlarm(specs, payment, held2) {
    const ptr0 = passStringToWasm0(payment, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(held2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
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
function dealChainKey(input) {
  const ret = wasm.dealChainKey(input);
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
function readTerms(payload, specs) {
  const ptr0 = passArray8ToWasm0(payload, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.readTerms(ptr0, len0, specs);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function rebuildChainKey(shares) {
  const ptr0 = passArrayJsValueToWasm0(shares, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.rebuildChainKey(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function rebuildChainKeyFromPaper(input) {
  const ret = wasm.rebuildChainKeyFromPaper(input);
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
function shareOnPaper(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.shareOnPaper(ptr0, len0);
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
function vaultDeclaration(money_spec, entries) {
  const ptr0 = passStringToWasm0(money_spec, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.vaultDeclaration(ptr0, len0, entries);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function verifyShare(bytes) {
  const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.verifyShare(ptr0, len0);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
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
  const message6 = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes)
    throw new TypeError(message6);
  throw new RangeError(message6);
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

// ../reader/src/web/core.ts
await __wbg_init({ module_or_path: new URL("mor_wasm_bg.wasm", document.baseURI) });

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

// ../../modules/timestamp/src/stamp.ts
var TIMESTAMP_SPEC = sha2562("timestamp clock Module, draft 1, test value until publication");

// ../grants/src/limits.ts
var GRANT_LIMITS_SPEC = sha2562("Grant limits cMIP, draft 1, test value until publication");
var MESSAGES = { specs: [] };

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
var OURS = new Set(ACCEPTABLE.flatMap((a) => a.hashes));

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
var relayAt = (hint, via = {}) => new Relay(hint, via[hint] ?? hint);

// ../genesis/src/lines.ts
var KINDS = ["public", "private", "earlier"];
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
  const held2 = /* @__PURE__ */ new Map();
  for (const a of o.acts) {
    let d;
    try {
      d = describeAct(a);
    } catch {
      continue;
    }
    if (d.signer !== o.identity) continue;
    if (d.spec === specs.identity && (d.type === IDENTITY_TYPES.genesis || d.type === IDENTITY_TYPES.rotation || d.type === IDENTITY_TYPES.chainSignature)) continue;
    held2.set(d.id, d);
  }
  const ownPrev = new Map(owns.flatMap((line) => line.map((id, i) => [id, i ? line[i - 1] : null])));
  const ownPosition = new Map(owns.flatMap((line) => line.map((id, i) => [id, i + 1])));
  const prevOf = (id) => {
    if (ownPrev.has(id)) return { known: true, prev: ownPrev.get(id) };
    const d = held2.get(id);
    if (!d || d.spec === void 0) return { known: false, prev: null };
    return { known: true, prev: d.prev ?? null };
  };
  const named = /* @__PURE__ */ new Set();
  for (const id of [...held2.keys(), ...ownPrev.keys()]) {
    const p = prevOf(id);
    if (p.prev) named.add(p.prev);
  }
  const ownTips = new Set(owns.map((line) => line[line.length - 1]));
  const tips = [...held2.values()].filter((d) => !named.has(d.id) && d.binding === o.binding).map((d) => d.id);
  for (const t of ownTips) if (!tips.includes(t) && !named.has(t)) tips.push(t);
  const out = [];
  for (const tip of tips) {
    const d = held2.get(tip);
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
        why = held2.has(at) ? `it holds a private act made elsewhere (${at.slice(0, 12)}\u2026): only the app that made it can read which act comes before it` : `an act in it (${at.slice(0, 12)}\u2026) was not found at its homes or relays`;
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
  const held2 = o.held ? new Set(o.held) : null;
  const found = (act) => held2 ? held2.has(act) : lines2.some((l) => l.tip === act);
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
function readCards(text2) {
  return text2.split(/[\n;]/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const [act, position, summary, ...rest] = l.split(/[\s:,]+/);
    if (!act || !position || !summary) throw new Error(`\u201C${l}\u201D: a card is a latest act, a position and a summary`);
    const c = { act: act.toLowerCase(), position: Number(position), summary: summary.toLowerCase() };
    const words2 = [];
    for (let i = 0; i < rest.length; i++) {
      const w = rest[i];
      if (/^missing$/i.test(w) && /^\d+$/.test(rest[i + 1] ?? "")) c.missing = Number(rest[++i]);
      else if (words2.length && !c.line && KINDS.includes(w.toLowerCase())) c.line = w.toLowerCase();
      else if (/^\d+$/.test(w) && c.hidden === void 0 && !words2.length) c.hidden = Number(w);
      else if (/^[\p{L}\p{M}’'-]+$/u.test(w)) words2.push(w);
      else throw new Error(`\u201C${l}\u201D: a card is a latest act, a position and a summary, then what its app adds (a count and its name)`);
    }
    if (words2.length) c.app = words2.join(" ");
    return c;
  });
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
async function firstOf(items, ask3, failed) {
  if (!items.length) return null;
  return new Promise((resolve) => {
    let left = items.length;
    let done = false;
    for (const x of items) {
      ask3(x).then(
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
function threePositions(random) {
  const out = /* @__PURE__ */ new Set();
  while (out.size < 3) out.add(1 + random(24));
  return [...out].sort((a, b) => a - b);
}
function typedBack(words2, positions, typed) {
  return positions.length === 3 && typed.length === 3 && positions.every((p, i) => words2[p - 1] === (typed[i] ?? "").trim().toLowerCase());
}

// ../genesis/src/forms.ts
var form = (label, hex2) => formEncode(label, unhex(hex2));
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
  let look;
  try {
    look = await lookUp(id, hints, via);
  } catch (e3) {
    throw new Error(`This identity was not found at ${hints.join(", ")}: ${message(e3)}`);
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
  const e3 = look.verifier.latest(look.resolution.identity, SPECS.envelopes, 4);
  const version = e3.payload ? Number(cborDecode(e3.payload).get(0)) : 1;
  return { version, act: look.encryptionKeyAct, secret: hex(secret) };
}

// src/shapes.ts
function taggedHash(tag, data) {
  const t = unhex(sha2562(tag));
  const all = new Uint8Array(t.length * 2 + data.length);
  all.set(t, 0);
  all.set(t, t.length);
  all.set(data, t.length * 2);
  return sha2562(all);
}
function fingerprint(scheme, key) {
  const d = new Uint8Array(1 + key.length);
  d[0] = scheme;
  d.set(key, 1);
  return grouped2(taggedHash("MOR/module/airgap/fingerprint", d).slice(0, 32));
}
var grouped2 = (h) => h.match(/.{1,4}/g).join(" ");

// src/read.ts
var message2 = (e3) => e3 instanceof Error ? e3.message : String(e3);
function served(id, bytes, identitySpec) {
  let d;
  try {
    d = describeAct(bytes);
  } catch {
    return null;
  }
  if (d.signer !== id || d.spec !== identitySpec || d.type !== IDENTITY_TYPES.rotation || !d.payload) return null;
  const m = cborDecode(d.payload);
  const key = m.get(2);
  const commit = m.get(3);
  const succ = m.get(9);
  const signingKey = hex(key[1]);
  return {
    id: d.id,
    bytes,
    position: Number(m.get(1)),
    previous: hex(m.get(0)),
    signingKey,
    signingFingerprint: fingerprint(1, key[1]),
    reveals: hex(commit[1]),
    homeless: m.get(11) === true,
    successor: succ === void 0 ? void 0 : succ === null ? null : hex(succ[1]),
    kept: m.get(4).length
  };
}
async function readIdentity(id, address2, via, identitySpec) {
  let look;
  try {
    look = await lookUp(id, address2, via);
  } catch (e3) {
    throw new Error(`This identity was not found at ${address2.join(", ")}: ${message2(e3)}`);
  }
  const r = look.resolution;
  if (!r.links.length) throw new Error(`Its chain could not be read at ${address2.join(", ")} (${r.stop}).`);
  const homes = [...new Set([...(r.homesAt ?? []).flat(), ...r.homes].map((h) => h.hint))];
  const routed = look.routes.routes.flatMap((x) => x.hints);
  const places = [.../* @__PURE__ */ new Set([...address2, ...homes, ...routed])];
  const chainActs = /* @__PURE__ */ new Map();
  for (const hint of places) {
    try {
      for (const a of (await relayAt(hint, via).identity(id)).chain) chainActs.set(describeAct(a).id, a);
    } catch {
    }
  }
  const acts = await actsBy(id, places, via);
  for (const a of acts) {
    const s = served(id, a, identitySpec);
    if (s) chainActs.set(s.id, a);
  }
  for (const b of [...chainActs.values(), ...acts]) {
    try {
      look.verifier.add(b);
    } catch {
    }
  }
  look.resolution = look.verifier.resolve(id);
  const r2 = look.resolution;
  const latest = r2.links[r2.links.length - 1];
  const next = [];
  for (const b of chainActs.values()) {
    const s = served(id, b, identitySpec);
    if (s && s.position === latest.position + 1 && s.previous === latest.act) next.push(s);
  }
  const binding = bindingOf(look, chainActs);
  const lines2 = linesOf({ identity: id, binding, own: [], acts });
  return { id, look, chainActs, places, next, lines: lines2, acts, binding };
}
function bindingOf(look, chainActs) {
  const links = look.resolution.links;
  for (let i = links.length - 1; i > 0; i--) {
    const b = chainActs.get(links[i].act);
    const t = b ? describeAct(b).type : IDENTITY_TYPES.rotation;
    if (t !== IDENTITY_TYPES.chainSignature) return links[i].act;
  }
  return links[0].act;
}
function placing(rd, binding) {
  return { held: rd.acts.map((a) => describeAct(a).id), unplaced: unplaced({ identity: rd.id, binding, acts: rd.acts }) };
}
function linesUnder(rd, binding) {
  return linesOf({ identity: rd.id, binding, own: [], acts: rd.acts });
}
function homesWords(homes, effective) {
  const list3 = homes.map((h) => h.operator ? `${h.hint} (operator ${h.operator})` : `${h.hint} (self-hosted: the identity is its own home)`).join("; ");
  const operators = new Set(homes.map((h) => h.operator ?? "own")).size;
  const k = /^Threshold\((\d+)\)$/.exec(effective ?? "")?.[1];
  const rule = !effective ? "" : k ? ` A change of its keys counts once homes of ${k} of its ${operators} operators hold it and sign receipts.` : /Own/.test(effective) ? " It is its own home: a change of its keys counts on its own signatures." : " One home decides: a change of its keys counts once that home signs its receipt.";
  return `Its homes: ${list3}.${rule}`;
}
function kishibLineWords(l) {
  return lineWords(l).replace(/^A line made elsewhere( that this device cannot read)?/, (_, unread) => unread ? "A line Ki\u0161ib cannot read" : "A line of acts");
}
function recordWords(rd) {
  const r = rd.look.resolution;
  const out = [];
  if (r.links[0]) out.push({ heading: "Its ID", lines: [{ text: `${idForm(r.links[0].act)} (in hexadecimal: ${r.links[0].act})` }] });
  out.push({ heading: "Its homes", lines: [{ text: homesWords(r.homes, r.effective) }, ...rd.look.unreachable.length ? [{ text: `Did not answer now: ${rd.look.unreachable.join(", ")}. Silence proves nothing.`, tone: "warn" }] : []] });
  const receipts = receiptsBy(rd.look.receipts);
  const chain = r.links.map((l) => {
    const n = receipts.get(l.act) ?? 0;
    const what = l.position === 0 ? "its genesis" : `a change of its keys (position ${l.position})`;
    const how = l.how === "genesis" ? "" : l.how === "homes" ? `, counting by its homes\u2019 receipts` : l.how === "own signatures" ? ", counting on its own signatures (self-hosted)" : `, counting as ${l.how}`;
    return { text: `${what}: act ${actForm(l.act)}${how}; ${n} receipt${n === 1 ? "" : "s"} held.`, tone: "ok" };
  });
  if (r.stop === "contested") chain.push({ text: `Contested at position ${r.links.length}: two rotations revealing one chain key are served there, and no rule settles them. Until it ends, no change of its keys counts.`, tone: "bad" });
  if (r.stop === "pending" || r.waiting.length) chain.push({ text: `A change of its keys waits for its homes\u2019 receipts: ${r.waiting.join(", ") || "one rotation"}.`, tone: "warn" });
  for (const s of rd.next) {
    const counted = r.links.some((l) => l.act === s.id);
    if (!counted) chain.push({ text: `Served at position ${s.position}, not counting: act ${actForm(s.id)}, installing the signing key ${s.signingFingerprint}${s.homeless ? ", homeless" : ""}.`, tone: r.stop === "contested" ? "bad" : "warn" });
  }
  out.push({ heading: "Its chain and receipts", lines: chain });
  const succ = rd.look.verifier.succession(rd.id);
  if (succ.state !== "none") {
    if (succ.successor && /^[0-9a-f]{64}$/.test(succ.successor)) succ.successor = idForm(succ.successor);
    if (succ.confirmation && /^[0-9a-f]{64}$/.test(succ.confirmation)) succ.confirmation = actForm(succ.confirmation);
    out.push({
      heading: "Its succession",
      lines: [
        succ.state === "confirmed" ? { text: `Declared to ${succ.successor}, and confirmed by it (act ${succ.confirmation}): clients follow it.`, tone: "ok" } : succ.state === "declared" ? { text: `Declared to ${succ.successor}, not yet confirmed by it: shown as declared, followed by nobody until it confirms.`, tone: "warn" } : { text: `Declared to ${succ.successor ?? "another protocol"} (${succ.state}).`, tone: "warn" }
      ]
    });
  }
  out.push({ heading: "Its lines of acts (each app or device keeps one)", lines: rd.lines.length ? rd.lines.map((l) => ({ text: kishibLineWords(l), tone: l.readable ? void 0 : "warn" })) : [{ text: "No everyday act under the key in force was found." }] });
  return out;
}
function receiptsBy(receipts) {
  const out = /* @__PURE__ */ new Map();
  for (const b of receipts) {
    try {
      const d = describeAct(b);
      const m = cborDecode(d.payload);
      const act = hex(m.get(1));
      out.set(act, (out.get(act) ?? 0) + 1);
    } catch {
    }
  }
  return out;
}

// ../dub/src/chainwords.ts
var WORDS_KEY_TAG = "MOR/module/seed-words/key";
var cat = (...xs) => {
  const out = new Uint8Array(xs.reduce((n, x) => n + x.length, 0));
  let at = 0;
  for (const x of xs) {
    out.set(x, at);
    at += x.length;
  }
  return out;
};
function taggedHash2(tag, data) {
  const t = unhex(sha2562(tag));
  return unhex(sha2562(cat(t, t, data)));
}
function keySeeds(seed, scheme, index) {
  if (seed.length !== 32) throw new Error("a chain-key seed is 32 bytes");
  const i = new Uint8Array(8);
  new DataView(i.buffer).setBigUint64(0, index);
  const a = taggedHash2(WORDS_KEY_TAG, cat(seed, Uint8Array.of(scheme), i, Uint8Array.of(0)));
  const b = taggedHash2(WORDS_KEY_TAG, cat(seed, Uint8Array.of(scheme), i, Uint8Array.of(1)));
  return cat(a, b.subarray(0, 16));
}

// src/words.ts
function chainKeyAt(seed, scheme, index) {
  const k = chainKeyFromSeeds(scheme, keySeeds(seed, scheme, BigInt(index)));
  return { ...k, index };
}
function freshSeed() {
  return crypto.getRandomValues(new Uint8Array(32));
}
function spentPaper(seed, acts, latest) {
  let found = null;
  for (const a of acts) {
    if (a.position >= latest) continue;
    const k = chainKeyAt(seed, a.scheme, a.position);
    k.seeds.fill(0);
    if (k.commit === a.commit) found = a.position;
  }
  return found;
}
function seedOf(words2) {
  return fromWords(words2);
}
function indexOf(seed, scheme, commit, upTo) {
  for (let i = 0; i <= upTo; i++) {
    const k = chainKeyAt(seed, scheme, i);
    k.seeds.fill(0);
    if (k.commit === commit) return i;
  }
  return null;
}
function paperOf(number, words2) {
  const x = Number(number.trim());
  if (!Number.isSafeInteger(x) || x < 1 || x > 255) throw new Refused("The share\u2019s number is the whole number written beside its 24 words (1, 2, 3, \u2026)");
  return { x, value: fromWords(words2) };
}
function wipe(...xs) {
  for (const x of xs) x?.fill(0);
}

// src/web/node-fs.ts
var none = (name) => () => {
  throw new Error(`${name}: there are no files in a browser`);
};
var readFileSync = none("readFileSync");
var writeFileSync = none("writeFileSync");
var renameSync = none("renameSync");

// ../genesis/src/kex.ts
var kexLog = { recording: false, entries: [] };
function record(e3) {
  if (kexLog.recording) kexLog.entries.push(e3);
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
var HELD_ELSEWHERE_SAY = "This identity\u2019s signing key is not held by this app: it is signed for by Ki\u0161ib\u2019s runner, and this act cannot be signed that way here. Nothing was signed.";
var AGREEMENTS_RECORD = 17;
var b64 = (b) => base64(b);
var unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
var TestIdentity = class _TestIdentity {
  constructor(f, via = {}) {
    this.f = f;
    this.via = via;
  }
  /** Where this file holds no signing key: who signs for it (the Dubsar runner cMIP). Never saved with the file. */
  signer;
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
    const version = (this.f.routes?.version ?? 0) + 1;
    const payload = routesPayload({ version, previous: this.f.routes?.act, routes });
    const made = await this.everydayNow(SPECS.identity, IDENTITY_TYPES.routes, payload, { public: true });
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
    const version = (last?.version ?? 0) + 1;
    const secret = given ?? newEncryptionSecret();
    const payload = encryptionKeyPayload(version, last?.act, xwingPublic(secret));
    const made = await this.everydayNow(SPECS.envelopes, ENVELOPES_TYPES.encryptionKey, payload, { public: true });
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
  async chainSign(signs2, relays = [], shared) {
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
      signs: signs2
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

// ../genesis/src/private.ts
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

// ../repo/src/proposals.ts
var NEGOTIATION = 18;
var SHARE_MEDIA = "f2f9c2b8a6e0c5c1b4a7d1e3f0a9c8b7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1";
var ONE_TIME_LINE = "One-time key for my share of the chain key: ";
var SIGNED = "Signed.";
var negotiationPayload = (text2, format) => cborEncode(new Map([[0, text2.normalize("NFC")], ...format ? [[1, unhex(format)]] : []]));
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
function readMessage(d) {
  if (d.spec !== REPO_SPECS.agreements || d.type !== NEGOTIATION || !d.payload || !d.signer) return null;
  const m = cborDecode(d.payload);
  const text2 = m.get(0);
  if (typeof text2 !== "string") return null;
  const link = d.objects?.[0];
  const format = m.get(1) instanceof Uint8Array ? hex(m.get(1)) : null;
  return {
    format,
    id: d.id,
    from: d.signer,
    to: d.to ?? [],
    text: text2,
    thread: link ? link[0] : d.id,
    previous: link ? link[1] : null,
    acks: d.acks ?? [],
    refs: (d.refs ?? []).flatMap((r, i) => d.refSigners?.[i] ? [[r, d.refSigners[i]]] : [])
  };
}
function oneTimeKeyOf(text2) {
  const line = text2.split("\n").find((l) => l.startsWith(ONE_TIME_LINE));
  if (!line) return null;
  try {
    const k = Uint8Array.from(atob(line.slice(ONE_TIME_LINE.length).trim()), (c) => c.charCodeAt(0));
    return k.length === 1216 ? k : null;
  } catch {
    return null;
  }
}
async function sealShare(by, share2, oneTime, relays) {
  const l = lockMedia(share2);
  const payload = cborEncode(
    /* @__PURE__ */ new Map([
      [0, unhex(SHARE_MEDIA)],
      [1, unhex(l.workHash)],
      [2, unhex(l.lockedHash)],
      [3, share2.length],
      [4, l.nonce],
      [5, l.key],
      [6, relays]
    ])
  );
  const made = by.signApart(SPECS.envelopes, 0, payload);
  const sealed = sealFor(made.act, made.key, [{ key: oneTime }]);
  const tag = pickupTag(oneTime);
  const left = [];
  for (const hint of relays) {
    try {
      const r = relayAt(hint, by.via);
      await r.putMedia(l.locked);
      await r.putSealed(sealed, [tag]);
      left.push(hint);
    } catch {
    }
  }
  if (!left.length) throw new Error(`No relay took the share (${relays.join(", ")}).`);
  return { sealed: sealedId(sealed), publication: made.id, left };
}

// ../collective/src/explain.ts
var short = (id) => `${id.slice(0, 8)}\u2026${id.slice(-4)}`;
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
var TYPE_NAMES = {
  [SPECS.envelopes]: { 0: "every publication of the collective (a release is one)", 1: "every key delivery of the collective", 4: "every encryption key of the collective" },
  [REPO_SPECS.agreements]: { 0: "every terms act of the collective", 1: "every signature of the collective" },
  [SPECS.text]: { 0: "every text of the collective" }
};
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
    const held2 = (x) => x.holders.length ? `any ${x.threshold} of ${list(x.holders.map(names))}` : "nobody: frozen";
    if (!b && a) out.push({ text: `A new area, \u201C${a.name}\u201D (area ${id}): ${held2(a)}.` });
    else if (b && !a) out.push({ text: `The \u201C${b.name}\u201D area (area ${id}) is dropped.`, tone: "warn" });
    else if (a && b && JSON.stringify(a) !== JSON.stringify(b)) {
      out.push({ text: `The \u201C${a.name}\u201D area (area ${id}) is now decided by ${held2(a)} (was ${held2(b)}).` });
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

// src/common.ts
var message3 = (e3) => e3 instanceof Error ? e3.message : String(e3);
var b642 = (b) => {
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s);
};
var FORGOTTEN_SAY = "What you type here is used for this act alone, then overwritten. Ki\u0161ib writes nothing to this device: close it, and nothing of your words remains.";
var NEW_WORDS_SAY = [
  "These are the new signing key\u2019s words: whoever holds them can sign as this identity and read its private messages. They are not the chain key\u2019s words.",
  "Write them on paper, in order. Carry them to Dub or Edubba, which take them (in Dub: the identity window, \u201Ctake the new words\u201D; in Edubba: the identity\u2019s record).",
  "They are shown once. When you say they are written, they are hidden, three are asked back, and Ki\u0161ib forgets them."
];
var NEW_CHAIN_WORDS_SAY = [
  "These are the new chain key\u2019s words: a new paper, made for this identity now, before anything is signed (Nobody, allegedly, 21 October 2026: \u201Cconfirming the new chain key comes before signing the rotation\u201D). The next change of its keys is made from them, in Ki\u0161ib, and from nothing else.",
  "This paper becomes the one that counts once the homes accept the change. Until then the old paper still works, but only to send this same change again. Once they accept it, the old paper is spent: destroy it then.",
  "If Ki\u0161ib is closed before the change is sent, nothing was signed: the next change starts over with another new paper, and this one is worthless.",
  "Write them on a new paper, in order, and keep it apart from the signing key\u2019s words. Never type them into Dub, Edubba, Damgar or a wallet: only Ki\u0161ib takes them.",
  "They are shown once. When you say they are written, they are hidden, three are asked back, and Ki\u0161ib forgets them; then it signs the change and sends it. The new signing key\u2019s words come once the homes\u2019 receipts are in."
];
function addresses(typed) {
  const out = typed.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  for (const a of out) if (!/^https?:\/\/[^\s]+$/.test(a)) throw new Error(`\u201C${a}\u201D: an address starts with https:// (or http://)`);
  if (!out.length) throw new Error("Give an address where this identity is found: one of its homes.");
  return out;
}
async function put(hint, bytes, before) {
  const r = relayAt(hint, {});
  const once = async () => {
    const res = await r.putAct(bytes);
    return { text: `${hint}: holds it${res.receipt ? ", and signed its receipt" : ""}.`, tone: "ok" };
  };
  try {
    return await once();
  } catch (e3) {
    if (e3 instanceof RelayError && e3.code === CODE.missingPredecessor) {
      try {
        for (const b of before) await r.putAct(b).catch(() => void 0);
        return await once();
      } catch (e22) {
        return { text: `${hint}: ${message3(e22)}`, tone: "warn" };
      }
    }
    return { text: `${hint}: ${message3(e3)}`, tone: "warn" };
  }
}
function holding(id, binding, signingSeed, chain, homes) {
  const f = {
    label: TEST_LABEL,
    identity: id,
    position: 0,
    binding,
    signingSecret: hex(signingSeed),
    safety: { scheme: 0, seeds: "" },
    chain: chain.map(b642),
    homes,
    rule: null,
    sequence: [],
    routes: null,
    encryption: [],
    pending: null
  };
  return new TestIdentity(f, {});
}

// src/collective.ts
var EXPIRY = 60 * 60;
var REQUEST_LABEL = "MOR Ki\u0161ib collective rotation request, version 1";
var CONTRIBUTION_MEDIA = sha2562("Ki\u0161ib: a paper share given to a collective rotation, test value until publication");
var DEALER_SAY = [
  { text: "This device will hold the collective\u2019s whole chain key for a moment: rebuilt from the members\u2019 papers, used once to sign this rotation, then overwritten. It also creates the new chain key and deals its shares, so for that moment it knows the new key whole.", tone: "bad" },
  { text: "If this device were compromised, or the person holding it dishonest, they could keep the new key and later act alone, past the threshold the members agreed. Nothing can prove a device forgot a key (F97). Founding has the same moment, on the founder\u2019s device.", tone: "bad" },
  { text: "So choose the cleanest device available: the app rather than the web page; ideally a device used for nothing else. The air-gapped way (an offline device, the bytes carried by QR code) is the gold standard, and comes later.", tone: "warn" },
  { text: "The practices Ki\u0161ib follows: the key alive only in memory, the rotation signed at once, the new shares dealt, the key overwritten, never written anywhere; the signed bytes kept to send again, not the key; exactly the threshold of papers collected, no more; the waiting one-time key expiring after an hour, shares sealed to it unopenable after; rebuild, rotate and deal in one sitting." },
  { text: "Afterwards: every member writes their new share on new paper and destroys the old one (it opens nothing once the rotation counts); the new signing key\u2019s words go to whoever holds that key (Edubba); every member\u2019s Dub and Edubba show the rotation." }
];
var ROTATION_NOTICE_FORMAT = sha2562("Rotation notice cMIP, draft 1, test value until publication");
var NOTICE_HEAD = "-- Dubsar rotation notice, draft 1 --";
function noticeText(free, n) {
  return [free, NOTICE_HEAD, `collective: ${n.collective}`, `fingerprint: ${n.fingerprint}`, `relays: ${n.relays.join(" ")}`, `expires: ${n.expires}`, `share: ${n.share}`].join("\n");
}
function readNotice(text2) {
  const ls = text2.split("\n");
  const at = ls.lastIndexOf(NOTICE_HEAD);
  if (at < 0 || ls.length - at !== 6) return null;
  const want = ["collective", "fingerprint", "relays", "expires", "share"];
  const v = {};
  for (let i = 0; i < 5; i++) {
    const m = /^([a-z]+): (.+)$/.exec(ls[at + 1 + i]);
    if (!m || m[1] !== want[i]) return null;
    v[m[1]] = m[2];
  }
  const relays = v.relays.split(" ");
  if (!/^[0-9a-f]{64}$/.test(v.collective) || !/^[0-9a-f]{64}$/.test(v.fingerprint)) return null;
  if (!relays.length || relays.length > 8 || relays.some((r) => !/^https?:\/\/\S+$/.test(r))) return null;
  if (!/^\d{1,12}$/.test(v.expires) || !/^\d{1,3}$/.test(v.share)) return null;
  const share2 = Number(v.share);
  if (share2 < 1 || share2 > 255) return null;
  return { collective: v.collective, fingerprint: v.fingerprint, relays, expires: Number(v.expires), share: share2 };
}
async function noticesFor(member, hints, open, now2, via = {}) {
  let inbox = [];
  try {
    inbox = (await lookUp(member, hints, via)).inbox(REPO_SPECS.agreements) ?? [];
  } catch (e3) {
    return { listed: [], problem: `The identity could not be read at ${hints.join(", ")}: ${message4(e3)}` };
  }
  if (!inbox.length) return { listed: [], problem: "This identity declares no inbox: no notice can reach it." };
  const found = [];
  for (const hint of inbox) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(hint, via).feed({ to: member, after });
        const sealed = page.items.filter((it) => it.kind === "sealed").map((it) => it.item);
        const opened2 = sealed.length ? await open(sealed) : [];
        for (const o of opened2) {
          if (!o) continue;
          const m = readMessage(o.described);
          if (!m || m.format !== ROTATION_NOTICE_FORMAT || !m.to.includes(member)) continue;
          const n = readNotice(m.text);
          if (!n || n.expires <= now2 || found.some((x) => x.fingerprint === n.fingerprint)) continue;
          found.push({ ...n, member, from: m.from, message: m.id });
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  const listed = [];
  for (const x of found) {
    try {
      const c = await readCollective(x.collective, x.relays, via);
      if (c.holders.includes(x.from)) listed.push(x);
    } catch {
    }
  }
  return { listed, problem: null };
}
var short2 = (id) => /^[0-9a-f]{64}$/.test(id) ? idForm(id) : id;
var message4 = (e3) => e3 instanceof Error ? e3.message : String(e3);
function encodeRequest(q) {
  return cborEncode(
    /* @__PURE__ */ new Map([
      [0, REQUEST_LABEL],
      [1, unhex(q.collective)],
      [2, unhex(q.previous)],
      [3, q.position],
      [4, q.kept.map(([a, p, s]) => [unhex(a), p, unhex(s)])],
      [5, unhex(q.clone)],
      [6, q.signatures.map(unhex)],
      [7, q.members.map(unhex)],
      [8, q.threshold],
      [9, q.needed],
      [10, q.oneTime],
      [11, q.expires],
      [12, q.relays],
      [13, unhex(q.starter)]
    ])
  );
}
function decodeRequest(b) {
  const m = cborDecode(b);
  if (m.get(0) !== REQUEST_LABEL) throw new Error("This is not a Ki\u0161ib rotation request.");
  const h = (k) => hex(m.get(k));
  return {
    collective: h(1),
    previous: h(2),
    position: Number(m.get(3)),
    kept: m.get(4).map((t) => [hex(t[0]), Number(t[1]), hex(t[2])]),
    clone: h(5),
    signatures: m.get(6).map(hex),
    members: m.get(7).map(hex),
    threshold: Number(m.get(8)),
    needed: Number(m.get(9)),
    oneTime: m.get(10),
    expires: Number(m.get(11)),
    relays: m.get(12),
    starter: h(13)
  };
}
function readFingerprint(typed) {
  const h = typed.replace(/\s+/g, "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(h)) throw new Refused("The rotation\u2019s fingerprint is 64 hexadecimal characters, as the starter\u2019s message gives it (spaces do not matter)");
  return h;
}
var when = (t) => new Date(t * 1e3).toISOString().replace("T", " ").slice(0, 16) + " UTC";
function declaredAgreement(rd) {
  let out = null;
  for (const l of rd.look.resolution.links) {
    const b = rd.chainActs.get(l.act);
    if (!b) continue;
    const d = describeAct(b);
    const m = cborDecode(d.payload);
    const decl = d.type === 0 ? m.get(4) : m.get(8);
    for (const x of decl ?? []) {
      if (hex(x[0]) !== REPO_SPECS.agreements || Number(x[1]) !== FOUNDING_AGREEMENT || x[2] === null) continue;
      out = x[2] instanceof Uint8Array ? hex(x[2]) : hex(x[2][0]);
    }
  }
  return out;
}
async function fetchAct(id, places, via) {
  for (const h of places) {
    try {
      const a = await relayAt(h, via).getAct(id);
      if (a) return a;
    } catch {
    }
  }
  return null;
}
async function readCollective(id, address2, via) {
  const rd = await readIdentity(id, address2, via, SPECS.identity);
  const r = rd.look.resolution;
  const agreement = declaredAgreement(rd);
  if (!agreement) throw new Error(`${short2(id)} declares no agreement: it is not a collective Ki\u0161ib can rotate.`);
  const bytes = await fetchAct(agreement, rd.places, via);
  if (!bytes) throw new Error(`Its agreement (${agreement}) was not found at ${rd.places.join(", ")}.`);
  const agreementPayload = describeAct(bytes).payload;
  const t = readTerms(agreementPayload, AGREEMENTS_SPECS);
  const ck = t.grammar?.chainKey;
  if (!ck || ck.form !== "shares" || !ck.threshold) throw new Error("Its agreement does not split the chain key into members\u2019 shares: Ki\u0161ib rotates only collectives whose key is on their members\u2019 paper.");
  const latest = r.links[r.links.length - 1];
  return { rd, agreement, agreementPayload, holders: ck.members ?? t.parties, threshold: ck.threshold, scheme: r.chainKeyScheme, index: latest.position, commit: r.chainKeyCommit, latest };
}
function signs(a, signer, act) {
  try {
    const d = describeAct(a);
    if (d.signer !== signer || d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.signature || !d.payload) return null;
    const named = cborDecode(d.payload).get(0);
    return named instanceof Uint8Array && hex(named) === act ? d.id : null;
  } catch {
    return null;
  }
}
async function changesOf(c, via) {
  const parties = readTerms(c.agreementPayload, AGREEMENTS_SPECS).parties;
  const out = [];
  const byMember = /* @__PURE__ */ new Map();
  const actsOf = async (m) => {
    if (!byMember.has(m)) byMember.set(m, await actsBy(m, c.rd.places, via));
    return byMember.get(m);
  };
  for (const p of parties) {
    for (const a of await actsOf(p)) {
      let d;
      try {
        d = describeAct(a);
      } catch {
        continue;
      }
      if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.terms || !d.payload) continue;
      let t;
      try {
        t = readTerms(d.payload, AGREEMENTS_SPECS);
      } catch {
        continue;
      }
      if (t.parent !== c.agreement) continue;
      const signers = [.../* @__PURE__ */ new Set([...(t.mark ?? []).flatMap((e3) => e3.signers), ...t.parties])];
      const signatures = {};
      for (const s of signers) {
        for (const a2 of await actsOf(s)) {
          const id = signs(a2, s, d.id);
          if (id) signatures[s] = id;
        }
      }
      out.push({
        clone: d.id,
        payload: d.payload,
        proposer: d.signer,
        members: t.parties,
        threshold: t.grammar?.chainKey.threshold ?? c.threshold,
        holder: t.grammar?.signing.holder ?? t.parties[0],
        signers,
        signatures,
        missing: signers.filter((s) => !signatures[s])
      });
    }
  }
  return out;
}
async function answersOf(founder, secret, clone, signatures, hints, via) {
  let inbox = [];
  try {
    inbox = (await lookUp(founder.id, hints, via)).inbox(REPO_SPECS.agreements) ?? [];
  } catch {
    inbox = [];
  }
  const out = {};
  for (const hint of inbox) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(hint, via).feed({ to: founder.id, after });
        for (const it of page.items) {
          if (it.kind !== "sealed") continue;
          let m = null;
          try {
            m = readMessage(openSealed(it.item, founder.id, secret).described);
          } catch {
            continue;
          }
          if (!m || m.text.split("\n")[0] !== SIGNED) continue;
          const sig = /act ([0-9a-f]{64})/.exec(m.text)?.[1];
          if (!sig || signatures[m.from] !== sig) continue;
          const k = oneTimeKeyOf(m.text);
          out[m.from] = { ...k ? { oneTime: k } : {}, thread: m.thread, previous: m.id };
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
    }
  }
  void clone;
  return out;
}
function contributionBytes(fingerprint2, p) {
  return cborEncode(/* @__PURE__ */ new Map([[0, unhex(fingerprint2)], [1, p.x], [2, p.value]]));
}
var CollectiveSitting = class _CollectiveSitting {
  constructor(deps) {
    this.deps = deps;
  }
  c = null;
  change = null;
  plan = null;
  room = false;
  request = null;
  fingerprint = "";
  oneTime = null;
  papers = [];
  founder = null;
  answers = {};
  stage = "waiting";
  lines = [];
  bytes = null;
  act = null;
  signing = null;
  positions;
  /** New shares to show here once, by holder (the starter's own, and members without a one-time key). */
  toShow = /* @__PURE__ */ new Map();
  sharePositions = /* @__PURE__ */ new Map();
  /** Whether nothing is left to do: the shares shown, the words typed back, or the request expired. */
  over() {
    return this.stage === "expired" || this.stage === "done" && [...this.toShow.values()].every((s) => s.shown);
  }
  view(now2) {
    if (this.stage === "waiting" && this.request && now2 > this.request.expires) this.expire();
    const id = this.c?.rd.id ?? "";
    return {
      kind: "collective",
      id,
      act: this.act,
      stage: this.stage,
      title: this.stage === "waiting" ? `A rotation of ${short2(id)} waits for its members\u2019 shares` : this.stage === "expired" ? "The rotation request expired" : `The rotation of ${short2(id)}`,
      lines: this.lines,
      ...this.request || this.room ? {
        request: {
          fingerprint: grouped2(this.fingerprint.slice(0, 32)),
          full: this.fingerprint,
          have: this.papers.length,
          need: this.c?.threshold ?? 0,
          expires: this.request?.expires ?? 0,
          room: this.room,
          from: this.papers.map((p) => p.from)
        }
      } : {},
      ...this.toShow.size ? { shares: [...this.toShow.entries()].map(([holder, s]) => ({ holder, x: s.x, shown: s.shown })) } : {},
      ...this.positions ? { positions: this.positions } : {}
    };
  }
  expire() {
    wipe(this.oneTime, ...this.papers.map((p) => p.value));
    this.oneTime = null;
    this.papers = [];
    this.stage = "expired";
    this.lines = [{ text: "The hour passed before enough shares were in. The one-time key is destroyed: shares sealed to it can never be opened, by anyone. Nothing was signed. Start again when the members are ready.", tone: "warn" }];
    if (this.founder) this.founder.f.signingSecret = "";
  }
  wipe() {
    wipe(this.oneTime, this.signing, ...this.papers.map((p) => p.value), ...[...this.toShow.values()].map((s) => s.share));
    this.oneTime = null;
    this.signing = null;
    this.papers = [];
    this.toShow.clear();
    if (this.founder) this.founder.f.signingSecret = "";
    this.founder = null;
  }
  // ---------------------------------------------------------------- the starter
  /** The starter's review: the change, its signatures, the lines kept, and F337's plain words, before anything is done. */
  async start(a) {
    const via = a.via ?? {};
    const id = readId(a.collective);
    this.room = !!a.room;
    const own = paperOf(a.number, a.shareWords);
    let founderSeed = null;
    try {
      const c = await readCollective(id, addresses(a.address), via);
      this.c = c;
      const r = c.rd.look.resolution;
      const blocking = [];
      if (r.stop === "contested") blocking.push("Its homes hold two rotations at one position (contested): no rotation can count until that ends.");
      if (c.rd.next.some((s) => !r.links.some((l) => l.act === s.id))) blocking.push("A rotation of this collective already waits for its homes: send that one again; Ki\u0161ib never signs a second with the same key.");
      const changes = (await changesOf(c, via)).sort((x, y) => x.missing.length - y.missing.length);
      if (!changes.length) throw new Error("No member change is proposed under the agreement in force: propose one in Edubba (the collective\u2019s page, \u201CChange its members\u201D), have every member sign it, then come back.");
      const ch = changes[0];
      this.change = ch;
      if (ch.missing.length) blocking.push(`The member change ${actForm(ch.clone)} is not signed by everyone it needs yet: waiting for ${ch.missing.map(short2).join(", ")}.`);
      if (changes.filter((x) => !x.missing.length).length > 1) blocking.push("Several member changes are fully signed under the same agreement: Ki\u0161ib cannot tell which one the members mean. Say which in Edubba.");
      this.plan = planLines(c.rd.lines, { leaveOut: a.leaveOut });
      const names = (m) => m === id ? "the collective" : short2(m);
      const shown = [];
      if (!this.room) {
        if (!a.founder?.trim() || !a.founderWords?.trim()) throw new Refused("Remote, the member who proposed the change gives their signing key\u2019s words: only they open the members\u2019 answers, with the one-time keys for their new shares. In the same room, tick \u201CEveryone is here\u201D.");
        const founder = readId(a.founder);
        if (founder !== ch.proposer) throw new Error(`The change was proposed by ${short2(ch.proposer)}: that member starts the rotation, since the members\u2019 answers, with their one-time keys, are in their inbox.`);
        founderSeed = seedOf(a.founderWords);
        const look = await lookCurrent(founder, founderSeed, c.rd.places, via);
        const enc = carriedKey(look, founderSeed);
        if (!enc) throw new Error("These words do not carry the encryption key this identity uses now, so the members\u2019 answers cannot be opened here. Rotate in the same room instead (every new share shown on this screen).");
        const chain = await servedChain(founder, look.resolution.homes, via);
        const f = holding(founder, look.resolution.links[look.resolution.links.length - 1].act, founderSeed, chain, look.resolution.homes);
        this.founder = f;
        const secret = unhex(enc.secret);
        this.answers = await answersOf(f, secret, ch.clone, ch.signatures, [...c.rd.places, ...look.resolution.homes.map((h) => h.hint)], via);
        wipe(secret);
        for (const m of ch.members) {
          if (m === founder) shown.push({ text: `${names(m)} (you, the starter): your new share is shown on this screen, once.` });
          else shown.push(this.answers[m]?.oneTime ? { text: `${names(m)}: sealed to the one-time key its Dub made when it signed, as at the founding.`, tone: "ok" } : { text: `${names(m)}: no one-time key found in its answer: its new share is shown on this screen, once, to hand over in person.`, tone: "warn" });
        }
        const others = c.holders.filter((h) => h !== founder);
        for (const h of others) if (!this.answers[h]) blocking.push(`No answer from ${short2(h)} was found in your inbox: Ki\u0161ib cannot tell it the rotation waits. Have it sign the change in Dub first.`);
      } else {
        for (const m of ch.members) shown.push({ text: `${names(m)}: its new share is shown on this screen, once, to write down here.` });
      }
      this.papers = [{ ...own, from: this.room ? "typed here" : this.founder?.id ?? "" }];
      this.oneTime = this.room ? null : newEncryptionSecret();
      const relays = [...new Set(c.rd.places)];
      this.request = this.room ? null : {
        collective: id,
        previous: c.latest.act,
        position: c.latest.position + 1,
        kept: this.plan.kept.map((k) => [k.act, k.position, k.summary]),
        clone: ch.clone,
        signatures: ch.signers.map((s) => ch.signatures[s]).filter(Boolean),
        members: ch.members,
        threshold: ch.threshold,
        needed: c.threshold,
        oneTime: xwingPublic(this.oneTime),
        expires: this.deps.now() + EXPIRY,
        relays,
        starter: this.founder.id
      };
      this.fingerprint = this.request ? sha2562(encodeRequest(this.request)) : sha2562(cborEncode(["room", id, c.latest.act, ch.clone]));
      const sections2 = [
        { heading: "Before you start: what this device will hold (F337)", lines: DEALER_SAY },
        ...recordWords(c.rd).filter((s) => !s.heading.startsWith("Its lines")),
        { heading: "The member change it completes", lines: [{ text: `Clone ${actForm(ch.clone)}, proposed by ${short2(ch.proposer)}.` }, ...readChanges(c.agreementPayload, ch.payload, names), { text: `Signed by ${Object.keys(ch.signatures).length} of the ${ch.signers.length} it needs: ${ch.signers.map((s) => `${short2(s)} ${ch.signatures[s] ? "\u2713" : "(not yet)"}`).join(", ")}.`, tone: ch.missing.length ? "warn" : "ok" }] },
        { heading: "The papers", lines: [{ text: `Exactly ${c.threshold} of the ${c.holders.length} members\u2019 paper shares rebuild the chain key (its agreement\u2019s rule); no more are collected.` }, { text: `Yours: share ${own.x}.` }, this.room ? { text: "In the same room: the others type theirs into this Ki\u0161ib, one after another. Nothing is sent." } : { text: `Remote: each other member gives theirs in their own Ki\u0161ib, sealed to a one-time key made here, within an hour (until ${when(this.request.expires)} by this device\u2019s clock; MOR has no clock).` }] },
        { heading: "Its lines of acts: what the rotation keeps (Identity rule 35)", lines: this.plan.shown.map((x) => ({ text: x.text.replace(/^A line made elsewhere( that this device cannot read)?/, (_m, u2) => u2 ? "A line Ki\u0161ib cannot read" : "A line of acts"), tone: x.tone })) },
        { heading: "The new shares", lines: [{ text: `A new chain key, created here at the moment of signing, dealt to ${ch.members.length} members, any ${ch.threshold} rebuilding it.` }, ...shown] }
      ];
      const signs2 = [
        `Ki\u0161ib signs one rotation of the collective ${short2(id)}, with its chain key rebuilt here from exactly ${c.threshold} paper shares, then overwritten.`,
        `The rotation declares the member change (clone ${actForm(ch.clone)}) with its ${ch.signers.length} signatures, keeps the collective\u2019s lines, installs a new signing key (its words shown once, for ${short2(ch.holder)}, who holds it) and commits a new chain key.`,
        this.room ? "Nothing is signed with anyone\u2019s signing key." : `As ${short2(this.founder.id)}: one message in each member\u2019s thread announcing the rotation, and, after it, each new share sealed to its member\u2019s one-time key, as at the founding. These acts start a new line of your acts; your next change of keys keeps it if it names it.`
      ];
      const s0 = founderSeed;
      founderSeed = null;
      wipe(s0);
      return {
        digest: sha2562(cborEncode(["MOR Ki\u0161ib collective rotation, version 1", this.fingerprint, this.room])),
        title: `Rotate the collective ${short2(id)}`,
        summary: [`Collective ${id}. Fingerprint of this rotation: ${grouped2(this.fingerprint.slice(0, 32))}.`, FORGOTTEN_SAY],
        sections: sections2,
        signs: signs2,
        warning: this.plan.warning,
        blocking
      };
    } catch (e3) {
      wipe(founderSeed, own.value, this.oneTime);
      throw e3;
    }
  }
  /** On confirmation: the request left at the collective's relays, and a message in each member's thread (remote); or the papers awaited here (same room). */
  async announce() {
    const c = this.c;
    if (this.room) {
      this.lines = [{ text: `Share ${this.papers[0].x} is in. ${c.threshold - 1} more to type here, one after another.` }];
      return;
    }
    const q = this.request;
    const blob = encodeRequest(q);
    const left = [];
    for (const hint of q.relays) {
      try {
        await relayAt(hint, {}).putMedia(blob);
        left.push(hint);
      } catch {
      }
    }
    if (!left.length) throw new Error(`No relay took the rotation request (${q.relays.join(", ")}). Nothing was signed.`);
    const f = this.founder;
    const lines2 = [{ text: `The request is at ${left.join(", ")}. Fingerprint: ${this.fingerprint}.`, tone: "ok" }];
    for (const m of c.holders) {
      if (m === f.id) continue;
      const a = this.answers[m];
      if (!a) continue;
      try {
        const look = await lookUp(m, c.rd.places, {});
        const inbox = look.inbox(REPO_SPECS.agreements) ?? [];
        if (!look.encryptionKey || !inbox.length) throw new Error("it declares no inbox or encryption key");
        await negotiate(f, { id: m, key: look.encryptionKey, inbox }, {
          thread: a.thread,
          previous: a.previous,
          acks: [a.previous],
          // H97: the free text, as before, then the rotation notice cMIP's structured part, which the member's Kišib reads to fill in Waiting for you.
          text: noticeText(
            [
              `A rotation of the collective ${c.rd.id} waits for your paper share, in Ki\u0161ib.`,
              `Fingerprint: ${this.fingerprint}`,
              `Open Ki\u0161ib, Collectives, \u201CWaiting for you\u201D: it is listed there, filled in, or give the collective and this fingerprint. Ki\u0161ib shows the rotation in plain words before you type anything.`,
              `It expires at ${when(q.expires)}.`
            ].join("\n"),
            { collective: c.rd.id, fingerprint: this.fingerprint, relays: q.relays.filter((r) => /^https?:\/\//.test(r)).slice(0, 8), expires: q.expires, share: c.holders.indexOf(m) + 1 }
          ),
          format: ROTATION_NOTICE_FORMAT,
          // Kišib makes no line an app continues: its acts stay off the starter's homes (README, cost of point 7).
          home: false
        });
        lines2.push({ text: `${short2(m)}: told, in its thread.`, tone: "ok" });
      } catch (e3) {
        lines2.push({ text: `${short2(m)}: could not be told (${message4(e3)}). Give it the fingerprint another way.`, tone: "warn" });
      }
    }
    this.lines = lines2;
  }
  /** In the same room: one more paper. Exactly the threshold, no more. */
  async paper(a) {
    if (this.stage !== "waiting") throw new Error("No rotation waits for papers here.");
    if (!this.room) throw new Error("Remote, each member gives their share in their own Ki\u0161ib.");
    const p = paperOf(a.number, a.words);
    if (this.papers.some((x) => x.x === p.x)) {
      wipe(p.value);
      throw new Error(`Share ${p.x} is already typed in.`);
    }
    if (this.papers.length >= this.c.threshold) {
      wipe(p.value);
      throw new Error("Enough shares are in: no more are taken.");
    }
    this.papers.push({ ...p, from: "typed here" });
    this.lines = [{ text: `${this.papers.length} of ${this.c.threshold} shares are in.`, tone: this.papers.length >= this.c.threshold ? "ok" : void 0 }];
  }
  /** Look for members' shares sealed to the one-time key, until exactly the threshold is in. */
  async gather() {
    if (this.stage !== "waiting" || this.room) return;
    const q = this.request;
    if (this.deps.now() > q.expires) {
      this.expire();
      return;
    }
    const c = this.c;
    const tag = pickupTag(q.oneTime);
    const said2 = [];
    for (const hint of q.relays) {
      let items = [];
      try {
        items = (await relayAt(hint, {}).feed({ pickup: tag })).items;
      } catch {
        continue;
      }
      for (const it of items) {
        if (this.papers.length >= c.threshold) break;
        if (it.kind !== "sealed") continue;
        let o;
        try {
          o = openSealed(it.item, void 0, this.oneTime);
        } catch {
          continue;
        }
        const d = o.described;
        if (d.spec !== SPECS.envelopes || d.type !== 0 || !d.payload || !d.signer) continue;
        const m = cborDecode(d.payload);
        if (hex(m.get(0)) !== CONTRIBUTION_MEDIA) continue;
        let locked = null;
        for (const h of q.relays) {
          locked = await relayAt(h, {}).getMedia(hex(m.get(2))).catch(() => null);
          if (locked) break;
        }
        if (!locked) continue;
        const inner = openMedia(locked, m.get(5), m.get(4));
        if (workHash(inner) !== hex(m.get(1))) continue;
        const g = cborDecode(inner);
        if (hex(g.get(0)) !== this.fingerprint) continue;
        const x = Number(g.get(1));
        const value = g.get(2);
        if (this.papers.some((p) => p.x === x)) continue;
        if (!c.holders.includes(d.signer)) {
          said2.push({ text: `A share from ${short2(d.signer)}, who holds no share of this collective: not taken.`, tone: "warn" });
          continue;
        }
        if (this.papers.some((p) => p.from === d.signer)) continue;
        this.papers.push({ x, value, from: d.signer });
        said2.push({ text: `Share ${x} from ${short2(d.signer)}${c.holders[x - 1] !== d.signer ? ` (numbered for ${short2(c.holders[x - 1] ?? "?")}: taken; the rebuild check decides)` : ""}.`, tone: "ok" });
      }
    }
    this.lines = [...this.lines.filter((l) => !/ shares are in\.$/.test(l.text)), ...said2, { text: `${this.papers.length} of ${c.threshold} shares are in.`, tone: this.papers.length >= c.threshold ? "ok" : void 0 }];
  }
  /** Rebuild, rotate and deal, in one sitting (F337). */
  async rotate() {
    const c = this.c;
    const ch = this.change;
    if (this.stage === "waiting" && this.request && this.deps.now() > this.request.expires) this.expire();
    if (this.stage !== "waiting") throw new Error("No rotation waits here.");
    if (this.papers.length !== c.threshold) throw new Error(`${this.papers.length} of ${c.threshold} shares are in: exactly ${c.threshold} are needed.`);
    checkWarned(this.plan, this.plan.warning ?? void 0);
    let rebuilt;
    try {
      rebuilt = rebuildChainKeyFromPaper({ seedModule: "words", scheme: c.scheme, index: c.index, commit: c.commit, papers: this.papers.map((p) => ({ x: p.x, value: p.value })) });
    } catch {
      wipe(...this.papers.map((p) => p.value));
      this.papers = this.room ? [] : [];
      this.lines = [{ text: "These papers do not rebuild the collective\u2019s chain key: one is copied wrong, or belongs to another dealing. Which one cannot be told. Nothing was signed; the papers are forgotten. Type them again (in the same room) or start again.", tone: "bad" }];
      if (!this.room) this.expire();
      return;
    }
    wipe(...this.papers.map((p) => p.value));
    const dealt = dealChainKey({ seedModule: "words", scheme: c.scheme, index: c.index + 1, threshold: ch.threshold, holders: ch.members.map((m) => ({ role: 0, identity: m })) });
    for (const s of dealt.shares) if (verifyShare(s).fingerprint !== dealt.fingerprint) throw new Error("A new share does not lie on its dealing: nothing was signed.");
    const check = rebuildChainKey(dealt.shares.slice(0, ch.threshold));
    if (check.commit !== dealt.commit) throw new Error("The new shares do not rebuild the new key: nothing was signed.");
    const signing = newSigningSecret();
    let bytes;
    try {
      bytes = makeRotation({
        identitySpec: SPECS.identity,
        identity: c.rd.id,
        previous: c.latest.act,
        position: c.latest.position + 1,
        chainKeyScheme: rebuilt.scheme,
        chainKeySeeds: rebuilt.seeds,
        newSigningPublic: signingPublic(signing),
        nextChainKeyScheme: dealt.scheme,
        nextChainKeyCommit: dealt.commit,
        kept: this.plan.kept,
        declarations: [{ spec: REPO_SPECS.agreements, kind: FOUNDING_AGREEMENT, value: ch.clone, signatures: ch.signers.map((s) => ch.signatures[s]) }]
      });
    } finally {
      wipe(rebuilt.seeds);
    }
    this.papers = [];
    wipe(this.oneTime);
    this.oneTime = null;
    this.bytes = bytes;
    this.act = actId(bytes);
    this.signing = signing;
    const lines2 = [{ text: `Signed: rotation ${this.act}. The chain key is overwritten; the papers are forgotten; the one-time key is destroyed.`, tone: "ok" }];
    const chain = orderedChain(c.rd);
    for (const h of c.rd.look.resolution.homes) lines2.push(await put(h.hint, bytes, chain));
    const relays = [.../* @__PURE__ */ new Set([...c.rd.places, ...this.founder ? this.founder.f.homes.map((h) => h.hint) : []])];
    dealt.shares.forEach((s, i) => void i);
    for (let i = 0; i < ch.members.length; i++) {
      const m = ch.members[i];
      const share2 = dealt.shares[i];
      const k = this.answers[m]?.oneTime;
      if (!this.room && this.founder && m !== this.founder.id && k) {
        try {
          const r = await sealShare(this.founder, share2, k, relays);
          lines2.push({ text: `${short2(m)}: its new share is sealed to its one-time key, at ${r.left.join(", ")}. Its Dub shows it once.`, tone: "ok" });
          wipe(share2);
          continue;
        } catch (e3) {
          lines2.push({ text: `${short2(m)}: its share could not be left (${message4(e3)}): shown here instead.`, tone: "warn" });
        }
      }
      this.toShow.set(m, { share: share2, x: i + 1, shown: false, fingerprint: dealt.fingerprint });
    }
    if (this.founder) this.founder.f.signingSecret = "";
    this.founder = null;
    lines2.push({ text: `The new dealing\u2019s fingerprint, for every member to compare: ${grouped2(dealt.fingerprint.slice(0, 32))}.` });
    lines2.push({ text: "Keep Ki\u0161ib open until the new shares and the collective\u2019s new words are shown. Closed now, what is not yet shown is lost (the shares sealed to members\u2019 Dubs are safe): the collective must then be rotated again, from enough of the new papers that reached their members.", tone: "warn" });
    this.lines = lines2;
    this.stage = "sent";
    await this.refresh();
  }
  async resend() {
    if (!this.bytes || this.stage !== "sent") throw new Error("Nothing is waiting to be sent again.");
    const c = this.c;
    const chain = orderedChain(c.rd);
    const lines2 = [];
    for (const h of c.rd.look.resolution.homes) lines2.push(await put(h.hint, this.bytes, chain));
    this.lines = [...this.lines.filter((l) => !/^It (counts|does not count)/.test(l.text) && !c.rd.look.resolution.homes.some((h) => l.text.startsWith(`${h.hint}:`))), ...lines2];
    await this.refresh();
  }
  async refresh() {
    if (!this.act || this.stage !== "sent") return;
    const c = this.c;
    let counts = false;
    try {
      const l = await lookUp(c.rd.id, c.rd.places, {});
      counts = l.resolution.links.some((x) => x.act === this.act);
    } catch {
      counts = false;
    }
    this.lines = [...this.lines.filter((l) => !/^It (counts|does not count)/.test(l.text)), counts ? { text: "It counts: the homes\u2019 receipts are in. The member change is in force.", tone: "ok" } : { text: "It does not count yet: send it again (the same bytes).", tone: "warn" }];
    if (counts) this.stage = "counts";
  }
  showWords() {
    if (!this.signing) throw new Error("No new signing key is held here.");
    if (this.stage === "sent" || this.stage === "waiting") throw new Error("Not yet: the collective\u2019s new words are shown once the homes\u2019 receipts are in.");
    this.stage = "counts";
    this.positions = void 0;
    return { words: toWords(this.signing), holder: this.change.holder, say: [`These are the collective\u2019s new signing key\u2019s words, for ${short2(this.change.holder)}, who holds that key under the agreement: carry them to Edubba (the collective\u2019s page, \u201Ctake the new words\u201D).`, ...NEW_WORDS_SAY.slice(1)] };
  }
  written() {
    if (!this.signing || this.stage !== "counts") throw new Error("No words are shown.");
    this.positions = threePositions((n) => crypto.getRandomValues(new Uint8Array(1))[0] % n);
    this.stage = "shown";
  }
  typed(t) {
    if (!this.signing || this.stage !== "shown" || !this.positions) throw new Error("No words are asked back.");
    if (!typedBack(toWords(this.signing), this.positions, t)) throw new Error("Not the words asked for. Check the paper: they are shown again with \u201CShow them again\u201D.");
    wipe(this.signing);
    this.signing = null;
    this.bytes = null;
    this.positions = void 0;
    this.stage = "done";
    this.lines = [...this.lines, { text: "The collective\u2019s new signing key is forgotten here.", tone: "ok" }];
  }
  shareShow(holder) {
    const s = this.toShow.get(holder);
    if (!s || s.shown) throw new Error("No share for this member waits to be shown here.");
    const p = shareOnPaper(s.share);
    return {
      x: p.x,
      words: toWords(p.value),
      fingerprint: grouped2(s.fingerprint.slice(0, 32)),
      say: [`The new share ${p.x} of the collective\u2019s chain key, for ${short2(holder)}. Write its number and its 24 words on new paper, labelled with the collective, and destroy the old paper.`, "It is shown once: when you say it is written, it is forgotten here."]
    };
  }
  shareWritten(holder) {
    const s = this.toShow.get(holder);
    if (!s || s.shown) throw new Error("No share for this member waits here.");
    wipe(s.share);
    s.shown = true;
  }
  // ---------------------------------------------------------------- a member
  /** A member reads a waiting rotation in plain words, by the collective and the fingerprint. */
  static async readRequest(a, now2) {
    const via = a.via ?? {};
    const id = readId(a.collective);
    const fp = readFingerprint(a.fingerprint);
    const c = await readCollective(id, addresses(a.address), via);
    let blob = null;
    for (const h of c.rd.places) {
      blob = await relayAt(h, via).getMedia(fp).catch(() => null);
      if (blob) break;
    }
    if (!blob) throw new Error(`No rotation request with this fingerprint was found at ${c.rd.places.join(", ")}. Check the fingerprint, or ask the starter.`);
    if (sha2562(blob) !== fp) throw new Error("The request found does not match this fingerprint: nothing is read from it, and nothing is signed.");
    const q = decodeRequest(blob);
    if (q.collective !== id) throw new Error("This request is for another collective.");
    if (now2 > q.expires) throw new Error(`This request expired at ${when(q.expires)}: its one-time key is destroyed. Ask the starter to begin again.`);
    if (q.previous !== c.latest.act) throw new Error("The collective\u2019s keys changed since this request was made: it is stale, and its rotation could never count.");
    const change = (await changesOf(c, via)).find((x) => x.clone === q.clone) ?? null;
    const names = (m) => m === id ? "the collective" : short2(m);
    const sections2 = [
      { heading: "The rotation you are asked to give your share to", lines: [{ text: `Collective ${id}, its keys changed at position ${q.position}, started by ${short2(q.starter)}.` }, { text: `Fingerprint: ${fp}. Compare it with the starter\u2019s message, character by character.`, tone: "warn" }, { text: `It expires at ${when(q.expires)} (this device\u2019s clock).` }] },
      { heading: "The member change it completes", lines: change ? [{ text: `Clone ${actForm(q.clone)}.` }, ...readChanges(c.agreementPayload, change.payload, names), { text: `It declares ${q.signatures.length} signatures.` }] : [{ text: `Clone ${actForm(q.clone)}, not found here: Ki\u0161ib cannot read it back to you. Do not give your share unless you know it.`, tone: "bad" }] },
      { heading: "What it keeps and creates", lines: [{ text: `It keeps ${q.kept.length} line${q.kept.length === 1 ? "" : "s"} of the collective\u2019s acts.` }, { text: `A new chain key, created on the starter\u2019s device and dealt to ${q.members.length} members (${q.members.map(short2).join(", ")}), any ${q.threshold} rebuilding it; ${q.needed} of the current papers rebuild the old one.` }] },
      { heading: "What the starter\u2019s device will hold (F337)", lines: DEALER_SAY.slice(0, 2) }
    ];
    return { q, c, sections: sections2, change };
  }
  /** Given everything: the member's review, and what runs once confirmed (the share sealed to the one-time key, signed by the member). */
  static async give(deps, a, done) {
    const via = a.via ?? {};
    const paper = paperOf(a.number, a.shareWords);
    let seed = null;
    try {
      const { q, c, sections: sections2 } = await _CollectiveSitting.readRequest(a, deps.now());
      const member = readId(a.member);
      if (!c.holders.includes(member)) throw new Error(`${short2(member)} holds no share of this collective\u2019s chain key now.`);
      if (c.holders[paper.x - 1] && c.holders[paper.x - 1] !== member) sections2.push({ heading: "Your paper", lines: [{ text: `Share ${paper.x} was dealt to ${short2(c.holders[paper.x - 1])}, not to you: check the paper. If it is yours, give it; the rebuild decides.`, tone: "warn" }] });
      seed = seedOf(a.memberWords);
      const look = await lookCurrent(member, seed, [.../* @__PURE__ */ new Set([...addresses(a.address), ...c.rd.places])], via);
      const fp = sha2562(encodeRequest(q));
      const s0 = seed;
      seed = null;
      return {
        review: {
          digest: sha2562(cborEncode(["MOR Ki\u0161ib share given, version 1", fp, member, paper.x])),
          title: `Give share ${paper.x} to the rotation of ${short2(c.rd.id)}`,
          summary: [FORGOTTEN_SAY],
          sections: sections2,
          signs: [`You sign, as ${short2(member)}, one private act carrying your share ${paper.x} and this rotation\u2019s fingerprint, sealed to the starter\u2019s one-time key: only the starter\u2019s Ki\u0161ib can open it, and only within the hour.`, "It starts a new line of your acts; nobody else can read it, and it voids nothing if your next change of keys leaves it out."],
          warning: null,
          blocking: []
        },
        wipe: () => wipe(s0, paper.value),
        run: async () => {
          if (deps.now() > q.expires) throw new Error("The request expired: nothing was sent.");
          const r = look.resolution;
          const chain = await servedChain(member, r.homes, via);
          const me = holding(member, r.links[r.links.length - 1].act, s0, chain, r.homes);
          const inner = contributionBytes(fp, paper);
          wipe(paper.value, s0);
          const l = lockMedia(inner);
          wipe(inner);
          const payload = cborEncode(/* @__PURE__ */ new Map([[0, unhex(CONTRIBUTION_MEDIA)], [1, unhex(l.workHash)], [2, unhex(l.lockedHash)], [3, inner.length], [4, l.nonce], [5, l.key], [6, q.relays]]));
          const made = me.sign(SPECS.envelopes, 0, payload, { public: false });
          me.f.signingSecret = "";
          const sealed = sealFor(made.act, made.key, [{ key: q.oneTime }]);
          const tag = pickupTag(q.oneTime);
          const left = [];
          for (const hint of q.relays) {
            try {
              const rr = relayAt(hint, via);
              await rr.putMedia(l.locked);
              await rr.putSealed(sealed, [tag]);
              left.push(hint);
            } catch {
            }
          }
          if (!left.length) throw new Error(`No relay took your share (${q.relays.join(", ")}).`);
          done({
            title: `Share ${paper.x} is given`,
            lines: [
              { text: `Sealed to the starter\u2019s one-time key and left at ${left.join(", ")}. Only the starter\u2019s Ki\u0161ib can open it, until ${when(q.expires)}.`, tone: "ok" },
              { text: "Your paper share and your signing words are forgotten here. Keep your paper until the rotation counts: then your new share arrives in Dub (or is handed to you), and the old paper opens nothing." }
            ]
          });
        }
      };
    } catch (e3) {
      wipe(seed, paper.value);
      throw e3;
    }
  }
};
function orderedChain(rd) {
  return rd.look.resolution.links.map((l) => rd.chainActs.get(l.act)).filter(Boolean);
}
async function checkShare(a) {
  const papers = a.papers.filter((p) => p.number.trim() || p.words.trim()).map((p) => paperOf(p.number, p.words));
  if (!papers.length) throw new Error("Give a share: its number and its 24 words.");
  try {
    const c = await readCollective(readId(a.collective), addresses(a.address), a.via);
    const lines2 = [{ text: `The words of ${papers.length === 1 ? "this share are" : "these shares are"} written right: their checksum holds.`, tone: "ok" }];
    for (const p of papers) {
      if (p.x > c.holders.length) {
        lines2.push({ text: `Share ${p.x}: this collective deals ${c.holders.length} shares, so there is no share ${p.x}. Copied wrong, or another collective\u2019s.`, tone: "bad" });
        continue;
      }
      lines2.push({ text: `Share ${p.x} of ${c.holders.length}, held by ${short2(c.holders[p.x - 1])} by the agreement in force; any ${c.threshold} shares rebuild its chain key.` });
    }
    const xs = new Set(papers.map((p) => p.x));
    if (xs.size !== papers.length) throw new Error("Two of these papers carry the same number: each share once.");
    if (papers.length >= c.threshold) {
      try {
        const rebuilt = rebuildChainKeyFromPaper({ seedModule: "words", scheme: c.scheme, index: c.index, commit: c.commit, papers: papers.slice(0, c.threshold).map((p) => ({ x: p.x, value: p.value })) });
        wipe(rebuilt.seeds);
        lines2.push({ text: `These ${c.threshold} papers rebuild the chain key the collective\u2019s chain commits to now (key ${c.index}): right, and current. The key was overwritten at once; nothing was signed.`, tone: "ok" });
      } catch {
        lines2.push({ text: `These ${c.threshold} papers do not rebuild the chain key the collective\u2019s chain commits to now: one is copied wrong, or of an earlier dealing (a rotation since dealt new shares). Which one cannot be told. Nothing was signed.`, tone: "bad" });
      }
    } else {
      lines2.push({ text: `One paper alone cannot be checked against the key: its blinding is not on paper, so only ${c.threshold} papers together say whether they rebuild it. Give ${c.threshold - papers.length} more here, in the same room, to check them (nothing is signed).`, tone: "warn" });
    }
    return { title: "A paper share, checked", lines: lines2 };
  } finally {
    wipe(...papers.map((p) => p.value));
  }
}

// airgap/pkg/kishib_airgap.js
var kishib_airgap_exports = {};
__export(kishib_airgap_exports, {
  acceptAnswer: () => acceptAnswer,
  default: () => __wbg_init2,
  initSync: () => initSync,
  pendingFor: () => pendingFor,
  readCommitment: () => readCommitment2,
  signingFingerprint: () => signingFingerprint
});
function acceptAnswer(identity_spec, pending, signed) {
  const ptr0 = passArray8ToWasm02(identity_spec, wasm2.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN2;
  const ptr1 = passArray8ToWasm02(pending, wasm2.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN2;
  const ptr2 = passArray8ToWasm02(signed, wasm2.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN2;
  const ret = wasm2.acceptAnswer(ptr0, len0, ptr1, len1, ptr2, len2);
  if (ret[3]) {
    throw takeFromExternrefTable02(ret[2]);
  }
  var v4 = getArrayU8FromWasm02(ret[0], ret[1]).slice();
  wasm2.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v4;
}
function pendingFor(previous, template, context) {
  const ptr0 = passArray8ToWasm02(previous, wasm2.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN2;
  const ptr1 = passArray8ToWasm02(template, wasm2.__wbindgen_malloc);
  const len1 = WASM_VECTOR_LEN2;
  const ptr2 = passArrayJsValueToWasm02(context, wasm2.__wbindgen_malloc);
  const len2 = WASM_VECTOR_LEN2;
  const ret = wasm2.pendingFor(ptr0, len0, ptr1, len1, ptr2, len2);
  if (ret[3]) {
    throw takeFromExternrefTable02(ret[2]);
  }
  var v4 = getArrayU8FromWasm02(ret[0], ret[1]).slice();
  wasm2.__wbindgen_free(ret[0], ret[1] * 1, 1);
  return v4;
}
function readCommitment2(_export) {
  let deferred3_0;
  let deferred3_1;
  try {
    const ptr0 = passArray8ToWasm02(_export, wasm2.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN2;
    const ret = wasm2.readCommitment(ptr0, len0);
    var ptr2 = ret[0];
    var len2 = ret[1];
    if (ret[3]) {
      ptr2 = 0;
      len2 = 0;
      throw takeFromExternrefTable02(ret[2]);
    }
    deferred3_0 = ptr2;
    deferred3_1 = len2;
    return getStringFromWasm02(ptr2, len2);
  } finally {
    wasm2.__wbindgen_free(deferred3_0, deferred3_1, 1);
  }
}
function signingFingerprint(_public) {
  let deferred2_0;
  let deferred2_1;
  try {
    const ptr0 = passArray8ToWasm02(_public, wasm2.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN2;
    const ret = wasm2.signingFingerprint(ptr0, len0);
    deferred2_0 = ret[0];
    deferred2_1 = ret[1];
    return getStringFromWasm02(ret[0], ret[1]);
  } finally {
    wasm2.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}
function __wbg_get_imports2() {
  const import0 = {
    __proto__: null,
    __wbg_Error_30c8987f7c2ed4e2: function(arg0, arg1) {
      const ret = Error(getStringFromWasm02(arg0, arg1));
      return ret;
    },
    __wbg___wbindgen_string_get_0380ccaa2f57f0d9: function(arg0, arg1) {
      const obj = arg1;
      const ret = typeof obj === "string" ? obj : void 0;
      var ptr1 = isLikeNone2(ret) ? 0 : passStringToWasm02(ret, wasm2.__wbindgen_malloc, wasm2.__wbindgen_realloc);
      var len1 = WASM_VECTOR_LEN2;
      getDataViewMemory02().setInt32(arg0 + 4 * 1, len1, true);
      getDataViewMemory02().setInt32(arg0 + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_throw_41e9ee4f547fc59a: function(arg0, arg1) {
      throw new Error(getStringFromWasm02(arg0, arg1));
    },
    __wbindgen_init_externref_table: function() {
      const table = wasm2.__wbindgen_externrefs;
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
    "./kishib_airgap_bg.js": import0
  };
}
function addToExternrefTable02(obj) {
  const idx = wasm2.__externref_table_alloc();
  wasm2.__wbindgen_externrefs.set(idx, obj);
  return idx;
}
function getArrayU8FromWasm02(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory02().subarray(ptr / 1, ptr / 1 + len);
}
var cachedDataViewMemory02 = null;
function getDataViewMemory02() {
  if (cachedDataViewMemory02 === null || cachedDataViewMemory02.buffer.detached === true || cachedDataViewMemory02.buffer.detached === void 0 && cachedDataViewMemory02.buffer !== wasm2.memory.buffer) {
    cachedDataViewMemory02 = new DataView(wasm2.memory.buffer);
  }
  return cachedDataViewMemory02;
}
function getStringFromWasm02(ptr, len) {
  return decodeText2(ptr >>> 0, len);
}
var cachedUint8ArrayMemory02 = null;
function getUint8ArrayMemory02() {
  if (cachedUint8ArrayMemory02 === null || cachedUint8ArrayMemory02.byteLength === 0) {
    cachedUint8ArrayMemory02 = new Uint8Array(wasm2.memory.buffer);
  }
  return cachedUint8ArrayMemory02;
}
function isLikeNone2(x) {
  return x === void 0 || x === null;
}
function passArray8ToWasm02(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory02().set(arg, ptr / 1);
  WASM_VECTOR_LEN2 = arg.length;
  return ptr;
}
function passArrayJsValueToWasm02(array, malloc) {
  const ptr = malloc(array.length * 4, 4) >>> 0;
  for (let i = 0; i < array.length; i++) {
    const add = addToExternrefTable02(array[i]);
    getDataViewMemory02().setUint32(ptr + 4 * i, add, true);
  }
  WASM_VECTOR_LEN2 = array.length;
  return ptr;
}
function passStringToWasm02(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder2.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory02().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN2 = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory02();
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
    const view = getUint8ArrayMemory02().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder2.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN2 = offset;
  return ptr;
}
function takeFromExternrefTable02(idx) {
  const value = wasm2.__wbindgen_externrefs.get(idx);
  wasm2.__externref_table_dealloc(idx);
  return value;
}
var cachedTextDecoder2 = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder2.decode();
var MAX_SAFARI_DECODE_BYTES2 = 2146435072;
var numBytesDecoded2 = 0;
function decodeText2(ptr, len) {
  numBytesDecoded2 += len;
  if (numBytesDecoded2 >= MAX_SAFARI_DECODE_BYTES2) {
    cachedTextDecoder2 = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder2.decode();
    numBytesDecoded2 = len;
  }
  return cachedTextDecoder2.decode(getUint8ArrayMemory02().subarray(ptr, ptr + len));
}
var cachedTextEncoder2 = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder2)) {
  cachedTextEncoder2.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder2.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN2 = 0;
var wasmModule2;
var wasmInstance2;
var wasm2;
function __wbg_finalize_init2(instance, module2) {
  wasmInstance2 = instance;
  wasm2 = instance.exports;
  wasmModule2 = module2;
  cachedDataViewMemory02 = null;
  cachedUint8ArrayMemory02 = null;
  wasm2.__wbindgen_start();
  return wasm2;
}
async function __wbg_load2(module2, imports) {
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
function initSync(module2) {
  if (wasm2 !== void 0) return wasm2;
  if (module2 !== void 0) {
    if (Object.getPrototypeOf(module2) === Object.prototype) {
      ({ module: module2 } = module2);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports2();
  if (!(module2 instanceof WebAssembly.Module)) {
    module2 = new WebAssembly.Module(module2);
  }
  const instance = new WebAssembly.Instance(module2, imports);
  return __wbg_finalize_init2(instance, module2);
}
async function __wbg_init2(module_or_path) {
  if (wasm2 !== void 0) return wasm2;
  if (module_or_path !== void 0) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === void 0) {
    module_or_path = new URL("kishib_airgap_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports2();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module: module2 } = await __wbg_load2(await module_or_path, imports);
  return __wbg_finalize_init2(instance, module2);
}

// src/web/airgap.ts
var started = null;
async function airgap() {
  started ??= __wbg_init2({ module_or_path: new URL("kishib_airgap_bg.wasm", document.baseURI) });
  await started;
  return kishib_airgap_exports;
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

// ../kit/src/engine/names.ts
var now = () => Date.now();
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
    if (k && !fresh && now() - k.at < (k.shown.state === "unreached" ? keep / 10 : keep)) return Promise.resolve(k.shown);
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
      this.kept.set(id, { shown, at: now() });
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
  const acts = /* @__PURE__ */ new Map();
  for (const h of at) {
    let after;
    try {
      for (; ; ) {
        const page = await relayAt(h, via).feed({ to: identity, after });
        const sealed = page.items.filter((it) => it.kind === "sealed");
        const opened2 = sealed.length ? await open(sealed.map((it) => it.item)) : [];
        for (const o of opened2) {
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
  const best = (from, version) => {
    const next = [...acts.entries()].filter(([, a]) => a.previous === from && a.version === version + 1);
    if (next.length > 1) out.forked = true;
    let pick = null;
    for (const [id] of next) {
      const below = best(id, version + 1);
      const depth = below ? below.depth : version + 1;
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

// ../kit/src/engine/people.ts
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
  const look = await lookUp(me.id, homes, via);
  if (!look.encryptionKey) throw new Error("This identity publishes no encryption key: its contacts cannot be sealed to it. Nothing was signed.");
  if (Array.isArray(o.open) && !me.f.encryption.some((x) => x.secret && hex(xwingPublic(unhex(x.secret))) === hex(look.encryptionKey))) throw new Error(`The encryption key this identity publishes is not one ${o.app} holds: its contacts cannot be sealed from here. Nothing was signed.`);
  let made;
  try {
    made = await me.signNow(PEOPLE_SPEC, SEALED_LIST, sealedListPayload({ version: found.version + 1, previous: found.act, follows: next }), { public: false, to: [me.id] });
  } finally {
    await o.save?.();
  }
  const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
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
  (now2) => {
    if (who2.id === me.id) throw new Error("That is this identity itself. Nothing was signed.");
    const nick = readNick(who2.nick);
    const had = now2.find((f) => f.id === who2.id);
    if (had && (!nick || had.name === nick)) return null;
    if (had) had.name = nick;
    else now2.push({ id: who2.id, name: nick });
    return now2;
  },
  o
);
var setNick = (me, who2, o) => changeContacts(
  me,
  (now2) => {
    const nick = readNick(who2.nick);
    const had = now2.find((f) => f.id === who2.id);
    if (!had) {
      if (who2.id === me.id) throw new Error("That is this identity itself. Nothing was signed.");
      now2.push({ id: who2.id, name: nick });
      return now2;
    }
    if ((had.name ?? null) === nick) return null;
    had.name = nick;
    return now2;
  },
  o
);
var removeContact = (me, id, o) => changeContacts(me, (now2) => now2.some((f) => f.id === id) ? now2.filter((f) => f.id !== id) : null, o);

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

// src/nakisib-say.ts
var NAKISIB_SAY = [
  "With Naki\u0161ib, the chain key never touches a connected device: your paper is typed only on an offline Mac that never connects, where Naki\u0161ib reads the request, shows its own summary, draws the new paper and signs. Ki\u0161ib carries the request there and the answer back, by a file on a USB stick, and sends it to the homes.",
  "Optional: Ki\u0161ib\u2019s own way, the paper typed here, stays as it is. Naki\u0161ib is an extra layer of safety for whoever wants it."
];
var NAKISIB_WAIT_SAY = [
  "Nothing is signed yet. Write the request to the USB stick, carry it to the offline Mac, and open it in Naki\u0161ib (\u201CChange keys\u201D). Naki\u0161ib takes your paper there, draws the new paper, and signs on SIGN; then carry its answer back here: \u201CRead Naki\u0161ib\u2019s answer\u201D.",
  "Keep Ki\u0161ib open meanwhile: it holds the new signing key it made for this change, and shows its words once the homes accept the change."
];
var NAKISIB_LOST_SAY = "Ki\u0161ib was closed after it wrote this request, so the new signing key it made then is gone. Naki\u0161ib signed with your paper for this request alone and signs no other with it: this change is sent as it is, and installs a signing key nobody holds. Once the homes accept it, change the keys again, from the new paper Naki\u0161ib drew: that change installs a key you hold.";

// src/kishib.ts
var SPENT_PAPER_SAY = (position) => `These are an earlier chain-key paper of this identity: the change of its keys at position ${position + 1} used it and committed a key of a new paper, so it changes these keys no more. Use the newest paper, the chain key\u2019s words Ki\u0161ib showed at the last change. Nothing was signed, and the words are forgotten.`;
var PAPER_COUNTS_SAY = "This new paper becomes the one that counts once the homes accept the change; until then the old paper still works, but only to send this same change again. If Ki\u0161ib is closed before the change is sent, nothing was signed: the next change starts over with another new paper, and the unused one is worthless.";
var PAPER_LINES = [
  { text: "Nothing is signed yet. First, the new chain key\u2019s words: write them down, then type three back. Only then does Ki\u0161ib sign this change and send it.", tone: "warn" },
  { text: PAPER_COUNTS_SAY }
];
var LAST_OF_OLD_PAPER_SAY = "This paper already made an earlier change of these keys: until 21 October 2026 Ki\u0161ib reused one paper for every change. This change is its last. It commits a key of a new paper, whose words are shown once the homes\u2019 receipts are in; this paper is spent after it.";
var message5 = (e3) => e3 instanceof Error ? e3.message : String(e3);
var openOr = (bytes, id, secret) => {
  try {
    return openSealed(bytes, id, secret);
  } catch {
    return null;
  }
};
var short3 = (id) => /^[0-9a-f]{64}$/.test(id) ? idForm(id) : id;
var unb642 = (t) => {
  try {
    return Uint8Array.from(atob(t.trim()), (c) => c.charCodeAt(0));
  } catch {
    throw new Error("That file could not be read.");
  }
};
var b643 = (b) => {
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s);
};
var MADE_CHAIN_WORDS_SAY = [
  "These are the chain key\u2019s words of a new identity: its first paper, made now on this device. They are the only way ever to change its keys, here in Ki\u0161ib.",
  "Write them on paper, in order, and keep it apart from everything that goes online. Never type them into Dub, Edubba, Damgar or a wallet: only Ki\u0161ib takes them.",
  "They are shown once. When you say they are written, they are hidden, three are asked back, and Ki\u0161ib forgets them; only then is the identity signed and sent to its homes. Closed before, nothing was made, and this paper is worthless."
];
var MADE_WORDS_SAY = [
  "These are the new identity\u2019s signing key\u2019s words: whoever holds them can sign as it and read its private messages. They are not the chain key\u2019s words.",
  "Write them on paper, in order. Bring the identity into Dub, Edubba, Damgar or Ummia with its ID and these words; or give them to Ki\u0161ib\u2019s runner (Runner, Identities held here), on this Mac.",
  "They are shown once. When you say they are written, they are hidden, three are asked back, and Ki\u0161ib forgets them: it keeps nothing of the identity."
];
var PLAN_LIFE = 15 * 60 * 1e3;
var NO_CONTACTS_SAY = {
  web: "Ki\u0161ib on the web holds no identity, so it has no contacts list: your contacts are in the apps holding your identity (Dub, Damgar\u2026), and in Ki\u0161ib\u2019s program once its runner holds it",
  off: "Ki\u0161ib\u2019s runner is off, so Ki\u0161ib holds no identity and has no contacts list to read: turn it on (Runner), and give it an identity (Runner, Add an identity to the runner)",
  locked: "Ki\u0161ib is locked: its contacts list is read once the runner\u2019s passphrase is given (Runner)",
  none: "Ki\u0161ib\u2019s runner holds no identity yet: give it one (Runner, Add an identity to the runner), and its contacts list is read here"
};
var Kishib = class {
  plans = /* @__PURE__ */ new Map();
  held = null;
  col = null;
  web;
  now;
  /** Who is known (H96, H100, H106): the one contacts list and the names identities published, read by the kit's one reader. */
  known;
  holder;
  /** The addresses given to Kišib in this program's life (homes, relays), in memory only: where names are read too. */
  near = /* @__PURE__ */ new Set();
  constructor(opts = {}) {
    this.web = opts.web ?? false;
    this.now = opts.now ?? (() => Math.floor(Date.now() / 1e3));
    this.holder = opts.holder ?? null;
    this.known = new Known("Ki\u0161ib", { via: opts.via });
  }
  // ------------------------------------------------------------ names and contacts (hand test v3: H96, H100, H106, H109)
  /** Addresses given in a form, kept in memory as places to read names at. Never written anywhere. */
  heard(...typed) {
    for (const t of typed) for (const x of String(t ?? "").split(/[\s,]+/)) if (/^https?:\/\/\S+$/.test(x) && this.near.size < 64) this.near.add(x.replace(/\/+$/, ""));
  }
  /** Where names are read: the homes of the identities held, and the addresses given here. */
  places() {
    const held2 = this.holder?.state === "on" ? this.holder.holding().flatMap((h) => h.homes) : [];
    return [.../* @__PURE__ */ new Set([...held2, ...this.near])];
  }
  /** The identity whose contacts Kišib shows (`as`, else the first held), or why there is none. */
  whose(as) {
    if (this.web || !this.holder) return { problem: NO_CONTACTS_SAY.web };
    if (this.holder.state !== "on") return { problem: NO_CONTACTS_SAY[this.holder.state] };
    const held2 = this.holder.holding();
    const id = as && held2.some((h) => h.id === as) ? as : held2[0]?.id;
    if (!id) return { problem: NO_CONTACTS_SAY.none };
    return this.holder.self(id);
  }
  /** The names of the IDs the page draws (H96, H106): the nickname given (where an identity is held), and the name each published. */
  async names(a) {
    const w = this.whose(a.as);
    if ("me" in w) return this.known.named(w.me, w.open, a.ids, this.places(), { fresh: a.fresh });
    const published = await this.known.names.many(a.ids.slice(0, 200), this.places(), !!a.fresh);
    return Object.fromEntries(Object.entries(published).map(([id, p]) => [id, { nick: null, published: p }]));
  }
  /** The one contacts list (H100), each contact with its names; or why it cannot be read here (locked, off, the web: nothing read). */
  async contacts(a = {}) {
    const w = this.whose(a.as);
    if (!("me" in w)) return { contacts: [], problem: w.problem };
    return this.known.contacts(w.me, w.open, this.places(), { fresh: a.fresh });
  }
  /** The list changed (H109): a contact added with a nickname, a nickname set or taken away, a contact taken out; sealed as the people cMIP keeps it. */
  /**
   * Kišib shows the contacts, and changes none (fix round 7's reading, put
   * to Nobody, allegedly): changing them signs an act, and the runner signs
   * only for the apps paired with it (the runner cMIP), never for Kišib
   * itself. They are changed in Dub, Damgar, Edubba or Ummia.
   */
  async contactChange(_a) {
    throw new Error(CONTACTS_READ_ONLY);
  }
  // ------------------------------------------------------------ state
  state() {
    this.expirePlans();
    const units2 = UNITS_MODULES.flatMap((m) => m.units.map((u2) => ({ hash: u2.hash, label: `${u2.many} (${m.name})`, network: u2.network ?? -1 })));
    units2.sort((x, y) => Number(y.network === 3) - Number(x.network === 3));
    return { web: this.web, sitting: this.sitting(), expiry: EXPIRY, units: units2 };
  }
  sitting() {
    if (this.col) return this.col.view(this.now());
    const h = this.held;
    if (!h) return null;
    const link = h.kind === "make" && h.id ? { link: idWhere(h.id, [h.homes[0]?.hint, h.places.find((p) => !h.homes.some((x) => x.hint === p))].filter((x) => !!x)) } : {};
    return { kind: h.kind, id: h.id, act: h.act, stage: h.stage, title: h.title, lines: h.lines, ...link, ...h.positions ? { positions: h.positions } : {}, ...h.chain || h.signing ? { words: h.chain ? "chain" : "signing" } : {}, ...h.request ? { nakisib: { fingerprint: h.fingerprint ?? "" } } : {} };
  }
  /** Drop everything this sitting holds: words, keys, bytes. */
  forget() {
    for (const p of this.plans.values()) p.wipe();
    this.plans.clear();
    if (this.held) {
      wipe(this.held.signing, this.held.chain);
      this.held.drop?.();
    }
    this.held = null;
    this.col?.wipe();
    this.col = null;
    return this.state();
  }
  busy() {
    if (this.held && this.held.stage !== "done" || this.col && !this.col.over()) {
      throw new Error("Ki\u0161ib is in the middle of another act: finish it, or forget it, first. One act at a time.");
    }
    this.held = null;
    this.col = null;
  }
  expirePlans() {
    const t = Date.now();
    for (const [k, p] of this.plans) {
      if (p.expires < t) {
        p.wipe();
        this.plans.delete(k);
      }
    }
  }
  plan(review2, p) {
    this.expirePlans();
    for (const old of this.plans.values()) old.wipe();
    this.plans.clear();
    const id = hex(randomBytes(16));
    this.plans.set(id, { ...p, digest: review2.digest, expires: Date.now() + PLAN_LIFE });
    return { plan: id, ...review2 };
  }
  /** Sign what a review showed, exactly: refused if it changed, expired, or still has something blocking. */
  async confirm(a) {
    this.expirePlans();
    const p = this.plans.get(a.plan);
    if (!p) throw new Error("That review expired (fifteen minutes) or was replaced, and its words were forgotten. Nothing was signed: start again.");
    if (p.digest !== a.digest) throw new Error("What you confirm is not what was shown. Nothing was signed.");
    this.plans.delete(a.plan);
    try {
      await p.run(a.warned);
    } finally {
      p.wipe();
    }
    return this.state();
  }
  // ------------------------------------------------------------ may: check paper words, show a record
  /** Check the chain key's words without signing anything: which key of the identity they give, if any. */
  async checkWords(a) {
    const id = readId(a.id);
    const seed = seedOf(a.words);
    try {
      const rd = await readIdentity(id, addresses(a.address), a.via ?? {}, SPECS.identity);
      const r = rd.look.resolution;
      const latest = r.links[r.links.length - 1];
      const idx = indexOf(seed, r.chainKeyScheme, r.chainKeyCommit, latest.position + 8);
      if (idx !== null) {
        return {
          title: "These are the right words",
          lines: [
            { text: `They give the chain key this identity\u2019s chain commits to now (key ${idx} of these words): the key the next change of its keys is signed with.`, tone: "ok" },
            { text: "That change makes a new paper and spends this one: keep this paper until then, and the new one after." },
            { text: "Nothing was signed, and the words are forgotten." }
          ]
        };
      }
      const spent = spentPaper(seed, commits(rd), latest.position);
      if (spent !== null) {
        return {
          title: "These words are spent",
          lines: [
            { text: SPENT_PAPER_SAY(spent).replace(/ Nothing was signed, and the words are forgotten\.$/, ""), tone: "bad" },
            { text: "Nothing was signed, and the words are forgotten." }
          ]
        };
      }
      const earlier = rd.look.resolution.links.length;
      return {
        title: "These are not the words this identity needs now",
        lines: [
          { text: `They do not give the chain key its chain commits to now (checked against keys 0 to ${latest.position + 8} of these words).`, tone: "bad" },
          { text: `They may be another identity\u2019s chain key words, its signing key\u2019s words (which never change the keys), a new paper whose change was never sent (worthless: Ki\u0161ib was closed before signing, and the next change makes another), or a word copied wrong that still passes the checksum. Its chain has ${earlier} act${earlier === 1 ? "" : "s"}.` },
          { text: "Nothing was signed, and the words are forgotten." }
        ]
      };
    } finally {
      wipe(seed);
    }
  }
  /** An identity's record in plain words: homes, receipts, lines, any contest. */
  async record(a) {
    const id = readId(a.id);
    const rd = await readIdentity(id, addresses(a.address), a.via ?? {}, SPECS.identity);
    return { title: `The record of ${short3(id)}`, sections: recordWords(rd) };
  }
  // ------------------------------------------------------------ must: rotate an identity
  /**
   * Review a rotation of an identity from its chain key's words: everything
   * read back in plain words before anything is signed. Optional: a
   * successor declared (F300), or the current succession ended; lines left
   * out by name; cards for lines another app made that cannot be read here.
   */
  async rotatePlan(a) {
    this.busy();
    const via = a.via ?? {};
    const id = readId(a.id);
    let seed = seedOf(a.words);
    try {
      const rd = await readIdentity(id, addresses(a.address), via, SPECS.identity);
      const r = rd.look.resolution;
      const latest = r.links[r.links.length - 1];
      const blocking = [];
      if (r.stop === "contested") blocking.push("Its homes hold two rotations at one position (contested). A normal rotation cannot settle it: use \u201CEscape a contested position\u201D.");
      const waiting = rd.next.filter((s) => !r.links.some((l) => l.act === s.id));
      if (waiting.length > 1) {
        blocking.push(`${waiting.length} rotations with this chain key exist, waiting for their homes. Ki\u0161ib never signs another (Identity rule 29). If you made only one, someone holds your chain key\u2019s words: use \u201CEscape a contested position\u201D.`);
      }
      const idx = indexOf(seed, r.chainKeyScheme, r.chainKeyCommit, latest.position + 8);
      const earlier = spentPaper(seed, commits(rd), latest.position);
      if (idx === null && earlier !== null) throw new Refused(SPENT_PAPER_SAY(earlier));
      if (idx === null) {
        throw new Refused("These words do not give the chain key this identity\u2019s chain commits to now: they may be another identity\u2019s, its signing key\u2019s words, or copied wrong. Nothing was signed, and the words are forgotten. (\u201CCheck paper words\u201D says more.)");
      }
      if (waiting.length === 1 && rd.chainActs.get(waiting[0].id)) return this.resendPlan(id, rd, waiting[0], idx, seed);
      let successor = null;
      if (a.successor?.trim()) {
        successor = readId(a.successor);
        if (successor === id) throw new Error("An identity cannot name itself as its successor.");
      }
      if (successor && a.endSuccession) throw new Error("Name a successor, or end the succession: not both.");
      const succNow = rd.look.verifier.succession(id);
      if (a.endSuccession && succNow.state === "none") throw new Error("No succession is declared: there is none to end.");
      let plan;
      try {
        plan = planLines(rd.lines, { leaveOut: a.leaveOut, cards: a.cards?.trim() ? readCards(a.cards) : void 0, ...placing(rd, rd.binding) });
      } catch (e3) {
        throw new Error(message5(e3));
      }
      const clock = declaresClock(rd);
      const vaultNow = rd.look.verifier.moneyVault(MIRS.money, id);
      const vault = vaultPlan(a.vault, vaultNow?.entries ?? null);
      const sections2 = [
        ...recordWords(rd).filter((s) => s.heading !== "Its lines of acts (each app or device keeps one)"),
        { heading: "Its lines of acts: what this rotation keeps (Identity rule 35)", lines: plan.shown.map((x) => ({ text: x.text.replace(/A line made elsewhere( that this device cannot read)?/, (_m, u2) => u2 ? "A line Ki\u0161ib cannot read" : "A line of acts"), tone: x.tone })) },
        {
          heading: "What changes",
          lines: [
            { text: "A new signing key, made now on this device. Its words are shown once, after the homes\u2019 receipts are in. Dub, Edubba and every app holding the old signing key\u2019s words stop signing until given the new ones.", tone: "warn" },
            { text: `A new chain key, from a new paper made now on this device (key ${latest.position + 1} of its words). Its 24 words are shown first: you write them down and type three back, and only then does Ki\u0161ib sign this change and send it. ${PAPER_COUNTS_SAY}`, tone: "warn" },
            ...earlier !== null ? [{ text: LAST_OF_OLD_PAPER_SAY, tone: "warn" }] : [],
            { text: `${homesWords(r.homes, r.effective)} Unchanged.` },
            successor ? { text: `A succession declared: ${successor} is named as this identity\u2019s successor. Nobody follows it until that identity confirms it, by an act of its own naming this rotation (F300; Ki\u0161ib can make it, \u201CConfirm a succession\u201D). This identity goes on living.`, tone: "warn" } : a.endSuccession ? { text: `The succession to ${succNow.successor ?? "its successor"} is ended.`, tone: "warn" } : { text: succNow.state === "none" ? "No succession." : `The succession stays as it is (${succNow.state}).` },
            ...clock ? [{ text: "This identity declares a clock (Money rule 15): its client anchors each change of its keys on that clock. Ki\u0161ib does not anchor: anchor it with the genesis client before relying on it.", tone: "warn" }] : []
          ]
        },
        { heading: "The vault (Money: where payments above a limit must go)", lines: vault.lines }
      ];
      const signs2 = [
        `Ki\u0161ib first shows the new paper\u2019s words (a fresh seed, the air-gapped Module\u2019s rule 3.3). Once three are typed back, it signs one rotation of ${short3(id)} at position ${latest.position + 1}, with the chain key these words give (key ${idx}), revealed once, committing the new paper\u2019s key.`,
        "It sends the exact same bytes to every home, and again, unchanged, if they stall: never a second rotation.",
        successor ? `Your rotation names ${short3(successor)} as successor; the successor signs nothing here.` : "It signs nothing else."
      ];
      const digest = sha2562(cborEncode(["MOR Ki\u0161ib rotation, version 1", id, latest.act, plan.kept.map((k) => [k.act, k.position, k.summary]), successor ?? "", !!a.endSuccession, ...vault.declaration ? [cborEncode([vault.declaration.kind, vault.declaration.cbor ?? null])] : []]));
      const s0 = seed;
      seed = null;
      return this.plan(
        {
          digest,
          title: `Change the keys of ${short3(id)}`,
          summary: [`Identity ${id}. Its chain was read from ${rd.places.join(", ")}, and judged by the core library.`, FORGOTTEN_SAY],
          sections: sections2,
          signs: signs2,
          warning: plan.warning,
          blocking
        },
        {
          wipe: () => wipe(s0),
          run: async (warned) => {
            if (blocking.length) throw new Error(`Nothing was signed: ${blocking[0]}`);
            checkWarned(plan, warned);
            const fresh = freshSeed();
            const next = chainKeyAt(fresh, r.chainKeyScheme, latest.position + 1);
            const nextCommit = next.commit;
            wipe(next.seeds);
            const old = s0.slice();
            const signing = newSigningSecret();
            const h = {
              kind: "identity",
              id,
              bytes: null,
              act: null,
              homes: r.homes,
              before: chainBefore(rd),
              with: [],
              places: rd.places,
              signing,
              chain: fresh,
              stage: "paper",
              title: `The rotation of ${short3(id)}: first, the new paper`,
              lines: PAPER_LINES,
              drop: () => wipe(old),
              sign: async () => {
                const current = chainKeyAt(old, r.chainKeyScheme, idx);
                try {
                  h.bytes = makeRotation({
                    identitySpec: SPECS.identity,
                    identity: id,
                    previous: latest.act,
                    position: latest.position + 1,
                    chainKeyScheme: r.chainKeyScheme,
                    chainKeySeeds: current.seeds,
                    newSigningPublic: signingPublic(signing),
                    nextChainKeyScheme: r.chainKeyScheme,
                    nextChainKeyCommit: nextCommit,
                    kept: plan.kept,
                    ...successor ? { successor } : {},
                    ...a.endSuccession ? { endSuccession: true } : {},
                    ...vault.declaration ? { declarations: [vault.declaration] } : {}
                  });
                } finally {
                  wipe(current.seeds, old);
                }
                h.act = actId(h.bytes);
                h.title = `The rotation of ${short3(id)}`;
              }
            };
            this.held = h;
            return this.sitting();
          }
        }
      );
    } catch (e3) {
      wipe(seed);
      throw e3;
    }
  }
  /**
   * A change already signed with this paper's key waits for its homes (Kišib
   * was closed before it counted): the paper now only sends that same change
   * again, its exact bytes as the homes and relays serve them (Identity rule
   * 29). Nothing is signed; no new words are shown here (the new paper was
   * written before it was signed; its signing key, if lost, is replaced by
   * the next change, from that new paper).
   */
  resendPlan(id, rd, s, idx, seed) {
    wipe(seed);
    const bytes = rd.chainActs.get(s.id);
    const r = rd.look.resolution;
    const sections2 = [
      ...recordWords(rd).filter((x) => !x.heading.startsWith("Its lines")),
      {
        heading: "A change of keys already signed with this paper, waiting for its homes",
        lines: [
          { text: `Rotation ${s.id} at position ${s.position}, signed with ${idx === null ? "the chain key this identity committed to" : `the chain key these words give (key ${idx})`}, installing the signing key ${s.signingFingerprint}${s.homeless ? " (homeless)" : ""}.`, tone: "warn" },
          { text: idx === null ? "Your paper now only answers this same change again (Naki\u0161ib gives the same bytes; Ki\u0161ib never signs a second change with the same key, Identity rule 29). Ki\u0161ib sends it again as the homes and relays serve it." : "This paper still works, but only to send this same change again: Ki\u0161ib never signs a second change with the same key (Identity rule 29)." },
          { text: "Once the homes accept it, the new paper written when it was signed is the one that counts, and this one is spent. If its signing key\u2019s words were never shown, change the keys again from that new paper: it installs a key you hold." },
          { text: "If you did not make this change, someone holds your chain key\u2019s words: do not send it; use \u201CEscape a contested position\u201D.", tone: "bad" }
        ]
      }
    ];
    const digest = sha2562(cborEncode(["MOR Ki\u0161ib resend, version 1", id, s.id]));
    return this.plan(
      { digest, title: `Send the same change of ${short3(id)}\u2019s keys again`, summary: [`Identity ${id}. Its chain was read from ${rd.places.join(", ")}, and judged by the core library.`, FORGOTTEN_SAY], sections: sections2, signs: ["Ki\u0161ib signs nothing: it sends the exact same bytes again, to every home."], warning: null, blocking: [] },
      {
        wipe: () => void 0,
        run: async () => {
          this.held = { kind: "identity", id, bytes, act: s.id, homes: r.homes, before: chainBefore(rd), with: [{ bytes, to: rd.places }], places: rd.places, signing: null, chain: null, stage: "sent", title: `The rotation of ${short3(id)}, sent again`, lines: [] };
          return this.send();
        }
      }
    );
  }
  /** Send the act held, the same bytes, to every home (a home lacking the acts before it gets them first), then see whether it counts. */
  async send() {
    const h = this.held;
    const lines2 = [];
    for (const home2 of h.homes) {
      lines2.push(await put(home2.hint, h.bytes, h.before));
    }
    for (const w of h.with) {
      for (const hint of w.to) {
        try {
          await relayAt(hint, {}).putAct(w.bytes);
        } catch {
        }
      }
    }
    lines2.push(
      h.signing ? { text: "Keep Ki\u0161ib open until the new signing key\u2019s words are shown. Closed now, the new signing key is lost: the identity stays yours, and the next change, from the new paper you wrote, installs a key you hold.", tone: "warn" } : { text: "The signing key this change installs was shown, if at all, in the sitting that signed it: if it was lost, once this change counts, change the keys again from the new paper written then.", tone: "warn" }
    );
    h.lines = lines2;
    return this.refresh();
  }
  /** Send the exact same bytes again (Identity rule 29): never a second rotation. */
  async resend() {
    if (this.col) {
      await this.col.resend();
      return this.state();
    }
    const h = this.held;
    if (!h || !h.bytes || h.stage !== "sent") throw new Error("Nothing is waiting to be sent again.");
    await this.send();
    return this.state();
  }
  /** Look again: whether what was sent counts now. */
  async refresh() {
    if (this.col) {
      await this.col.refresh();
      return this.sitting();
    }
    const h = this.held;
    if (!h || !h.act) throw new Error("Nothing was sent.");
    if (h.kind === "confirm") return this.sitting();
    const places = [.../* @__PURE__ */ new Set([...h.homes.map((x) => x.hint), ...h.places])];
    let counts = false;
    let say3;
    try {
      const l = (await readIdentity(h.id, places, {}, SPECS.identity)).look;
      counts = l.resolution.links.some((x) => x.act === h.act);
      say3 = counts ? { text: `It counts: the homes\u2019 receipts are in (${l.resolution.links.find((x) => x.act === h.act).how}).`, tone: "ok" } : { text: `It does not count yet: the receipts its home rule needs are not all in (${l.resolution.stop}). Send it again: the same bytes, never a new rotation.`, tone: "warn" };
    } catch (e3) {
      say3 = { text: `It could not be read back: ${message5(e3)}. Send it again: the same bytes.`, tone: "warn" };
    }
    h.lines = [...h.lines.filter((x) => !/^It (counts|does not count|could not)/.test(x.text)), say3];
    if (counts && h.stage === "sent") {
      h.stage = h.signing ? "counts" : "done";
      if (!h.signing) h.lines = [...h.lines, { text: "The new paper written when this change was signed is now the one that counts; the old paper is spent: destroy it.", tone: "ok" }];
    }
    return this.sitting();
  }
  /**
   * The new words, once the rotation counts: the new chain key's first (a
   * new paper, H79), then, once three of them are typed back, the new
   * signing key's; each shown, then hidden before three are asked back.
   */
  showWords() {
    if (this.col) return this.col.showWords();
    const h = this.held;
    if (!h || !h.signing && !h.chain) throw new Error("No new signing key is held here.");
    h.positions = void 0;
    if (h.chain) {
      h.stage = "paper";
      return { words: toWords(h.chain), say: h.kind === "make" ? MADE_CHAIN_WORDS_SAY : NEW_CHAIN_WORDS_SAY, which: "chain" };
    }
    if (h.stage === "sent") throw new Error("Not yet: the new signing key\u2019s words are shown once the homes\u2019 receipts are in, so they are never words of a key that does not count.");
    h.stage = "counts";
    return { words: toWords(h.signing), say: h.kind === "make" ? MADE_WORDS_SAY : NEW_WORDS_SAY, which: "signing" };
  }
  /** Hide the words; three positions to type back. */
  written() {
    if (this.col) {
      this.col.written();
      return this.state();
    }
    const h = this.held;
    if (!h || !h.signing && !h.chain || h.stage !== "counts" && h.stage !== "paper") throw new Error("No words are shown.");
    h.positions = threePositions((n) => randomBytes(1)[0] % n);
    h.stage = "shown";
    return this.state();
  }
  /**
   * The three words typed back: right, and Kišib forgets them. For the new
   * paper, it then signs the change and sends it; for the new signing key,
   * the sitting is done.
   */
  async typed(a) {
    if (this.col) {
      this.col.typed(a.typed);
      return this.state();
    }
    const h = this.held;
    if (!h || !h.signing && !h.chain || h.stage !== "shown" || !h.positions) throw new Error("No words are asked back.");
    if (!typedBack(toWords(h.chain ?? h.signing), h.positions, a.typed)) throw new Error("Not the words asked for. Check the paper: they are shown again with \u201CShow them again\u201D.");
    if (h.chain) {
      wipe(h.chain);
      h.chain = null;
      h.positions = void 0;
      const sign = h.sign;
      h.sign = null;
      h.drop = void 0;
      await sign();
      h.stage = "sent";
      await this.send();
      h.lines = [
        h.kind === "make" ? { text: "The chain key\u2019s words are written and forgotten here; then the identity was signed and sent to its homes. Its signing key\u2019s words come once their receipts are in.", tone: "ok" } : { text: "The new chain key\u2019s words are written and forgotten here; then the change was signed and sent. Once the homes accept it, the new paper is the one that counts and the old one is spent: destroy it then.", tone: "ok" },
        ...h.lines
      ];
      return this.state();
    }
    wipe(h.signing);
    h.signing = null;
    h.bytes = null;
    h.positions = void 0;
    h.stage = "done";
    h.lines = [...h.lines, { text: "The new signing key is forgotten here. Ki\u0161ib holds nothing of this identity now: only your two new papers do, the chain key\u2019s and the signing key\u2019s.", tone: "ok" }];
    return this.state();
  }
  // ------------------------------------------------------------ with Nakišib, Kišib's offline companion (decided 23 October 2026)
  /**
   * Change keys with Nakišib: the same reading as `rotatePlan` (every line,
   * the cards, the vault, the successor, all read back), without the
   * paper's words, which are typed only on the offline Mac. Confirmed, Kišib
   * makes the new signing key and writes the request for Nakišib (the
   * air-gapped Module's pending rotation, made by the Module's own `online`
   * code); it signs nothing with a chain key.
   */
  async nakisibPlan(a) {
    this.busy();
    const via = a.via ?? {};
    const id = readId(a.id);
    const rd = await readIdentity(id, addresses(a.address), via, SPECS.identity);
    const r = rd.look.resolution;
    const latest = r.links[r.links.length - 1];
    const blocking = [];
    if (r.stop === "contested") blocking.push("Its homes hold two rotations at one position (contested). A normal rotation cannot settle it: use \u201CEscape a contested position\u201D.");
    const waiting = rd.next.filter((x) => !r.links.some((l) => l.act === x.id));
    if (waiting.length > 1) blocking.push(`${waiting.length} rotations with this chain key exist, waiting for their homes. Naki\u0161ib never signs another (Identity rule 29). If you made only one, someone holds your chain key\u2019s words: use \u201CEscape a contested position\u201D.`);
    if (waiting.length === 1 && rd.chainActs.get(waiting[0].id)) return this.resendPlan(id, rd, waiting[0], null, null);
    if (r.chainKeyScheme !== 2 && r.chainKeyScheme !== 3) throw new Error("This identity\u2019s chain key is of a scheme Naki\u0161ib does not implement.");
    let successor = null;
    if (a.successor?.trim()) {
      successor = readId(a.successor);
      if (successor === id) throw new Error("An identity cannot name itself as its successor.");
    }
    if (successor && a.endSuccession) throw new Error("Name a successor, or end the succession: not both.");
    const succNow = rd.look.verifier.succession(id);
    if (a.endSuccession && succNow.state === "none") throw new Error("No succession is declared: there is none to end.");
    let plan;
    try {
      plan = planLines(rd.lines, { leaveOut: a.leaveOut, cards: a.cards?.trim() ? readCards(a.cards) : void 0, ...placing(rd, rd.binding) });
    } catch (e3) {
      throw new Error(message5(e3));
    }
    const clock = declaresClock(rd);
    const vaultNow = rd.look.verifier.moneyVault(MIRS.money, id);
    const vault = vaultPlan(a.vault, vaultNow?.entries ?? null);
    const sections2 = [
      ...recordWords(rd).filter((x) => x.heading !== "Its lines of acts (each app or device keeps one)"),
      { heading: "Its lines of acts: what this rotation keeps (Identity rule 35)", lines: plan.shown.map((x) => ({ text: x.text.replace(/A line made elsewhere( that this device cannot read)?/, (_m, u2) => u2 ? "A line Ki\u0161ib cannot read" : "A line of acts"), tone: x.tone })) },
      {
        heading: "What changes",
        lines: [
          { text: "A new signing key, made now on this device. Naki\u0161ib shows its fingerprint, and so does Ki\u0161ib: compare them. Its words are shown here once the homes\u2019 receipts are in. Dub, Edubba and every app holding the old signing key\u2019s words stop signing until given the new ones.", tone: "warn" },
          { text: `A new chain key, from a new paper Naki\u0161ib draws on the offline Mac (key ${latest.position + 1} of its paper), written and three of its parts typed back there before Naki\u0161ib signs. Your current paper is typed there, never here.`, tone: "warn" },
          { text: `${homesWords(r.homes, r.effective)} Unchanged.` },
          successor ? { text: `A succession declared: ${successor} is named as this identity\u2019s successor. Nobody follows it until that identity confirms it, by an act of its own naming this rotation (F300; Ki\u0161ib can make it, \u201CConfirm a succession\u201D). This identity goes on living.`, tone: "warn" } : a.endSuccession ? { text: `The succession to ${succNow.successor ?? "its successor"} is ended.`, tone: "warn" } : { text: succNow.state === "none" ? "No succession." : `The succession stays as it is (${succNow.state}).` },
          ...clock ? [{ text: "This identity declares a clock (Money rule 15): its client anchors each change of its keys on that clock. Ki\u0161ib does not anchor: anchor it with the genesis client before relying on it.", tone: "warn" }] : []
        ]
      },
      { heading: "The vault (Money: where payments above a limit must go)", lines: vault.lines },
      { heading: "With Naki\u0161ib, Ki\u0161ib\u2019s offline companion", lines: NAKISIB_SAY.map((text2) => ({ text: text2 })) }
    ];
    const signs2 = [
      `Ki\u0161ib signs nothing with a chain key. It makes the new signing key and writes the request for Naki\u0161ib: this change of ${short3(id)} at position ${latest.position + 1}, everything above but the next chain key, which Naki\u0161ib supplies.`,
      "Naki\u0161ib, on the offline Mac, reads the request\u2019s exact bytes and shows its own summary, takes your paper, draws the new paper, and signs on SIGN. Ki\u0161ib then reads its answer, checks that it is exactly this change (the air-gapped Module\u2019s rule 3.9), and sends the same bytes to every home, and again, unchanged, if they stall: never a second rotation."
    ];
    const digest = sha2562(cborEncode(["MOR Ki\u0161ib rotation with Naki\u0161ib, version 1", id, latest.act, plan.kept.map((k) => [k.act, k.position, k.summary]), successor ?? "", !!a.endSuccession, ...vault.declaration ? [cborEncode([vault.declaration.kind, vault.declaration.cbor ?? null])] : []]));
    const scheme = r.chainKeyScheme;
    return this.plan(
      { digest, title: `Change the keys of ${short3(id)} with Naki\u0161ib`, summary: [`Identity ${id}. Its chain was read from ${rd.places.join(", ")}, and judged by the core library.`, "No paper is typed here: Naki\u0161ib takes it, on the offline Mac."], sections: sections2, signs: signs2, warning: plan.warning, blocking },
      {
        wipe: () => void 0,
        run: async (warned) => {
          if (blocking.length) throw new Error(`Nothing was written: ${blocking[0]}`);
          checkWarned(plan, warned);
          const signing = newSigningSecret();
          const throwaway = freshSeed();
          const k = chainKeyAt(throwaway, scheme, latest.position);
          let template;
          try {
            template = makeRotation({
              identitySpec: SPECS.identity,
              identity: id,
              previous: latest.act,
              position: latest.position + 1,
              chainKeyScheme: scheme,
              chainKeySeeds: k.seeds,
              newSigningPublic: signingPublic(signing),
              nextChainKeyScheme: scheme,
              nextChainKeyCommit: "00".repeat(32),
              kept: plan.kept,
              ...successor ? { successor } : {},
              ...a.endSuccession ? { endSuccession: true } : {},
              ...vault.declaration ? { declarations: [vault.declaration] } : {}
            });
          } finally {
            wipe(k.seeds, throwaway);
          }
          const ag = await airgap();
          const fp = ag.signingFingerprint(signingPublic(signing));
          const previous = rd.chainActs.get(latest.act);
          if (!previous) throw new Error("The identity\u2019s latest change of keys could not be read whole. Nothing was written.");
          const request = ag.pendingFor(previous, template, [`Ki\u0161ib: a change of the keys of ${id}, at position ${latest.position + 1}.`, `Ki\u0161ib: the new signing key it made, fingerprint ${fp}.`]);
          this.held = {
            kind: "identity",
            id,
            bytes: null,
            act: null,
            homes: r.homes,
            before: chainBefore(rd),
            with: [],
            places: rd.places,
            signing,
            chain: null,
            stage: "request",
            title: `The change of keys of ${short3(id)}, with Naki\u0161ib`,
            lines: [...NAKISIB_WAIT_SAY.map((text2, i) => ({ text: text2, ...i === 0 ? { tone: "warn" } : {} })), { text: `The new signing key\u2019s fingerprint, as Naki\u0161ib shows it: ${fp}.` }],
            request,
            fingerprint: fp
          };
          return this.sitting();
        }
      }
    );
  }
  /** The request written for Nakišib, to save to a file: the Module's pending rotation (not secret). */
  nakisibRequest() {
    const h = this.held;
    if (!h?.request) throw new Error("No request for Naki\u0161ib is held: start \u201CChange keys with Naki\u0161ib\u201D first.");
    return { name: `nakisib-request-${h.id.slice(0, 8)}.mor`, bytes: b643(h.request), fingerprint: h.fingerprint ?? "" };
  }
  /**
   * Nakišib's answer, read: checked against the request it answers (the
   * air-gapped Module's rule 3.9, by the Module's own `online` code), then
   * sent to every home, then, once it counts, the new signing key's words.
   * Kišib closed since it wrote the request: give the request's file too,
   * with the identity and one of its homes (`NAKISIB_LOST_SAY`).
   */
  async nakisibAnswer(a) {
    const answer = unb642(a.answer);
    const ag = await airgap();
    const h = this.held;
    if (h?.stage === "request" && h.request) {
      let act2;
      try {
        act2 = ag.acceptAnswer(unhex(SPECS.identity), h.request, answer);
      } catch (e3) {
        throw new Error(`This is not Naki\u0161ib\u2019s answer to the request Ki\u0161ib wrote: ${message5(e3)}. Nothing was sent.`);
      }
      h.bytes = act2;
      h.act = actId(act2);
      h.stage = "sent";
      h.title = `The change of keys of ${short3(h.id)}, signed by Naki\u0161ib`;
      await this.send();
      h.lines = [{ text: "Naki\u0161ib\u2019s answer is exactly the change Ki\u0161ib asked for, signed with the chain key this identity committed to: sent to every home.", tone: "ok" }, ...h.lines];
      return this.state();
    }
    if (!a.request?.trim()) throw new Error("Ki\u0161ib holds no request for Naki\u0161ib now (it was closed since it wrote one, or none was written). Give the request\u2019s file too, with the identity and one of its homes.");
    this.busy();
    const id = readId(a.id ?? "");
    const request = unb642(a.request);
    let act;
    try {
      act = ag.acceptAnswer(unhex(SPECS.identity), request, answer);
    } catch (e3) {
      throw new Error(`This is not Naki\u0161ib\u2019s answer to that request: ${message5(e3)}. Nothing was sent.`);
    }
    const d = describeAct(act);
    if (d.signer !== id) throw new Error("That answer is a change of another identity\u2019s keys. Nothing was sent.");
    const rd = await readIdentity(id, addresses(a.address ?? ""), a.via ?? {}, SPECS.identity);
    this.held = {
      kind: "identity",
      id,
      bytes: act,
      act: actId(act),
      homes: rd.look.resolution.homes,
      before: chainBefore(rd),
      with: [],
      places: rd.places,
      signing: null,
      chain: null,
      stage: "sent",
      title: `The change of keys of ${short3(id)}, signed by Naki\u0161ib`,
      lines: []
    };
    await this.send();
    this.held.lines = [{ text: NAKISIB_LOST_SAY, tone: "warn" }, ...this.held.lines];
    return this.state();
  }
  // ------------------------------------------------------------ make an identity (H48)
  /**
   * Review a new identity (H48: "Kišib is an ID hub and should allow to
   * create new identities"): its homes, its relays, a chain key from a new
   * paper and a signing key, made as Dub makes one. Confirmed, the paper's
   * words come first, written and three typed back before anything is
   * signed; then its genesis, routes and encryption key (the one its signing
   * words carry, so every app bringing it opens its messages) are signed and
   * sent; once the homes' receipts are in, its signing key's words are shown
   * once. Kišib keeps nothing of it.
   */
  async makePlan(a) {
    this.busy();
    let fromNakisib = null;
    if (a.commitment?.trim()) {
      let c;
      try {
        c = JSON.parse((await airgap()).readCommitment(unb642(a.commitment)));
      } catch (e3) {
        throw new Error(`That file is not Naki\u0161ib\u2019s commitment for a new identity: ${message5(e3)}. Nothing was made.`);
      }
      if (c.index !== 0) throw new Error("That commitment is for a change of keys, not a new identity\u2019s first paper (its key index is not 0). Nothing was made.");
      fromNakisib = { scheme: c.scheme, commit: c.commit };
    }
    const via = a.via ?? {};
    const hints = addresses(a.homes);
    const relays = a.relays.trim() ? addresses(a.relays) : hints;
    const homes = [];
    for (const hint of hints) {
      let info;
      try {
        info = await relayAt(hint, via).info();
      } catch (e3) {
        throw new Error(`${hint} did not answer: ${message5(e3)}. Nothing was made.`);
      }
      const op = info.get(0);
      if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator. Nothing was made.`);
      homes.push({ operator: hex(op), hint });
    }
    const sections2 = [
      {
        heading: "What is made",
        lines: [
          { text: `A new identity, living at ${hints.join(", ")}: its homes keep its chain and sign their receipts.` },
          { text: `Its relays, where its posts are published and its inbox is: ${relays.join(", ")}.` },
          fromNakisib ? { text: `A chain key from the paper Naki\u0161ib drew on the offline Mac (key 0 of that paper): only its commitment comes here. Compare it with Naki\u0161ib\u2019s screen: ${grouped2(fromNakisib.commit)}.`, tone: "warn" } : { text: "A chain key, from a new paper made now on this device (key 0 of its words). Its 24 words are shown first: you write them down and type three back, and only then is the identity signed and sent.", tone: "warn" },
          { text: "A signing key, made now. Its words are shown once the homes\u2019 receipts are in: bring the identity into the apps with them, or give them to Ki\u0161ib\u2019s runner.", tone: "warn" },
          { text: "Its encryption key, the one its signing words carry: every app bringing it opens its private messages." },
          { text: "Ki\u0161ib keeps nothing of it: once both papers are written, it forgets them.", tone: "ok" }
        ]
      }
    ];
    if (fromNakisib) sections2.push({ heading: "With Naki\u0161ib, Ki\u0161ib\u2019s offline companion", lines: NAKISIB_SAY.map((text2) => ({ text: text2 })) });
    const signs2 = [
      fromNakisib ? "Ki\u0161ib signs the identity\u2019s genesis with its new signing key, committing the chain key of Naki\u0161ib\u2019s paper, and its routes and encryption key; then sends them to its homes and relays." : "Once the paper\u2019s three words are typed back, Ki\u0161ib signs the identity\u2019s genesis with its new signing key, committing the paper\u2019s chain key, and its routes and encryption key; then sends them to its homes and relays."
    ];
    const digest = sha2562(cborEncode(["MOR Ki\u0161ib new identity, version 1", homes.map((h) => [h.operator, h.hint]), relays, ...fromNakisib ? [fromNakisib.commit] : []]));
    return this.plan(
      { digest, title: "Make an identity", summary: ["A test identity, made as Dub makes one: its chain key on paper, its signing key\u2019s words for the apps.", FORGOTTEN_SAY], sections: sections2, signs: signs2, warning: null, blocking: [] },
      {
        wipe: () => void 0,
        run: async () => {
          const fresh = fromNakisib ? null : freshSeed();
          const signing = newSigningSecret();
          let commit;
          if (fromNakisib) commit = fromNakisib;
          else {
            const key = chainKeyAt(fresh, 3, 0);
            commit = { scheme: key.scheme, commit: key.commit };
            wipe(key.seeds);
          }
          const h = {
            kind: "make",
            id: "",
            bytes: null,
            act: null,
            homes,
            before: [],
            with: [],
            places: [...hints, ...relays],
            signing,
            chain: fresh,
            stage: "paper",
            title: fromNakisib ? "A new identity, from Naki\u0161ib\u2019s paper" : "A new identity: first, its paper",
            lines: fromNakisib ? [] : [{ text: "Nothing is signed yet. First, the chain key\u2019s words: write them down, then type three back. Only then does Ki\u0161ib sign the identity and send it.", tone: "warn" }],
            sign: async () => {
              const genesis = makeGenesis({ identitySpec: SPECS.identity, signingSecret: signing, chainKeyScheme: commit.scheme, chainKeyCommit: commit.commit, homes });
              const id = actId(genesis);
              const t = holding(id, id, signing, [genesis], homes);
              const routes = t.sign(SPECS.identity, IDENTITY_TYPES.routes, routesPayload({ version: 1, routes: [{ scope: null, hints: relays, kind: 0 }, { scope: null, hints: relays, kind: 1 }] }), { public: true });
              const enc = t.sign(SPECS.envelopes, ENVELOPES_TYPES.encryptionKey, encryptionKeyPayload(1, void 0, xwingPublic(encryptionSecret(signing))), { public: true });
              h.id = id;
              h.act = id;
              h.bytes = genesis;
              h.with = [
                { bytes: genesis, to: relays },
                { bytes: routes.act, to: [...hints, ...relays] },
                { bytes: enc.act, to: [...hints, ...relays] }
              ];
              h.title = `A new identity, ${short3(id)}`;
            }
          };
          this.held = h;
          if (fromNakisib) {
            const sign = h.sign;
            h.sign = null;
            await sign();
            h.stage = "sent";
            await this.send();
            h.lines = [{ text: "The identity was signed with the chain key of Naki\u0161ib\u2019s paper and sent to its homes. Its signing key\u2019s words come once their receipts are in.", tone: "ok" }, ...h.lines];
          }
          return this.sitting();
        }
      }
    );
  }
  /** A collective's paper share checked (accepted, new): its words, its number among the holders, and, with enough papers, the key they rebuild. Nothing is signed. */
  async checkShare(a) {
    return checkShare({ ...a, via: a.via ?? {} });
  }
  // ------------------------------------------------------------ must: escape a contested position (F299)
  /**
   * Review an escape with both keys (Identity section 11): someone else
   * rotated with this identity's chain key (its paper words were stolen),
   * or two rotations contest one position of a self-hosted identity. The
   * owner, holding the chain key's words and the signing key's words bound
   * before that position, signs a homeless rotation to new homes and an
   * escape endorsement listing every rotation served at that position as
   * abandoned.
   */
  async escapePlan(a) {
    this.busy();
    const via = a.via ?? {};
    const id = readId(a.id);
    let seed = seedOf(a.words);
    let signingSeed = null;
    try {
      signingSeed = seedOf(a.signingWords);
      const rd = await readIdentity(id, addresses(a.address), via, SPECS.identity);
      const r = rd.look.resolution;
      const pub = hex(signingPublic(signingSeed));
      const chain = orderedChain2(rd);
      let q = null;
      for (const c of chain) if (keyBoundBy(c.bytes) === pub) q = c;
      if (!q) throw new Refused("These signing words do not give a signing key this identity\u2019s chain ever bound: they are another identity\u2019s, or the chain key\u2019s words in the wrong box. Nothing was signed, and the words are forgotten.");
      const p = q.position + 1;
      const rivals = [];
      for (const b of rd.chainActs.values()) {
        const s = served(id, b, SPECS.identity);
        if (s && s.position === p && s.previous === q.act) rivals.push(s);
      }
      if (!rivals.length) throw new Error(`Nothing contests your position: no rotation is served after the act that bound your signing key (${q.act}). If you want to change your keys, use \u201CChange an identity\u2019s keys\u201D.`);
      const commit = commitOf(q.bytes);
      const idx = indexOf(seed, commit.scheme, commit.commit, p + 8);
      if (idx === null) throw new Refused("These words do not give the chain key committed before the contested position. Nothing was signed, and the words are forgotten.");
      const oldHomes = new Set([...(r.homesAt ?? []).flat(), ...r.homes].map((h) => h.hint));
      const newHomes = await homesAt(addresses(a.homes), via);
      if (!newHomes.length) throw new Error("Give one or more new homes: an escape leaves the old homes, which hold the other rotation and refuse any other with the same key.");
      for (const h of newHomes) if (oldHomes.has(h.hint)) throw new Error(`${h.hint} is one of the old homes: it holds the other rotation, and refuses any other revealing the same chain key (Identity rule 30). Name new homes.`);
      let plan;
      try {
        plan = planLines(linesUnder(rd, q.act), { leaveOut: a.leaveOut, cards: a.cards?.trim() ? readCards(a.cards) : void 0, ...placing(rd, q.act) });
      } catch (e3) {
        throw new Error(message5(e3));
      }
      const counted = (s) => r.links.some((l) => l.act === s.id);
      const sections2 = [
        ...recordWords(rd).filter((s) => !s.heading.startsWith("Its lines")),
        {
          heading: `What contests position ${p}`,
          lines: rivals.map((s) => ({
            text: `Rotation ${s.id}, revealing your chain key, installing the signing key ${s.signingFingerprint}${counted(s) ? ": it counts now" : r.stop === "contested" ? ": contested" : ": served, not counting"}${s.homeless ? " (homeless)" : ""}.`,
            tone: "bad"
          }))
        },
        { heading: "Your lines of acts: what the escape keeps (Identity rule 35)", lines: plan.shown.map((x) => ({ text: x.text.replace(/A line made elsewhere( that this device cannot read)?/, (_m, u2) => u2 ? "A line Ki\u0161ib cannot read" : "A line of acts"), tone: x.tone })) },
        {
          heading: "What changes",
          lines: [
            { text: `New homes: ${newHomes.map((h) => `${h.hint} (operator ${h.operator})`).join("; ")}. The old homes are left.`, tone: "warn" },
            { text: "Every rotation above is abandoned: it can never count afterwards (Identity section 11).", tone: "warn" },
            { text: "A new signing key, made now; its words are shown once the new homes\u2019 receipts are in." },
            { text: `A new chain key, from a new paper made now on this device (key ${p} of its words): its words are shown first, and only once three are typed back are the escape and its endorsement signed. The stolen paper is then spent: whoever holds it can derive nothing that counts after this escape. ${PAPER_COUNTS_SAY}`, tone: "warn" }
          ]
        }
      ];
      const signs2 = [
        `With your chain key (key ${idx} of these words): one homeless rotation of ${short3(id)} at position ${p}, naming the new homes.`,
        `With your signing key (bound by ${actForm(q.act)}): one escape endorsement naming that rotation and listing ${rivals.length === 1 ? "the rotation above" : `the ${rivals.length} rotations above`} as abandoned.`,
        "Both keys together are the strongest proof of ownership MOR sees (Identity rule 53): an escape endorsed with the signing key cannot be voided by an objection. Someone holding both of your keys could do the same: keep them apart."
      ];
      const digest = sha2562(cborEncode(["MOR Ki\u0161ib escape, version 1", id, q.act, rivals.map((s) => s.id).sort(), newHomes.map((h) => h.hint), plan.kept.map((k) => [k.act, k.position, k.summary])]));
      const s0 = seed;
      const g0 = signingSeed;
      seed = null;
      signingSeed = null;
      const qq = q;
      return this.plan(
        { digest, title: `Escape position ${p} of ${short3(id)}, with both keys`, summary: [`Identity ${id}: someone else\u2019s rotation revealing your chain key stands at position ${p}.`, FORGOTTEN_SAY], sections: sections2, signs: signs2, warning: plan.warning, blocking: [] },
        {
          wipe: () => wipe(s0, g0),
          run: async (warned) => {
            checkWarned(plan, warned);
            const fresh = freshSeed();
            const next = chainKeyAt(fresh, commit.scheme, p);
            const nextCommit = next.commit;
            wipe(next.seeds);
            const oldChain = s0.slice();
            const oldSigning = g0.slice();
            const signing = newSigningSecret();
            const everywhere = [.../* @__PURE__ */ new Set([...newHomes.map((h2) => h2.hint), ...rd.places])];
            const h = {
              kind: "escape",
              id,
              bytes: null,
              act: null,
              homes: newHomes,
              before: chain.filter((c) => c.position <= qq.position).map((c) => c.bytes),
              with: [],
              places: [...newHomes.map((h2) => h2.hint), ...rd.places],
              signing,
              chain: fresh,
              stage: "paper",
              title: `The escape of ${short3(id)}: first, the new paper`,
              lines: PAPER_LINES,
              drop: () => wipe(oldChain, oldSigning),
              sign: async () => {
                const current = chainKeyAt(oldChain, commit.scheme, idx);
                let bytes;
                let endorsement;
                try {
                  bytes = makeRotation({
                    identitySpec: SPECS.identity,
                    identity: id,
                    previous: qq.act,
                    position: p,
                    chainKeyScheme: commit.scheme,
                    chainKeySeeds: current.seeds,
                    newSigningPublic: signingPublic(signing),
                    nextChainKeyScheme: commit.scheme,
                    nextChainKeyCommit: nextCommit,
                    kept: plan.kept,
                    homes: newHomes,
                    homeless: true
                  });
                  const owner = holding(id, qq.act, oldSigning, chain.filter((c) => c.position <= qq.position).map((c) => c.bytes), newHomes);
                  endorsement = owner.sign(SPECS.identity, ESCAPE_ENDORSEMENT, cborEncode(/* @__PURE__ */ new Map([[0, rivals.map((s) => unhex(s.id))]])), { public: true, objects: [[id, actId(bytes)]] }).act;
                } finally {
                  wipe(current.seeds, oldChain, oldSigning);
                }
                h.bytes = bytes;
                h.act = actId(bytes);
                h.title = `The escape of ${short3(id)}`;
                h.with = [
                  { bytes: endorsement, to: everywhere },
                  { bytes, to: rd.places }
                ];
                for (const hint of everywhere) await relayAt(hint, via).putAct(endorsement).catch(() => void 0);
              }
            };
            this.held = h;
            return this.sitting();
          }
        }
      );
    } catch (e3) {
      wipe(seed, signingSeed);
      throw e3;
    }
  }
  // ------------------------------------------------------------ must: a succession, confirmed by the successor (F300)
  /**
   * Review the successor's confirmation of a succession declared by
   * another identity's rotation (Identity section 8): the successor's own
   * signing key's words, and an act of the successor naming that rotation.
   */
  async confirmPlan(a) {
    this.busy();
    const via = a.via ?? {};
    const owner = readId(a.owner);
    const successor = readId(a.successor);
    let seed = seedOf(a.words);
    try {
      const rd = await readIdentity(owner, addresses(a.address), via, SPECS.identity);
      const s = rd.look.verifier.succession(owner);
      if (s.state === "none") throw new Error(`No succession is declared by ${short3(owner)}: there is nothing to confirm.`);
      if (s.successor !== successor) throw new Error(`The succession ${short3(owner)} declares names ${s.successor ? short3(s.successor) : "another protocol"}, not ${short3(successor)}.`);
      if (s.state === "confirmed") throw new Error("This succession is already confirmed.");
      const look = await lookCurrent(successor, seed, [.../* @__PURE__ */ new Set([...addresses(a.address), ...rd.places])], via);
      const sections2 = [
        { heading: "What it confirms", lines: [{ text: `${short3(owner)} declared, in its rotation ${s.rotation}, that ${short3(successor)} succeeds it.` }, { text: "Until the successor confirms, clients show it as declared and follow nobody (F300).", tone: "warn" }] },
        { heading: "Who signs what", lines: [{ text: `${short3(owner)} signed the rotation that declares the succession, with its chain key. It signs nothing now.` }, { text: `You, ${short3(successor)}, sign one act with your signing key: a confirmation (Identity type 7) naming that rotation. It needs nothing from ${short3(owner)}.` }, { text: `${short3(owner)} goes on living: succession does not end it (Identity rule 39). Its followers and agreements may move across to you.` }] },
        { heading: "A line of your acts", lines: [{ text: "This act starts a new line of your acts, made here. Your next change of keys keeps it only if it names it: Ki\u0161ib finds every line when it rotates.", tone: "warn" }] }
      ];
      const digest = sha2562(cborEncode(["MOR Ki\u0161ib succession confirmation, version 1", owner, successor, s.rotation]));
      const s0 = seed;
      seed = null;
      const r = look.resolution;
      return this.plan(
        { digest, title: `Confirm that ${short3(successor)} succeeds ${short3(owner)}`, summary: [FORGOTTEN_SAY], sections: sections2, signs: [`You sign, as ${short3(successor)}, one confirmation naming the rotation ${s.rotation}.`], warning: null, blocking: [] },
        {
          wipe: () => wipe(s0),
          run: async () => {
            const chain = await servedChain(successor, r.homes, via);
            const binding = r.links[r.links.length - 1].act;
            const me = holding(successor, binding, s0, chain, r.homes);
            const made = me.sign(SPECS.identity, LINK_CONFIRMATION, cborEncode(/* @__PURE__ */ new Map()), { public: true, objects: [[owner, s.rotation]] });
            wipe(s0, unhex(me.f.signingSecret));
            me.f.signingSecret = "";
            const to = [.../* @__PURE__ */ new Set([...r.homes.map((h) => h.hint), ...rd.places])];
            const lines2 = [];
            for (const hint of to) lines2.push(await put(hint, made.act, chain));
            this.held = { kind: "confirm", id: successor, owner, bytes: null, act: made.id, homes: r.homes, before: [], with: [], places: to, signing: null, chain: null, stage: "done", title: `${short3(successor)} confirmed the succession`, lines: lines2 };
            const v = await lookUp(owner, to, via);
            await lookUp(successor, to, via, v.verifier);
            v.verifier.add(made.act);
            const now2 = v.verifier.succession(owner);
            lines2.push(now2.state === "confirmed" ? { text: "Read back as anyone would: the succession is confirmed, and clients follow it.", tone: "ok" } : { text: `Read back: ${now2.state}.`, tone: "warn" });
            lines2.push({ text: "Your signing words are forgotten here.", tone: "ok" });
            return this.sitting();
          }
        }
      );
    } catch (e3) {
      wipe(seed);
      throw e3;
    }
  }
  // ------------------------------------------------------------ must: rotate a collective (F337)
  deps() {
    return { now: this.now, web: this.web };
  }
  /** Start a collective's rotation: the starter's review (F337's plain words first). */
  async collectiveStart(a) {
    this.busy();
    const c = new CollectiveSitting(this.deps());
    const review2 = await c.start(a);
    const plan = this.plan(review2, {
      wipe: () => this.col === c ? void 0 : c.wipe(),
      run: async () => {
        this.col = c;
        await c.announce();
        return this.sitting();
      }
    });
    return plan;
  }
  /** In the same room: one more paper typed into this Kišib. */
  async collectivePaper(a) {
    if (!this.col) throw new Error("No collective rotation is waiting here.");
    await this.col.paper(a);
    return this.state();
  }
  /** Look for the members' shares sealed to the one-time key. */
  async collectiveGather() {
    if (!this.col) throw new Error("No collective rotation is waiting here.");
    await this.col.gather();
    return this.state();
  }
  /** Rebuild, rotate and deal, in one sitting, once exactly the threshold is in. */
  async collectiveRotate() {
    if (!this.col) throw new Error("No collective rotation is waiting here.");
    await this.col.rotate();
    return this.state();
  }
  /** A new share shown here once (the starter's own, or a member's by hand). */
  collectiveShare(a) {
    if (!this.col) throw new Error("No collective rotation here.");
    return this.col.shareShow(a.holder);
  }
  collectiveShareWritten(a) {
    if (!this.col) throw new Error("No collective rotation here.");
    this.col.shareWritten(a.holder);
    return this.state();
  }
  /** A member: read a rotation waiting for its share, by the collective and its fingerprint, before typing anything. */
  /**
   * The rotations waiting for a member (the rotation notice cMIP, 2.1; H97),
   * for Collectives › Waiting for you, prefilled. On the Mac with the runner
   * on, at once, for every identity it holds (opened with the key it holds);
   * elsewhere (the web, or no runner), only with the member's ID, a home and
   * signing words, overwritten once read: Kišib holds nothing before.
   */
  async collectiveNotices(a) {
    const via = a.via ?? {};
    const now2 = this.now();
    if (a.words?.trim()) {
      const member = readId(a.member ?? "");
      const hints = addresses(a.address ?? "");
      let seed;
      try {
        seed = fromWords(a.words);
      } catch (e3) {
        if (e3 instanceof Refused) throw new Error(`${e3.message}. Nothing was read.`);
        throw e3;
      }
      const secret = encryptionSecret(seed);
      seed.fill(0);
      try {
        const r = await noticesFor(member, hints, async (sealed) => sealed.map((b) => openOr(b, member, secret)), now2, via);
        return { notices: r.listed, problem: r.problem, by: "words" };
      } finally {
        secret.fill(0);
      }
    }
    const h = this.holder;
    if (this.web || !h || h.state !== "on" || !h.holding().length) {
      const why = this.web || !h ? "Ki\u0161ib holds nothing here" : h.state === "locked" ? "Ki\u0161ib\u2019s runner is locked: give its passphrase (Runner), or" : h.state === "off" ? "Ki\u0161ib\u2019s runner is off, so Ki\u0161ib holds nothing" : "Ki\u0161ib\u2019s runner holds no identity";
      return { notices: [], problem: `${why}: give your ID, one of your homes and your signing words, and Ki\u0161ib reads the rotations waiting for you in your inbox, then forgets the words.`, by: null };
    }
    const notices = [];
    for (const x of h.holding()) {
      const r = await noticesFor(x.id, x.homes, h.self(x.id).open, now2, via);
      notices.push(...r.listed);
    }
    return { notices, problem: null, by: "runner" };
  }
  async collectiveRead(a) {
    const { c, sections: sections2 } = await CollectiveSitting.readRequest(a, this.now());
    return { title: `A rotation of ${short3(c.rd.id)} asks for your share`, sections: sections2 };
  }
  /** A member's share: reviewed with the paper and signing words, then, confirmed, sealed to the starter's one-time key. */
  async collectiveGive(a) {
    this.busy();
    let sent = null;
    const g = await CollectiveSitting.give(this.deps(), a, (r) => sent = r);
    return this.plan(g.review, {
      wipe: g.wipe,
      run: async () => {
        await g.run();
        const s = sent;
        this.held = { kind: "collective", id: readId(a.collective), bytes: null, act: null, homes: [], before: [], with: [], places: [], signing: null, chain: null, stage: "done", title: s.title, lines: s.lines };
        return this.sitting();
      }
    });
  }
};
var ESCAPE_ENDORSEMENT = 14;
var LINK_CONFIRMATION = 7;
async function homesAt(hints, via) {
  const out = [];
  for (const hint of hints) {
    let info;
    try {
      info = await relayAt(hint, via).info();
    } catch (e3) {
      throw new Error(`${hint} did not answer: ${message5(e3)}`);
    }
    const op = info.get(0);
    if (!(op instanceof Uint8Array)) throw new Error(`${hint} is not a home: it declares no operator`);
    out.push({ operator: hex(op), hint });
  }
  return out;
}
function orderedChain2(rd) {
  return rd.look.resolution.links.map((l) => ({ act: l.act, position: l.position, bytes: rd.chainActs.get(l.act) })).filter((c) => c.bytes);
}
function chainBefore(rd) {
  return orderedChain2(rd).map((c) => c.bytes);
}
function keyBoundBy(bytes) {
  const d = describeAct(bytes);
  const m = cborDecode(d.payload);
  if (d.type === IDENTITY_TYPES.genesis) return hex(m.get(0)[1]);
  if (d.type === IDENTITY_TYPES.rotation) return hex(m.get(2)[1]);
  return null;
}
function commitOf(bytes) {
  const d = describeAct(bytes);
  const m = cborDecode(d.payload);
  const c = d.type === IDENTITY_TYPES.genesis ? m.get(1) : d.type === IDENTITY_TYPES.rotation ? m.get(3) : m.get(2);
  return { scheme: Number(c[0]), commit: hex(c[1]) };
}
function commits(rd) {
  return orderedChain2(rd).map((c) => ({ position: c.position, ...commitOf(c.bytes) }));
}
function declaresClock(rd) {
  for (const c of orderedChain2(rd)) {
    const d = describeAct(c.bytes);
    const m = cborDecode(d.payload);
    const decl = d.type === IDENTITY_TYPES.genesis ? m.get(4) : m.get(8);
    for (const x of decl ?? []) if (Number(x[1]) === 1 && x[2] !== null) return true;
  }
  return false;
}
var NETWORK = ["Bitcoin", "testnet", "signet", "regtest"];
function vaultEntryWords(e3) {
  const units2 = /* @__PURE__ */ new Set([e3.unit]);
  const rail = e3.railModule === SPEC.lightning.hash ? "on Lightning" : e3.railModule === SPEC.onchain.hash ? "on-chain" : `on rail Module ${e3.railModule.slice(0, 8)}\u2026`;
  const where = e3.railModule === SPEC.lightning.hash ? readLightningAddress(e3.source)?.node.slice(0, 16) : readOnchainAddress(e3.source)?.key.slice(0, 16);
  const unit = unitOf(e3.unit)?.unit.name ?? `unit ${e3.unit.slice(0, 8)}\u2026`;
  return `${unit}, ${rail} (${where ?? "?"}\u2026): ${e3.limit === 0 ? "every payment in this unit goes to the vault (flow off)" : `a single payment above ${say({ unit: e3.unit, value: e3.limit }, units2)} must go to the vault, not the flow`}.`;
}
function vaultPlan(v, now2) {
  const change = v ?? { change: "keep" };
  if (change.change === "keep") {
    return { lines: now2 ? [{ text: "Kept as it is:" }, ...now2.map((e3) => ({ text: vaultEntryWords(e3) }))] : [{ text: "None declared, and none is declared now: every payment goes to the flow; no protection chosen (Money rule 3)." }], declaration: null };
  }
  if (change.change === "remove") {
    if (!now2) throw new Error("This identity declares no vault: there is none to remove.");
    return {
      lines: [{ text: "Removed: from this rotation on, every payment goes to the flow, whatever its size, and a thief holding the signing key could point the flow anywhere (Money rule 3).", tone: "warn" }],
      declaration: vaultDeclaration(MIRS.money, null)
    };
  }
  if (!unitOf(change.unit)) throw new Error("Choose the vault\u2019s unit.");
  const entries = [];
  const limit = (n) => {
    if (!Number.isInteger(n) || n < 0) throw new Error("A limit is a whole number, 0 or more (0: every payment goes to the vault).");
    return n;
  };
  if (change.lightning?.node?.trim()) entries.push({ unit: change.unit, railModule: SPEC.lightning.hash, source: lightningAddress({ network: change.network, node: change.lightning.node.trim().toLowerCase() }), limit: limit(change.lightning.limit) });
  if (change.onchain?.key?.trim()) entries.push({ unit: change.unit, railModule: SPEC.onchain.hash, source: onchainAddress({ network: change.network, key: change.onchain.key.trim().toLowerCase(), request: change.onchain.request.trim().toLowerCase() }), limit: limit(change.onchain.limit) });
  if (!entries.length) throw new Error("A vault names at least one rail: its node (Lightning) or its Bitcoin key (on-chain).");
  if (unitOf(change.unit)?.unit.network !== change.network) throw new Error(`The unit is not the ${NETWORK[change.network]} network\u2019s.`);
  return {
    lines: [
      { text: "Declared anew, with the chain key (Money rule 2): only another change of keys can change it.", tone: "warn" },
      ...entries.map((e3) => ({ text: vaultEntryWords(e3) })),
      ...entries.length > 1 ? [{ text: "Several entries for one unit: the smallest limit applies (F114)." }] : [],
      { text: "A payment in a unit the vault has no entry for cannot be paid to the flow at all (fail closed, Money rule 3)." },
      { text: "The vault\u2019s node or key should be another than the flow\u2019s: the vault is only as safe as the key it names.", tone: "warn" }
    ],
    declaration: vaultDeclaration(
      MIRS.money,
      entries.map((e3) => ({ unit: e3.unit, railModule: e3.railModule, source: e3.source, limit: e3.limit }))
    )
  };
}
var CONTACTS_READ_ONLY = "Ki\u0161ib shows your contacts and changes none: changing them signs an act, and Ki\u0161ib signs only for the apps paired with it. Add a contact or a nickname in Dub, Damgar, Edubba or Ummia; it is here at once. Nothing was signed.";

// src/ops.ts
var text = (v) => typeof v === "string" ? v : "";
var list2 = (v) => Array.isArray(v) ? v.map(String).map((s) => s.trim()).filter(Boolean) : [];
function vaultOf(a) {
  const c = text(a.vault);
  if (c === "remove") return { change: "remove" };
  if (c !== "set") return { change: "keep" };
  const n = (v) => Number(text(v) || "0");
  return {
    change: "set",
    network: Number(text(a.vaultNetwork) || "3"),
    unit: text(a.vaultUnit),
    lightning: text(a.vaultNode) ? { node: text(a.vaultNode), limit: n(a.vaultLightningLimit) } : void 0,
    onchain: text(a.vaultKey) ? { key: text(a.vaultKey), request: text(a.vaultRequest), limit: n(a.vaultOnchainLimit) } : void 0
  };
}
async function run(k, op, a) {
  k.heard(text(a.address), text(a.homes), text(a.relays));
  switch (op) {
    // Who is known (hand test v3, H96, H100, H106, H109): the kit's names and its one contacts list.
    case "names":
      return k.names({ ids: list2(a.ids), fresh: a.fresh === true, as: text(a.as) || void 0 });
    case "contacts":
      return k.contacts({ as: text(a.as) || void 0, fresh: a.fresh === true });
    case "contact add":
      return k.contactChange({ op: "add", id: text(a.id), nick: text(a.nick), as: text(a.as) || void 0 });
    case "contact nick":
      return k.contactChange({ op: "nick", id: text(a.id), nick: text(a.nick), as: text(a.as) || void 0 });
    case "contact remove":
      return k.contactChange({ op: "remove", id: text(a.id), as: text(a.as) || void 0 });
    case "state":
      return k.state();
    case "forget":
      return k.forget();
    case "check words":
      return k.checkWords({ id: text(a.id), address: text(a.address), words: text(a.words) });
    case "record":
      return k.record({ id: text(a.id), address: text(a.address) });
    case "make plan":
      return k.makePlan({ homes: text(a.homes), relays: text(a.relays), commitment: text(a.commitment) });
    case "check share": {
      const numbers = Array.isArray(a.numbers) ? a.numbers.map(String) : [text(a.number)];
      const words2 = Array.isArray(a.shares) ? a.shares.map(String) : [text(a.shareWords)];
      return k.checkShare({ collective: text(a.collective), address: text(a.address), papers: numbers.map((n, i) => ({ number: n, words: words2[i] ?? "" })) });
    }
    case "rotate plan":
      return k.rotatePlan({ id: text(a.id), address: text(a.address), words: text(a.words), successor: text(a.successor), endSuccession: a.endSuccession === true, leaveOut: list2(a.leaveOut), cards: text(a.cards), vault: vaultOf(a) });
    case "nakisib plan":
      return k.nakisibPlan({ id: text(a.id), address: text(a.address), successor: text(a.successor), endSuccession: a.endSuccession === true, leaveOut: list2(a.leaveOut), cards: text(a.cards), vault: vaultOf(a) });
    case "nakisib request":
      return k.nakisibRequest();
    case "nakisib answer":
      return k.nakisibAnswer({ answer: text(a.answer), request: text(a.request), id: text(a.id), address: text(a.address) });
    case "escape plan":
      return k.escapePlan({ id: text(a.id), address: text(a.address), words: text(a.words), signingWords: text(a.signingWords), homes: text(a.homes), leaveOut: list2(a.leaveOut), cards: text(a.cards) });
    case "confirm plan":
      return k.confirmPlan({ owner: text(a.owner), successor: text(a.successor), address: text(a.address), words: text(a.words) });
    case "collective start":
      return k.collectiveStart({ collective: text(a.collective), address: text(a.address), founder: text(a.founder), founderWords: text(a.founderWords), number: text(a.number), shareWords: text(a.shareWords), room: a.room === true, leaveOut: list2(a.leaveOut) });
    // H97: the rotations waiting for the member, from their inbox (the rotation notice cMIP).
    case "collective notices":
      return k.collectiveNotices({ member: text(a.member), address: text(a.address), words: text(a.words) });
    case "collective read":
      return k.collectiveRead({ collective: text(a.collective), fingerprint: text(a.fingerprint), address: text(a.address) });
    case "collective give":
      return k.collectiveGive({ collective: text(a.collective), fingerprint: text(a.fingerprint), address: text(a.address), member: text(a.member), memberWords: text(a.memberWords), number: text(a.number), shareWords: text(a.shareWords) });
    case "confirm":
      return k.confirm({ plan: text(a.plan), digest: text(a.digest), warned: typeof a.warned === "string" ? a.warned : void 0 });
    case "resend":
      return k.resend();
    case "refresh":
      await k.refresh();
      return k.state();
    case "words show":
      return k.showWords();
    case "words written":
      return k.written();
    case "words typed":
      return k.typed({ typed: list2(a.typed) });
    case "collective paper":
      return k.collectivePaper({ number: text(a.number), words: text(a.words) });
    case "collective gather":
      return k.collectiveGather();
    case "collective rotate":
      return k.collectiveRotate();
    case "collective share":
      return k.collectiveShare({ holder: text(a.holder) });
    case "collective share written":
      return k.collectiveShareWritten({ holder: text(a.holder) });
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
  const one = form2.indexOf("1");
  if (one < 0 || form2.length < one + 10) return form2;
  return `${form2.slice(0, one + 4)}\u2026${form2.slice(-3)}`;
}
var initial = (name, id) => (name?.trim()?.[0] ?? id.replace(/^m\w*1/, "")[0] ?? "?").toUpperCase();
var NAME_WORDS = { loading: "Loading\u2026", none: "No name published", unreached: "Name not reached" };
function nameOf(n) {
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
function namedOf(w) {
  if (w.named) return w.named;
  const nick = w.name && w.ownName && w.name !== w.ownName ? w.name : null;
  const pub = w.ownName ?? (nick ? null : w.name ?? null);
  return { nick, published: pub ? { state: "name", name: pub } : { state: "none" } };
}
function card(a, o = {}) {
  const s = a.signer;
  const named = namedOf(s);
  const names = !nameOf(named) && s.collective && named.published?.state === "none" ? '<span class="k-nick">a collective</span>' : namesHtml(named, { retry: false });
  const signer = `<button type="button" class="k-signer" data-k-menu="signer" aria-haspopup="menu"><span class="k-names k-nm">${names}</span>${a.of ? `<span class="k-of" dir="auto">of ${e(a.of)}</span>` : ""}${s.me ? '<span class="k-dn">you</span>' : ""}<span class="k-sid">${e(shortForm(s.form))}</span></button>`;
  const labels = (a.labels ?? []).map((l) => `<div class="k-label${l.tone === "bad" ? " k-bad" : l.tone === "warn" ? " k-warn" : ""}">${l.html ?? e(l.text)}</div>`).join("");
  const kind = a.kind ? `<span class="k-kind">${e(a.kind)}</span>` : "";
  const text2 = a.text || kind ? `<div class="k-txt" dir="auto">${kind}${e(a.text ?? "")}</div>` : "";
  const foot = `<div class="k-foot">${a.verified && !a.alarm ? '<span class="k-v" title="verified">\u2713</span>' : ""}${a.alarm ? `<span class="k-alarmline">${e(a.alarm)}</span>` : ""}<button type="button" class="k-actid" data-k-menu="act" aria-haspopup="menu">${e(shortForm(a.form))}</button></div>`;
  const hint = (!a.when && a.unstamped ? `<div class="k-unstamped">${e(a.unstamped)}</div>` : "") + (!a.when && a.hint ? `<div class="k-hint" title="Written by the signer when signing: not checked by anyone, and not used to order anything" dir="auto">the signer\u2019s own hint: ${e(a.hint)}</div>` : "");
  const earlier = a.earlier?.length ? `<div class="k-earlier" data-k-earlier hidden><div class="k-earlier-say">${a.earlier.length === 1 ? "The original, as signed" : `The original and ${a.earlier.length - 1} earlier correction${a.earlier.length > 2 ? "s" : ""}, as signed, oldest first`}</div>${a.earlier.map((x) => card(x)).join("")}</div>` : "";
  const corrected = a.earlier?.length ? `<button type="button" class="k-corrected" data-k-corrected aria-expanded="false">Corrected</button>` : "";
  return `<article class="k-act${o.selected ? " k-sel" : ""}${a.earlier?.length ? " k-is-corrected" : ""}" data-k-act="${e(a.id)}" data-k-signer="${e(s.id)}">${earlier}${a.when ? `<span class="k-when">${e(a.when)}</span>` : ""}${signer}${corrected}${labels}${text2}${a.html ?? ""}${hint}${foot}</article>`;
}
function signerMenu(app2, w, own) {
  const below = w.me ? own : [w.followed ? { key: "unfollow", label: "Following: remove from contacts" } : { key: "follow", label: "Follow: add to contacts" }, ...own, w.muted ? { key: "unmute", label: "Unmute" } : { key: "mute", label: "Mute" }];
  const n = nameOf(namedOf(w));
  return menu(`${n ? `${n} \xB7 ` : ""}${shortForm(w.form)}`, [
    { key: "copy-id", label: "Copy ID" },
    { key: "copy-link", label: "Copy ID link" },
    { key: "profile", label: "Open profile" }
  ], app2, below);
}
function actMenu(app2, a, own, signs2 = true) {
  const opens = a.corrects ? "Open what it corrects" : "Open what it answers";
  const every = signs2 ? [{ key: "rely", label: "Rely on it" }, { key: "anchor", label: "Anchor it" }, ...a.own ? [{ key: "correct", label: "Correct it" }] : []] : [];
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
function say2(line, more, o = {}) {
  const rest = Array.isArray(more) ? more.map((m) => `<p>${e(m)}</p>`).join("") : more;
  const mor = o.mor ? whatIsMor(o.mor === "offline") : "";
  return `<details class="k-say"><summary>${e(line)}<span class="k-help" aria-label="more">?</span>${mor}</summary><div class="k-more-text">${rest}${o.mor ? `<p>${whatIsMor(o.mor === "offline", true)}</p>` : ""}</div></details>`;
}
var MOR_HOME = "https://dubsar.org/";
function whatIsMor(offline = false, long = false) {
  if (offline) return `<span class="k-mor k-mor-text" data-k-mor>${long ? "What is MOR? Read it at " : "What is MOR? "}<span class="k-mono">dubsar.org</span>${long ? ", on another device: this one never connects." : " (on another device)"}</span>`;
  return `<a class="k-mor" data-k-mor href="${MOR_HOME}" target="_blank" rel="noopener noreferrer">${long ? "What is MOR? dubsar.org\u2019s front page, in a new tab" : "What is MOR?"}</a>`;
}
var note = (kind, html) => `<div class="k-note${kind ? ` k-${kind}` : ""}" role="status">${html}</div>`;
var CLOSE_X = '<button type="button" class="k-round k-x" data-k-close aria-label="Close">\xD7</button>';
function ownId(o) {
  return `<div class="k-ownid" data-k-ownid><span class="k-mono k-idwhole">${e(o.form)}</span><div class="k-row"><button type="button" class="k-btn k-small" data-k-copy-id="${e(o.form)}">Copy ID</button><button type="button" class="k-btn k-small" data-k-share="${e(o.link)}">Share your ID link</button></div></div>`;
}
function labelOf(c) {
  return (c.named ? nameOf(c.named) : null) ?? c.name ?? c.names?.[0] ?? shortForm(c.form);
}
function contactsPanel(o) {
  const rows = o.contacts.map((c) => {
    const n = c.named ?? namedOf({ name: c.name, ownName: c.names?.[0] ?? null });
    const words2 = [labelOf(c), n.nick ?? "", n.published?.state === "name" ? n.published.name : "", ...c.names ?? [], c.form].join(" ").toLowerCase();
    return `<div class="k-idline" data-k-contact="${e(c.id)}" data-k-name="${e(words2)}"><button type="button" class="k-idrow" data-k-contact-open="${e(c.id)}"><span class="k-dot${c.collective ? " k-c" : ""} k-alt">${e(initial(labelOf(c), c.form))}</span><span><span class="k-n k-names" dir="auto">${namesHtml(n, { retry: false })}${c.collective ? '<span class="k-tagc">collective</span>' : ""}</span><br><span class="k-s">${e(shortForm(c.form))}</span></span></button>${o.nick ? `<button type="button" class="k-btn k-q k-small" data-k-nick="${e(c.id)}" title="Your own name for it, sealed: only you see it">Nickname\u2026</button>` : ""}${o.action ? `<button type="button" class="k-btn k-q k-small" data-k-contact-do="${e(c.id)}">${e(o.action)}</button>` : ""}</div>`;
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

// ../kit/src/dom.ts
async function copy(text2) {
  try {
    await navigator.clipboard.writeText(text2);
    return true;
  } catch {
    try {
      const t = document.createElement("textarea");
      t.value = text2;
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
async function copied(item, text2) {
  const ok = await copy(text2);
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
      const box = fold2.closest("[data-k-act]")?.querySelector(":scope > [data-k-earlier]");
      if (box) {
        box.hidden = !box.hidden;
        fold2.setAttribute("aria-expanded", String(!box.hidden));
        fold2.classList.toggle("k-on", !box.hidden);
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
      const text2 = cid ? cid.dataset.kCopyId : share2.dataset.kShare;
      void (async () => {
        let said2 = "";
        if (share2 && typeof navigator.share === "function") {
          try {
            await navigator.share({ title: "My ID on MOR", text: text2 });
            return;
          } catch (err) {
            if (err.name === "AbortError") return;
          }
        }
        said2 = await copy(text2) ? share2 ? "Copied: paste it where you share it" : "Copied" : "Select it and copy it";
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
function pushLayer(box, shade, close) {
  closeMenu();
  const l = { box, shade, close, dirty: false };
  stack.push(l);
  shade.addEventListener("click", () => {
    if (stack[stack.length - 1] === l) void leave(l);
  });
  box.addEventListener("input", (ev) => {
    const t = ev.target;
    if ((t.tagName === "TEXTAREA" || t.tagName === "INPUT" && !/^(checkbox|radio|file|hidden|search)$/.test(t.type)) && t.value.trim()) l.dirty = true;
  });
  box.addEventListener("submit", () => l.dirty = false, true);
  box.addEventListener("click", (ev) => {
    const t = ev.target;
    if (t.closest("[data-k-close]")?.closest("[data-k-stack]") === box) l.close();
    else if (t.closest("[data-k-remove-no]") && box.matches("[data-k-confirm]")) l.close();
  });
  box.dataset.kStack = "";
  restack();
  return l;
}
function popLayer(box) {
  const i = stack.findIndex((l) => l.box === box);
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
  const box = document.createElement("div");
  box.className = "k-modal k-confirm";
  box.setAttribute("role", "alertdialog");
  box.setAttribute("aria-modal", "true");
  box.dataset.kConfirm = "";
  box.innerHTML = `<div class="k-mh"><span class="k-grow"></span><button type="button" class="k-round" data-k-close aria-label="Close">\xD7</button></div><div class="k-mbody">${html}</div>`;
  page.append(shade, box);
  let answered = false;
  const close = (a = false) => {
    answered ||= a;
    if (!box.isConnected) return;
    box.remove();
    shade.remove();
    popLayer(box);
    if (!answered) gone?.();
  };
  pushLayer(box, shade, () => close());
  box.querySelector(".k-mbody button")?.focus({ preventScroll: true });
  return { box, close };
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
    const now2 = this.stack[this.stack.length - 1];
    const back = this.stack.length > 1 ? '<button type="button" class="k-round" data-k-popup="back" aria-label="Back">\u2190</button>' : "";
    this.box.innerHTML = `<div class="k-mh">${back}<h3 dir="auto">${escapeText(now2.title)}</h3><button type="button" class="k-round" data-k-popup="close" aria-label="Close">\xD7</button></div><div class="k-mbody">${now2.html}</div>`;
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
function stampCards(root, words2) {
  for (const a of root.querySelectorAll("article.k-act[data-k-act]")) {
    const w = words2[a.dataset.kAct ?? ""];
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
function ask(page, o) {
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

// ../kit/src/ids.ts
function idForm2(hex2, label = "mid") {
  if (!/^[0-9a-f]{64}$/.test(hex2)) return hex2;
  const CHARSET2 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const bytes = hex2.match(/../g).map((b) => parseInt(b, 16));
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
  return `${label}1${[...data, ...check].map((d) => CHARSET2[d]).join("")}`;
}
function who(o) {
  const form2 = o.form ?? idForm2(o.id, "mid");
  return `<span class="k-who${o.inline ? " k-inline" : ""}" data-k-who="${e(o.id)}"${o.named ? ' data-k-named=""' : ""}><span class="k-names">${namesHtml(o.named ?? null)}${o.me ? '<span class="k-you">you</span>' : ""}${o.collective ? '<span class="k-tagc">collective</span>' : ""}</span>${idButton(form2, { person: o.id })}</span>`;
}
function idButton(form2, o = {}) {
  return `<button type="button" class="k-idbtn" data-k-idform="${e(form2)}"${o.person ? ` data-k-person="${e(o.person)}"` : ""}${o.act ? ` data-k-act-id="${e(o.act)}"` : ""}${o.expand ? ' data-k-expand=""' : ""} title="Tap to show it whole">${e(shortForm(form2))}</button>`;
}
var actId2 = (id, o = {}) => idButton(idForm2(id, "mact"), { act: id, expand: o.expand });
function hashButton(hex2) {
  return `<button type="button" class="k-idbtn k-hash" data-k-idform="${e(hex2)}" data-k-short="${e(`${hex2.slice(0, 8)}\u2026${hex2.slice(-4)}`)}" title="Tap to show it whole">${e(`${hex2.slice(0, 8)}\u2026${hex2.slice(-4)}`)}</button>`;
}
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
  const ask3 = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(async () => {
      queued = false;
      const ws = [...root.querySelectorAll("[data-k-who]:not([data-k-named])")];
      if (ws.length) await fillNames(root, ws, false);
    });
  };
  new MutationObserver(ask3).observe(root, { childList: true, subtree: true });
  ask3();
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
    const box = w.querySelector(".k-names");
    const extra = [...box.querySelectorAll(".k-you, .k-tagc")].map((x) => x.outerHTML).join("");
    box.innerHTML = namesHtml(got[w.dataset.kWho] ?? { published: { state: "unreached" } }) + extra;
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
      const words2 = [c.named.nick ?? "", c.named.published?.state === "name" ? c.named.published.name : "", form2].join(" ").toLowerCase();
      return `<button type="button" role="option" data-k-picked="${e(form2)}" data-k-words="${e(words2)}"><span class="k-names">${namesHtml(c.named, { retry: false })}${c.collective ? '<span class="k-tagc">collective</span>' : ""}</span><span class="k-k">${e(shortForm(form2))}</span></button>`;
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
      if (!await ask(page, { title: `Remove ${c?.name ?? shortForm(c?.form ?? "")} from your contacts?`, text: "Taken out of the one list, in every app holding this identity. Nobody is told.", yes: "Remove", no: "Keep it" })) return;
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
function actFormOf(hex2, label = "mact") {
  if (!/^[0-9a-f]{64}$/.test(hex2)) return hex2;
  const CHARSET2 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const bytes = hex2.match(/../g).map((b) => parseInt(b, 16));
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
  return `${label}1${[...data, ...check].map((d) => CHARSET2[d]).join("")}`;
}

// src/page/panel.ts
var PANEL_STYLE = `
body.k-runner-panel{margin:0;background:#0b0e14;color:var(--k-text);font:300 15px/1.5 "Atkinson Hyperlegible Next",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.k-rp{padding:14px 18px 10px}
.k-rp h3{font-weight:300;font-size:19px;margin:0 0 2px}
.k-rp p{margin:4px 0}
.k-rp-words{border:1px solid var(--k-edge);border-radius:10px;padding:8px 12px;margin:10px 0;max-height:40vh;overflow:auto;background:var(--k-raise)}
.k-rp-check{display:flex;gap:8px;align-items:center;font-size:14px;color:var(--k-text);margin:8px 0}
.k-rp .k-btn{border-radius:999px;padding:8px 16px;font:inherit;cursor:pointer;border:1px solid var(--k-edge);background:none;color:var(--k-text)}
.k-rp .k-btn.k-p{background:var(--k-p);color:#0a0c10;border-color:var(--k-p)}
.k-rp .k-btn.k-q{border-color:transparent;color:var(--k-soft)}
.k-rp .k-tap{cursor:pointer;font-family:"Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-id);border-bottom:1px dotted var(--k-edge)}
.k-rp .k-tap .k-whole{display:none}
.k-rp .k-tap:focus .k-short{display:none}
.k-rp .k-tap:focus .k-whole{display:inline;overflow-wrap:anywhere;user-select:all}`;

// src/page/view.ts
var NAME2 = "Ki\u0161ib";
var TEST_ONLY3 = "Test identities only, until MOR is frozen";
var TINT3 = { layer: APPS.kishib.colour, pastel: APPS.kishib.pastel };
var WEB_BANNER3 = `<details class="k-say kishib-banner" id="for-testing-only" role="note"><summary><strong>For testing only.</strong> ${TEST_ONLY3}.<span class="k-help" aria-label="more">?</span>${whatIsMor()}</summary><div class="k-more-text"><p>The risks, in plain words:</p>
<ol><li>The words you type here are your chain key: whoever serves this page\u2019s code at that moment could copy them, and with them change your identity\u2019s keys, or keep a collective\u2019s whole key.</li>
<li>This browser, its extensions and whatever else runs on this device see what you type. A collective\u2019s whole chain key is rebuilt in the device that rotates it.</li>
<li>Ki\u0161ib keeps nothing in this browser\u2019s storage; but nothing can prove a device forgot what it held.</li></ol>
<p>Use the app on a clean device for anything of value; ideally a device used for nothing else. Never here for a real identity.</p></div></details>`;
var STYLE2 = `${KIT_STYLE}
${PANEL_STYLE}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.kishib-banner{flex:none;margin:0;padding:6px 16px;border-bottom:1px solid var(--k-line);background:var(--k-bg);font:300 12.5px/1.5 "Atkinson Hyperlegible Next",system-ui,sans-serif;color:var(--k-soft)}
.kishib-banner strong{font-weight:400;color:var(--k-text)}
.kishib-banner ol{margin:4px 0;padding-left:1.4em}
.k-home.kishib-three>.k-tile:last-child{grid-column:1 / -1}
.kishib-foot{flex:none;padding:0 28px 10px}
.kishib-holds{display:flex;align-items:center;gap:10px;white-space:nowrap;flex:none;padding:4px 6px 4px 14px;border:1px solid var(--k-line);border-radius:999px;font-size:14px}
.kishib-holds .k-s{font:11.5px "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-faint);white-space:nowrap}
.kishib-door{flex:1;display:grid;place-items:center;padding:20px}
.kishib-door .k-box{max-width:560px;width:100%;padding:28px 32px;border-radius:22px;background:var(--k-raise);border-color:var(--k-line)}
.kishib-door .k-ic{width:44px;height:44px;color:var(--k-p)}
.kishib-door h2{font-size:30px;margin:10px 0 6px}
.kishib-steps{display:flex;flex-wrap:wrap;gap:6px;font-size:13px;color:var(--k-faint);margin:2px 0 10px}
.kishib-steps .k-done-step{color:var(--k-soft)}
.kishib-steps .k-now{color:var(--k-text)}
.kishib-pane form{max-width:760px}
.kishib-pane textarea{min-height:76px}
.kishib-check{display:flex!important;gap:8px;align-items:center;color:var(--k-text)!important;font-size:14px!important}
.kishib-review{border:1px solid var(--k-line);border-radius:14px;padding:10px 16px;margin:10px 0;background:var(--k-raise)}
.kishib-review h3{font-size:14px;color:var(--k-soft);margin:12px 0 4px}
.kishib-review ul,.kishib-lines{margin:4px 0;padding-left:1.1em;font-size:14px}
.kishib-review li,.kishib-lines li{margin:3px 0}
li.bad{color:var(--k-bad)}
li.warn{color:var(--k-soft)}
.kishib-must{border:1px solid var(--k-bad);border-radius:14px;padding:12px 16px;margin:10px 0}
.kishib-signs{border:1px solid var(--k-edge);border-radius:12px;padding:8px 14px;margin:10px 0;font-size:14px}
.kishib-fpr{font:15px/1.5 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-id);letter-spacing:.04em}
.kishib-full{font:12px/1.5 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-soft);overflow-wrap:anywhere}
.kishib-typed{display:flex;gap:12px;flex-wrap:wrap}
.kishib-typed label{flex:1;min-width:120px}
.kishib-seg{display:inline-flex;border:1px solid var(--k-edge);border-radius:999px;padding:3px;gap:2px}
.kishib-seg button{padding:4px 16px;border-radius:999px;color:var(--k-soft);font-size:14px}
.kishib-seg button.k-on{background:var(--k-p);color:var(--k-ink);font-weight:400}
.kishib-app{border:1px solid var(--k-line);border-radius:14px;padding:12px 16px;margin:10px 0}
.kishib-app h3{font-size:17px}
.kishib-kinds{border-top:1px solid var(--k-line);margin-top:8px}
.kishib-kinds>div{display:flex;align-items:center;gap:12px;padding:8px 2px;border-bottom:1px solid var(--k-line);font-size:14.5px}
.kishib-kinds .k-r{margin-left:auto}
.kishib-wait{border:1px solid var(--k-edge);border-radius:14px;padding:12px 16px;margin:10px 0;background:var(--k-raise)}
.kishib-wait h3{font-size:17px}
.kishib-pane .k-feed{flex:none;max-height:none}
@media (max-width:600px){
  .k-home.kishib-three{grid-template-rows:repeat(3,1fr)}
  .k-home.kishib-three>.k-tile:last-child{grid-column:auto}
  .kishib-holds .k-n,.kishib-holds .k-s{display:none}
  .kishib-holds{padding:6px 10px}
  .k-top .k-tabs{display:none}
  .kishib-door .k-box{padding:20px}
}`;
var CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
function hexOfForm(form2) {
  const one = form2.lastIndexOf("1");
  let acc = 0;
  let bits = 0;
  const out = [];
  for (const c of form2.slice(one + 1, -6)) {
    const v = CHARSET.indexOf(c);
    if (v < 0) return null;
    acc = (acc << 5 | v) & 4095;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push(acc >> bits & 255);
    }
  }
  const hex2 = out.map((b) => b.toString(16).padStart(2, "0")).join("");
  return out.length === 32 && idForm2(hex2, form2.slice(0, one)) === form2 ? hex2 : null;
}
var ID_IN_TEXT = /\bm(?:id|act)1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}\b|\b[0-9a-f]{64}\b/g;
function said(text2) {
  return e(text2).replace(ID_IN_TEXT, (x) => {
    if (x.startsWith("mid1")) {
      const id = hexOfForm(x);
      return id ? who({ id, form: x, inline: true }) : x;
    }
    if (x.startsWith("mact1")) {
      const id = hexOfForm(x);
      return id ? actId2(id) : x;
    }
    return hashButton(x);
  });
}
var idFormOf = (id) => idForm2(id, "mid");
var lines = (ls) => `<ul class="kishib-lines">${ls.map((l) => `<li class="${e(l.tone ?? "")}">${said(l.text)}</li>`).join("")}</ul>`;
var TILES = [
  { key: "identities", name: "Identities", say: "Make an identity. Read any identity\u2019s record. Confirm a succession.", icon: "identities", danger: 1 },
  { key: "runner", name: "Runner", say: "Off. In this program only, never on the web: when on, Ki\u0161ib signs for the apps you approve, from keys it keeps, encrypted.", icon: "runner", danger: 2 },
  { key: "paper", name: "Paper", say: "The chain key\u2019s 24 words: check them, change keys, change the vault, name a successor, escape.", icon: "paper", danger: 3 },
  { key: "collectives", name: "Collectives", say: "A collective\u2019s rotation: waiting for you, start it, in the same room, check a share.", icon: "collectives", danger: 3 }
];
var tilesFor = (web) => TILES.filter((t) => !web || t.key !== "runner");
function holds(web, r) {
  if (!web && r?.state === "locked") return `<button type="button" class="kishib-holds" data-action="holds" title="Ki\u0161ib\u2019s runner is locked: give its passphrase"><span class="k-n">Runner locked</span><span class="k-s">passphrase</span><span class="k-dot k-alt">\u2013</span></button>`;
  if (web || !r?.on) return `<button type="button" class="kishib-holds" data-action="holds" title="What Ki\u0161ib holds"><span class="k-n">Holds nothing</span><span class="k-s">${web ? "web" : "runner off"}</span><span class="k-dot k-alt">\u2013</span></button>`;
  const names = r.held.map((h) => h.name);
  const shown = names.length ? names.length <= 2 && names.every(Boolean) ? names.join(", ") : `${names.length} ${names.length === 1 ? "identity" : "identities"}` : "nothing yet";
  return `<button type="button" class="kishib-holds" data-action="holds" title="What Ki\u0161ib\u2019s runner holds"><span class="k-n">Holds ${e(shown)}</span><span class="k-s">runner on</span><span class="k-dot">${e(String(names.length))}</span></button>`;
}
function topBar(web, tab, r) {
  const tabs = tab ? `<nav class="k-tabs" aria-label="Ki\u0161ib">${tilesFor(web).map((t) => `<button type="button" class="k-tab${t.key === tab ? " k-on" : ""}" data-tab="${t.key}"${t.key === tab ? ' aria-current="page"' : ""}>${e(t.name)}</button>`).join("")}</nav>` : "";
  return top({ left: `${contactsButton()}<button type="button" class="k-btn k-q kishib-home-btn" data-action="home-tiles" title="The four tiles">${appMark(NAME2, "icon.png")}</button>${tabs}`, right: holds(web, r) });
}
function home(web, r) {
  const ts = tilesFor(web).map(
    (t) => (
      // H111: the Runner tile shows the menu bar's seal as the runner's state shows it there: filled while on, a padlock while locked, hollow while off.
      t.key === "runner" && r?.on ? { ...t, icon: "runnerOn", say: `On: ${r.held.length} ${r.held.length === 1 ? "identity" : "identities"} held, ${r.apps.filter((a) => a.state === "approved").length} ${r.apps.filter((a) => a.state === "approved").length === 1 ? "app" : "apps"} paired${r.waiting.length ? `, ${r.waiting.length} waiting` : ""}. Ki\u0161ib signs for the apps you approve.` } : t.key === "runner" && r?.state === "locked" ? { ...t, icon: "runnerLocked", say: "Locked: what it keeps is encrypted on this Mac. Give its passphrase, and it signs again for the apps you approved." } : t
    )
  );
  const locked = !web && r?.state === "locked" ? unlockBox(r) : "";
  return `${topBar(web, null, r)}<div class="k-body k-col-flex">${locked}${tiles(ts).replace('class="k-home"', `class="k-home${ts.length === 3 ? " kishib-three" : ""}"`)}</div>
<div class="kishib-foot">${say2(TEST_ONLY3, [web ? "The web client is for testing only: the banner above says its risks." : "Ki\u0161ib writes nothing of your words to this device; what it holds for an act lives in the program\u2019s memory, and is gone when it stops. The runner, while on, is the one exception: it keeps the signing keys you give it, in Ki\u0161ib\u2019s folder, encrypted under its passphrase."], { mor: true })}</div>`;
}
function column(tab, web, r) {
  switch (tab) {
    case "identities":
      return [
        ...r?.on && !web ? [{ key: "held", label: "Held here", k: r.held.length }, "-"] : [],
        ...r?.state === "locked" && !web ? [{ key: "held", label: "Held here", k: "locked" }, "-"] : [],
        { key: "make", label: "Make an identity" },
        { key: "make-nakisib", label: "Make one with Naki\u0161ib" },
        { key: "record", label: "Read a record" },
        { key: "confirm", label: "Confirm a succession" },
        ...r?.state === "off" && !web ? ["-", { key: "held", label: "Held by the runner", k: "off" }] : []
      ];
    case "runner":
      return [
        { key: "onoff", label: "On or off" },
        // H89: an identity added where one works with the runner, in its own column entry.
        { key: "add", label: "Add an identity to the runner", k: r?.on ? r.held.length : void 0 },
        { key: "apps", label: "Apps", k: r?.apps.length ?? 0 },
        { key: "waiting", label: "Waiting", k: (r?.waiting.length ?? 0) + (r?.memberAsks.length ?? 0) },
        { key: "signed", label: "Signed", k: r?.signed.length ?? 0 }
      ];
    case "paper":
      return [
        { key: "check", label: "Check the paper" },
        { key: "rotate", label: "Change keys" },
        { key: "nakisib", label: "Change keys with Naki\u0161ib" },
        { key: "vault", label: "Change the vault" },
        { key: "successor", label: "Name a successor" },
        "-",
        { key: "escape", label: "Escape a contested position" }
      ];
    case "collectives":
      return [
        { key: "give", label: "Waiting for you" },
        { key: "start", label: "Start a rotation" },
        { key: "room", label: "In the same room" },
        { key: "checkshare", label: "Check a share", k: "new" }
      ];
  }
}
var firstPart = (tab, r, web) => tab === "identities" ? r && r.state !== "off" && !web ? "held" : "make" : tab === "runner" ? "onoff" : tab === "paper" ? "check" : "give";
function tabPage(web, tab, part2, pane, r) {
  return `${topBar(web, tab, r)}${opened(column(tab, web, r), part2, `<div class="kishib-pane" id="pane">${pane}</div><div id="status"></div>`)}`;
}
function door(web, tab, r) {
  const icon = tab === "paper" ? ICONS.paper : ICONS.collectives;
  return `${topBar(web, tab, r)}<div class="k-body kishib-door"><div class="k-box" id="door">${icon}<h2>${tab === "paper" ? "Paper" : "Collectives"}</h2>
<p class="k-soft">Have your paper ready. Ki\u0161ib uses the words for one act and forgets them.</p>
<p class="k-soft">${tab === "paper" ? "Here the chain key\u2019s 24 words are typed, used for one act, and forgotten. Ki\u0161ib writes nothing of them to this device." : "Here a collective\u2019s paper shares are typed, used for one rotation, and forgotten."} Be alone with this screen.</p>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="open-door">Open ${tab === "paper" ? "Paper" : "Collectives"}</button><button type="button" class="k-btn k-q" data-action="home-tiles">Not now</button></div></div></div>`;
}
var idField = (name, label, required = true) => `<label>${label} (mid1\u2026, or its hexadecimal)</label><div class="k-row"><input name="${name}" class="k-grow" type="text" autocomplete="off" spellcheck="false"${required ? " required" : ""}>${contactsButtonFor(name)}</div>`;
var words = (name, label) => `<label>${label}</label><textarea name="${name}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>`;
var address = `<label>One of its homes</label><input name="address" type="text" placeholder="https://" required>`;
var forgotten = say2("What you type is used for this act alone, then overwritten.", ["Nothing is written to this device. Close Ki\u0161ib, and nothing of your words remains."]);
var submit = (label, after = "Nothing is signed before you read it back.") => `<div class="k-row"><button type="submit" class="k-btn k-p">${e(label)}</button><span class="k-small k-faint">${e(after)}</span></div>`;
var units = [];
var setUnits = (u2) => units = u2 ?? [];
function vaultFields(open) {
  return `<details class="k-box"${open ? " open" : ""}><summary>+ The vault: ${open ? "declare it anew, or remove it" : "keep it as it is"}</summary>
<p class="k-small k-soft">The vault is where a payment above a limit must go, per unit, and the one place a thief holding only the signing key cannot point payments (Money rules 2 and 3). It changes only with the chain key, so only here. Its node or key should be another than your flow\u2019s, which Damgar names.</p>
<label>The vault</label><select name="vault"><option value="keep"${open ? "" : " selected"}>Keep it as it is</option><option value="set"${open ? " selected" : ""}>Declare it anew, as below</option><option value="remove">Remove it (every payment to the flow)</option></select>
<div class="k-row"><label class="k-grow">Its unit <select name="vaultUnit" data-vault-units>${units.map((u2) => `<option value="${e(u2.hash)}">${e(u2.label)}</option>`).join("")}</select></label><label class="k-grow">Network <select name="vaultNetwork"><option value="3" selected>regtest</option><option value="2">signet</option></select></label></div>
<label>Lightning: the vault\u2019s node key (66 hexadecimal characters; not your flow\u2019s node)</label><input name="vaultNode" autocomplete="off" spellcheck="false">
<label>Its limit: the largest single payment that may still go to the flow (0: every payment to the vault)</label><input name="vaultLightningLimit" inputmode="numeric" value="0">
<label>On-chain: the vault\u2019s Bitcoin key, x-only (64 hexadecimal characters)</label><input name="vaultKey" autocomplete="off" spellcheck="false">
<label>Its request key (Damgar\u2019s Settings show one; it signs address requests, and must stay online)</label><input name="vaultRequest" autocomplete="off" spellcheck="false">
<label>Its limit</label><input name="vaultOnchainLimit" inputmode="numeric" value="0"></details>`;
}
var VAULT_SAY = [
  "Changing the vault or its limit is a change of keys. Only the chain key changes the vault (Money rules 2 and 3), so a thief holding only the signing key can never move it.",
  "You need the chain key\u2019s paper, your newest one (written when the identity was made, or shown at its last change of keys). Ki\u0161ib first shows two new sets of 24 words, each once: the new chain key\u2019s (a new paper, for the next change; the old paper is then spent), written down before anything is signed; then it signs a change of keys that keeps every line of acts and declares the vault anew (or removes it), and once the homes accept it shows the new signing key\u2019s, to give to Dub and Damgar.",
  "The old signing key\u2019s words stop counting once the homes receipt the change."
];
var nakisibSaid = `<div class="k-box k-fill" id="nakisib-say">${NAKISIB_SAY.map((t) => `<p class="k-small k-soft">${e(t)}</p>`).join("")}</div>`;
var nakisibLate = `<details class="k-box"><summary>+ Ki\u0161ib was closed since it wrote the request</summary><form id="nakisib-late" autocomplete="off"><p class="k-small k-soft">Give the request\u2019s file and Naki\u0161ib\u2019s answer, with the identity and one of its homes. The new signing key Ki\u0161ib made with the request is gone: said again before anything is sent.</p>${idField("id", "The identity")}${address}<label>The request Ki\u0161ib wrote</label><input name="request" type="file" required><label>Naki\u0161ib\u2019s answer</label><input name="answer" type="file" required><div class="k-row"><button type="submit" class="k-btn k-p">Check it, and send it</button></div></form></details>`;
var cardsFold = (runnerOn) => `<details class="k-box"><summary>+ Lines another app made that cannot be read here</summary><label>Their cards, one per line, copied whole from each app\u2019s identity window (Dub, Edubba, Damgar, Ummia): latest act, position, summary, then the app\u2019s count and name</label><textarea name="cards"></textarea>${runnerOn ? '<div class="k-row"><button type="button" class="k-btn" data-action="runner-cards">Add the cards of the lines Ki\u0161ib\u2019s runner signed</button><span class="k-small k-faint">for an identity the runner holds: Dub\u2019s lines, signed here</span></div>' : ""}</details>`;
var STEPS = ["The words", "Read back", "New chain paper", "Signed", "New signing words"];
function steps(at) {
  return `<div class="kishib-steps" aria-label="Steps">${STEPS.map((s, i) => `<span class="${i < at ? "k-done-step" : i === at ? "k-now" : ""}">${i < at ? "\u2713 " : ""}${e(s)}</span>${i < STEPS.length - 1 ? "<span>\u203A</span>" : ""}`).join("")}</div>`;
}
function part(tab, key, web, r) {
  const f = (kind, title, intro, body, button = "Read it back", after) => `<h2>${e(title)}</h2><p class="k-soft k-small">${e(intro)}</p><form id="form-${kind}" data-kind="${kind}" autocomplete="off">${body}${forgotten}${submit(button, after)}</form><div id="result"></div>`;
  const runnerOn = !web && !!r?.on;
  switch (`${tab}/${key}`) {
    case "identities/held":
      return held(r);
    case "identities/make":
      return f(
        "make",
        "Make an identity",
        "A new identity: its homes, its relays, a chain key on a new paper, a signing key for the apps. Its chain key\u2019s words are shown once and three asked back before anything is signed; its signing key\u2019s words once its homes take it. Ki\u0161ib keeps nothing.",
        `<label>Its homes (one address per line): where it lives, and anyone can check it</label><textarea name="homes" required placeholder="https://"></textarea><label>Its relays, if you like (where its posts are published and its inbox is): its homes otherwise</label><textarea name="relays" placeholder="https://"></textarea>`
      );
    case "identities/make-nakisib":
      return `${f(
        "make",
        "Make an identity with Naki\u0161ib",
        "A new identity whose chain-key paper Naki\u0161ib drew on the offline Mac (A new identity): only its commitment comes here, by the file Naki\u0161ib wrote. Ki\u0161ib makes its signing key, signs its genesis committing that paper\u2019s key, and sends it to its homes; its signing key\u2019s words once its homes take it. Ki\u0161ib keeps nothing.",
        `<label>Naki\u0161ib\u2019s commitment (the file it wrote on the USB stick)</label><input name="commitment" type="file" required><label>Its homes (one address per line): where it lives, and anyone can check it</label><textarea name="homes" required placeholder="https://"></textarea><label>Its relays, if you like (where its posts are published and its inbox is): its homes otherwise</label><textarea name="relays" placeholder="https://"></textarea>`
      )}${nakisibSaid}`;
    case "identities/record":
      return f("record", "An identity\u2019s record", "Homes, receipts, lines of acts, any contest, any succession, as any reader would see it, judged by the core library. Reading signs nothing.", `${idField("id", "The identity")}${address}`, "Read it", "Reading signs nothing.");
    case "identities/confirm":
      return f(
        "confirm",
        "Confirm a succession",
        "As the successor: the identity that named you in a change of its keys is followed only once you confirm it, with an act of your own naming that change (F300). It uses your signing key\u2019s words, not paper.",
        `${idField("owner", "The identity that named you")}${idField("successor", "Your ID")}${address}${words("words", "Your signing key\u2019s 24 words (as Dub shows them)")}`
      );
    case "paper/check":
      return f("check", "Check the paper", "Ki\u0161ib derives the chain key from the words and compares it with what the identity\u2019s chain commits to: right, spent, or not these. Nothing is signed.", `${idField("id", "The identity")}${address}${words("words", "The chain key\u2019s 24 words, in order")}`, "Check them", "Nothing is signed.");
    case "paper/rotate":
      return `${steps(0)}${f(
        "rotate",
        "Change an identity\u2019s keys",
        "From its chain key\u2019s paper: a new signing key, and a new chain-key paper, every line of its acts kept. Ki\u0161ib reads the identity from its homes and every relay its routes name, finds every line of its acts, and reads it all back in plain words before anything is signed.",
        `${idField("id", "The identity")}${address}${words("words", "The chain key\u2019s 24 words, in order (its newest paper; never the signing key\u2019s words)")}${cardsFold(runnerOn)}${vaultFields(false)}`
      )}`;
    case "paper/nakisib":
      return `${f(
        "nakisib",
        "Change keys with Naki\u0161ib",
        "The same change of keys, its chain key used only on the offline Mac: Ki\u0161ib reads the identity, every line of its acts, the cards and the vault, and reads it all back; then writes the request for Naki\u0161ib. No paper is typed here.",
        `${idField("id", "The identity")}${address}${cardsFold(runnerOn)}${vaultFields(false)}`,
        "Read it back",
        "Nothing is written or signed before you read it back."
      )}${nakisibSaid}${nakisibLate}`;
    case "paper/vault":
      return `<h2>Change the vault</h2><div class="kishib-review" id="vault-say">${lines(VAULT_SAY.map((text2) => ({ text: text2 })))}</div><form id="form-rotate" data-kind="rotate">${idField("id", "The identity")}${address}${words("words", "The chain key\u2019s 24 words, in order (its newest paper)")}${cardsFold(runnerOn)}${vaultFields(true)}${forgotten}${submit("Read it back")}</form><div id="result"></div>`;
    case "paper/successor":
      return f(
        "rotate",
        "Name a successor",
        "The identity names its successor in a change of its keys, signed from its chain key\u2019s paper. Nobody follows it until the successor confirms it (Identities, Confirm a succession). This identity goes on living.",
        `${idField("id", "Your identity")}${address}${words("words", "Your chain key\u2019s 24 words")}${idField("successor", "The successor")}${cardsFold(runnerOn)}`
      );
    case "paper/escape":
      return f(
        "escape",
        "Escape a contested position",
        "Last, and set apart: for when someone else has changed your identity\u2019s keys with your chain key\u2019s words (they were stolen), or two changes contest one position of a self-hosted identity. You need both papers: the chain key\u2019s words, and the signing key\u2019s words of the key you held before. You leave to new homes.",
        `${idField("id", "The identity")}${address}${words("words", "Its chain key\u2019s 24 words")}${words("signingWords", "Its signing key\u2019s 24 words, the key you held before the other change")}<label>New homes (one address per line): not the old ones, which hold the other change</label><textarea name="homes" required placeholder="https://"></textarea>`
      );
    case "collectives/give":
      return `${noticesBox(web, r)}${f(
        "give",
        "Waiting for you: give your share",
        "A member who started a rotation told you in the proposal\u2019s thread (in Dub): listed above, filled in, or give the collective and its fingerprint here. Ki\u0161ib reads the rotation back to you first, checked against the collective\u2019s chain. Your share goes sealed to a one-time key that expires within the hour.",
        `${idField("collective", "The collective")}<label>The rotation\u2019s fingerprint (64 characters)</label><input name="fingerprint" type="text" autocomplete="off" spellcheck="false" required>${address}
<div class="k-row"><button type="button" class="k-btn" data-action="read request">Read the rotation first</button></div><div id="request"></div>
${idField("member", "Your ID")}<label>Your share\u2019s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>${words("shareWords", "Your share\u2019s 24 words")}${words("memberWords", "Your signing key\u2019s 24 words (to sign the small act that carries your share)")}`
      )}`;
    case "collectives/start":
    case "collectives/room": {
      const room = key === "room";
      return f(
        "start",
        room ? "In the same room" : "Start a rotation",
        room ? "Everyone is here: the papers are typed into this Ki\u0161ib one after another; nothing is sent, and no signing words are needed. Every new share is shown on this screen, once." : "This completes a member change proposed in Edubba and signed by every member. The member who proposed it starts here; the other members give their shares in their own Ki\u0161ib, within an hour.",
        `${idField("collective", "The collective")}${address}<label>Your share\u2019s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>${words("shareWords", "Your share\u2019s 24 words")}${room ? '<input type="hidden" name="room" value="1">' : `${idField("founder", "Your ID (you proposed the change)")}${words("founderWords", "Your signing key\u2019s 24 words: they open your members\u2019 answers, with the one-time keys their new shares go to")}`}`
      );
    }
    case "collectives/checkshare":
      return f(
        "checkshare",
        "Check a share",
        "A paper share of a collective\u2019s chain key: its number and its 24 words, checked against the collective. One paper says whether it is written right and whose it is; as many papers as rebuild the key say whether they still rebuild it. Nothing is signed.",
        `${idField("collective", "The collective")}${address}<label>The share\u2019s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>${words("shareWords", "The share\u2019s 24 words")}
<details class="k-box"><summary>+ More papers, typed here in the same room, to check together</summary><label>One per line: the number, then its 24 words (\u201C2 word word \u2026\u201D)</label><textarea name="more"></textarea></details>`,
        "Check it",
        "Nothing is signed."
      );
    case "runner/onoff":
      return runnerOnOff(r);
    case "runner/add":
      return runnerAdd(r);
    case "runner/apps":
      return runnerApps(r);
    case "runner/waiting":
      return runnerWaiting(r);
    case "runner/signed":
      return runnerSigned(r);
    default:
      return "";
  }
}
function noticesBox(web, r) {
  if (!web && r?.on && r.held.length) return `<div class="k-box" id="notices" data-auto><h3>Rotations waiting for you</h3><p class="k-small k-soft">Reading the inbox of the identities the runner holds\u2026</p></div>`;
  return `<div class="k-box" id="notices"><h3>Rotations waiting for you</h3><p class="k-small k-soft">Ki\u0161ib holds nothing here: give your ID, one of your homes and your signing words, and it reads the rotations waiting for you in your inbox, then forgets the words.${web ? "" : " On this Mac, with the runner on and holding you, they are listed at once."}</p>
<form id="form-notices" data-kind="notices" autocomplete="off">${idField("member", "Your ID")}${address}${words("words", "Your signing key\u2019s 24 words")}<div class="k-row"><button type="submit" class="k-btn">Find them</button><span class="k-small k-faint">reads only; nothing is signed</span></div></form><div id="notices-list"></div></div>`;
}
function noticesList(ns, problem) {
  if (problem) return `<p class="k-small k-soft">${said(problem)}</p>`;
  if (!ns.length) return '<p class="k-small k-soft">No rotation waits for you.</p>';
  return ns.map(
    (n) => `<div class="kishib-wait" data-notice="${e(n.fingerprint)}"><p>${who({ id: n.collective, collective: true, inline: true })} \xB7 fingerprint ${hashButton(n.fingerprint)} \xB7 your share ${n.share} \xB7 expires ${e(when2(n.expires))}</p><p class="k-small k-soft">Started by ${who({ id: n.from, inline: true })}, for ${who({ id: n.member, inline: true })}.</p>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="notice-pick" data-collective="${e(idForm2(n.collective, "mid"))}" data-fingerprint="${e(n.fingerprint)}" data-relays="${e(n.relays.join(" "))}" data-share="${n.share}" data-member="${e(idForm2(n.member, "mid"))}">Read it, then give my share</button></div></div>`
  ).join("");
}
var when2 = (s) => new Date(s * 1e3).toISOString().replace("T", " ").slice(0, 16) + " UTC";
function unlockBox(r) {
  const choose = r.upgrade;
  return `<form class="k-box k-fill" id="form-unlock" data-kind="unlock" autocomplete="off"><h3>Ki\u0161ib\u2019s runner is locked</h3>
<p class="k-small k-soft">${choose ? "Its file, written by an earlier Ki\u0161ib, keeps its keys in the clear: choose a passphrase now, typed twice, and Ki\u0161ib encrypts it under it. The keys, the apps and the log are kept." : "Ki\u0161ib was closed, or the Mac restarted: what the runner keeps (its keys, the apps paired with it, what it signed and opened) waits on this Mac, encrypted. Give its passphrase, and everything is back; no app pairs again. Until then, an app asking is told that Ki\u0161ib is locked."}</p>
<label>${choose ? "Choose a passphrase (at least 8 characters)" : "The runner\u2019s passphrase"}</label><input name="passphrase" type="password" autocomplete="off" required>
${choose ? '<label>The passphrase again</label><input name="again" type="password" autocomplete="off" required>' : ""}
<div class="k-row"><button type="submit" class="k-btn k-p">${choose ? "Encrypt it, and unlock" : "Unlock"}</button><span class="k-small k-faint">Forgotten? It cannot be found again: turn the runner off (Runner), which erases everything, then give the signing words again.</span></div></form>`;
}
var quitBox = (on) => `<div class="k-box" id="quit-box"><h3>${on ? "Lock now, or quit Ki\u0161ib" : "Quit Ki\u0161ib"}</h3><p class="k-small k-soft">${on ? "Locked, the runner signs and opens nothing until its passphrase is given again; nothing is erased, no app pairs again. " : ""}<b>Closing Ki\u0161ib\u2019s window does not end it</b>: its program keeps running${on ? ", unlocked" : ""}. Quit Ki\u0161ib ends it${on ? ", locking the runner" : ""}; so does restarting the Mac. On the Mac, Ki\u0161ib\u2019s seal in the menu bar offers the same.</p><div class="k-row">${on ? '<button type="button" class="k-btn" data-action="runner-lock">Lock now</button>' : ""}<button type="button" class="k-btn" data-action="quit">Quit Ki\u0161ib</button></div></div>`;
var offBox = (locked) => `<div class="k-box"><h3>Turn it off</h3><p class="k-small k-soft">Turning the runner off <b>erases everything</b>: every signing key it holds, every app paired with it, and the log of what it signed and opened. Its file is overwritten, then removed. Turned on again, it starts from nothing: the risk read, a passphrase chosen, the words given again, each app paired again.${locked ? " This is the way out of a forgotten passphrase." : ""}</p><div class="k-row"><button type="button" class="k-btn k-alarm" data-action="runner-off">Turn it off, and erase everything</button></div></div>`;
function runnerOnOff(r) {
  if (!r) return "";
  const seg = `<div class="kishib-seg" role="group" aria-label="The runner"><button type="button" class="${r.state === "off" ? "k-on" : ""}" data-action="${r.state === "off" ? "" : "runner-off-ask"}">Off</button><button type="button" class="${r.state === "off" ? "" : "k-on"}" data-action="${r.state === "off" ? "runner-on-ask" : ""}">${r.state === "locked" ? "Locked" : "On"}</button></div>`;
  const state = r.state === "on" ? `<div class="k-box k-fill" id="runner-state"><div class="k-row"><div class="k-grow"><b>On</b> <span class="k-small k-soft">since ${e(when2(r.since))}</span><p class="k-small k-soft">Ki\u0161ib keeps the signing keys of ${r.held.length} ${r.held.length === 1 ? "identity" : "identities"} on this Mac, in its folder, encrypted under the runner\u2019s passphrase. The chain key: never.</p></div>${seg}</div></div>
${quitBox(true)}
${offBox(false)}` : r.state === "locked" ? `<div class="k-box k-fill" id="runner-state"><div class="k-row"><div class="k-grow"><b>Locked</b><p class="k-small k-soft">What the runner keeps is on this Mac, encrypted; it signs and opens nothing until its passphrase is given.</p></div>${seg}</div></div>
${unlockBox(r)}${quitBox(false)}${offBox(true)}` : `<div class="k-box k-fill" id="runner-state"><div class="k-row"><div class="k-grow"><b>Off</b><p class="k-small k-soft">No key stored. Every app signs with its own words, as today.</p></div>${seg}</div></div>
<div class="k-box" id="risk"><h3>Before you turn it on, the risk</h3>${lines(r.risk.map((text2) => ({ text: text2 })))}
<label>Choose the runner\u2019s passphrase (at least 8 characters): asked each time Ki\u0161ib starts</label><input id="runner-pass" type="password" autocomplete="new-password">
<label>The passphrase again</label><input id="runner-pass-again" type="password" autocomplete="new-password">
<p class="k-small k-soft">Forget it, and it cannot be found again: the runner is then turned off, erasing everything, and the signing words given again.</p>
<label class="kishib-check"><input type="checkbox" id="risk-read"> I have read the risk</label><div class="k-row"><span class="k-grow"></span><button type="button" class="k-btn" data-action="runner-on">Turn it on</button></div></div>
<p class="k-small k-faint">The risk is optional: you may leave it off for good.</p>${quitBox(false)}`;
  return `<h2>The runner</h2><p class="k-soft k-small">On this Mac\u2019s program only, never in the web client. An app asks to pair; you approve here; then Ki\u0161ib signs for it, showing what it signs in a panel inside the app\u2019s window. The app never holds a key.</p>${state}`;
}
var notOn = (r, title, off) => `<h2>${title}</h2>${r?.state === "locked" ? `<p class="k-soft">The runner is locked: what it keeps is encrypted until its passphrase is given.</p>${unlockBox(r)}` : `<p class="k-soft">${off}</p>`}`;
function held(r) {
  if (r?.state === "locked") return notOn(r, "Held here", "");
  if (!r?.on) {
    return `<h2>Held by the runner</h2><p class="k-soft">The runner is off: Ki\u0161ib holds nothing. Turned on (Runner), it keeps the signing keys of the identities you give it here, encrypted under its passphrase, and signs with them for the apps you approve.</p><div class="k-row"><button type="button" class="k-btn" data-tab="runner">Open Runner</button></div>`;
  }
  const rows = r.held.map(
    // H96, H106: its names as read (Loading…, the name, No name published, Name not reached), its short ID a tap; H88: its ID whole, Copy ID, Share your ID link.
    (h) => `<div class="kishib-app" data-held="${e(h.id)}"><div class="k-row"><span class="k-dot">${e((h.name ?? "M")[0].toUpperCase())}</span><div class="k-grow"><h3>${who({ id: h.id, form: h.form })}</h3></div><button type="button" class="k-btn k-q" data-action="held-record" data-id="${e(h.id)}">Its record</button><button type="button" class="k-btn k-q" data-action="held-remove" data-id="${e(h.id)}">Remove</button></div>
${ownId({ form: h.form, link: h.link })}
<p class="k-small k-soft">${h.apps.length ? `Used by ${e(h.apps.join(", "))}.` : "No app uses it yet."}</p>
${h.members.length ? `<div class="kishib-members"><p class="k-small">Its own keys for its collectives, held here with it (encrypted):</p>${h.members.map((m) => `<div class="k-row" data-member="${e(m.collective)}"><span class="k-grow">${who({ id: m.collective, form: m.form, collective: true, inline: true })}</span><span class="k-small k-faint">added ${e(when2(m.added))}</span><button type="button" class="k-btn k-q" data-action="member-remove" data-id="${e(h.id)}" data-collective="${e(m.collective)}">Remove</button></div>`).join("")}</div>` : ""}
${h.spent ? `<div class="k-note k-error">Its keys were changed with its chain key: the signing key the runner holds no longer counts, and it signs nothing for it. Give the new signing key\u2019s words.<form class="kishib-renew" data-renew="${e(h.id)}"><input type="hidden" name="id" value="${e(h.id)}"><label>One of its homes</label><input name="address" placeholder="https://" required><label>The new signing key\u2019s 24 words</label><textarea name="words" required autocomplete="off" spellcheck="false"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Take the new words</button></div></form></div>` : ""}</div>`
  ).join("");
  return `<h2>Held here</h2><p class="k-soft k-small">The identities Ki\u0161ib\u2019s runner keeps, by their signing keys, on this Mac, encrypted under its passphrase, with their own keys for their collectives. Remove one, and Ki\u0161ib forgets its keys; the apps using it through Ki\u0161ib stop signing as it.</p>${memberAsks(r)}${rows || '<p class="k-soft">None yet.</p>'}
<div class="k-row"><button type="button" class="k-btn" data-action="runner-add">Add an identity to the runner</button><span class="k-small k-faint">in Runner, beside its apps</span></div>`;
}
function runnerAdd(r) {
  if (!r?.on) return notOn(r, "Add an identity to the runner", "The runner is off: turn it on first (On or off), knowing the risk.");
  const list3 = r.held.length ? `<div class="k-small k-soft kishib-held-now">Held now (Identities, Held here, for each one\u2019s record and keys): ${r.held.map((h) => `<span data-held="${e(h.id)}">${who({ id: h.id, form: h.form, inline: true })}</span>`).join(", ")}</div>` : "";
  return `<h2>Add an identity to the runner</h2><p class="k-soft k-small">Ki\u0161ib keeps its signing key on this Mac, encrypted under the runner\u2019s passphrase, and signs with it for the apps you approve (Apps). Never the chain key.</p>${list3}
<form id="form-give-runner" data-kind="give-runner" class="k-box" autocomplete="off"><h3>Give an identity to the runner</h3><p class="k-small k-soft">By its signing key\u2019s words, as Dub shows them (its identity\u2019s menu, Words): Ki\u0161ib checks they give the key its homes serve. Never the chain key\u2019s words.</p>${idField("id", "The identity")}${address}${words("words", "Its signing key\u2019s 24 words")}<div class="k-row"><button type="submit" class="k-btn k-p">Keep it here</button><span class="k-small k-faint">kept while the runner is on, encrypted</span></div></form>`;
}
function memberAsks(r) {
  return r.memberAsks.map(
    (x) => `<div class="kishib-wait" data-member-ask="${e(x.id)}"><h3>${e(x.app)} asks Ki\u0161ib to hold ${who({ id: x.identity, inline: true })}\u2019s key for a collective</h3><p class="k-small k-soft">The collective ${who({ id: x.collective, form: x.form, collective: true, inline: true })} \xB7 asked ${e(when2(x.at))}. Ki\u0161ib opens the key sealed to ${e(x.name ?? "this identity")} at its homes and keeps it here, encrypted. Acting as the collective, ${e(x.app)} then asks, and Ki\u0161ib\u2019s panel shows each act before Ki\u0161ib signs it; the key never goes to ${e(x.app)}.</p>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="member-answer" data-ask="${e(x.id)}" data-yes="1">Add it</button><button type="button" class="k-btn k-q" data-action="member-answer" data-ask="${e(x.id)}" data-yes="0">Refuse</button></div></div>`
  ).join("");
}
var OPEN_WORDS = "may open what is sealed to this identity";
var openSay = (app2) => `Chosen for each identity (decided: \u201Cper identity, per app\u201D). ${app2} then reads the private messages sent to that identity, and its sealed contacts list, through Ki\u0161ib, without a panel each time (an opening signs nothing; Ki\u0161ib returns the act and the key of that one act, never the identity\u2019s keys). Each opening is listed in Signed. Revoke ${app2}, and it ends.`;
var need = (app2, n) => n.opening ? `<p class="k-small k-soft kishib-need" data-need="opening">${e(app2)} says it needs this \u201C${e(n.opening.why)}\u201D; without it, \u201C${e(n.opening.without)}\u201D.</p>` : "";
function runnerApps(r) {
  if (!r?.on) return notOn(r, "Apps", "The runner is off: no app is paired. Turn it on first (On or off).");
  const name = (id) => who({ id, inline: true });
  const waiting = r.apps.filter((a) => a.state === "waiting").map(
    (a) => `<div class="kishib-app" data-pairing="${e(a.id)}"><h3>${e(a.name)} asks to pair</h3><p class="k-small k-soft">From ${e(a.origin)}, on this computer. Its code: <b class="kishib-fpr">${e(a.code)}</b>: approve only if ${e(a.name)} shows the same.</p>
<p class="k-small">The identities ${e(a.name)} may use through Ki\u0161ib, and, for each, whether ${e(a.name)} ${OPEN_WORDS}:</p>${r.held.map((h) => `<div class="k-row kishib-allow"><label class="kishib-check k-grow"><input type="checkbox" name="allow" value="${e(h.id)}" checked> ${who({ id: h.id, form: h.form, inline: true })}</label><label class="kishib-check"><input type="checkbox" name="open" value="${e(h.id)}"> ${OPEN_WORDS}</label></div>${need(a.name, a.needs)}`).join("") || '<p class="k-small k-soft">Ki\u0161ib holds no identity yet: give one first (Runner, Add an identity to the runner).</p>'}
<p class="k-small k-faint">Opening is off unless chosen. ${e(openSay(a.name))} Without it, ${e(a.name)} sends private messages as that identity but cannot read the answers.</p>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="approve" data-pairing="${e(a.id)}">Approve</button><button type="button" class="k-btn k-q" data-action="refuse" data-pairing="${e(a.id)}">Refuse</button></div></div>`
  ).join("");
  const kinds = r.kinds;
  const approved = r.apps.filter((a) => a.state === "approved").map((a, i) => ({ a, i })).sort((x, y) => (y.a.approved ?? 0) - (x.a.approved ?? 0) || y.i - x.i).map(({ a }) => a).map(
    (a) => `<div class="kishib-app" data-app="${e(a.id)}"><div class="k-row"><div class="k-grow"><h3>${e(a.name)}</h3><span class="k-small k-faint">${e(a.origin)} \xB7 paired ${a.approved ? e(when2(a.approved)) : ""}</span></div><button type="button" class="k-btn k-alarm" data-action="revoke" data-pairing="${e(a.id)}">Revoke</button></div>
<p class="k-small k-soft">Signs as ${a.identities.map(name).join(", ") || "no identity"}.</p>
<div class="kishib-kinds">${kinds.filter((k) => !k.always).map((k) => `<div><span>${e(a.name)} \xB7 ${e(k.name)}</span><span class="k-r kishib-seg" role="group"><button type="button" class="${a.yes.includes(k.kind) ? "" : "k-on"}" data-action="yes" data-pairing="${e(a.id)}" data-kind="${k.kind}" data-on="0">Ask</button><button type="button" class="${a.yes.includes(k.kind) ? "k-on" : ""}" data-action="yes" data-pairing="${e(a.id)}" data-kind="${k.kind}" data-on="1">Yes</button></span></div>`).join("")}<div><span class="k-soft">Money acts, agreements, relying on another\u2019s act, keys, and acts Ki\u0161ib cannot read</span><span class="k-r k-small k-faint">always ask</span></div>
${a.identities.map(
      (id) => `<div data-open="${e(a.id)}" data-identity="${e(id)}"><span>${e(a.name)} ${e(OPEN_WORDS).replace("this identity", name(id))}</span><span class="k-r kishib-seg" role="group"><button type="button" class="${a.opens.includes(id) ? "" : "k-on"}" data-action="opening" data-pairing="${e(a.id)}" data-identity="${e(id)}" data-on="0">No</button><button type="button" class="${a.opens.includes(id) ? "k-on" : ""}" data-action="opening" data-pairing="${e(a.id)}" data-identity="${e(id)}" data-on="1">Yes</button></span></div>${need(a.name, a.needs)}`
    ).join("")}</div>
<p class="k-small k-faint">${a.opens.length ? e(openSay(a.name)) : `${e(a.name)} sends private messages as these identities but cannot read the answers.`}</p></div>`
  ).join("");
  return `<h2>Apps</h2><p class="k-soft k-small">Each app paired with the runner: what it may sign without asking (a standing yes, per kind), what always asks, and whether it may have what is sealed to its identities opened. Revoke, and the app signs and opens through Ki\u0161ib no more.</p>${waiting}${approved || (waiting ? "" : '<p class="k-soft">No app is paired. In Dub, the identity panel: + Add, Use one from Ki\u0161ib.</p>')}`;
}
function runnerWaiting(r) {
  if (!r?.on) return notOn(r, "Waiting", "The runner is off.");
  const ws = r.waiting.map(
    (w) => `<div class="kishib-wait" data-request="${e(w.request)}"><h3>${e(w.title)}</h3><p class="k-small k-soft">${w.as ? said(w.as) : `As ${who({ id: w.identity, inline: true })}`} \xB7 asked ${e(when2(w.at))}</p><div class="kishib-review">${w.words.map((x) => `<p dir="auto">${said(x)}</p>`).join("")}</div>
${w.always ? '<p class="k-small k-faint">Money, agreements, relying on another\u2019s act, and keys always ask.</p>' : `<label class="kishib-check"><input type="checkbox" data-always="${e(w.request)}"> Always yes for ${e(w.app)}\u2019s ${e(r.kinds.find((k) => k.kind === w.kind)?.name ?? w.kind)}</label>`}
<div class="k-row"><button type="button" class="k-btn k-p" data-action="answer" data-yes="1" data-request="${e(w.request)}">Sign it</button><button type="button" class="k-btn k-q" data-action="answer" data-yes="0" data-request="${e(w.request)}">Decline</button></div></div>`
  ).join("");
  return `<h2>Waiting</h2><p class="k-soft k-small">Requests not answered yet, in case their panel was closed in the app. Each waits ten minutes; the app that asked still waits for its answer.</p>${memberAsks(r)}${ws || (r.memberAsks.length ? "" : '<p class="k-soft">Nothing waits.</p>')}`;
}
function runnerSigned(r) {
  if (!r?.on) return notOn(r, "Signed", "The runner is off: it keeps no record.");
  return `<h2>Signed</h2><p class="k-soft k-small">Every act the runner signed, and everything it opened for an app, newest first; kept, encrypted, until the runner is turned off.</p><div class="k-feedwrap"><div class="k-feed" id="signed">${r.signed.length ? "" : '<p class="k-empty">Nothing signed yet.</p>'}</div></div>`;
}
function sections(ss) {
  return ss.map((s) => `<h3>${said(s.heading)}</h3>${lines(s.lines)}`).join("");
}
function review(r, mustRead, change) {
  const blocked = r.blocking.length > 0;
  const must = mustRead ? r.sections[0] : null;
  const rest = mustRead ? r.sections.slice(1) : r.sections;
  return `${change ? steps(1) : ""}<h2>${said(r.title)}</h2>
${r.summary.map((s) => `<p class="k-small k-soft">${said(s)}</p>`).join("")}
${must ? `<div class="kishib-must" id="mustread"><h3>${said(must.heading)}</h3>${lines(must.lines)}<label class="kishib-check"><input type="checkbox" id="read-it"> I have read this, and chosen this device knowingly</label></div>` : ""}
<div class="kishib-review">${sections(rest)}</div>
${blocked ? note("error", `Nothing can be signed yet:${lines(r.blocking.map((t) => ({ text: t, tone: "bad" })))}`) : ""}
${r.warning ? `<div class="k-alarmbox">${said(r.warning)}<label class="kishib-check"><input type="checkbox" id="warned"> I have read this: go on as it says</label></div>` : ""}
<div class="kishib-signs"><span class="k-small k-faint">What is signed</span>${r.signs.map((s) => `<p>${said(s)}</p>`).join("")}</div>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="sign" ${blocked ? "disabled" : ""}>Sign it</button><button type="button" class="k-btn k-q" data-action="forget">Cancel, and forget the words</button></div>`;
}
function wordsShown(ws, say22, label, step) {
  return `${step !== null ? steps(step) : ""}<h2>${e(label)}</h2>${say22.map((s) => `<p class="k-small k-soft">${e(s)}</p>`).join("")}
<div class="k-words" id="words">${ws.map((w, i) => `<span><b>${i + 1}.</b>${e(w)}</span>`).join("")}</div>
<div class="k-row"><button type="button" class="k-btn k-p" data-action="written">I have written them down</button></div>`;
}
function askBack(positions, step) {
  return `${step !== null ? steps(step) : ""}<h2>Three of the words, from your paper</h2><p class="k-small k-soft">The words are hidden. Type the ones asked, from what you wrote.</p>
<form id="typed"><div class="kishib-typed">${positions.map((p) => `<label>Word ${p}<input name="w${p}" autocomplete="off" spellcheck="false" required></label>`).join("")}</div>
<div class="k-row"><button type="submit" class="k-btn k-p">Check</button><button type="button" class="k-btn k-q" data-action="show words">Show them again</button></div></form>`;
}
function sitting(s) {
  const btn = (action, label, primary = false, extra = "") => `<button type="button" class="k-btn${primary ? " k-p" : ""}" data-action="${action}"${extra}>${label}</button>`;
  const q = s.request;
  const req = q ? `<div class="kishib-review" id="request-state">${q.room ? `<p>${q.have} of ${q.need} paper shares are in, typed here.</p>` : `<p>Fingerprint of this rotation</p><p class="kishib-fpr">${e(q.fingerprint)}</p><p class="kishib-full">${e(q.full)}</p><p>${q.have} of ${q.need} shares are in. The one-time key expires at ${e(when2(q.expires))} (this device\u2019s clock).</p>`}</div>` : "";
  const acts = [];
  if (s.stage === "sent") acts.push(btn("refresh", "Look again"), btn("resend", "Send it again (the same bytes)", true));
  if (s.stage === "request") acts.push(btn("nakisib write", "Write the request for Naki\u0161ib", true));
  const answer = s.stage === "request" ? `<form id="nakisib-answer" class="k-box k-fill" autocomplete="off"><label>Naki\u0161ib\u2019s answer (the file it wrote on the USB stick)</label><input name="answer" type="file" required><div class="k-row"><button type="submit" class="k-btn k-p">Read Naki\u0161ib\u2019s answer</button><span class="k-small k-faint">checked to be exactly this change before anything is sent</span></div></form>` : "";
  if (s.stage === "paper") acts.push(btn("show words", s.kind === "make" ? "Show the chain key\u2019s words (its paper)" : "Show the new chain key\u2019s words (a new paper)", true));
  if (s.stage === "counts" && s.kind !== "confirm") acts.push(btn("show words", s.kind === "collective" ? "Show the collective\u2019s new signing key\u2019s words" : s.kind === "make" ? "Show its signing key\u2019s words" : "Show the new signing key\u2019s words", true));
  if (s.stage === "shown") acts.push(btn("show words", "Show them again"));
  if (s.stage === "waiting" && q) {
    if (!q.room) acts.push(btn("gather", "Look for the members\u2019 shares", q.have < q.need));
    if (q.have >= q.need) acts.push(btn("rotate collective", "Rebuild, rotate and deal now", true));
  }
  const paper = s.stage === "waiting" && q?.room && q.have < q.need ? `<form id="paper"><label>The next share\u2019s number</label><input name="number" type="text" inputmode="numeric" autocomplete="off" required>${words("words", "Its 24 words")}<div class="k-row"><button type="submit" class="k-btn k-p">Add this paper</button></div></form>` : "";
  const shares = s.shares?.length ? `<h3>New shares to show here, once each</h3><ul class="kishib-lines">${s.shares.map((x) => `<li>Share ${x.x}, for ${who({ id: x.holder, inline: true })}: ${x.shown ? "written down, forgotten here" : btn("show share", "Show it", false, ` data-holder="${e(x.holder)}"`)}</li>`).join("")}</ul>` : "";
  const done = s.stage === "done" || s.stage === "expired";
  const step = s.kind === "identity" ? { paper: 2, sent: 3, counts: 4, shown: s.words === "signing" ? 4 : 2, done: 5 }[s.stage] : void 0;
  const made = s.kind === "make" && s.id && s.link ? `<div class="kishib-review" id="made-id"><p class="k-small k-soft">Its ID, to give to whoever may write to it, or to bring it into the apps:</p>${ownId({ form: idForm2(s.id), link: s.link })}</div>` : "";
  return `${step !== void 0 ? steps(step) : ""}<h2>${said(s.title)}</h2>${req}<div class="kishib-review">${lines(s.lines)}</div>${made}${paper}${shares}
<div class="k-row">${acts.join("")}${done && !(s.shares ?? []).some((x) => !x.shown) ? btn("forget", "Done", true) : ""}</div>${answer}`;
}
var tabOf = (s) => s.kind === "make" || s.kind === "confirm" ? "identities" : s.kind === "collective" ? "collectives" : "paper";
function pairing() {
  return `${top({ left: appMark(NAME2, "icon.png"), right: "" })}<div class="k-body kishib-door"><div class="k-box"><h2>Pair this browser</h2>
<p class="k-small k-soft">This page acts for the Ki\u0161ib program running on this machine. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="k-row"><input id="pair-code" class="k-grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit" class="k-btn k-p">Pair</button></form><div id="pair-status"></div></div></div>`;
}
function alone(html) {
  return `${top({ left: appMark(NAME2, "icon.png"), right: "" })}<div class="k-body kishib-door"><div class="k-box">${html}</div></div>`;
}
function quitDone(off) {
  return `<div class="k-body"><div class="k-box" id="quit-done"><h2>Ki\u0161ib has quit</h2><p class="k-soft">Its program has ended${off ? "" : ", and the runner is locked"}. Open Ki\u0161ib again from your Applications (or its seal in the menu bar).</p></div></div>`;
}

// src/page/ui.ts
function mount(app2, b) {
  const $ = (id) => document.getElementById(id);
  app2.classList.add("k-page", "k-kishib");
  let state = null;
  let runner = null;
  let tab = null;
  let part2 = null;
  let door2 = null;
  let current = null;
  const popup2 = new Popup(app2);
  attachClosing();
  const errorOf = (err) => err instanceof Error ? err.message : String(err);
  const fail = (err) => {
    if (b.unpaired?.(err)) {
      app2.innerHTML = pairing();
      return;
    }
    const s = $("status") ?? $("result");
    const html = note("error", said(errorOf(err)));
    if (s) {
      s.innerHTML = html;
      s.scrollIntoView({ block: "nearest" });
    } else app2.insertAdjacentHTML("beforeend", `<div id="status" class="k-status">${html}</div>`);
  };
  const done = (html) => {
    const s = $("status");
    if (s) s.innerHTML = note("done", html);
  };
  const tell = (kind, html) => {
    const s = $("status");
    if (s) s.innerHTML = note(kind, html);
    else app2.insertAdjacentHTML("beforeend", `<div id="status" class="k-status">${note(kind, html)}</div>`);
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
  function draw(pane) {
    const r = b.web ? null : runner;
    if (!tab) {
      app2.innerHTML = home(b.web, r);
      return;
    }
    if ((tab === "paper" || tab === "collectives") && door2 !== tab && !state?.sitting) {
      app2.innerHTML = door(b.web, tab, r);
      return;
    }
    app2.innerHTML = tabPage(b.web, tab, part2, pane ?? part(tab, part2 ?? "", b.web, r), r);
    if (tab === "runner" && part2 === "signed") drawSigned();
    void notices();
  }
  async function notices() {
    const box = app2.querySelector("#notices[data-auto]");
    if (!box) return;
    const r = await b.ask("collective notices", {}).catch((err) => ({ notices: [], problem: errorOf(err) }));
    if (box.isConnected) box.innerHTML = `<h3>Rotations waiting for you</h3>${noticesList(r.notices, r.problem)}`;
  }
  async function show(s) {
    state = s;
    current = null;
    if (s.runner) runner = s.runner;
    setUnits(s.units);
    const st = s.sitting;
    if (st) {
      tab = tabOf(st);
      door2 = tab;
      if (st.stage === "shown" && st.positions) return draw(askBack(st.positions, st.kind === "identity" ? st.words === "signing" ? 4 : 2 : null));
      return draw(sitting(st));
    }
    draw();
  }
  function openTab(t) {
    if (state?.sitting && tabOf(state.sitting) !== t && state.sitting.stage !== "done") {
      tab = tabOf(state.sitting);
      void show(state);
      return fail(new Error("Ki\u0161ib is in the middle of an act: finish it, or forget it (Cancel), first. One act at a time."));
    }
    tab = t;
    part2 = firstPart(t, runner, b.web);
    if (door2 !== t) door2 = null;
    draw();
  }
  const drawn = /* @__PURE__ */ new Map();
  const label = (text2) => ({ text: text2, html: said(text2) });
  function drawSigned() {
    const box = $("signed");
    if (!box || !runner) return;
    drawn.clear();
    box.innerHTML = runner.signed.map((s) => {
      const form2 = actFormOf(s.identity, "mid");
      const at = `${new Date(s.at * 1e3).toISOString().replace("T", " ").slice(0, 16)} UTC`;
      const kind = runner.kinds.find((k) => k.kind === s.kind)?.name ?? s.kind;
      const a = {
        id: s.opened && s.sealed ? s.sealed : s.act,
        form: actFormOf(s.act),
        signer: { id: s.identity, form: form2, link: form2, name: s.name, me: true },
        kind: s.opened ? `${s.app} \xB7 opened \xB7 ${kind}` : `${s.app} \xB7 ${kind}`,
        // H121: the IDs in its words, each a tap showing it whole.
        html: `<div class="k-txt" dir="auto">${s.words.map(said).join(" ")}</div>`,
        labels: [label(s.opened ? `opened, nothing signed \xB7 ${s.times === 1 ? "once" : `${s.times} times`} \xB7 last ${at}` : `${s.lane ? "signed without asking: a lane\u2019s record, to the identity itself" : s.standing ? "signed without asking" : "asked, and signed"} \xB7 ${s.as ? `as the collective ${actFormOf(s.as, "mid")}, with its member key` : s.line === "apart" ? "on a line of its own" : `${s.app}\u2019s ${s.line} line, position ${s.position}`} \xB7 ${at}`)],
        verified: false
      };
      drawn.set(a.id, { act: a, s });
      return card(a);
    }).join("");
    const ids = cardsUntimed(box);
    if (ids.length)
      void b.ask("clock words", { ids }).then((w) => box.isConnected && stampCards(box, w)).catch(() => void 0);
  }
  attachCards(app2, {
    app: "Ki\u0161ib",
    signs: false,
    act: (id) => drawn.get(id)?.act,
    signerItems: () => [],
    actItems: () => ({ before: [], after: [] }),
    async choose(key, a) {
      const s = drawn.get(a.id)?.s;
      if (!s) return;
      if (key === "profile") return openRecord(a.signer.form);
      if (key === "why" && s.opened) {
        popup2.show("An opening", `${lines([{ text: `Ki\u0161ib opened, for ${s.app}, what was sealed to this identity: ${s.times === 1 ? "once" : `${s.times} times`}. An opening signs nothing; ${s.app} reads the act inside, not the identity\u2019s key.` }])}<div class="kishib-review">${s.words.map((w) => `<p dir="auto">${said(w)}</p>`).join("")}</div>`);
        return;
      }
      if (key === "why") {
        const body = popup2.show("Why it\u2019s valid", `<p class="k-small k-soft">Reading its standing at its homes\u2026</p>`);
        const r = await b.ask("runner standing", { act: s.act, identity: s.identity }).catch((e3) => ({ lines: [{ text: errorOf(e3), tone: "warn" }] }));
        if (body.isConnected) popup2.replace(`${lines(r.lines)}<div class="kishib-review">${s.words.map((w) => `<p dir="auto">${said(w)}</p>`).join("")}</div>`);
      }
    }
  });
  function openRecord(form2) {
    tab = "identities";
    part2 = "record";
    draw();
    const f = app2.querySelector("#form-record");
    if (f) f.elements.namedItem("id").value = form2;
  }
  attachIds(app2, {
    names: (ids, fresh) => b.ask("names", { ids, fresh: !!fresh }),
    profile: (id) => openRecord(idFormOf(id))
  });
  attachContacts(app2, { app: "Ki\u0161ib", ask: (op, a) => b.ask(op, a), profile: (id) => openRecord(idFormOf(id)), said: tell, readOnly: "Shown here, changed in Dub, Damgar, Edubba or Ummia: changing them signs an act, and Ki\u0161ib signs only for the apps paired with it." });
  attachColumn(app2, async (key) => {
    part2 = key;
    const runnerTab = tab === "runner";
    if (runnerTab && !b.web) runner = await b.ask("runner state").catch(() => null) ?? runner;
    if (part2 !== key) return;
    if (runnerTab) return draw();
    const pane = $("pane");
    if (pane && tab) pane.innerHTML = part(tab, key, b.web, b.web ? null : runner);
    const st = $("status");
    if (st) st.innerHTML = "";
    if (tab === "runner" && key === "signed") drawSigned();
    void notices();
  });
  const values = (form2) => {
    const out = {};
    for (const el of Array.from(form2.elements)) {
      if (!el.name || el.name === "allow") continue;
      out[el.name] = el.type === "checkbox" ? el.checked : el.value;
    }
    return out;
  };
  const clear = (form2) => Array.from(form2.elements).forEach((el) => (el.tagName === "TEXTAREA" || el.type === "password") && (el.value = ""));
  const fileB64 = async (el) => {
    const f = el.files?.[0];
    if (!f) return "";
    const b2 = new Uint8Array(await f.arrayBuffer());
    let t = "";
    for (const x of b2) t += String.fromCharCode(x);
    return btoa(t);
  };
  const withFiles = async (form2, a) => {
    for (const el of Array.from(form2.querySelectorAll("input[type=file]"))) a[el.name] = await fileB64(el);
    return a;
  };
  async function saveFile(name, b644) {
    const bytes = Uint8Array.from(atob(b644), (c) => c.charCodeAt(0));
    const w = window;
    if (w.showSaveFilePicker) {
      try {
        const h = await w.showSaveFilePicker({ suggestedName: name });
        const out = await h.createWritable();
        await out.write(bytes);
        await out.close();
        return;
      } catch {
      }
    }
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e4);
  }
  const PLANS = { nakisib: "nakisib plan", rotate: "rotate plan", escape: "escape plan", confirm: "confirm plan", start: "collective start", give: "collective give", make: "make plan" };
  function showReview(r, kind) {
    current = { review: r, must: kind === "start" };
    const pane = $("pane");
    if (pane) pane.innerHTML = review(r, current.must, kind === "rotate");
    pane?.scrollTo?.(0, 0);
  }
  app2.addEventListener("submit", async (ev) => {
    const form2 = ev.target;
    const id = form2.getAttribute("id") ?? "";
    if (id === "pair") return;
    ev.preventDefault();
    const a = values(form2);
    if (form2.classList.contains("kishib-renew")) {
      const r = await act(() => b.ask("runner give", { id: a.id, address: a.address, words: a.words }));
      if (!r) return;
      runner = r;
      draw();
      return done("The new signing key\u2019s words are taken: the runner signs for this identity again, with its new key.");
    }
    await withFiles(form2, a);
    if (id === "form-notices") {
      const r = await act(() => b.ask("collective notices", { member: a.member, address: a.address, words: a.words }));
      clear(form2);
      const list3 = $("notices-list");
      if (r && list3) list3.innerHTML = noticesList(r.notices, r.problem);
      return;
    }
    if (id === "nakisib-answer" || id === "nakisib-late") {
      const s = await act(() => b.ask("nakisib answer", a));
      if (s) await show({ ...s, runner: runner ?? void 0 });
      return;
    }
    const kind = form2.dataset.kind ?? "";
    switch (kind) {
      case "check":
      case "record": {
        const r = await act(() => b.ask(kind === "check" ? "check words" : "record", a));
        if (!r) return;
        clear(form2);
        $("result").innerHTML = `<div class="kishib-review" id="answer"><h3>${said(r.title)}</h3>${r.lines ? lines(r.lines) : sections(r.sections ?? [])}</div>`;
        return;
      }
      case "checkshare": {
        const more = String(a.more ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => /^(\d+)\s+(.*)$/.exec(l) ?? [l, "", l]);
        const r = await act(() => b.ask("check share", { collective: a.collective, address: a.address, numbers: [a.number, ...more.map((m) => m[1])], shares: [a.shareWords, ...more.map((m) => m[2])] }));
        if (!r) return;
        clear(form2);
        $("result").innerHTML = `<div class="kishib-review" id="answer"><h3>${said(r.title)}</h3>${lines(r.lines)}</div>`;
        return;
      }
      case "unlock": {
        const r = await act(() => b.ask("runner unlock", { passphrase: a.passphrase, again: a.again }));
        clear(form2);
        if (!r) return;
        runner = r;
        draw();
        return done("Unlocked: the runner\u2019s keys, apps and log are back. The apps paired sign through it again; none pairs again.");
      }
      case "give-runner": {
        const r = await act(() => b.ask("runner give", a));
        if (!r) return;
        runner = r;
        draw();
        const typed = String(a.id ?? "").trim();
        const h = r.held.find((x) => x.id === typed || x.form === typed || typed.startsWith(`${x.form}?`));
        return done(`Kept by the runner, on this Mac: approve it for an app in Runner, Apps.${h ? `<p class="k-small k-soft">Its ID, to give to whoever may write to it:</p>${ownId({ form: h.form, link: h.link })}` : ""}`);
      }
      default:
        if (PLANS[kind]) {
          const r = await act(() => b.ask(PLANS[kind], { ...a, ...a.room === "1" ? { room: true } : {} }));
          if (!r) return;
          clear(form2);
          return showReview(r, kind);
        }
    }
    if (id === "typed") {
      const typed = Object.keys(a).sort((x, y) => Number(x.slice(1)) - Number(y.slice(1))).map((k) => String(a[k]));
      const s = await act(() => b.ask("words typed", { typed }));
      if (s) await show({ ...s, runner: runner ?? void 0 });
      return;
    }
    if (id === "paper") {
      const s = await act(() => b.ask("collective paper", a));
      if (s) await show({ ...s, runner: runner ?? void 0 });
    }
  });
  app2.addEventListener("click", async (ev) => {
    const t = ev.target;
    const tile = t.closest("[data-k-tile]");
    if (tile) return openTab(tile.dataset.kTile);
    const tb = t.closest("[data-tab]");
    if (tb) return openTab(tb.dataset.tab);
    const el = t.closest("[data-action]");
    if (!el) return;
    const d = el.dataset;
    const again = async (s) => s && show({ ...s, runner: runner ?? void 0 });
    switch (d.action) {
      case "home-tiles":
        if (state?.sitting && state.sitting.stage !== "done") return fail(new Error("Ki\u0161ib is in the middle of an act: finish it, or forget it (Cancel), first."));
        tab = null;
        part2 = null;
        door2 = null;
        return draw();
      // H89: top right shows what Kišib holds and the runner's state, as in every app; it opens the runner, where identities are added.
      case "holds":
        return openTab(b.web ? "identities" : "runner");
      case "runner-add":
        tab = "runner";
        part2 = "add";
        return draw();
      case "open-door":
        door2 = tab;
        return draw();
      case "forget": {
        const s = await act(() => b.ask("forget"));
        if (s) {
          state = { ...s, runner: runner ?? void 0 };
          current = null;
          draw();
        }
        return;
      }
      // H97: a rotation listed, tapped: the form filled in from its notice, then the rotation read from its request, checked against the collective's chain (2.3).
      case "notice-pick": {
        const f = app2.querySelector("#form-give");
        if (!f) return;
        const set = (name, value) => {
          const el2 = f.elements.namedItem(name);
          if (el2) el2.value = value;
        };
        set("collective", d.collective ?? "");
        set("fingerprint", d.fingerprint ?? "");
        set("address", d.relays ?? "");
        set("number", d.share ?? "");
        set("member", d.member ?? "");
        f.querySelector('[data-action="read request"]')?.click();
        f.querySelector('[name="shareWords"]')?.scrollIntoView({ block: "center" });
        return;
      }
      case "read request": {
        const form2 = t.closest("form");
        const a = values(form2);
        const r = await act(() => b.ask("collective read", { collective: a.collective, fingerprint: a.fingerprint, address: a.address }));
        if (r) $("request").innerHTML = `<div class="kishib-review"><h3>${said(r.title)}</h3>${sections(r.sections)}</div>`;
        return;
      }
      case "sign": {
        if (!current) return;
        if (current.must && !$("read-it")?.checked) return fail(new Error("Read what this device will hold, and say so, before anything is done."));
        const warned = current.review.warning ? $("warned")?.checked ? current.review.warning : void 0 : void 0;
        if (current.review.warning && !warned) return fail(new Error("A line of acts would be left out, or cannot be placed: read the warning in red and tick it, or go back and give its card."));
        return again(await act(() => b.ask("confirm", { plan: current.review.plan, digest: current.review.digest, ...warned ? { warned } : {} })));
      }
      case "nakisib write": {
        const r = await act(() => b.ask("nakisib request"));
        if (!r) return;
        await saveFile(r.name, r.bytes);
        return done(`The request is written (${e(r.name)}): carry it to the offline Mac, and open it in Naki\u0161ib, \u201CChange keys\u201D. Its new signing key\u2019s fingerprint, which Naki\u0161ib shows too: ${e(r.fingerprint)}.`);
      }
      case "refresh":
      case "resend":
      case "gather":
      case "rotate collective": {
        const op = d.action === "gather" ? "collective gather" : d.action === "rotate collective" ? "collective rotate" : d.action;
        return again(await act(() => b.ask(op)));
      }
      case "show words": {
        const w = await act(() => b.ask("words show"));
        if (!w) return;
        const st = state?.sitting;
        const label2 = w.holder ? "The collective\u2019s new signing key\u2019s words" : st?.kind === "make" ? w.which === "chain" ? "Its chain key\u2019s words: its first paper" : "Its signing key\u2019s words" : w.which === "chain" ? "Write a new chain-key paper" : "The new signing key\u2019s words";
        const pane = $("pane");
        if (pane) pane.innerHTML = wordsShown(w.words, w.say, label2, st?.kind === "identity" ? w.which === "chain" ? 2 : 4 : null);
        return;
      }
      case "written": {
        if (app2.querySelector("#words[data-share]")) {
          const holder = app2.querySelector("#words").dataset.share;
          return again(await act(() => b.ask("collective share written", { holder })));
        }
        return again(await act(() => b.ask("words written")));
      }
      case "show share": {
        const holder = d.holder;
        const r = await act(() => b.ask("collective share", { holder }));
        if (!r) return;
        const pane = $("pane");
        if (pane) {
          pane.innerHTML = wordsShown(r.words, [...r.say, `Share number ${r.x}. The new dealing\u2019s fingerprint: ${r.fingerprint}.`], `New share ${r.x} of the collective\u2019s chain key`, null);
          pane.querySelector("#words").setAttribute("data-share", holder);
        }
        return;
      }
      // ------------------------------------------------ the runner (the program only)
      case "runner-on-ask":
        $("risk")?.scrollIntoView({ block: "center" });
        return $("risk-read")?.focus();
      case "runner-on": {
        if (!$("risk-read")?.checked) return fail(new Error("Read the risk, and tick it, before the runner is turned on. It stays off."));
        const pass = $("runner-pass");
        const again2 = $("runner-pass-again");
        const r = await act(() => b.ask("runner on", { read: true, passphrase: pass?.value ?? "", again: again2?.value ?? "" }));
        if (pass) pass.value = "";
        if (again2) again2.value = "";
        if (!r) return;
        runner = r;
        draw();
        return done("The runner is on, its file encrypted under your passphrase. Give it an identity (Runner, Add an identity to the runner), then pair an app: in Dub, the identity panel, + Add, Use one from Ki\u0161ib.");
      }
      case "quit": {
        if (!await ask(app2, { title: "Quit Ki\u0161ib?", text: "Its program ends, and the runner, if on, is locked: the apps sign through it no more until Ki\u0161ib is opened again and its passphrase given. Nothing is erased.", yes: "Quit Ki\u0161ib" })) return;
        const r = await act(() => b.ask("quit"));
        if (!r) return;
        app2.innerHTML = quitDone(runner?.state === "off");
        return;
      }
      case "runner-lock": {
        const r = await act(() => b.ask("runner lock"));
        if (!r) return;
        runner = r;
        draw();
        return done("Locked: the runner signs and opens nothing until its passphrase is given again. Nothing was erased.");
      }
      // H90: Off, or the button below it, asks the same question in the page (never the browser's own dialog), then turns it off.
      case "runner-off-ask":
      case "runner-off": {
        if (!await ask(app2, { title: "Turn the runner off?", text: "It erases everything: every signing key it holds, every app paired with it, and what it signed and opened. The apps stop signing through it. Turned on again, it starts from nothing.", yes: "Turn it off, and erase everything", alarm: true })) return;
        const r = await act(() => b.ask("runner off"));
        if (!r) return;
        runner = r;
        draw();
        return done("The runner is off: every key, pairing and record it held is erased, its file overwritten and removed.");
      }
      case "approve": {
        const box = t.closest(".kishib-app");
        const identities = [...box.querySelectorAll('input[name="allow"]:checked')].map((x) => x.value);
        const opens = [...box.querySelectorAll('input[name="open"]:checked')].map((x) => x.value).filter((x) => identities.includes(x));
        const r = await act(() => b.ask("runner approve", { pairing: d.pairing, identities, opens }));
        if (r) {
          runner = r;
          draw();
          app2.querySelector(`[data-app="${CSS.escape(d.pairing)}"]`)?.scrollIntoView({ block: "nearest" });
          done("Approved: the app may now use the identities chosen, each act shown in Ki\u0161ib\u2019s panel inside its window. Its setting up is here, below.");
        }
        return;
      }
      case "refuse":
      case "revoke": {
        if (d.action === "revoke" && !await ask(app2, { title: "Revoke this app?", text: "It signs through Ki\u0161ib no more, and what waits from it is dropped.", yes: "Revoke it" })) return;
        const r = await act(() => b.ask("runner revoke", { pairing: d.pairing }));
        if (r) {
          runner = r;
          draw();
        }
        return;
      }
      case "yes": {
        const r = await act(() => b.ask("runner yes", { pairing: d.pairing, kind: d.kind, on: d.on === "1" }));
        if (r) {
          runner = r;
          draw();
        }
        return;
      }
      case "member-answer": {
        const r = await act(() => b.ask("runner member answer", { ask: d.ask, yes: d.yes === "1" }));
        if (r) {
          runner = r;
          draw();
          if (d.yes === "1") done("Kept: Ki\u0161ib holds this identity\u2019s key for the collective, encrypted. The app acts as the collective through Ki\u0161ib\u2019s panel.");
        }
        return;
      }
      case "member-remove": {
        if (!await ask(app2, { title: "Forget this collective\u2019s key here?", text: "The app using the identity through Ki\u0161ib can no longer act as the collective. The key itself stays sealed to the identity at its homes.", yes: "Forget it here" })) return;
        const r = await act(() => b.ask("runner member remove", { identity: d.id, collective: d.collective }));
        if (r) {
          runner = r;
          draw();
        }
        return;
      }
      case "opening": {
        const r = await act(() => b.ask("runner opening", { pairing: d.pairing, identity: d.identity, on: d.on === "1" }));
        if (r) {
          runner = r;
          draw();
        }
        return;
      }
      case "answer": {
        const always = !!app2.querySelector(`[data-always="${CSS.escape(d.request)}"]`)?.checked;
        const r = await act(() => b.ask("runner answer", { request: d.request, yes: d.yes === "1", always }));
        if (r) {
          runner = r;
          draw();
          done(d.yes === "1" ? "Signed: the app that asked has its signature." : "Declined: nothing was signed.");
        }
        return;
      }
      case "held-record": {
        const h = runner?.held.find((x) => x.id === d.id);
        const r = await act(() => b.ask("record", { id: d.id, address: h?.homes[0] ?? "" }));
        if (r) popup2.show(r.title, sections(r.sections));
        return;
      }
      case "held-remove": {
        if (!await ask(app2, { title: "Remove this identity from the runner?", text: "Ki\u0161ib forgets its signing key; the apps using it through Ki\u0161ib stop signing as it. The identity itself is not touched.", yes: "Remove it" })) return;
        const r = await act(() => b.ask("runner remove", { id: d.id }));
        if (r) {
          runner = r;
          draw();
        }
        return;
      }
      case "runner-cards": {
        const form2 = t.closest("form");
        const id = form2.elements.namedItem("id").value.trim();
        const r = await act(() => b.ask("runner cards", { id }));
        if (!r) return;
        const area = form2.elements.namedItem("cards");
        if (!r.cards) return fail(new Error("Ki\u0161ib\u2019s runner signed no line for this identity under its current key (or does not hold it)."));
        area.value = [area.value.trim(), ...r.cards.split("; ")].filter(Boolean).join("\n");
        return;
      }
    }
  });
  if (!b.web) {
    let missed = 0;
    setInterval(async () => {
      if (document.hidden || !runner || app2.querySelector("#quit-done")) return;
      let r;
      try {
        r = await b.ask("runner state");
        missed = 0;
      } catch (err) {
        if (b.unpaired?.(err)) return;
        if (++missed >= 2) app2.innerHTML = quitDone(runner.state === "off");
        return;
      }
      if (r.state !== runner.state) {
        runner = r;
        popup2.close();
        draw();
        return;
      }
      if (!runner.on) return;
      const changed = JSON.stringify([r.apps, r.waiting, r.signed.length, r.held, r.memberAsks]) !== JSON.stringify([runner.apps, runner.waiting, runner.signed.length, runner.held, runner.memberAsks]);
      runner = r;
      if (!changed) return;
      if (tab === "runner" && part2 !== "onoff") draw();
      else app2.querySelectorAll(".kishib-holds").forEach((x) => x.outerHTML = holds(b.web, runner));
    }, 2e3);
  }
  return { show };
}

// src/web/app.ts
var app = document.getElementById("app");
var kishib = new Kishib({ web: true });
var ask2 = (op, a = {}) => run(kishib, op, a);
var ui = mount(app, { web: true, ask: ask2, start });
async function start() {
  if (!crypto?.getRandomValues) {
    app.innerHTML = alone(note("error", "This browser has no secure source of randomness: Ki\u0161ib cannot run here."));
    return;
  }
  await ui.show(kishib.state());
}
addEventListener("pagehide", () => kishib.forget());
void start();
