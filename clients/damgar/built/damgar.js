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
var refAct = (r) => typeof r === "string" ? r : r[0];
var refSigner = (r) => typeof r === "string" ? null : r[1];
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
async function followRef(r, hints, via = {}) {
  const id = refAct(r);
  const named2 = refSigner(r);
  const notTried = [];
  const check = (act) => {
    const d = describeAct(act);
    if (d.id !== id) throw new Error(`the act fetched is ${d.id}, not ${id}`);
    const actual = d.signer ?? d.id;
    if (named2 && actual !== named2) throw new Error(`the reference names ${named2} as the signer of ${id}, but the act shows ${actual}: the reference is wrong`);
    return act;
  };
  const tryable = (hint) => {
    const why = cannotReach(hint, via);
    if (why && !notTried.some((n) => n.hint === hint)) notTried.push({ hint, why });
    return !why;
  };
  const fetchFrom = async (places2) => {
    let at = "";
    const act = await firstOf(places2.filter(tryable), async (h) => {
      const a = await relayAt(h, via).getAct(id);
      if (a && !at) at = h;
      return a;
    });
    return act ? { act: check(act), at } : null;
  };
  const here = await fetchFrom(hints);
  if (here) return { ...here, how: "asked", notTried };
  if (!named2) throw new Error(`the act ${id} was not found at ${hints.join(", ")}, and the reference names no signer to look by`);
  let l;
  try {
    l = await lookUp(named2, hints, via);
  } catch (e3) {
    throw new Error(`the act ${id} was not found at ${hints.join(", ")}, and its signer ${named2} could not be looked up there: ${e3 instanceof Error ? e3.message : e3}`);
  }
  for (const n of l.notTried) if (!notTried.some((x) => x.hint === n.hint)) notTried.push(n);
  const places = l.verifier.places(named2).filter((p) => !hints.includes(p));
  const outbox = new Set(l.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints.map((h) => h.replace(/\/$/, ""))));
  const there = await fetchFrom(places.filter((p) => outbox.has(p))) ?? await fetchFrom(places.filter((p) => !outbox.has(p)));
  if (there) return { ...there, how: "signer", notTried };
  throw new Error(`the act ${id} was not found at ${hints.join(", ")}, nor at its signer's routes and homes (${places.join(", ") || "none found"})`);
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

// ../../modules/video/src/video.ts
var MAX_BYTES = 64 * 1024 * 1024 - 16;

// ../../modules/audio/src/audio.ts
var MAX_BYTES2 = 64 * 1024 * 1024 - 16;

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
  video: test2("video Module, draft 1, test value until publication"),
  /** The audio Module (modules/module-audio-draft-1.md): a recording, named by its test value until publication, as the video Module is. */
  audio: test2("audio Module, draft 1, test value until publication")
};

// ../barebone/src/corrections.ts
var CORRECTIONS_SPEC = sha2562("Corrections cMIP, draft 2, test value until publication");
var LONG_FORM_CORRECTION = sha2562("Long-form corrections cMIP, draft 1, test value until publication");

// ../barebone/src/post.ts
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
  const acts = lines2.reduce((n, l) => n + l.ids.length, 0);
  const shown = (l) => ({ acts, latest: l?.card.act ?? null, summary: l?.card.summary ?? null });
  const first = lines2.find((l) => l.kind === "private") ?? lines2[0];
  if (!lines2.length) return { ...shown(), atHomes: null, missing: 0, hidden: 0, card: null };
  const homes = me.f.homes.map((h) => h.hint);
  let places = homes;
  try {
    const look = await lookUp(me.f.identity, homes, via);
    places = [.../* @__PURE__ */ new Set([...homes, ...look.resolution.homes.map((h) => h.hint), ...look.routes.routes.flatMap((x) => x.hints)])];
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
async function ownActs(identity, secrets, places, via = {}) {
  const out = /* @__PURE__ */ new Map();
  const locked = /* @__PURE__ */ new Map();
  for (const a of await actsBy(identity, places, via)) {
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
          const page = await relayAt(h, via).feed({ ...q, after });
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
var test3 = (s) => createHash("sha256").update(s).digest("hex");
var REPO_SPECS = {
  /** The Agreements MIR (`AGREEMENTS`). */
  agreements: test3("LAW, test value until the freeze"),
  /** The release manifest cMIP (cmips/cmip-release-manifest-draft-1.md). */
  manifest: test3("release manifest cMIP, draft 1, test value until publication"),
  /** The payment cMIP: a Module under it must carry fields 11 and 13 (Development draft 10, F301). The core's test value. */
  payment: test3("payment cMIP, draft 2, test value until publication")
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
var TEST_RAIL = test3("a test rail Module, no real rail");
var TEST_TIME = test3("a test time reference, no real clock");
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
  const grantMap = cborDecode(gd.payload);
  if (grantMap.has(2) && grantMap.get(2) === null) await holdDeals(v, d.signer, d.binding, hints, via);
  for (const a of await allBy(d.signer, hints, via)) {
    const x = describeAct(a);
    if (x.spec !== MIRS.agreements || x.type !== REVOCATION || !x.payload) continue;
    const named2 = cborDecode(x.payload).get(0);
    if (named2 instanceof Uint8Array && hex(named2) === d.binding) v.add(a);
  }
  if (opts.key) v.addWithKey(act, opts.key);
  else v.add(act);
  let limits = null;
  if (g.limits) {
    let stamps2 = opts.stamps;
    if (g.limits.expiry?.clock === "timestamp" && !stamps2?.has(g.limits.expiry.identity)) {
      stamps2 = new Map(stamps2 ?? []);
      try {
        stamps2.set(g.limits.expiry.identity, await stampsOf(g.limits.expiry.identity, hints, via));
      } catch {
      }
    }
    limits = judge(g.limits, d, MIRS.money, { stamps: stamps2 });
  }
  const verdicts = limits && limits.within !== null ? [[d.id, limits.within]] : [];
  const b = v.agreementsBacking(withGrantLimits(AGREEMENTS_SPECS, verdicts), d.id);
  const lane2 = g.grantee === d.signer;
  const laneBy = `Signed under a lane of ${names(d.signer)} (a grant to itself, ${d.binding.slice(0, 8)}\u2026, its key held by an app; F351)`;
  const plain = b.kind === "backed" || b.kind === "binds" ? `${lane2 ? laneBy : `Signed by ${names(g.grantee)} in ${names(d.signer)}\u2019s name, under ${names(d.signer)}\u2019s grant ${d.binding.slice(0, 8)}\u2026`}: backed (Agreements rule 80).` : b.kind === "not-backed" ? `${lane2 ? laneBy : `Signed by ${names(g.grantee)} in ${names(d.signer)}\u2019s name, under the grant ${d.binding.slice(0, 8)}\u2026`}, which does not back it: ${b.reason}.` : b.kind === "disputed" ? `${lane2 ? laneBy : `Signed by ${names(g.grantee)} in ${names(d.signer)}\u2019s name, under the grant ${d.binding.slice(0, 8)}\u2026`}: disputed, valid but conferring nothing unless its grantor adopts it (the grant was revoked; a keeper recorded the act first: Agreements rule 76, S7e).` : `${lane2 ? laneBy : `Signed by ${names(g.grantee)} in ${names(d.signer)}\u2019s name, under the grant ${d.binding.slice(0, 8)}\u2026`}: whether it backs it is unknown (${b.reason ?? "not readable"}).`;
  return { grant: d.binding, grantor: d.signer, grantee: g.grantee, lane: lane2, backing: b.kind, reason: b.reason ?? null, limits, words: plain };
}
async function holdDeals(v, grantor, grant, hints, via) {
  const held = /* @__PURE__ */ new Set();
  const hold = async (terms, depth) => {
    if (held.has(terms) || depth > 8) return;
    const bytes = await fetchAct(terms, hints, via);
    if (!bytes) return;
    const t = describeAct(bytes);
    if (t.spec !== MIRS.agreements || t.type !== AGREEMENTS_TYPES.terms || !t.payload) return;
    held.add(terms);
    v.add(bytes);
    const m = cborDecode(t.payload);
    const parties = (m.get(0) ?? []).map((x) => hex(x));
    for (const p of parties) {
      try {
        await lookUp(p, hints, via, v);
      } catch {
      }
      for (const a of await allBy(p, hints, via)) {
        const x = describeAct(a);
        if (x.spec === MIRS.agreements && x.type === AGREEMENTS_TYPES.signature && x.objects?.some((o) => o[0] === terms)) {
          try {
            v.add(a);
          } catch {
          }
        }
      }
    }
    const parent = m.get(11);
    if (parent instanceof Uint8Array) await hold(hex(parent), depth + 1);
  };
  for (const a of await allBy(grantor, hints, via)) {
    const x = describeAct(a);
    if (x.spec !== MIRS.agreements || x.type !== AGREEMENTS_TYPES.signature || !x.objects?.length) continue;
    const terms = x.objects[0][0];
    const bytes = await fetchAct(terms, hints, via);
    const t = bytes ? describeAct(bytes) : null;
    if (!t?.payload || t.spec !== MIRS.agreements || t.type !== AGREEMENTS_TYPES.terms) continue;
    const m = cborDecode(t.payload);
    const lists = (f) => f instanceof Uint8Array ? hex(f) === grant : Array.isArray(f) ? f.some(lists) : f instanceof Map ? [...f.values()].some(lists) : false;
    if (lists(m.get(14)) || lists(m.get(29))) await hold(terms, 0);
  }
}

// src/total.ts
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
function spent(payments, unit) {
  return payments.filter((p) => !p.refused && p.amount.unit === unit).reduce((n, p) => n + p.amount.value, 0);
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
    const named2 = cborDecode(d.payload).get(0);
    if (named2 instanceof Uint8Array && hex(named2) === grant && !out.includes(d.id)) out.push(d.id);
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
  for (const x of await ownActs(identity, secrets, [.../* @__PURE__ */ new Set([...at, ...l.routes.routes.flatMap((r) => r.hints)])], via)) {
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
async function signAndAsk(me, collective, key, act, ask3, text3, hints, via = {}) {
  const at = await chainFor(collective, key, hints, via);
  const made = signAsMember(collective, key, at, { ...act, public: true });
  const places = await publishAt([made.act], hints, via);
  if (!places.length) throw new Error("No relay took the act: nothing counts. Try again.");
  const asked = [];
  const notAsked = [];
  for (const h of ask3) {
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
    } catch (e3) {
      out.set(id, { kind: "unread", reason: e3 instanceof Error ? e3.message : String(e3), met: false, areas: [] });
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
  const now4 = await collectiveNow(id, hints, via);
  if (!now4.agreement) return { id, agreement: null, area: null, key: null, why: "Its agreement in force could not be read from its relays and homes." };
  const t = await termsOf(now4.agreement, hints, via);
  const a = t?.areas.find((x) => x.kinds.some((k) => k.form === "layer" && k.layer === MONEY_LAYER || k.spec === AGREEMENTS_SPECS.money));
  const area = a ? { id: a.id, name: a.name, holders: a.holders, number: a.threshold, cap: capOf(a.limits) } : null;
  const keys = await readMemberKeys(me.id, me.f.encryption.map((e3) => unhex(e3.secret)), me.f.homes.map((h) => h.hint), via).catch(() => []);
  const key = keys.length ? await memberKeyFor(keys, id, hints, via).catch(() => null) : null;
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
async function signPromise(me, c, payload, ask3, text3, hints, via) {
  return signAndAsk(me, c.id, c.key, { spec: AGREEMENTS_SPECS.money, type: 1, payload }, ask3, text3, hints, via);
}
async function standing(c, act, amount, hints, via) {
  const area = c.area;
  const verdicts = area?.cap ? [[act, withinCap(area, amount)]] : [];
  return (await judgeCollective(c.id, [act], hints, via, verdicts)).get(act);
}

// ../grants/src/deal.ts
function pct(n) {
  const p = n / 1e4;
  return `${Number.isInteger(p) ? p : p.toFixed(4).replace(/0+$/, "")}%`;
}
function dealName(text3) {
  const m = /^“([^”]{1,200})”/.exec(text3);
  return m ? m[1] : null;
}
async function readDeal(version2, places, via = {}) {
  const t = await termsAt(version2, places, via);
  if (!t || t.grammar) return null;
  const grant = t.payeeGrants?.[0] ?? null;
  let payee = null;
  let service = null;
  if (grant) {
    for (const h of places) {
      const a = await relayAt(h, via).getAct(grant).catch(() => null);
      if (!a) continue;
      const d = describeAct(a);
      payee = d.signer ?? null;
      const g = d.payload ? cborDecode(d.payload).get(0) : null;
      service = g instanceof Uint8Array ? hex(g) : null;
      break;
    }
  }
  const owners = (t.stakes?.[0]?.[1] ?? []).filter((x) => typeof x[0] === "string");
  const referral = t.plan?.shares.find((s) => s.kind === "role" && s.role === "referral")?.part ?? 0;
  return { version: version2, name: dealName(t.text), text: t.text, parties: t.parties, owners, payee, service, grant, referral };
}
async function dealOfPost(post2, places, via = {}) {
  const d = describeAct(post2);
  for (const id of d.refs ?? []) {
    let act = null;
    for (const h of places) {
      act = await relayAt(h, via).getAct(id).catch(() => null);
      if (act) break;
    }
    if (!act) continue;
    const x = describeAct(act);
    if (x.spec !== REPO_SPECS.agreements || !x.payload) continue;
    if (x.type === AGREEMENTS_TYPES.terms) {
      const r = await readDeal(id, places, via);
      if (r) return r;
    }
    if (x.type === AGREEMENTS_TYPES.offer) {
      const under = cborDecode(x.payload).get(0);
      if (under instanceof Uint8Array) {
        const r = await readDeal(hex(under), places, via);
        if (r) return r;
      }
    }
  }
  return null;
}
function sharedLine(d, names) {
  return `This work is shared: ${d.owners.map(([id, n]) => `${names(id)} (${pct(n)})`).join(", ")}. The split service${d.service ? `, ${names(d.service)},` : ""} answers for it.`;
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
function threePositions(random) {
  const out = /* @__PURE__ */ new Set();
  while (out.size < 3) out.add(1 + random(24));
  return [...out].sort((a, b) => a - b);
}
function typedBack(words, positions, typed) {
  return positions.length === 3 && typed.length === 3 && positions.every((p, i) => words[p - 1] === (typed[i] ?? "").trim().toLowerCase());
}

// ../dub/src/chainwords.ts
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

// ../genesis/src/forms.ts
var form = (label, hex2) => formEncode(label, unhex(hex2));
var idForm = (id) => form("mid", id);
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
  const said = [];
  if (found.forked) said.push({ text: "Your contacts were forked at your homes: two apps changed them at once. The longer branch was continued.", tone: "warn" });
  said.push(left ? { text: `Your contacts are sealed to you and kept at your homes (version ${found.version + 1}): every app holding this identity reads them.`, tone: "ok" } : { text: "No home took your contacts: nothing changed there. Try again.", tone: "warn" });
  return said;
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
    const said = a.op === "add" ? await addContact(me, { id: a.id, nick: a.nick ?? null }, opts) : a.op === "nick" ? await setNick(me, { id: a.id, nick: a.nick ?? null }, opts) : await removeContact(me, a.id, opts);
    this.lists.delete(me.id);
    return said;
  }
  /** Forget what was kept for an identity (it was removed, or its key changed). */
  forget(id) {
    this.lists.delete(id);
    this.names.forget(id);
  }
};

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
var labelOf = (hash) => {
  const a = ACCEPTABLE.find((x) => x.hashes.includes(hash));
  if (!a) return void 0;
  if (a.hashes.length === 1) return `${a.name} ${a.kind}, draft ${a.draft}`;
  const u2 = BITCOIN_UNITS.units.find((x) => x.hash === hash);
  return `${a.name}, draft ${a.draft}: ${u2?.name ?? "a unit"}`;
};
var isAccepted = (a, accepted) => a.hashes.every((h) => accepted.has(h));

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
  let confirm = null;
  if (m.get(0) === 3) {
    const c = m.get(6);
    if (!Array.isArray(c) || c.length !== 2 || !Array.isArray(c[1]) || !c[1].length) throw new Error("a draft confirming a purchase: its claim and what it acknowledges");
    confirm = { claim: h322(c[0], "the claim"), acks: c[1].map((x) => h322(x, "an act acknowledged")) };
  } else if (m.has(6)) throw new Error("a draft: a confirmation on a draft that confirms nothing");
  return {
    what,
    other: h322(m.get(1), "the other party"),
    amount: amountOf2(m.get(2)),
    whatFor: m.has(3) ? text(m.get(3), "what for") : null,
    app: text(m.get(4), "the app"),
    anchor,
    confirm
  };
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
  const amount = m.has(4) ? amountOf2(m.get(4)) : null;
  return { to: h322(m.get(0), "the request answered"), commitment: h322(m.get(1), "the commitment"), bound, ticket: m.has(3) ? h322(m.get(3), "the ticket") : null, amount };
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

// ../ummia/src/anchor.ts
async function placesOf(service, hints, via) {
  const l = await lookUp(service, hints, via);
  const places = [.../* @__PURE__ */ new Set([...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints), ...l.resolution.homes.map((h) => h.hint), ...hints])];
  return { l, places };
}
async function offers(service, hints, via = {}) {
  const { l, places } = await placesOf(service, hints, via);
  const out = /* @__PURE__ */ new Map();
  for (const h of places) {
    try {
      for (const it of (await relayAt(h, via).feed({ signer: service, spec: MIRS.agreements })).items) {
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
  const version2 = e3.payload ? Number(cborDecode(e3.payload).get(0)) : 1;
  return { version: version2, act: look.encryptionKeyAct, secret: hex(secret) };
}

// src/accepted.ts
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
  const acts = /* @__PURE__ */ new Map();
  const problems = [];
  if (Array.isArray(keys) && !keys.length) return { acts, problems: ["this app holds no encryption key of this identity"] };
  const open = Array.isArray(keys) ? openerOf(identity, keys) : keys;
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l;
  try {
    l = await lookUp(identity, homes, via, v);
  } catch (e3) {
    return { acts, problems: [`its homes did not answer (${e3 instanceof Error ? e3.message : String(e3)})`] };
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
async function readAccepted(identity, keys, homes, via = {}) {
  const { acts, problems } = await readActs(identity, keys, homes, via);
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
    const look = await lookUp(me.id, homes, via);
    if (!look.encryptionKey || !me.f.encryption.some((e3) => (e3.secret ? hex(xwingPublic(unhex(e3.secret))) : e3.public) === hex(look.encryptionKey))) {
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

// src/damgar.ts
var LINE_SAY = "Damgar keeps its own line of acts for this identity (its money acts and messages). If the signing key is ever changed with the chain key, in Ki\u0161ib, that change must keep this line, or every claim and receipt signed here becomes void. Ki\u0161ib reads it from the homes and keeps it.";
var SPENT_SAY = "This identity\u2019s signing key was changed elsewhere, with its chain key, so the signing key\u2019s words Damgar holds no longer count. Nothing was signed. To go on here, give Damgar the new signing key\u2019s words.";
var RUNNER_OLD_KEY_SAY = "This identity\u2019s keys were changed with its chain key, and Ki\u0161ib\u2019s runner still holds the old signing key: nothing was signed. Give the runner the new signing key\u2019s words, in Ki\u0161ib (Runner, Identities held here). Damgar then goes on, in new lines.";
var RUNNER_HOLDS_SAY = "Ki\u0161ib\u2019s runner holds this identity\u2019s signing key, on this Mac; Damgar holds none of its keys. Its words are given and changed in Ki\u0161ib, never here.";
var RUNNER_NO_OPEN_SAY = "Ki\u0161ib does not let Damgar open what is sealed to this identity: drafts, requests and payments sealed to it are not read here. To allow it, in Ki\u0161ib: Runner, Apps, Damgar, \u201Cmay open what is sealed to\u201D this identity.";
var KISIB_NO_OPEN_LIST_SAY = "Ki\u0161ib does not let Damgar open what is sealed to this identity, so the rules you follow cannot be sealed to it. To allow it, tick it in Ki\u0161ib: Runner \u203A Apps, beside Damgar, \u201Cmay open what is sealed to\u201D this identity.";
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
var message2 = (e3) => e3 instanceof Error ? e3.message : String(e3);
var now3 = () => Math.floor(Date.now() / 1e3);
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
  /** This app's line as the homes hold it, for its card (H80's question 2). */
  line = lineReader("Damgar");
  /** This app's line: what waits sent first, in its own turn (the file read again there, the key checked first), then read back. Null where the homes could not be read. */
  async lineNow(me, via) {
    if (Object.keys(me.f.unsent ?? {}).length) {
      await this.serial(async () => {
        const f = await this.load(me.id);
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
  /**
   * Who is known, as in every app (H96, H100, H106, H109): the one contacts
   * list (the people cMIP's, sealed to the identity at its homes, nicknames
   * included) and the names identities published (the naming cMIP), read by
   * the kit's one name reader, kept a few minutes in memory only.
   */
  known = new Known("Damgar");
  /** An identity's published name as read (H96): the name, none published, or not reached (never "no name" for silence). */
  published(id, places) {
    return this.known.names.read(id, places);
  }
  /** Its display name (the naming cMIP), where one was read; null otherwise. */
  async nameOf(id, places, _via) {
    const n = await this.published(id, places);
    return n.state === "name" ? n.name : null;
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
      return { open: null, problem: message2(e3).replace(/ Nothing was signed\.$/, "") };
    }
    if (!p || p.state !== "approved" || !p.identities.some((x) => x.id === me.id)) return { open: null, problem: "Damgar is not paired with Ki\u0161ib for this identity any more: nothing sealed to it opens here." };
    if (!p.opens.includes(me.id)) return { open: null, problem: RUNNER_NO_OPEN_SAY };
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
      return { available: true, origin: this.opts.runner.origin(), state: null, code: this.opts.runner.code(), identities: [], problem: message2(e3) };
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
      const named2 = list(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
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
      await this.store.write(k.id, "settings", { relays: named2.length ? named2 : r.homes.map((h) => h.hint), via: {} });
      await this.store.saveIdentity(new TestIdentity(f, {}));
      await this.store.setActive(k.id);
      return {
        lines: [
          { text: `Damgar uses ${k.name ?? short(k.id)} through Ki\u0161ib\u2019s runner: Ki\u0161ib holds its signing key, Damgar none. Every money act is shown by Ki\u0161ib, in its panel here, before it is signed: money always asks.`, tone: "ok" },
          p.opens.includes(k.id) ? { text: "Ki\u0161ib opens for Damgar what is sealed to this identity: drafts, requests and payments are read here, Damgar holding no key.", tone: "ok" } : { text: RUNNER_NO_OPEN_SAY, tone: "warn" },
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
    return { id, short: short(id), me: id === me };
  }
  /** The Dubsar clock's time of each act shown (decided 23 October 2026: every app relies on it), in words; none where it has not stamped it. */
  async clockWords(ids) {
    const { s, hints } = await this.ctx();
    return clockWords(ids.slice(0, 500), hints, s.via);
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
      const look = await lookCurrent(id, seed, [address], via);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await servedChain(id, r.homes, via);
      const named2 = list(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named2.length ? named2 : list(a.relays ?? []);
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
    const via = a.via ?? {};
    const hints = list(a.homes);
    if (!hints.length) throw new Error("Give at least one home address: where the identity lives, and anyone can check it.");
    const relays = list(a.relays);
    for (const r of [...hints, ...relays]) if (!/^https?:\/\//.test(r)) throw new Error(`\u201C${r}\u201D: an address starts with https:// (or http://)`);
    const homes = [];
    for (const hint of hints) {
      let info;
      try {
        info = await relayAt(hint, via).info();
      } catch (e3) {
        throw new Error(`${hint} did not answer: ${message2(e3)}`);
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
    const id = TestIdentity.create({ homes, via, chainKey: chain.key });
    id.f.safety = { scheme: 0, seeds: "" };
    chain.key.seeds.fill(0);
    this.pending?.seed.fill(0);
    this.pending = { file: id.f, seed, positions, relays: relays.length ? relays : hints, via };
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
      if (message2(e3) === SPENT_SAY) return { current: false, say: SPENT_SAY };
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
    if (c && !fresh && c.at + 60 > now3()) return c.list;
    const { open } = await this.opener(me);
    const sealed = await readAccepted(me.id, open ?? [], me.f.homes.map((h) => h.hint), me.via);
    const here = (await this.store.read(me.id, "settings"))?.acceptedHere ?? [];
    const entries = new Map(sealed.entries);
    for (const h of here) if (!entries.has(h)) entries.set(h, labelOf(h) ?? null);
    const l = { ...sealed, entries };
    this.lists.set(me.id, { list: l, at: now3() });
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
  setAccepted(keys, where = "list") {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.current(me);
      const want = new Set(keys);
      const unknownKey = keys.find((k) => !ACCEPTABLE.some((a) => a.key === k));
      if (unknownKey) throw new Error(`Damgar lists no \u201C${unknownKey}\u201D.`);
      if (where === "here") {
        const hashes = ACCEPTABLE.filter((a) => want.has(a.key)).flatMap((a) => a.hashes);
        await this.store.write(me.id, "settings", { ...s, acceptedHere: hashes, acceptLater: false });
        this.lists.delete(me.id);
        return { lines: [{ text: "Followed in Damgar only: your list is unchanged, so the other apps still ask.", tone: "ok" }] };
      }
      const { open, problem } = await this.opener(me);
      if (!open) {
        const hashes = ACCEPTABLE.filter((a) => want.has(a.key)).flatMap((a) => a.hashes);
        await this.store.write(me.id, "settings", { ...s, acceptedHere: hashes, acceptLater: false });
        this.lists.delete(me.id);
        const cause = problem === RUNNER_NO_OPEN_SAY ? KISIB_NO_OPEN_LIST_SAY : `The rules you follow cannot be sealed to this identity: ${problem ?? NO_KEY_SAY}`;
        return { lines: [{ text: cause, tone: "warn" }, { text: "Kept in Damgar only, for now: Damgar follows them here; the other apps do not see them until they are sealed. Save them again once it is allowed.", tone: "ok" }] };
      }
      const r = await changeAccepted(
        me,
        (entries) => {
          for (const a of ACCEPTABLE) for (const h of a.hashes) {
            if (want.has(a.key)) entries.set(h, labelOf(h) ?? null);
            else entries.delete(h);
          }
        },
        { via: s.via, save: () => this.store.saveIdentity(me), check: () => this.current(me), open }
      );
      if (s.acceptedHere?.length || s.acceptLater) await this.store.write(me.id, "settings", { ...s, acceptedHere: void 0, acceptLater: void 0 });
      this.lists.delete(me.id);
      await this.accepted(me, true);
      const lines2 = [];
      if (r.list.merged.length) lines2.push({ text: `Two apps had changed the accepted list at once. Both changes were merged: ${r.list.merged.join(" ")}`, tone: "warn" });
      lines2.push(r.written ? { text: `Your rules are sealed to this identity and kept at its homes (version ${r.list.version}): every app holding the identity reads it; nobody else can.`, tone: "ok" } : { text: "Nothing changed." });
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
          on ? { text: `Your rules are published at ${s.relays.join(", ")}: anyone can read which specifications you accept, and so which rails you can pay on.`, tone: "warn" } : { text: "The published list is withdrawn: it is private again. Earlier versions stay readable as acts.", tone: "ok" }
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
      const s2 = f ? await this.store.read(id, "settings") ?? { relays: [], via: {} } : null;
      const published = f && s2 ? await this.published(id, [...f.f.homes.map((h) => h.hint), ...s2.relays]) : { state: "unreached" };
      held.push({ id, grouped: groupId(id), short: short(id), active: id === active, runner: !f?.f.signingSecret, name: published.state === "name" ? published.name : null, named: { nick: null, published } });
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
      short: short(me.id),
      homes: me.f.homes.map((h) => h.hint),
      relays: s.relays,
      encryption: me.f.encryption.length > 0,
      line: line ?? noLine(me.f),
      // The collectives under it (decided: acting as a collective is the identity panel's gesture): those Damgar acts for, added here.
      collectives: await Promise.all(
        (s.collectives ?? []).map(async (c) => {
          const published = await this.published(c, [...me.f.homes.map((h) => h.hint), ...s.relays]);
          return { id: c, form: idForm(c), short: short(c), name: published.state === "name" ? published.name : null, named: { nick: null, published } };
        })
      ),
      name: held.find((h) => h.id === me.id)?.name ?? null,
      named: held.find((h) => h.id === me.id)?.named ?? null,
      // H88: its ID link (the ID with where it lives: one home, one relay), for Share your ID link.
      link: idWhere(me.id, [...me.f.homes.map((h) => h.hint).slice(0, 1), ...s.relays.filter((r) => !me.f.homes.some((h) => h.hint === r)).slice(0, 1)]),
      runner: !me.f.signingSecret
    };
    let l;
    try {
      l = await this.accepted(me);
    } catch (e3) {
      l = { entries: /* @__PURE__ */ new Map(), tips: [], merged: [], version: 0, problems: [message2(e3)] };
    }
    const set = this.acceptedSet(l);
    out.accept = ACCEPTABLE.map((a) => ({ key: a.key, name: a.name, kind: a.kind, draft: a.draft, text: a.text, does: a.does, here: a.here, built: a.built, needs: a.needs, accepted: isAccepted(a, set), hashes: a.hashes }));
    out.list = { version: l.version, merged: l.merged, published: !!book.published && !book.published.withdrawn, problems: l.problems };
    out.stage = l.version === 0 && !s.acceptLater && !s.acceptedHere?.length ? "accept" : "ready";
    out.list.here = s.acceptedHere?.length ?? 0;
    out.settingsSaved = !!s.settingsSaved;
    out.counts = {
      toSign: Object.values(book.drafts).filter((d) => d.stage === "new").length + Object.values(book.requestsIn).filter((r) => r.stage === "new" || r.stage === "debt").length + Object.values(book.invoices).filter((i) => i.stage === "new").length + Object.values(book.laneRequests ?? {}).filter((r) => r.stage === "new").length + Object.values(book.payments).filter((p) => p.side === "in" && p.claims.length > 0 && !p.receipts.length).length,
      toPay: Object.values(book.payments).filter((p) => p.side === "out" && p.stage === "to pay").length
    };
    return out;
  }
  // ------------------------------------------------------------ who is known (H96, H100, H106, H109, H119)
  /**
   * The names of these identities, for the page (the kit's `attachIds`;
   * H96, H106): the nickname given in the one contacts list (sealed, the
   * person's own) and the name each published, read at the identity's homes
   * and relays. `fresh`: asked again (a retry). With no identity in use (the
   * first screen), the names published only, each held identity's read at
   * its own homes.
   */
  async names(a) {
    const ids = [...new Set(a.ids.filter((x) => /^[0-9a-f]{64}$/.test(x)))].slice(0, 200);
    const active = await this.store.active();
    const me = active ? await this.load(active) : null;
    if (!me) {
      const out = {};
      for (const id of ids) {
        const f = await this.store.identity(id).catch(() => null);
        out[id] = { nick: null, published: f ? await this.known.names.read(id, f.f.homes.map((h) => h.hint), !!a.fresh) : { state: "unreached" } };
      }
      return out;
    }
    const { s, hints } = await this.ctx();
    const { open } = await this.opener(me);
    return this.known.named(me, open, ids, hints, { via: s.via, fresh: a.fresh });
  }
  /** The one contacts list (H100), each contact with its names; why it cannot be read here, where it cannot. */
  async contacts(a = {}) {
    const { me, s, hints } = await this.ctx();
    const { open, problem } = await this.opener(me);
    const r = await this.known.contacts(me, open, hints, { via: s.via, fresh: a.fresh });
    return { contacts: r.contacts, problem: open ? r.problem : problem === RUNNER_NO_OPEN_SAY ? "Ki\u0161ib does not let Damgar open what is sealed to this identity, so its contacts are not read here" : problem ?? r.problem };
  }
  /** Add a contact (with a nickname, H109), give or change its nickname, or take it out: sealed as the people cMIP keeps the list, seen in every app. */
  contactChange(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.current(me);
      if (!a.id.trim()) throw new Error("Give its ID (mid1\u2026, or an ID link). Nothing was signed.");
      const { open } = await this.opener(me);
      let said;
      try {
        said = await this.known.change(me, a, { open, via: s.via, save: () => this.store.saveIdentity(me) });
      } catch (e3) {
        if (e3 instanceof Refused) throw new Error(`${e3.message}. Nothing was signed.`);
        throw e3;
      }
      return { lines: said };
    });
  }
  /**
   * The first-use step on the rules, left for later (H112): Damgar opens,
   * every money act under a rule not followed shown unknown (Development
   * rule 10); Settings, Rules I follow, at any time.
   */
  acceptLater() {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.store.write(me.id, "settings", { ...s, acceptLater: true });
      return { lines: [{ text: "Later, then: until you choose the rules you follow (Settings, Rules I follow), every money act is shown unknown, and nothing is signed for it.", tone: "ok" }] };
    });
  }
  /** Back to the first page (H112): no identity in use; those held are kept, to choose again. */
  firstBack() {
    return this.serial(async () => {
      await this.store.setActive(null);
      return { lines: [] };
    });
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
          c = { id, agreement: null, area: null, key: null, why: message2(e3) };
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
  /** Stop acting for a collective here (it stays what it is; nothing is signed). */
  collectiveRemove(id) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      s.collectives = (s.collectives ?? []).filter((c) => c !== id);
      await this.store.write(me.id, "settings", s);
      return { lines: [{ text: `Damgar no longer acts for ${short(id)} here. Nothing was signed; add it again by its ID.`, tone: "ok" }] };
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
    if (!pointer.act) throw new Error(`${short(to)} publishes no payee pointer: there is nowhere the promise could be paid. Nothing was signed.`);
    const payload = promisePayload(c, { to, amount, pointer: pointer.act });
    const say_ = promiseSay(c, me.id, { to, amount, whatFor: a.whatFor.trim() }, short);
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
      const text3 = `A promise of the collective ${short(r.c.id)} to pay ${short(r.to)} ${r.amount.value.toLocaleString("en")}${a.whatFor.trim() ? `, for ${a.whatFor.trim()}` : ""}: ${r.say.above ? "above its Money lane\u2019s cap, it" : "it"} needs your key too. Read it in your Signing tab, then sign it with your own key for the collective.`;
      const made = await signPromise(me, r.c, r.payload, r.say.others, text3, r.places, s.via);
      await this.store.saveIdentity(me);
      book.collectiveActs = { ...book.collectiveActs ?? {}, [made.act]: { collective: r.c.id, to: r.to, amount: r.amount, whatFor: a.whatFor.trim(), asked: made.asked, at: now3() } };
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
        problems.push(`Its inbox could not be looked up: ${message2(e3)}`);
      }
      const places = list([...me.f.homes.map((h) => h.hint), ...inbox]);
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
              if ((d.spec && MESSAGES_SPECS.includes(d.spec) || d.spec === MONEY || d.spec === MIRS.agreements && d.type === AGREEMENTS_TYPES.split) && !book.acts[d.id] && !fresh.some((f) => f.described.id === d.id)) fresh.push(o);
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
          problems.push(`${hint}: ${message2(e3)}`);
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
          return `its signer was not found (${message2(e3)})`;
        }
      };
      for (const [id, x] of Object.entries(book.uncounted ?? {})) {
        if (x.stage !== "new" || book.acts[id] || fresh.some((f) => f.described.id === id)) continue;
        const act = b642(x.act);
        const key = x.key ? b642(x.key) : void 0;
        fresh.push({ act, key, described: key ? openWithKey(act, key) : describeAct(act) });
      }
      for (const o of fresh) {
        const d = o.described;
        if (!d.signer || !d.payload) continue;
        let st = await standing2(o);
        const underGrant = (st === "scoped" || st === "unknown") && !!o.described.binding;
        const a = underGrant ? await this.authority(o, [...places, ...s.relays], s.via) : null;
        if (a) {
          st = a.backing === "backed" || a.backing === "binds" ? "valid" : a.backing === "disputed" ? `disputed: ${a.words}` : `signed under a grant that does not back it: ${a.words}`;
          (book.authorities ??= {})[d.id] = a.words;
        }
        if (underGrant && (!a || a.backing === "unknown")) {
          const was = book.uncounted?.[d.id];
          if (!was) lines2.push({ text: `${short(d.signer)} sent something signed under a lane that cannot count yet: in Waiting, To receive.`, tone: "warn" });
          (book.uncounted ??= {})[d.id] = { act: base64(o.act), key: o.key ? base64(o.key) : void 0, from: d.signer, found: was?.found ?? now3(), why: a ? this.waitingWhy(a) : "the grant it was signed under was not found at the places asked yet", stage: was?.stage ?? "new" };
          continue;
        }
        if (book.uncounted?.[d.id]) delete book.uncounted[d.id];
        if (st !== "valid") {
          problems.push(`An act from ${short(d.signer)} that does not count (${st}): set aside.`);
          continue;
        }
        book.acts[d.id] = { act: base64(o.act), key: o.key ? base64(o.key) : void 0, from: d.signer };
        try {
          await this.file(me, s, book, d, lines2);
        } catch (e3) {
          problems.push(`${short(d.signer)}: ${message2(e3)}`);
        }
      }
      if (unopened) problems.push(`${unopened} sealed act${unopened === 1 ? "" : "s"} addressed to this identity did not open with the encryption keys Damgar holds: sealed to a key it does not hold.`);
      await this.byItself(me, s, book, lines2, problems);
      await this.saveBook(me.id, book);
      return { lines: lines2, problems };
    });
  }
  /** Why an act under a lane cannot count yet, in plain words first (H107). */
  waitingWhy(a) {
    const l = a.limits;
    if (l && l.within === null && /clock|stamp|expiry/i.test(l.why)) return `its lane has an expiry judged by a timestamp clock, which has not placed this act yet; until it does, nobody can tell it was signed in time (the grant limits cMIP, 3.1). ${a.words}`;
    return a.words;
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
    const t = now3();
    const signer = d.signer;
    if (d.spec && MESSAGES_SPECS.includes(d.spec)) {
      const unread = (why) => {
        (book.unread ??= {})[d.id] = { from: signer, found: t, type: d.type ?? -1, why, stage: "new" };
        lines2.push({ text: `A money message from ${short(signer)} that Damgar cannot read: shown unknown, in Waiting.`, tone: "warn" });
      };
      if ((d.type === TYPES.draft || d.type === TYPES.laneRequest || d.type === TYPES.sale) && signer !== me.id) return;
      if (d.type === TYPES.sale) return;
      const readers = { [TYPES.draft]: readDraft, [TYPES.request]: readRequest, [TYPES.invoiceRequest]: readInvoiceRequest, [TYPES.answer]: readAnswer };
      if (d.spec === MESSAGES_SPEC) readers[TYPES.laneRequest] = readLaneRequest;
      if (!readers[d.type]) return unread(`a message of type ${d.type}, which the money messages cMIP draft 1 does not define`);
      try {
        readers[d.type](d.payload);
      } catch (e3) {
        return unread(message2(e3));
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
        lines2.push({ text: `A request to be paid, from ${short(signer)}: in Waiting.`, tone: "ok" });
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
        lines2.push({ text: p.stage === "to pay" ? `${short(signer)} answered: a payment is ready, in Waiting, To pay.` : `${short(signer)} refused to bind the payment: ${p.bound?.kind === "refused" ? p.bound.why : ""}`, tone: p.stage === "to pay" ? "ok" : "warn" });
      }
      return;
    }
    if (d.spec === MIRS.agreements && d.type === AGREEMENTS_TYPES.split) {
      const m = cborDecode(d.payload);
      const payouts = m.get(1) ?? [];
      const mine = payouts.filter((x) => x.get(0) instanceof Uint8Array && hex(x.get(0)) === me.id).map((x) => ({ amount: Number(x.get(1)), role: typeof x.get(3) === "string" ? x.get(3) : null }));
      const receipt = m.get(0);
      const agreement = m.get(3);
      if (mine.length && receipt instanceof Uint8Array && agreement instanceof Uint8Array) {
        const rc = book.acts[hex(receipt)] ? this.moneyOf(book, hex(receipt)) : null;
        (book.splits ??= {})[d.id] = { service: signer, agreement: hex(agreement), receipt: hex(receipt), mine, unit: rc?.amount?.unit ?? null, at: t };
        lines2.push({ text: `${short(signer)} published a split naming you: ${mine.map((x) => `${x.amount}${x.role ? ` (${x.role})` : ""}`).join(", ")}, in the account.`, tone: "ok" });
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
      lines2.push({ text: `${short(signer)} says they paid you ${say(a.amount, new Set(unitOf(a.amount.unit) ? [a.amount.unit] : []))}: check it, and sign the receipt, in Waiting.`, tone: "ok" });
    } else if (a.type === "receipt" && a.payer === me.id) {
      const pr = readPaymentProof(new Uint8Array(a.proof));
      const key = paymentCommitment({ rail: a.rail, payee: a.payee, amount: a.amount, fulfils: a.fulfils, payer: me.id, paidTo: pr.paidTo, salt: pr.salt });
      const p = book.payments[key];
      if (!p) throw new Error("a receipt for no payment of this identity");
      if (!p.receipts.includes(d.id)) p.receipts.push(d.id);
      p.stage = "settled";
      lines2.push({ text: `${short(signer)} signed the receipt for your payment: in the account.`, tone: "ok" });
    } else if (a.type === "receipt" && a.payer !== me.id && a.payee !== me.id && a.payee === signer) {
      (book.shared ??= {})[d.id] = { payer: typeof a.payer === "string" ? a.payer : "", payee: a.payee, amount: a.amount, fulfils: a.fulfils, purchase: !!a.purchase, at: t };
      lines2.push({ text: `A payment to a deal you share in was receipted in its payee\u2019s name (${short(a.payee)}): in the account.`, tone: "ok" });
    } else if (a.type === "obligation" && a.creditor === me.id && a.debtor === signer) {
      const ask3 = Object.entries(book.requestsOut).find(([id, x]) => x.to === signer && !x.obligation && this.requestOf(book, id)?.pointer === a.pointer);
      if (ask3) ask3[1].obligation = d.id;
      lines2.push({ text: `${short(signer)} accepted a debt to you, signed: in the account. ${DEBT_SAY}`, tone: "ok" });
    }
  }
  /**
   * What a drafted payment follows, where it is not the payee's pointer
   * (the money messages cMIP, draft 5, 8): a tip whose draft names, in its
   * `refs`, a post under a deal between separate people, its payee the
   * deal's own payee, follows the deal itself ("the target is the agreement
   * not the act"). Null otherwise: the payee's pointer, as before.
   */
  async followsOf(me, s, book, id, dr) {
    if (dr.what !== "pay" || book.pasted?.[id]) return null;
    let d;
    try {
      d = this.opened(book, id).d;
    } catch {
      return null;
    }
    const places = [...s.relays, ...me.f.homes.map((h) => h.hint)];
    for (const [i, ref] of (d.refs ?? []).entries()) {
      try {
        const post2 = (await followRef(d.refSigners?.[i] ? [ref, d.refSigners[i]] : ref, places, s.via)).act;
        const deal = await dealOfPost(post2, places, s.via);
        if (deal?.payee === dr.other) return deal.version;
      } catch {
      }
    }
    return null;
  }
  /** A kept Money act, read: null where it is not kept or not read. */
  moneyOf(book, id) {
    try {
      const { d, payload } = this.opened(book, id);
      return d.spec === MONEY ? moneyRead(d.type, payload).act ?? null : null;
    } catch {
      return null;
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
    } catch (e3) {
      throw new Error(`${short(id)} was not found: ${message2(e3)}`);
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
      at: now3()
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
        lines2.push({ text: `${short(inv.from)} asks where to pay you ${say(f.amount, acc)} on-chain: an address to give, in Waiting (every step by hand).`, tone: "ok" });
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
      const lane2 = keys.link && this.opts.link ? await this.payeeLane(me, s, MESSAGES_SPEC, TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound: { kind: "invoice", invoice: "" }, ticket: null, amount: f.amount })) : null;
      const auto = lane2 && !("why" in lane2) ? lane2 : null;
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
        } catch (e3) {
          lines2.push({ text: `Damgar could not make the invoice by itself (${message2(e3)}): make it in your wallet, in Waiting.`, tone: "warn" });
          return;
        }
      }
      lines2.push({ text: `${short(inv.from)} wants to pay you ${say(f.amount, acc)} on Lightning: make an invoice in your wallet, in Waiting.${lane2 && "why" in lane2 && !s.manual ? ` Not answered by itself: ${lane2.why.replace(/\.? ?Nothing was signed\.?$/, "")}.` : ""}`, tone: "ok" });
    }
  }
  /** What keeps a Lightning invoice from binding this payment (the Lightning rail Module's rule, and the checks of the money messages cMIP, 5.3). */
  invoiceProblems(p, invoice) {
    const t = invoice.trim().toLowerCase().replace(/^lightning:/, "");
    let decoded;
    try {
      decoded = lightningInvoice(t);
    } catch (e3) {
      return [`${message2(e3)}. Copy the whole invoice from your wallet`];
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
    const opened2 = this.opened(book, id);
    const ir = readInvoiceRequest(opened2.payload);
    const f = ir.fields;
    const fail = (why) => ({ ir, why, address: null });
    if (f.payer !== opened2.d.signer) return fail("its signer is not the payer the commitment names");
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
      at: now3(),
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
      if (d.spec === MIRS.agreements && d.type === AGREEMENTS_TYPES.terms) agreement = fulfils;
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
          problems.push(`A draft ${short(id)}: ${message2(e3)}`);
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
      for (const [id, x] of Object.entries(book.uncounted ?? {})) {
        if (x.stage !== "new") continue;
        items.push({
          id,
          kind: "uncounted",
          from: this.who(x.from, me.id),
          app: null,
          title: `Waiting to count: sent by ${short(x.from)} under a lane`,
          lines: [
            { text: `It cannot count yet: ${x.why}`, tone: "warn" },
            { text: "Damgar looks again each time it looks for what arrived; once it counts, it shows here as a payment to answer. Until then nothing is answered and nothing signed (unknown, as Development rule 10 says)." },
            { text: "Setting it aside signs nothing and sends nothing." }
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
        } catch (e3) {
          problems.push(`A lane asked ${short(id)}: ${message2(e3)}`);
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
      const c = await this.ownClaim(me, s, dr).catch((e3) => ({ why: message2(e3) }));
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
      const follows = dr.what === "pay" ? await this.followsOf(me, s, book, id, dr) : null;
      if (follows) {
        const deal = await readDeal(follows, [...s.relays, ...me.f.homes.map((h) => h.hint)], s.via).catch(() => null);
        if (deal) lines2.push({ text: `${sharedLine(deal, (x2) => x2 === me.id ? `you (${short(x2)})` : short(x2))} The payment follows the deal (${short(follows)}): a tip, divided like a sale, no purchase.`, tone: "ok" });
      }
      if (!unknown) {
        try {
          const r = await this.route(me, s, dr.other, dr.amount, acc);
          lines2.push({ text: `On ${railName(r.module)}, to ${r.to === "flow" ? "their flow (their payee pointer in force)" : "their vault"}. ${r.why}`.trim(), tone: "ok" });
          lines2.push({ text: "Signing sends them an invoice request, sealed: the payment\u2019s fingerprint (the commitment: who pays whom, how much, for what, where), for their side to bind. Nothing is paid yet; you pay in your own wallet, from Waiting, To pay." });
        } catch (e3) {
          unknown = true;
          lines2.push({ text: message2(e3), tone: "warn" });
        }
      }
      if (dr.what === "anchor" && dr.anchor) lines2.push({ text: `For an anchor of one act on the Bitcoin clock, through the service\u2019s standing offer ${short(dr.anchor.offer)}, tier ${dr.anchor.tier}. The service is sent the leaf (a fingerprint mixed with a random secret ${dr.app} keeps), never the act. Whether the payment follows its offer is Agreements\u2019 to judge: unknown here.` });
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
      book.drafts[id] = { found: now3(), stage: "new", payment: null };
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
  // ------------------------------------------------------------ the act menu: Rely on it, Anchor it (decided by Nobody, allegedly: "Agreed")
  /**
   * Rely on an act (a receipt, a claim, any act shown): the witness act
   * (Identity type 15) signed once RELY is typed, as everywhere, its key
   * checked first (H80); through Kišib's panel where the identity is used
   * through it. It keeps that act visible as disputed should its author ever
   * disown it.
   */
  rely(a) {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      if (a.typed.trim() !== "RELY") throw new Error("Type RELY to sign the witness act. Nothing was signed.");
      const id = readActId(a.id);
      if (book.acts[id]?.from === me.id || me.f.sequence.includes(id)) throw new Error("It is this identity\u2019s own act: a witness act names other identities\u2019 acts. Nothing was signed.");
      await this.current(me);
      let made;
      try {
        made = await me.witness([id], { shown: WITNESS_EXPLANATION, relays: s.relays });
      } finally {
        await this.store.saveIdentity(me);
      }
      if (!made.sent.some((x) => x.result)) throw new Error(`No home took the witness act: ${made.sent.map((x) => `${x.home}: ${x.error}`).join("; ")}. It is signed here, not published.`);
      return { lines: [{ text: `You rely on ${short(id)}: witness act ${short(made.id)}, public at this identity\u2019s homes and relays. It keeps that act visible as disputed should its author ever disown it.`, tone: "ok" }] };
    });
  }
  /** An anchoring service's standing offers (the anchoring cMIP), read from its public acts. */
  anchorOffers(a) {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const service = readId(a.service);
      const acc = this.acceptedSet(await this.accepted(me));
      const found = await offers(service, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via);
      return { offers: found.map((o) => ({ act: o.act, unit: o.unit, words: o.words, tiers: o.tiers.map((t, i) => ({ tier: i, words: `within ${t.blocks} block${t.blocks === 1 ? "" : "s"}, ${say({ unit: o.unit, value: t.price }, acc)}` })) })) };
    });
  }
  /**
   * Anchor an act (a receipt, a claim, any act shown), in one step here:
   * the service's standing offer followed, a tier chosen; the payment
   * prepared and its invoice request signed at once, as a pasted draft is;
   * the blind kept here. The service answers with an invoice and a ticket,
   * paid in To pay; it shows in Account › Anchors.
   */
  async anchor(a) {
    const id = readActId(a.id);
    const service = readId(a.service);
    const { me, s } = await this.serial(() => this.ctx());
    const offer = (await offers(service, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via)).find((o) => o.act === a.offer);
    if (!offer) throw new Error("That offer was not found at the service\u2019s places. Nothing was signed.");
    const tier = offer.tiers[a.tier];
    if (!tier) throw new Error("The offer has no such tier. Nothing was signed.");
    const blind = new Uint8Array(randomBytes(32));
    const leaf = anchoringLeaf(id, blind);
    const d = { what: "anchor", other: service, amount: { unit: offer.unit, value: tier.price }, whatFor: `an anchor of ${short(id)}`, app: "Damgar", anchor: { offer: offer.act, tier: a.tier, leaf } };
    const pasted = await this.paste(base64(draftPayload(d)));
    await this.serial(async () => {
      const { book } = await this.ctx();
      (book.anchored ??= {})[pasted.id] = { act: id, blind: hex(blind), leaf, service, offer: offer.act, tier: a.tier, at: now3() };
      await this.saveBook(me.id, book);
    });
    const signed = await this.signDraft(pasted.id);
    return { lines: [{ text: `An anchor of ${short(id)} asked of ${short(service)}, tier ${a.tier} (within ${tier.blocks} blocks): the invoice request signed and sent. When the service answers with its invoice and ticket, pay it in To pay; it shows in Account \u203A Anchors. The blind is kept here.`, tone: "ok" }, ...signed.lines.slice(1)] };
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
        book.requestsOut[req] = { to: dr.other, at: now3(), obligation: null, payment: null };
        x.stage = "signed";
        await this.saveBook(me.id, book);
        return { lines: [{ text: `The request was sent to ${short(dr.other)}, sealed. Their Damgar offers them to pay it, or accept it as a debt.`, tone: "ok" }] };
      }
      const p = await this.bind(me, s, book, {
        payee: dr.other,
        amount: dr.amount,
        fulfils: dr.what === "anchor" ? dr.anchor.offer : await this.followsOf(me, s, book, id, dr),
        whatFor: dr.whatFor,
        answers: null,
        draft: id,
        ticket: dr.what === "anchor" ? { leaf: dr.anchor.leaf, tier: dr.anchor.tier } : null
      });
      x.stage = "signed";
      x.payment = p.key;
      await this.saveBook(me.id, book);
      return { lines: [{ text: `The invoice request was sent to ${short(dr.other)}, sealed. When they answer, the payment shows in Waiting, To pay.`, tone: "ok" }] };
    });
  }
  /** Decline a draft or a request: nothing is signed, nothing is sent. */
  decline(id) {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      if (book.drafts[id]?.stage === "new") book.drafts[id].stage = "declined";
      else if (book.laneRequests?.[id]?.stage === "new") book.laneRequests[id].stage = "declined";
      else if (book.requestsIn[id] && (book.requestsIn[id].stage === "new" || book.requestsIn[id].stage === "debt")) book.requestsIn[id].stage = "declined";
      else if (book.uncounted?.[id]?.stage === "new") book.uncounted[id].stage = "set aside";
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
      return { lines: [{ text: `The invoice request was sent to ${short(x.from)}, sealed. When they answer, the payment shows in Waiting, To pay.`, tone: "ok" }] };
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
      const claim = await this.deliver(me, s, book, MONEY, made.type, made.payload, p.service ?? p.other, void 0, await this.claimHow(me, s, p, made), await this.purchaseReaders(me, s, p));
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
  /**
   * Who must be able to read a purchase's claim besides its payee or service
   * (the money messages cMIP, draft 5, 9; decided with the MOR lead, 23
   * October 2026: "every member of the collective's agreement in force, or
   * every party of the version the purchase names"): the parties of the
   * version the purchase names, read as anyone reads it. None for a payment
   * that is no purchase, or a lone seller's.
   */
  async purchaseReaders(me, s, p) {
    if (!p.purchase) return [];
    const places = await collectivePlaces(p.other, [...s.relays, ...me.f.homes.map((h) => h.hint)], s.via).catch(() => [...s.relays]);
    for (const v of [p.purchase[1], p.purchase[0]]) {
      const t = await termsAt(v, places, s.via).catch(() => null);
      if (t?.parties?.length && t.parties.length > 1) return t.parties;
    }
    return [];
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
      const lane2 = keys.lanes?.find((x) => x.grant === how.grant);
      if (!lane2) throw new Error("That lane\u2019s key is not held here. Nothing was signed.");
      try {
        act = signUnderGrant({ grant: lane2.grant, grantor: me.id, secret: lane2.secret, strand: lane2.strand }, { spec: MONEY, type: made.type, payload: made.payload, public: true, acks });
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
  /**
   * This identity's own claims of one of its payments, with their bytes and
   * content keys where private (sealed to the payee): what a buyer's contest
   * names as the purchase (F386), and what the core needs to read it.
   */
  ownClaims(key) {
    return this.serial(async () => {
      const { book } = await this.ctx();
      const p = book.payments[key];
      if (!p || p.side !== "out") return [];
      return [.../* @__PURE__ */ new Set([...p.claims, ...p.publicClaims ?? []])].flatMap((id) => {
        const k = book.acts[id];
        return k ? [{ id, act: b642(k.act), key: k.key ? b642(k.key) : null }] : [];
      });
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
    lines2.push({ text: `The buyer followed a repost by ${short(c.referral.identity)}: your offer promises ${share2}% to the reposter. Its payment is prepared (${say(amount, /* @__PURE__ */ new Set([amount.unit]))}): Damgar signs it by itself under your referral lane, or it waits in Waiting. A promise in words, not judged by the core (F351).`, tone: "ok" });
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
      return `the reposter was not found (${message2(e3)})`;
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
        problems.push(`A receipt Damgar could not sign by itself: ${message2(e3)}`);
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
        lines2.push({ text: `The referral share to ${short(dr.other)} is asked for by itself, under your referral lane: when they answer, it is in Waiting, To pay, to pay in your wallet.`, tone: "ok" });
      } catch (e3) {
        lines2.push({ text: `The referral share to ${short(dr.other)} waits in Waiting (${message2(e3)}).` });
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
      const others = [...Object.values(book.payments).map((p) => p.other), ...Object.values(book.requestsIn).map((r) => r.from), ...Object.values(book.requestsOut).map((r) => r.to), ...Object.values(book.shared ?? {}).map((x) => x.payee)];
      const problems = [];
      let l = null;
      try {
        l = await this.judge(me, s, book, others);
      } catch (e3) {
        problems.push(`This identity could not be looked up: ${message2(e3)}`);
      }
      const opts = await this.judgeOpts(me);
      const payments = Object.values(book.payments).sort((a, b) => b.at - a.at).map((p) => {
        const proofs = [...p.claims.map((a) => ["claim", a]), ...p.receipts.map((a) => ["receipt", a])].map(([kind, act]) => {
          let j = { rail: { answer: "unknown", why: "not judged" }, beside: { answer: "unknown", why: "" }, standing: "unknown" };
          try {
            if (l) j = l.verifier.moneyJudge(act, opts);
          } catch (e3) {
            j.rail.why = message2(e3);
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
      const deals = /* @__PURE__ */ new Map();
      const dealOf = async (fulfils, purchase) => {
        const places2 = [...s.relays, ...me.f.homes.map((h) => h.hint)];
        let version2 = purchase?.[0] ?? null;
        if (!version2) {
          for (const h of places2) {
            const act = await relayAt(h, s.via).getAct(fulfils).catch(() => null);
            if (!act) continue;
            const d = describeAct(act);
            if (d.spec === MIRS.agreements && d.type === AGREEMENTS_TYPES.terms) version2 = fulfils;
            else if (d.spec === MIRS.agreements && d.type === AGREEMENTS_TYPES.offer && d.payload) {
              const u2 = cborDecode(d.payload).get(0);
              if (u2 instanceof Uint8Array) version2 = hex(u2);
            }
            break;
          }
        }
        if (!version2) return null;
        if (!deals.has(version2)) deals.set(version2, await readDeal(version2, places2, s.via).catch(() => null));
        return deals.get(version2) ?? null;
      };
      for (const [i, x] of payments.entries()) {
        const p = book.payments[x.key];
        if (!p) continue;
        const d = await dealOf(p.fulfils, p.purchase ?? null);
        if (d && d.parties.length > 1) payments[i] = { ...x, deal: d.name ?? "a shared work" };
      }
      const shared = /* @__PURE__ */ new Map();
      const collectives = /* @__PURE__ */ new Set();
      const entry = (d) => {
        let e3 = shared.get(d.version);
        if (!e3) shared.set(d.version, e3 = { version: d.version, name: d.name ?? "a shared work", ...collectives.has(d.version) ? { collective: true } : {}, payments: [], payouts: [] });
        return e3;
      };
      const railOf = (receipt, whose) => {
        let rail = { answer: "unknown", why: "its receipt could not be judged here" };
        try {
          if (l) rail = l.verifier.moneyJudge(receipt, opts).rail;
        } catch (e3) {
          rail = { answer: "unknown", why: message2(e3) };
        }
        return { rail, standing: rail.answer === "valid" ? `receipted ${whose}; the rail says valid` : `receipted ${whose}; the rail says ${rail.answer}${rail.why ? ` (${rail.why})` : ""}: whether it was paid is unknown here` };
      };
      for (const [receipt, x] of Object.entries(book.shared ?? {})) {
        const d = await dealOf(x.fulfils, null);
        if (!d || !d.parties.includes(me.id)) continue;
        entry(d).payments.push({ receipt, payer: this.who(x.payer, me.id), amount: shown(x.amount), kind: x.purchase ? "a sale" : "a tip", ...railOf(receipt, "by its split service in the deal\u2019s payee\u2019s name") });
      }
      const places = [...s.relays, ...me.f.homes.map((h) => h.hint)];
      for (const [split, x] of Object.entries(book.splits ?? {})) {
        if (!deals.has(x.agreement)) {
          let d2 = await readDeal(x.agreement, places, s.via).catch(() => null);
          if (!d2) {
            const t2 = await termsAt(x.agreement, places, s.via).catch(() => null);
            if (t2?.grammar && t2.parties?.includes(me.id)) {
              d2 = { version: x.agreement, name: "a collective\u2019s work", text: "", parties: t2.parties, owners: [], payee: null, service: x.service, grant: null, referral: 0 };
              collectives.add(x.agreement);
            }
          }
          deals.set(x.agreement, d2);
        }
        const d = deals.get(x.agreement);
        if (!d) continue;
        const unitOf2 = (value) => x.unit ?? book.shared?.[x.receipt]?.amount.unit ?? payments.find((p) => p.side === "in" && p.other.id === x.service && p.amount.value === value)?.amount.unit ?? null;
        if (collectives.has(x.agreement) && !entry(d).payments.some((y) => y.receipt === x.receipt)) {
          const r = this.moneyOf(book, x.receipt);
          const mine = x.mine.reduce((n, m) => n + m.amount, 0);
          const judged = r ? railOf(x.receipt, "in the collective\u2019s name") : (
            // Sealed to the collective, whose keys this Damgar (holding your identity alone) does not hold: Edubba opens it, Damgar cannot judge it.
            { rail: { answer: "unknown", why: "its receipt is sealed to the collective, which this Damgar does not open" }, standing: "your share named in its split service\u2019s split; its receipt is sealed to the collective, which this Damgar does not open: whether it was paid is unknown here" }
          );
          entry(d).payments.push({ receipt: x.receipt, payer: this.who(typeof r?.payer === "string" ? r.payer : "", me.id), amount: shown(r?.amount ?? { unit: unitOf2(mine) ?? "", value: mine }), kind: r && !r.purchase ? "a tip" : "a sale", ...judged });
        }
        for (const m of x.mine) {
          const unit = unitOf2(m.amount);
          const paid = payments.some((p) => p.side === "in" && p.other.id === x.service && p.amount.value === m.amount && (!unit || p.amount.unit === unit) && p.proofs.some((y) => y.rail.answer === "valid"));
          entry(d).payouts.push({ split, amount: shown({ unit: unit ?? "", value: m.amount }), role: m.role, paid });
        }
      }
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
        shared: [...shared.values()],
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
      request: p.invoiceRequest || null,
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
    const read4 = { grantee: me.id, scope: 2, kinds: g.kinds, limits: g.limits, limitsProblem: null, key: "" };
    const kindSaid = (k) => k.spec === MONEY && k.type === 2 ? "receipts (\u201CI received this\u201D)" : k.spec === MONEY && k.type === 3 ? "payment claims (\u201CI paid this\u201D)" : MESSAGES_SPECS.includes(k.spec) && k.type === 3 ? "invoice requests (asking a payee where to pay)" : MESSAGES_SPECS.includes(k.spec) && k.type === 4 ? "answers to invoice requests (an invoice, or an address)" : `acts of type ${k.type} of ${k.spec.slice(0, 8)}\u2026`;
    const out = [
      `A lane named \u201C${g.label}\u201D, asked by ${g.app}: a grant of this identity to itself (Agreements draft 15, rule 73, F351), naming a key that ${g.app} made and holds. With it, ${g.app} signs in your name, by itself, without opening Damgar, within these limits only.`,
      `What it may sign: ${g.kinds.map(kindSaid).join("; ")}. Nothing else: never a grant, a revocation, a pointer, a debt or a post.`,
      g.limits?.cap ? `How much one act may move: at most ${say({ unit: g.limits.cap.unit, value: g.limits.cap.value }, acc)} (the grant limits cMIP, 2). An act above it is refused before it is signed, and one signed anyway counts for nothing.` : "How much one act may move: no cap. A lane without a cap is refused here.",
      g.total ? `In all: at most ${say({ unit: g.total.unit, value: g.total.value }, acc)} for the whole lane (the grant limits cMIP, draft 3, 8). ${TOTAL_SAY}` : "",
      g.limits?.expiry?.clock === "timestamp" ? grantInWords(read4, me.id, short).find((l) => l.startsWith("Until")) ?? "" : "Until: no expiry; it ends only when you revoke it.",
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
      if (!clock) throw new Error("An expiry is judged on a timestamp clock: name one in Lanes, In force (its ID), or leave Until empty.");
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
      lines2.push({ text: `Its limits cannot be read (${message2(e3)}): it cannot be granted.`, tone: "warn" });
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
      (book.lanes ??= {})[grant] = { label: r.label, app: r.app, key: r.key, kinds: r.kinds, limits, at: now3(), revoked: null, here: false, role: null, total };
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
    const limits = this.laneLimits({ unit: a.unit, value: Number(String(a.cap).replace(/[\s_]/g, "")) }, a.until ?? null, s.clock ?? DUBSAR_CLOCK_ID);
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
      const limits = this.laneLimits({ unit: a.unit, value: Number(String(a.cap).replace(/[\s_]/g, "")) }, a.until ?? null, s.clock ?? DUBSAR_CLOCK_ID);
      const g = this.ownLaneShape(a.role, limits);
      const k = makeGrantKey();
      const keys = await this.keys(me.id);
      const grant = await this.grantLaneActs(me, s, { key: hex(k.public[1]), kinds: g.kinds, limits });
      keys.lanes = [...keys.lanes ?? [], { grant, label: g.label, secret: hex(k.secret), strand: [], kinds: g.kinds, limits, role: a.role }];
      await this.store.write(me.id, "keys", keys);
      (book.lanes ??= {})[grant] = { label: g.label, app: "Damgar", key: hex(k.public[1]), kinds: g.kinds, limits, at: now3(), revoked: null, here: true, role: a.role };
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
        const expired = l.limits?.expiry?.clock === "timestamp" && now3() > l.limits.expiry.time;
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
          // What is paid apart from what is only asked (H107): asked holds its amount against the cap in all, but no money has moved.
          paid: under && unitOfLane ? shown(spent(under.payments.filter((p) => p.stage === "paid").map((p) => ({ amount: p.amount, refused: false })), unitOfLane)) : null,
          asked: under && unitOfLane ? shown(spent(under.payments.filter((p) => p.stage === "asked").map((p) => ({ amount: p.amount, refused: false })), unitOfLane)) : null,
          payments: under ? await Promise.all(under.payments.map(async (p) => ({ key: p.key, to: { ...this.who(p.payee, me.id), name: await this.nameOf(p.payee, hints, s.via).catch(() => null) }, amount: { ...p.amount, said: say(p.amount, acc) }, whatFor: p.whatFor, stage: p.stage, request: p.request, claims: p.claims }))) : [],
          sealed: under?.sealed ?? 0
        });
      }
      void keys;
      return { lanes: out, manual: !!s.manual, link: !!keys.link, linkSay: LINK_SAY, clock: s.clock ?? DUBSAR_CLOCK_ID, dubsar: !s.clock && !!DUBSAR_CLOCK_ID };
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
        at: now3(),
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
      const refused = refuseBeforeSigning(l.limits, { spec, type, payload }, MONEY, now3());
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
   * Where an identity is paid, as anyone reads it (H100: "Currencies and
   * rails accepted can live on the profile page"): its payee pointer in
   * force, each rail by name, with what it names (a node, a key, its
   * network, so its unit). Null where it publishes none.
   */
  async pointerOf(id) {
    const { me, s } = await this.ctx();
    const { look, acts } = await this.payee(id, me, s);
    const ptr = look.verifier.moneyPointer(MONEY, id);
    if (!ptr.act || !acts.get(ptr.act)?.payload) return null;
    const pp = moneyRead(0, acts.get(ptr.act).payload).act;
    const unitOn = (module2, address) => {
      const a = module2 === SPEC.lightning.hash ? readLightningAddress(address) : module2 === SPEC.onchain.hash ? readOnchainAddress(address) : null;
      return a ? `${a.network === 0 ? "bitcoin" : NETWORKS[a.network]} satoshis` : "a unit this app does not read";
    };
    return { version: ptr.version, rails: pp.rails.map((r) => ({ name: railName(r.module), said: unitOn(r.module, new Uint8Array(r.address)) })) };
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
    if (a.order?.length) {
      const rank = (m) => {
        const i = a.order.indexOf(m === SPEC.lightning.hash ? "lightning" : "onchain");
        return i < 0 ? a.order.length : i;
      };
      out.sort((x, y) => rank(x.module) - rank(y.module));
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
  async deliver(me, s, book, spec, type, payload, to, refs, how = { by: "hand" }, also = []) {
    const l = await lookUp(to, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via);
    if (!l.encryptionKey) throw new Error(`${short(to)} publishes no encryption key: nothing can be sealed to it. Nothing was sent.`);
    const inbox = l.inbox(spec) ?? (MESSAGES_SPECS.includes(spec) ? MESSAGES_SPECS.map((x) => l.inbox(x)).find((x) => x) : void 0) ?? [];
    if (!inbox.length) throw new Error(`${short(to)} declares no inbox: nothing can be left for it. Nothing was sent.`);
    await this.current(me);
    const others = [];
    for (const id of [...new Set(also)].filter((x) => x !== to && x !== me.id)) {
      try {
        const o = await lookUp(id, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via);
        const ib = o.inbox(spec) ?? o.routes.routes.filter((r) => r.kind === 1).flatMap((r) => r.hints);
        if (o.encryptionKey && ib.length) others.push({ id, key: o.encryptionKey, inbox: ib });
      } catch {
      }
    }
    let made;
    if (how.by === "lane") {
      const keys = await this.keys(me.id);
      const lane2 = keys.lanes?.find((x) => x.grant === how.grant);
      if (!lane2) throw new Error("That lane\u2019s key is not held here. Nothing was signed.");
      try {
        made = signUnderGrant({ grant: lane2.grant, grantor: me.id, secret: lane2.secret, strand: lane2.strand }, { spec, type, payload, public: false, to: [to, ...others.map((x) => x.id)], refs });
      } finally {
        await this.store.write(me.id, "keys", keys);
      }
    } else {
      try {
        made = await this.signAct(me, spec, type, payload, { public: false, to: [to, ...others.map((x) => x.id)], refs });
      } finally {
        await this.store.saveIdentity(me);
      }
    }
    book.acts[made.id] = { act: base64(made.act), key: base64(made.key), from: me.id };
    (book.how ??= {})[made.id] = how;
    const sealed = sealFor(made.act, made.key, [{ id: to, key: l.encryptionKey }, ...others.map((x) => ({ id: x.id, key: x.key }))]);
    let left = 0;
    for (const h of inbox) {
      try {
        await relayAt(h, s.via).putSealed(sealed);
        left++;
      } catch {
      }
    }
    for (const h of [...new Set(others.flatMap((x) => x.inbox))].filter((x) => !inbox.includes(x))) await relayAt(h, s.via).putSealed(sealed).catch(() => void 0);
    const throughKisib = how.by === "lane" && !!this.opts.app && !me.f.signingSecret && !!this.opts.runner;
    await leaveAtHomes(me, made, { via: s.via, lockedOnly: how.by === "lane" && !(this.opts.app && me.f.signingSecret) });
    if (throughKisib) await this.laneRecordThroughKisib(me, s, made).catch(() => void 0);
    await this.store.saveIdentity(me);
    if (!left) throw new Error(`${short(to)}\u2019s inbox (${inbox.join(", ")}) took nothing. It was signed and kept here; try again later.`);
    return made.id;
  }
  /**
   * The record of a payment made under the lane, for an identity used
   * through Kišib (the Dubsar runner cMIP, draft 3, 7.5): its key delivered
   * to the identity itself, signed by Kišib without a panel, sealed to the
   * identity's own encryption key and left at its homes, where Damgar reads
   * it. Where Kišib does not sign it, the payment stays sealed, not counted.
   */
  async laneRecordThroughKisib(me, s, made) {
    const own = me.f.encryption.at(-1);
    const key = own?.secret ? xwingPublic(unhex(own.secret)) : own?.public ? unhex(own.public) : null;
    if (!key) return;
    try {
      const kd = await me.signApartNow(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, keyDeliveryPayload(made.id, made.key, false), { to: [me.id] });
      const sealed = sealFor(kd.act, kd.key, [{ id: me.id, key }]);
      for (const h of me.f.homes) await relayAt(h.hint, s.via).putSealed(sealed).catch(() => void 0);
    } finally {
      await this.store.saveIdentity(me);
    }
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
    case "accept later":
      return d.acceptLater();
    case "first back":
      return d.firstBack();
    case "clock words":
      return d.clockWords(list2(a.ids));
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
      return d.setAccepted(list2(a.keys), a.in === "here" ? "here" : "list");
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
      return d.railsReview({ lightning: text2(a.lightning), onchain: text2(a.onchain), network: Number(a.network ?? 3), newRequestKey: a.newRequestKey === true, order: Array.isArray(a.order) ? list2(a.order) : void 0 });
    case "rails publish":
      return d.publishRails({ lightning: text2(a.lightning), onchain: text2(a.onchain), network: Number(a.network ?? 3), newRequestKey: a.newRequestKey === true, order: Array.isArray(a.order) ? list2(a.order) : void 0, digest: text2(a.digest) });
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
    case "collective remove":
      return d.collectiveRemove(text2(a.id));
    case "make":
      return d.make({ homes: list2(a.homes), relays: list2(a.relays) });
    case "make confirm":
      return d.makeConfirm(list2(a.typed));
    case "rely":
      return d.rely({ id: text2(a.id), typed: text2(a.typed) });
    case "anchor offers":
      return d.anchorOffers({ service: text2(a.service) });
    case "anchor":
      return d.anchor({ id: text2(a.id), service: text2(a.service), offer: text2(a.offer), tier: Number(a.tier) });
    case "tip":
      return d.tip({ to: text2(a.to), value: text2(a.value), unit: text2(a.unit), whatFor: text2(a.whatFor) });
    case "paste":
      return d.paste(text2(a.text));
    case "runner":
      return d.runnerState();
    case "runner pair":
      return d.runnerPair();
    case "runner take":
      return d.runnerTake({ id: text2(a.id) });
    case "runner asking":
      return d.runnerAsking();
    case "runner drop":
      return d.runnerDrop({ request: text2(a.request) });
    case "runner unpair":
      return d.runnerUnpair();
    case "names":
      return d.names({ ids: list2(a.ids), fresh: a.fresh === true });
    case "contacts":
      return d.contacts({ fresh: a.fresh === true });
    case "contact add":
      return d.contactChange({ op: "add", id: text2(a.id), nick: text2(a.nick) });
    case "contact nick":
      return d.contactChange({ op: "nick", id: text2(a.id), nick: text2(a.nick) });
    case "contact remove":
      return d.contactChange({ op: "remove", id: text2(a.id) });
    case "answer address":
      return d.answerAddress(text2(a.id));
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
  const named2 = namedOf(s);
  const names = !nameOf(named2) && s.collective && named2.published?.state === "none" ? '<span class="k-nick">a collective</span>' : namesHtml(named2, { retry: false });
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
  const n = nameOf(namedOf(w));
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
  const label = nameOf(n) ?? NAME_WORDS[n.published?.state === "name" ? "none" : n.published?.state ?? "loading"];
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
  return (c.named ? nameOf(c.named) : null) ?? c.name ?? c.names?.[0] ?? shortForm(c.form);
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
      const text3 = cid ? cid.dataset.kCopyId : share2.dataset.kShare;
      void (async () => {
        let said = "";
        if (share2 && typeof navigator.share === "function") {
          try {
            await navigator.share({ title: "My ID on MOR", text: text3 });
            return;
          } catch (err) {
            if (err.name === "AbortError") return;
          }
        }
        said = await copy(text3) ? share2 ? "Copied: paste it where you share it" : "Copied" : "Select it and copy it";
        const was = b.textContent;
        b.textContent = said;
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
  const box = document.createElement("div");
  box.className = `k-frame k-${o.app}`;
  box.setAttribute("role", "dialog");
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
  box.append(by, frame);
  page.append(shade, box);
  pushLayer(box, shade, () => {
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
      popLayer(box);
      box.remove();
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
  const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
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

// ../kit/src/qr.ts
var ECC_PER_BLOCK = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
};
var BLOCKS = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
};
var FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 };
function rawModules(ver) {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const n = Math.floor(ver / 7) + 2;
    r -= (25 * n - 10) * n - 55;
    if (ver >= 7) r -= 36;
  }
  return r;
}
var dataCodewords = (ver, l) => Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[l][ver] * BLOCKS[l][ver];
function gfMul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = z << 1 ^ (z >>> 7) * 285;
    z ^= (y >>> i & 1) * x;
  }
  return z & 255;
}
function rsDivisor(degree) {
  const r = new Array(degree).fill(0);
  r[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = gfMul(r[j], root);
      if (j + 1 < r.length) r[j] ^= r[j + 1];
    }
    root = gfMul(root, 2);
  }
  return r;
}
function rsRemainder(data, div) {
  const r = new Array(div.length).fill(0);
  for (const b of data) {
    const f = b ^ r.shift();
    r.push(0);
    div.forEach((c, i) => r[i] ^= gfMul(c, f));
  }
  return r;
}
function codewords(data, ver, l) {
  const nBlocks = BLOCKS[l][ver];
  const ecLen = ECC_PER_BLOCK[l][ver];
  const raw = Math.floor(rawModules(ver) / 8);
  const nShort = nBlocks - raw % nBlocks;
  const shortLen = Math.floor(raw / nBlocks);
  const div = rsDivisor(ecLen);
  const blocks = [];
  for (let i = 0, k = 0; i < nBlocks; i++) {
    const d = data.slice(k, k + shortLen - ecLen + (i < nShort ? 0 : 1));
    k += d.length;
    const ec = rsRemainder(d, div);
    if (i < nShort) d.push(0);
    blocks.push([...d, ...ec]);
  }
  const out = [];
  for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => (i !== shortLen - ecLen || j >= nShort) && out.push(b[i]));
  return out;
}
function alignment(ver, size) {
  if (ver === 1) return [];
  const n = Math.floor(ver / 7) + 2;
  const step = Math.floor((ver * 8 + n * 3 + 5) / (n * 4 - 4)) * 2;
  const r = [6];
  for (let pos = size - 7; r.length < n; pos -= step) r.splice(1, 0, pos);
  return r;
}
function qr(text3, o = {}) {
  const level = o.level ?? "M";
  const bytes = [...new TextEncoder().encode(text3)];
  let ver = 1;
  for (; ver <= 40; ver++) if (4 + (ver < 10 ? 8 : 16) + bytes.length * 8 <= dataCodewords(ver, level) * 8) break;
  if (ver > 40) throw new Error("Too long for a QR code.");
  const bits = [];
  const put = (v, n) => {
    for (let i2 = n - 1; i2 >= 0; i2--) bits.push(v >>> i2 & 1);
  };
  put(4, 4);
  put(bytes.length, ver < 10 ? 8 : 16);
  for (const b of bytes) put(b, 8);
  const cap = dataCodewords(ver, level) * 8;
  put(0, Math.min(4, cap - bits.length));
  put(0, (8 - bits.length % 8) % 8);
  for (let pad = 236; bits.length < cap; pad ^= 236 ^ 17) put(pad, 8);
  const data = [];
  for (let i2 = 0; i2 < bits.length; i2 += 8) data.push(parseInt(bits.slice(i2, i2 + 8).join(""), 2));
  const all = codewords(data, ver, level);
  const size = ver * 4 + 17;
  const m = Array.from({ length: size }, () => new Array(size).fill(false));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x, y, d) => {
    m[y][x] = d;
    fn[y][x] = true;
  };
  for (let i2 = 0; i2 < size; i2++) {
    set(6, i2, i2 % 2 === 0);
    set(i2, 6, i2 % 2 === 0);
  }
  const finder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
      }
  };
  finder(3, 3);
  finder(size - 4, 3);
  finder(3, size - 4);
  const al = alignment(ver, size);
  for (let i2 = 0; i2 < al.length; i2++)
    for (let j = 0; j < al.length; j++) {
      if (i2 === 0 && j === 0 || i2 === 0 && j === al.length - 1 || i2 === al.length - 1 && j === 0) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(al[i2] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  const format = (mask) => {
    const d = FORMAT_BITS[level] << 3 | mask;
    let rem = d;
    for (let i2 = 0; i2 < 10; i2++) rem = rem << 1 ^ (rem >>> 9) * 1335;
    const b = (d << 10 | rem) ^ 21522;
    const bit = (i2) => (b >>> i2 & 1) !== 0;
    for (let i2 = 0; i2 <= 5; i2++) set(8, i2, bit(i2));
    set(8, 7, bit(6));
    set(8, 8, bit(7));
    set(7, 8, bit(8));
    for (let i2 = 9; i2 < 15; i2++) set(14 - i2, 8, bit(i2));
    for (let i2 = 0; i2 < 8; i2++) set(size - 1 - i2, 8, bit(i2));
    for (let i2 = 8; i2 < 15; i2++) set(8, size - 15 + i2, bit(i2));
    set(8, size - 8, true);
  };
  format(0);
  if (ver >= 7) {
    let rem = ver;
    for (let i2 = 0; i2 < 12; i2++) rem = rem << 1 ^ (rem >>> 11) * 7973;
    const b = ver << 12 | rem;
    for (let i2 = 0; i2 < 18; i2++) {
      const d = (b >>> i2 & 1) !== 0;
      const a = size - 11 + i2 % 3;
      const c = Math.floor(i2 / 3);
      set(a, c, d);
      set(c, a, d);
    }
  }
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let v = 0; v < size; v++)
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = (right + 1 & 2) === 0;
        const y = upward ? size - 1 - v : v;
        if (!fn[y][x] && i < all.length * 8) {
          m[y][x] = (all[i >>> 3] >>> 7 - (i & 7) & 1) !== 0;
          i++;
        }
      }
  }
  const masked = (mask) => {
    const r = m.map((row) => [...row]);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        if (fn[y][x]) continue;
        const inv = [(x + y) % 2 === 0, y % 2 === 0, x % 3 === 0, (x + y) % 3 === 0, (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, x * y % 2 + x * y % 3 === 0, (x * y % 2 + x * y % 3) % 2 === 0, ((x + y) % 2 + x * y % 3) % 2 === 0][mask];
        if (inv) r[y][x] = !r[y][x];
      }
    return r;
  };
  const withFormat = (grid, mask) => {
    const keep = m.map((row) => [...row]);
    format(mask);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (fn[y][x]) grid[y][x] = m[y][x];
    for (let y = 0; y < size; y++) m[y] = keep[y];
    return grid;
  };
  if (o.mask !== void 0) return { size, dark: withFormat(masked(o.mask), o.mask) };
  let best = null;
  let bestScore = Infinity;
  for (let k = 0; k < 8; k++) {
    const g = withFormat(masked(k), k);
    const sc = penalty(g);
    if (sc < bestScore) [best, bestScore] = [g, sc];
  }
  return { size, dark: best };
}
function penalty(g) {
  const size = g.length;
  let r = 0;
  const line = (at) => {
    let color = false;
    let run2 = 0;
    const hist = [0, 0, 0, 0, 0, 0, 0];
    const add = (len) => {
      if (hist[0] === 0) len += size;
      hist.pop();
      hist.unshift(len);
    };
    const count = () => {
      const n = hist[1];
      const core = n > 0 && hist[2] === n && hist[3] === n * 3 && hist[4] === n && hist[5] === n;
      return (core && hist[0] >= n * 4 && hist[6] >= n ? 1 : 0) + (core && hist[6] >= n * 4 && hist[0] >= n ? 1 : 0);
    };
    for (let i = 0; i < size; i++) {
      if (at(i) === color) {
        run2++;
        if (run2 === 5) r += 3;
        else if (run2 > 5) r++;
      } else {
        add(run2);
        if (!color) r += count() * 40;
        color = at(i);
        run2 = 1;
      }
    }
    if (color) {
      add(run2);
      run2 = 0;
    }
    add(run2 + size);
    r += count() * 40;
  };
  for (let y = 0; y < size; y++) line((x) => g[y][x]);
  for (let x = 0; x < size; x++) line((y) => g[y][x]);
  for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) if (g[y][x] === g[y][x + 1] && g[y][x] === g[y + 1][x] && g[y][x] === g[y + 1][x + 1]) r += 3;
  const dark = g.flat().filter(Boolean).length;
  const total = size * size;
  r += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
  return r;
}
function qrSvg(text3, o = {}) {
  const { size, dark } = qr(text3, { level: o.level });
  const q = 4;
  const n = size + q * 2;
  let d = "";
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (dark[y][x]) d += `M${x + q} ${y + q}h1v1h-1z`;
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  return `<svg class="k-qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${o.px ?? 220}" height="${o.px ?? 220}" shape-rendering="crispEdges" role="img" aria-label="${esc(o.label ?? "QR code")}"><rect width="${n}" height="${n}" fill="#fff"/><path fill="#000" d="${d}"/></svg>`;
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
function actFormOf(hex2, label = "mact") {
  if (!/^[0-9a-f]{64}$/.test(hex2)) return hex2;
  const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
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
  return `${label}1${[...data, ...check].map((d) => CHARSET[d]).join("")}`;
}

// src/page/view.ts
var whoOf = (w, inline = true) => who({ id: w.id, me: !!w.me, inline });
var NAME2 = "Damgar";
var TEST_ONLY3 = "Test identities and test networks only, until MOR is frozen. No real money";
var TINT3 = { layer: APPS.damgar.colour, pastel: APPS.damgar.pastel };
var WEB_BANNER3 = `<details class="k-say damgar-banner" id="for-testing-only" role="note"><summary><strong>For testing only.</strong> ${TEST_ONLY3}. Damgar holds no wallet.<span class="k-help" aria-label="more">?</span>${whatIsMor()}</summary><div class="k-more-text"><p>The risks, in plain words:</p>
<ol><li>Whoever serves this page\u2019s code at the moment you bring an identity here could copy its signing key, and the on-chain request key Damgar makes: with them, sign claims and receipts as you, and commit your side to payments you did not intend.</li>
<li>This browser\u2019s storage, where those keys are kept, can be lost, or read by what runs in this page.</li>
<li>Damgar holds no wallet: money moves only in your own wallet, on a test network. This page follows no chain, so an on-chain payment is shown paid, not yet checked against the chain.</li></ol>
<p>Never bring a real identity here, and never pay real money for anything it shows.</p></div></details>`;
var STYLE2 = `${KIT_STYLE}
body:has(.k-page){display:flex;flex-direction:column;height:100vh;height:100dvh}
#app.k-page{flex:1;min-height:0;height:auto}
.damgar-banner{flex:none;margin:0;padding:6px 16px;border-bottom:1px solid var(--k-line);background:var(--k-bg);font:300 12.5px/1.5 "Atkinson Hyperlegible Next",system-ui,sans-serif;color:var(--k-soft)}
.damgar-banner strong{font-weight:400;color:var(--k-text)}
.damgar-banner ol{margin:4px 0;padding-left:1.4em}
.damgar-foot{flex:none;padding:0 28px 10px}
.damgar-first{max-width:640px;margin:0 auto;width:100%;overflow:auto;padding:24px 20px 40px}
.damgar-first h2{font-size:24px;margin:8px 0 4px}
.damgar-pane{max-width:860px;width:100%}
.damgar-pane h2{font-size:24px;margin:2px 0 4px}
.damgar-pane .k-feed{flex:none;max-height:none}
.damgar-pane textarea{min-height:76px}
.damgar-lines{margin:4px 0;padding-left:1.1em;font-size:14px}
.damgar-lines li{margin:3px 0}
li.bad{color:var(--k-bad)}
li.warn{color:var(--k-soft)}
.damgar-qr{display:inline-block;line-height:0;border-radius:8px;overflow:hidden;max-width:100%}
.damgar-qr svg{max-width:100%;height:auto}
.damgar-wallet{margin:6px 0 8px}
.damgar-wallet a.k-btn{text-decoration:none;display:inline-flex;align-items:center}
.damgar-copy{font:12px/1.5 "Atkinson Hyperlegible Mono",ui-monospace,"SF Mono",Menlo,monospace;color:var(--k-soft);overflow-wrap:anywhere;border:1px solid var(--k-edge);border-radius:10px;padding:8px 10px;background:var(--k-bg);margin:6px 0}
.damgar-v{font-size:11.5px;letter-spacing:.04em;text-transform:uppercase;padding:1px 8px;border-radius:999px;border:1px solid var(--k-edge);color:var(--k-soft)}
.damgar-v.valid{color:var(--k-text);border-color:var(--k-p)}
.damgar-v.invalid{color:var(--k-bad);border-color:var(--k-bad)}
.damgar-proofs{border-top:1px solid var(--k-line);margin-top:8px;padding-top:6px;font-size:13px}
.damgar-proofs .p{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin:4px 0}
.damgar-totals{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin:10px 0}
.damgar-totals .k-box{margin:0}
.damgar-totals .k-box.k-fill{background:var(--k-raise)}
.damgar-totals h4{margin:0 0 6px;font-size:13px;color:var(--k-soft);font-weight:400}
.damgar-costs{border:1px solid var(--k-bad);border-radius:14px;padding:10px 16px;margin:10px 0}
.damgar-costs h3{font-size:14px;margin:0 0 4px}
.damgar-accept{list-style:none;padding:0;margin:0}
.damgar-accept li{border:1px solid var(--k-line);border-radius:12px;padding:10px 14px;margin:8px 0}
.damgar-accept .damgar-check{display:flex;gap:8px;align-items:center;color:var(--k-text);font-size:15px;margin:0}
.damgar-accept .k-kind{margin-left:6px}
.damgar-accept p{margin:4px 0 0 26px;font-size:13px;color:var(--k-soft)}
.damgar-check{display:flex!important;gap:8px;align-items:center;color:var(--k-text)!important;font-size:14px!important}
.damgar-lane{border:1px solid var(--k-line);border-radius:14px;padding:12px 16px;margin:10px 0}
.damgar-lane h3{font-size:17px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.damgar-state{font-size:12.5px;padding:2px 10px;border-radius:999px;background:var(--k-wash2);color:var(--k-text)}
.damgar-over{color:var(--k-bad)}
.k-act .damgar-acts{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0 2px}
@media (max-width:600px){
  .k-top .k-tabs{display:none}
  .damgar-foot{padding:0 12px 8px}
}`;
var lines = (ls) => ls.length ? `<ul class="damgar-lines">${ls.map((l) => `<li class="${e(l.tone ?? "")}">${e(l.text)}</li>`).join("")}</ul>` : "";
var formOf = actFormOf;
var TILES = [
  { key: "waiting", name: "Waiting", say: "Payments to read, sign and pay in your wallet; invoices to make, receipts to sign; one pasted by hand; to the vault.", icon: "waiting", danger: 3 },
  { key: "account", name: "Account", say: "In, out, pending, owed. Per unit, never summed across units. What other apps paid under their lanes.", icon: "account", danger: 1 },
  { key: "lanes", name: "Lanes", say: "What each app may pay without asking: a cap per act, a cap in all, kinds, an expiry.", icon: "lanes", danger: 2 },
  { key: "settings", name: "Settings", say: "Where you are paid (the vault set in Ki\u0161ib), the rules you follow, homes and relays, every step by hand.", icon: "settings", danger: 2 }
];
function topBar(s, tab, acting) {
  const i = s.identity;
  const tabs = tab ? `<nav class="k-tabs" aria-label="Damgar">${TILES.map((t) => `<button type="button" class="k-tab${t.key === tab ? " k-on" : ""}" data-tab="${t.key}"${t.key === tab ? ' aria-current="page"' : ""}>${e(t.name)}${t.key === "waiting" && s.counts.toSign + s.counts.toPay ? `<span class="k-count">${s.counts.toSign + s.counts.toPay}</span>` : ""}</button>`).join("")}</nav>` : "";
  const me = i ? meButton({ name: i.name, form: i.form, named: i.named ?? null, as: acting ? { name: acting.name, form: acting.form, named: acting.named ?? null } : null }) : "";
  return top({ left: `<div class="k-row">${contactsButton()}<button type="button" class="k-btn k-q" data-action="home-tiles" title="The four tiles">${appMark(NAME2, "icon.png")}</button></div>${tabs}`, right: me });
}
function home(s, web, acting) {
  const n = s.counts;
  const ts = TILES.map((t) => t.key === "waiting" && n.toSign + n.toPay ? { ...t, say: `To sign: ${n.toSign} \xB7 to pay: ${n.toPay}. Each read in plain words before you sign; paid only in your own wallet.` } : t);
  return `${topBar(s, null, acting)}<div class="k-body k-col-flex">${tiles(ts)}</div>
<div class="damgar-foot">${say2(TEST_ONLY3, [web ? "The web client is for testing only: the banner above says its risks." : "Damgar holds no wallet and no node: money moves only in your own wallet. The signing key and the on-chain request key are held in software in this program\u2019s folder: a prototype, never for a real identity."], { mor: true })}</div>`;
}
function column(tab, s, c, acting) {
  switch (tab) {
    case "waiting":
      return [
        { key: "to-pay", label: "To pay", k: c.toPay },
        { key: "to-receive", label: "To receive", k: c.toReceive },
        ...acting ? ["-", { key: "collective", label: `For ${acting.name ?? "the collective"}` }] : [],
        "-",
        { key: "paste", label: "+ Paste an act to sign" },
        { key: "vault", label: "To the vault" }
      ];
    case "account":
      return [{ key: "summary", label: "Summary" }, { key: "payments", label: "Payments" }, { key: "shared", label: "Shared deals" }, { key: "under", label: "Under the lanes" }, { key: "anchors", label: "Anchors" }];
    case "lanes":
      return [{ key: "asked", label: "Asked", k: c.asked }, { key: "in-force", label: "In force", k: c.inForce }, { key: "own", label: "Damgar\u2019s own" }, "-", { key: "ended", label: "Ended", k: c.ended }];
    case "settings":
      return [{ key: "paid", label: "Where you are paid" }, { key: "accept", label: "Rules I follow" }, { key: "relays", label: "Homes and relays" }, "-", { key: "manual", label: "Every step by hand" }];
  }
}
var firstPart = (tab) => ({ waiting: "to-pay", account: "summary", lanes: "in-force", settings: "paid" })[tab];
function tabPage(s, tab, part, counts, acting) {
  return `${topBar(s, tab, acting)}${opened(column(tab, s, counts, acting), part, `<div class="damgar-pane" id="pane"><p class="k-empty">Reading\u2026</p></div><div id="status" class="k-status"></div>`)}`;
}
function pairing() {
  return `<div class="damgar-first"><h2>Pair this browser</h2>
<p class="k-small k-soft">This page acts for the Damgar program running on this machine, which holds the keys. Open it with the app (it pairs by itself), or enter a code the program gave.</p>
<form id="pair" class="k-row"><input id="pair-code" class="k-grow" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off" required>
<button type="submit" class="k-btn k-p">Pair</button></form><div id="pair-status"></div></div>`;
}
var alone = (html) => `<div class="damgar-first">${appMark(NAME2, "icon.png")}${html}</div>`;
var runnerSay = (web) => web ? "through Ki\u0161ib\u2019s runner, in the computer\u2019s program only: never in the web client" : "through Ki\u0161ib\u2019s runner, on this Mac: Damgar holds no key, and Ki\u0161ib\u2019s panel asks for every money act";
var ADD = (web) => [
  { key: "make", label: "Make one", say: "its chain key\u2019s words shown once" },
  { key: "bring", label: "Bring one", say: "its ID and its signing key\u2019s words" },
  { key: "kishib", label: "Use one from Ki\u0161ib", say: runnerSay(web), empty: web }
];
function firstScreen(web, part = "bring") {
  return `<div class="damgar-first">${appMark(NAME2, "icon.png")}<h2>First, an identity</h2>
<p class="k-soft">Damgar holds no wallet: it reads money acts in plain words, signs them for you, and keeps the account. It needs an identity to sign as.</p>
<div class="k-row">${ADD(web).map((a) => `<button type="button" class="k-btn${a.key === part ? " k-p" : ""}" data-add="${a.key}"${a.empty ? " disabled" : ""}>${e(a.label)}</button>`).join("")}</div>
<div id="first-part">${part === "make" ? makeForm() : part === "kishib" ? '<p class="k-small k-soft">Reading Ki\u0161ib\u2019s runner\u2026</p>' : bringForm()}</div>
<div id="status" class="k-status"></div></div>`;
}
function bringForm() {
  return `<form id="bring"><p class="k-small k-soft">By its ID and its signing key\u2019s words, as Dub, Edubba or Ki\u0161ib show them (never the chain key\u2019s).</p>
<label>Its ID (mid1\u2026, or its hexadecimal)</label><div class="k-row"><input name="id" class="k-grow" autocomplete="off" spellcheck="false" required>${contactsButtonFor("id")}</div>
<label>Its signing key\u2019s 24 words</label><textarea name="words" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required></textarea>
<label>An address where it is found (one of its homes)</label><input name="address" placeholder="https://" required>
<label>Relays, one per line, if it names none</label><textarea name="relays"></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Bring it</button></div></form>`;
}
function makeForm() {
  return `<form id="make"><p class="k-small k-soft">Its chain key\u2019s 24 words are shown once, for you to write on paper; Damgar keeps none of them. Three are typed back before anything is published.</p>
<label>Its homes, one per line (where it lives; anyone checks it there)</label><textarea name="homes" required placeholder="https://"></textarea>
<label>Its relays, one per line (its acts and its inbox); its homes if none</label><textarea name="relays"></textarea>
<div class="k-row"><button type="submit" class="k-btn k-p">Make it</button></div></form>`;
}
function makeWords(r) {
  return `<div class="k-box"><h3>Its chain key\u2019s words</h3><p class="k-small k-soft">Write them on paper, in order, now. They are shown once: Damgar keeps none of them. With them, in Ki\u0161ib, you change its keys, its vault, its successor.</p>
<div class="k-words">${r.words.map((w, i) => `<span><b>${i + 1}</b>${e(w)}</span>`).join("")}</div></div>
<form id="make-confirm"><p class="k-small k-soft">Hide them, then type back words ${r.positions.join(", ")}.</p>
<div class="k-row">${r.positions.map((p) => `<label class="k-grow">Word ${p}<input name="w${p}" autocomplete="off" autocapitalize="off" spellcheck="false" required></label>`).join("")}</div>
<div class="k-row"><button type="submit" class="k-btn k-p">Publish it</button></div></form>`;
}
function runnerForm(r) {
  if (!r.available) return `<p class="k-small k-soft">Ki\u0161ib\u2019s runner is in the computer\u2019s program only, on the Mac: never in the web client. Bring the identity here by its words instead.</p>`;
  const ids = r.identities.length ? `<div class="k-list">${r.identities.map((x) => `<div><span>${who({ id: x.id, named: x.name ? { published: { state: "name", name: x.name } } : null, inline: true })}</span><button type="button" class="k-btn k-small k-r" data-runner-take="${e(x.id)}">${x.held ? "Use it" : "Use it here"}</button></div>`).join("")}</div>` : "";
  return `${r.problem ? note("error", e(r.problem)) : ""}
${say2("Ki\u0161ib keeps the identity\u2019s signing key on this Mac; Damgar holds none.", ["Pairing starts here and is approved in Ki\u0161ib (Runner, Apps), comparing the code. Then every money act Damgar would sign is a request to Ki\u0161ib, and Ki\u0161ib\u2019s panel appears inside Damgar\u2019s window: money always asks. Allow \u201Cmay open what is sealed to this identity\u201D in Ki\u0161ib, or Damgar cannot read what waits for it."])}
${r.state === "approved" ? `<p class="k-small">Ki\u0161ib approved Damgar (code ${e(r.code ?? "")}). The identities it lets Damgar use:</p>${ids || '<p class="k-small k-soft">None yet: choose some for Damgar in Ki\u0161ib.</p>'}` : r.state === "waiting" ? `<p>Approve Damgar in Ki\u0161ib (Runner, Apps), comparing this code: <span class="k-mono">${e(r.code ?? "")}</span></p><div class="k-row"><button type="button" class="k-btn" data-action="runner-look">I approved it in Ki\u0161ib</button></div>` : `<div class="k-row"><button type="button" class="k-btn k-p" data-action="runner-pair">Ask Ki\u0161ib to pair</button></div>`}`;
}
function acceptList(items) {
  return `<ul class="damgar-accept">${items.map(
    (a) => `<li><label class="damgar-check"><input type="checkbox" name="accept" value="${e(a.key)}"${a.accepted ? " checked" : ""}> ${e(a.name)}<span class="k-kind">${e(a.kind)}, draft ${a.draft}</span></label>
<p>${e(a.does)}</p><p>${e(a.here)}</p><p class="k-faint">${e(a.text)}${a.built ? "" : " \xB7 not used by Damgar yet"}${a.needs.length ? ` \xB7 needs ${a.needs.map(e).join(", ")}` : ""}</p></li>`
  ).join("")}</ul>`;
}
function acceptScreen(s) {
  return `<div class="damgar-first">${appMark(NAME2, "icon.png")}<h2>Rules I follow</h2>
${say2("Damgar signs only under what you accept here; anything else is shown unknown, never signed.", ["Every money act names the specifications it follows. Damgar reads, checks and signs only under those you accept; an act under any other is shown unknown, as the core treats a specification it does not implement. Your choice is sealed to your identity and kept at its homes, so every app holding it reads the same list; changeable in Settings."])}
${s.list.problems.length ? note("", lines(s.list.problems.map((t) => ({ text: t, tone: "warn" })))) : ""}
<form id="accept">${acceptList(s.accept)}<div class="k-row"><button type="submit" class="k-btn k-p">Add these to my list</button><button type="submit" class="k-btn" data-in="here">In Damgar only</button><button type="button" class="k-btn" data-action="accept-later">Later</button><span class="k-grow"></span><button type="button" class="k-btn k-q" data-action="first-back">\u2190 Another identity</button></div><p class="k-small k-soft">Later: every money act is shown unknown until you choose, in Settings, Rules I follow.</p></form><div id="status" class="k-status"></div></div>`;
}
var IDENTITY_MENU = [
  ["words", "Words", ""],
  ["line", "Line and homes", ""],
  ["renew", "New words from Ki\u0161ib", "after a change of keys"],
  ["collective", "A collective under it", ""],
  ["remove", "Remove from Damgar\u2026", ""]
];
function wordsShown(c) {
  return `<p class="k-small k-soft">With the ID, they bring this identity into Damgar, Dub or Edubba on another device. Whoever holds them can sign claims and receipts as this identity and open what is sealed to it. They are not the chain key\u2019s words, and not a Bitcoin wallet\u2019s.</p>
<p class="k-mono">${e(c.grouped)}</p><div class="k-words">${c.words.map((w, i) => `<span><b>${i + 1}</b>${e(w)}</span>`).join("")}</div>`;
}
function lineShown(s) {
  const i = s.identity;
  return `<dl class="k-facts"><dt>ID</dt><dd class="k-mono">${e(i.form)}</dd><dt>Homes</dt><dd>${e(i.homes.join(", "))}</dd><dt>Relays</dt><dd>${e(i.relays.join(", "))}</dd><dt>Damgar\u2019s line</dt><dd>${cardWords(i.line, "Damgar", e)}</dd></dl>
${say2("Give Ki\u0161ib this card at a change of keys.", ["Most of Damgar\u2019s acts are sealed, so Ki\u0161ib cannot read its line from the homes: when the signing key is changed there, give Ki\u0161ib this card (latest act, position, summary), or every claim and receipt signed here becomes void."])}
${i.encryption ? "" : note("error", "Damgar holds no encryption key for this identity: nothing sealed to it opens here.")}`;
}
function renewForm() {
  return `<form id="renew"><p class="k-small k-soft">Its signing key was changed elsewhere (in Ki\u0161ib): give the new signing key\u2019s words, and Damgar signs with them, in a new line.</p><label>The new signing key\u2019s 24 words</label><textarea name="words" required autocomplete="off" autocapitalize="off" spellcheck="false"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Use the new words</button></div></form>`;
}
function collectiveForm(cs) {
  return `<p class="k-small k-soft">A collective whose Money area you hold: Damgar acts for it with your own key for it, sealed to you when you signed its founding. Then choose it under this identity in the panel: Waiting shows its part.</p>
${cs.length ? `<div class="k-list">${cs.map((c) => `<div><span>${who({ id: c.id, collective: true, inline: true })}</span><button type="button" class="k-btn k-q k-small k-r" data-collective-remove="${e(c.id)}">Stop acting for it</button></div>`).join("")}</div>` : ""}
<form id="collective-add" class="k-row"><input name="id" class="k-grow" placeholder="A collective\u2019s ID (mid1\u2026 or hex)" autocomplete="off" spellcheck="false" required>${contactsButtonFor("id")}<button type="submit" class="k-btn k-p">Act for it</button></form>`;
}
var verdict = (v) => `<span class="damgar-v ${e(v.answer)}" title="${e(v.why)}">${e(v.answer)}</span>`;
var btn = (action, id, label, primary = false, key = "id") => `<button type="button" class="k-btn${primary ? " k-p" : " k-q"}" data-action="${e(action)}" data-${key}="${e(id)}">${e(label)}</button>`;
function itemActs(t) {
  const offers2 = t.offers.map((o) => {
    switch (o) {
      case "sign":
        return btn("sign draft", t.id, t.kind === "draft" && t.title.startsWith("A request") ? "Sign and send the request" : "Sign it", true);
      case "decline":
        return btn("decline", t.id, t.kind === "unknown" ? "Set it aside" : "Decline");
      case "debt":
        return btn("accept debt", t.id, "Accept as a debt");
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
  const invoice = t.offers.includes("invoice") ? `<label>The description hash to give your wallet</label><div class="damgar-copy">${e(t.descriptionHash ?? "")}</div><button type="button" class="k-btn k-q k-small" data-action="copy" data-text="${e(t.descriptionHash ?? "")}">Copy it</button>
<form class="invoice" data-id="${e(t.id)}"><label>The invoice your wallet made (BOLT 11)</label><textarea name="invoice" required spellcheck="false" placeholder="lnbcrt\u2026"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Check it and send it</button></div></form>` : "";
  return `${t.amount ? `<p>${e(t.amount.said)}</p>` : ""}${lines(t.lines)}${invoice}<div class="damgar-acts">${offers2}</div>`;
}
function openInWallet(key, invoice) {
  const webln = typeof globalThis !== "undefined" && !!globalThis.webln;
  const link = `lightning:${invoice}`;
  return `<div class="damgar-wallet" data-wallet="${e(key)}"><div class="k-row">${webln ? `<button type="button" class="k-btn k-p" data-action="webln" data-key="${e(key)}" data-invoice="${e(invoice)}">Pay with your browser\u2019s wallet</button>` : ""}<a class="k-btn${webln ? "" : " k-p"}" href="${e(link)}" data-open-wallet>Open in wallet</a></div>
${fold("Its QR code, for a wallet on your phone", `<div class="damgar-qr">${qrSvg(link, { level: "M", label: "The invoice, as a QR code" })}</div>`)}
<p class="k-small k-soft">${webln ? "Your browser\u2019s wallet asks you to approve it, then hands the proof back here by itself." : "Your wallet asks you to approve it; then paste its proof below."} Nothing is paid without your approval in the wallet.</p></div>`;
}
function payment(p, forPay = false) {
  const proofs = p.proofs.length ? `<div class="damgar-proofs">${p.proofs.map((x) => `<div class="p"><span>${x.kind === "claim" ? "Claim" : "Receipt"} by ${whoOf(x.by)}</span><span class="k-small k-soft">${e(x.how)}</span>${verdict(x.rail)}<span class="k-small k-soft">rail: ${e(x.rail.why || "the rail\u2019s own evidence holds")}</span>${x.confirmations ? `<span class="k-small">${x.confirmations[0]} of ${x.confirmations[1]} confirmations</span>` : ""}</div><div class="p k-small">Beside it: ${verdict(x.beside)} ${e(x.beside.why)}${x.standing !== "valid" ? ` \xB7 the act itself: ${e(x.standing)}` : ""}</div>`).join("")}</div>` : "";
  const pay = forPay && p.pay ? p.pay.invoice ? `<label>Pay this invoice in your wallet</label>${openInWallet(p.key, p.pay.invoice)}<div class="damgar-copy">${e(p.pay.invoice)}</div><button type="button" class="k-btn k-q k-small" data-action="copy" data-text="${e(p.pay.invoice)}">Copy the invoice</button>
<form class="paid" data-key="${e(p.key)}"><label>The proof, from your wallet once paid: the preimage (64 hexadecimal characters)</label><input name="proof" required spellcheck="false" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn k-p">Check it and sign my claim</button></div></form>` : `<label>Pay exactly ${e(p.pay.amount.said)} to this address, from your wallet</label><div class="damgar-copy">${e(p.pay.address ?? "")}</div><button type="button" class="k-btn k-q k-small" data-action="copy" data-text="${e(p.pay.address ?? "")}">Copy the address</button>
${p.stage === "paid" ? `<div class="k-row"><button type="button" data-action="recheck" data-key="${e(p.key)}" class="k-btn k-p">Check the chain again</button></div>` : `<form class="paid" data-key="${e(p.key)}"><label>The proof, from your wallet once sent: the transaction\u2019s id (64 hexadecimal characters)</label><input name="proof" required spellcheck="false" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn k-p">Check it and sign my claim</button></div></form>`}` : "";
  const vaultInvoice = forPay && p.vaultInvoice ? `<p class="k-small k-soft">Make an invoice on your vault\u2019s node (${hashButton(p.vaultInvoice.node)}) for exactly ${e(p.amount.said)}, with this description hash and no description (on regtest, in the test wallet, on the vault\u2019s node):</p><div class="damgar-copy">${e(p.vaultInvoice.descriptionHash)}</div>
<form class="vault-invoice" data-key="${e(p.key)}"><label>The invoice your vault\u2019s node made</label><input name="invoice" required spellcheck="false" autocomplete="off"><div class="k-row"><button type="submit" class="k-btn k-p">Check it</button></div></form>` : "";
  const ticket = p.ticket ? `<p class="k-small k-soft">An anchor\u2019s ticket: batch ${p.ticket.batch}, tier ${p.ticket.tier}, on the chain by block ${p.ticket.deadline}.${p.ticket.checked ? "" : " Not checked here: this Damgar follows no chain, so whether that block is within the tier\u2019s reach of today\u2019s is unknown. Pay only if you trust the service on it, or check it in Damgar on a computer."}</p>` : "";
  return `<p>${e(p.amount.said)} \xB7 ${e(p.railName)}${p.to === "vault" ? ", to the vault" : ""}</p>${p.whatFor ? `<p class="k-small k-soft">For \u201C${e(p.whatFor)}\u201D</p>` : ""}${ticket}${lines(p.lines)}${vaultInvoice}${pay}${proofs}`;
}
var unverifiedSaid = (p) => `unknown: this payment is not verified here (${[...new Set(p.proofs.map((x) => `the rail says ${x.rail.answer}${x.rail.why ? `: ${x.rail.why}` : ""}`))].join("; ")})`;
var confirmed = (p) => p.stage === "settled" && ["claim", "receipt"].every((k) => p.proofs.some((x) => x.kind === k && x.rail.answer === "valid" && x.standing === "valid"));
function pastePane() {
  return `<h2>Paste an act to sign</h2>
${say2("The first way to pay: by hand.", ["Another app (Dub, from its pay chooser\u2019s \u201CBy hand\u201D) shows the payment to copy. Paste it here: Damgar reads it to you in plain words, and it waits in To pay, to be signed or declined there. Pasting signs nothing."])}
<form id="paste"><label>The payment, as the other app showed it</label><textarea name="text" required spellcheck="false" autocomplete="off" placeholder="Paste it here"></textarea><div class="k-row"><button type="submit" class="k-btn k-p">Read it</button></div></form><div id="pasted"></div>`;
}
function vaultPane(r, problem, waiting) {
  if (problem) return `<h2>To the vault</h2>${note("error", e(problem))}`;
  const v = r?.vault;
  if (!v) return `<h2>To the vault</h2><p class="k-soft">Your identity\u2019s chain declares no vault: every payment goes to your flow. A vault, and its limit per unit, is declared with the chain key, in Ki\u0161ib (Paper, Change the vault).</p>`;
  return `<h2>To the vault</h2>
${say2("From your wallet to your vault, one way only.", ["Damgar binds the payment, you pay it in your wallet (on regtest, the test wallet) and paste the proof back. It names the act that declared your vault, a transfer to yourself (the payment cMIP, draft 4). Withdrawing needs the chain key and stays in Ki\u0161ib."])}
<p class="k-small k-soft">Your vault: ${e(v.entries.map((x) => `${x.railName}, ${x.unit.said}: ${x.said}`).join("; "))}. Declared in your chain (act ${actId2(v.declaredBy)}), with the chain key: changed only in Ki\u0161ib.</p>
<form id="vault-transfer"><label>To</label><select name="entry">${v.entries.map((x, i) => `<option value="${i}">${e(x.railName)}, ${e(x.unit.said)}</option>`).join("")}</select>
<label>Amount (whole units)</label><input name="value" inputmode="numeric" autocomplete="off" required>
<div class="k-row"><button type="submit" class="k-btn">Read it back</button></div></form><div id="vault-review"></div>${waiting}`;
}
function vaultReview(r) {
  return `<div class="k-box"><h3>Transfer to your vault, read back</h3>${lines(r.lines)}</div>
${r.costs.length ? `<div class="damgar-costs"><h3>Before you send</h3>${lines(r.costs)}</div>` : ""}
${r.blocking.length ? note("error", lines(r.blocking.map((t) => ({ text: t, tone: "warn" })))) : `<div class="k-row"><button type="button" class="k-btn k-p" data-action="vault transfer" data-digest="${e(r.digest)}">Bind it, then pay it here</button></div>`}`;
}
function collectivePane(c, name) {
  if (!c) return `<h2>For ${name}</h2><p class="k-soft">Damgar does not act for this collective: add it in the identity\u2019s menu (A collective under it).</p>`;
  const area = c.area;
  const acts = c.acts.length ? `<ul class="damgar-lines">${c.acts.map((a) => {
    const st = a.standing;
    const keys = st?.areas[0];
    return `<li class="${st?.met ? "ok" : "warn"}">${e(a.amount.value.toLocaleString("en"))} to ${who({ id: a.to, inline: true })}${a.whatFor ? ` (${e(a.whatFor)})` : ""}: ${e(st ? st.met ? "counts for the collective" : "does not count yet" : "not read")}${keys ? e(`, ${keys.signers.length} of ${keys.needed} keys${keys.limits === "above" ? ", above the cap" : ""}`) : ""} \xB7 ${actId2(a.act)}</li>`;
  }).join("")}</ul>` : '<p class="k-small k-soft">No promise signed here yet.</p>';
  return `<h2>For ${name}</h2>
${say2("Damgar acts for it with your own key for it.", ["Made as you signed its founding and sealed to you at your homes. Within the area\u2019s cap, your key alone; above it, another holder\u2019s key too, as its constitution writes it."])}
${area ? `<p class="k-small k-soft">Its Money area, \u201C${e(area.name)}\u201D: ${area.holders.length} holder${area.holders.length === 1 ? "" : "s"}, ${area.number} key${area.number === 1 ? "" : "s"}${area.cap ? `; above ${area.cap.value.toLocaleString("en")} an act, one more` : ""}.</p>` : ""}
${c.why ? note("error", e(c.why)) : `<form class="collective-promise" data-collective="${e(c.id)}"><h3>A promise to pay, from the collective</h3>
<label>To whom (an ID)</label><div class="k-row"><input name="to" type="text" class="k-grow" required autocomplete="off" spellcheck="false">${contactsButtonFor("to")}</div>
<label>How much (regtest satoshis)</label><input name="value" type="text" inputmode="numeric" required>
<label>What for</label><input name="whatFor" type="text">
<div class="k-row"><button type="submit" class="k-btn">Read it back</button></div><div class="promise-read"></div></form>`}
<h3>Promises signed here</h3>${acts}`;
}
function promiseRead(r) {
  return `${lines(r.lines)}<div class="k-row"><button type="button" class="k-btn k-p" data-action="collective-promise" data-digest="${e(r.digest)}">Sign it for the collective, with my own key</button></div>`;
}
var amounts = (xs) => xs.length ? xs.map((x) => e(x.said)).join("<br>") : '<span class="k-faint">none</span>';
function summaryPane(a) {
  const asks = a.asks.length ? `<h3>Requests and debts</h3><div class="k-list">${a.asks.map((x) => `<div><span>${x.side === "out" ? "You asked" : "Asked of you by"} ${whoOf(x.other)}: ${e(x.amount.said)}${x.whatFor ? `, for \u201C${e(x.whatFor)}\u201D` : ""}</span><span class="k-r">${e(x.state)}</span></div>`).join("")}</div>` : "";
  return `<h2>Summary</h2>
${say2("Per unit, never summed across units. Each verified from the rail\u2019s evidence.", a.notes)}
<div class="damgar-totals"><div class="k-box k-fill"><dl class="k-facts">${a.totals.map((t) => `<dt>${e(t.label)}</dt><dd>${amounts(t.amounts)}</dd>`).join("")}</dl></div></div>
${asks}${a.problems.length ? note("", lines(a.problems.map((t) => ({ text: t, tone: "warn" })))) : ""}`;
}
function laneTotal(l) {
  if (!l.total) return "";
  const over = l.over ? `<span class="damgar-over"> \xB7 overspent by ${e(l.over.said)}</span>` : "";
  const parts = l.spent ? [l.paid && l.paid.value ? `${l.paid.said} paid` : null, l.asked && l.asked.value ? `${l.asked.said} asked, not paid yet` : null].filter(Boolean).join(", ") : "";
  return `<dt>In all</dt><dd>${e(l.total.said)}${l.spent ? ` \xB7 ${e(l.spent.said)} spent${parts ? ` (${e(parts)})` : ""}, ${e(l.left?.said ?? "")} left` : " \xB7 not read yet"}${over}</dd>`;
}
function lane(l, actions = true) {
  const until = l.until ? new Date(l.until * 1e3).toISOString().slice(0, 16).replace("T", " ") + " UTC" : null;
  return `<div class="damgar-lane" data-lane="${e(l.grant)}"><h3>${e(l.label)} <span class="damgar-state">${e(l.state)}</span></h3>
<dl class="k-facts">${l.cap ? `<dt>At most</dt><dd>${e(l.cap.said)} per payment</dd>` : ""}${laneTotal(l)}${until ? `<dt>Until</dt><dd>${e(until)}, on the timestamp clock named</dd>` : ""}<dt>Its key</dt><dd>held by ${e(l.here ? "this Damgar" : l.app)}</dd><dt>Signed under it</dt><dd>${l.acts.length} act${l.acts.length === 1 ? "" : "s"}${l.sealed ? `, ${l.sealed} sealed (their keys not delivered here: not counted)` : ""}</dd></dl>
${say2("In plain words", l.words)}
${actions && l.state === "in force" ? `<div data-revoke="${e(l.grant)}"><div class="k-row"><button type="button" class="k-btn" data-action="revoke lane review" data-grant="${e(l.grant)}">Revoke it</button></div></div>` : ""}</div>`;
}
function revokeReview(grant, said) {
  return `<div class="k-box">${lines(said)}<div class="k-row"><button type="button" class="k-btn k-p" data-action="revoke lane" data-grant="${e(grant)}">Sign the revocation</button></div></div>`;
}
function laneReview(r) {
  return `<div class="k-box"><h3>The lane, read back</h3>${lines(r.lines)}<div class="k-row"><button type="button" class="k-btn k-p" data-action="own lane" data-digest="${e(r.digest)}">Sign this lane</button></div></div>`;
}
function inForcePane(ls, clock, manual, dubsar = false) {
  return `<h2>In force</h2>
${say2("What an app may sign and pay without asking you each time.", ["A lane lets an app (Dub, or Damgar itself) sign some of your money acts by itself, within a cap per act and until a date: a grant of your identity to itself, its key held by that app. Every act signed under one is shown so, here and to every reader. One revocation ends it.", "\u201CIn all\u201D, a cap for the whole lane, is kept by the apps and counted here: Dub refuses to sign past it; verifiers judge only the cap per payment and the expiry, since a total needs every act of the lane, some of them private."])}
${manual ? note("", "Every step is followed by hand (Settings): the lanes Damgar holds sign nothing until you turn it off. Lanes other apps hold still sign there.") : ""}
${ls.map((l) => lane(l)).join("") || '<p class="k-empty">No lane in force. An app asks for one (in Dub: the identity\u2019s menu, \u201CA lane from Damgar\u201D), and it waits in Asked.</p>'}
<h3>The clock for lanes</h3><p class="k-small k-soft">A lane\u2019s expiry is judged on a timestamp clock you name (the grant limits cMIP, 3.1): until it stamps an act, whether it came before the expiry is unknown.${dubsar ? " Prefilled with the Dubsar clock, the one every app of the suite relies on; a lane\u2019s grant names the clock, so its words say which." : ""}</p>
<form id="clock" class="k-row"><input name="clock" class="k-grow" placeholder="its ID" value="${e(clock ?? "")}" spellcheck="false">${contactsButtonFor("clock")}<button type="submit" class="k-btn">Save the clock</button></form>`;
}
function ownPane(ls, units, l, web) {
  const unitOptions = units.map((u2) => `<option value="${e(u2.hash)}"${/regtest/.test(u2.label) ? " selected" : ""}>${e(u2.label)}</option>`).join("");
  const own = (role, title, sayIt) => `<form class="own-lane" data-role="${role}"><h3>${title}</h3><p class="k-small k-soft">${sayIt}</p>
<div class="k-row"><label class="k-grow">At most, per act <input name="cap" inputmode="numeric" required></label><label>Unit <select name="unit">${unitOptions}</select></label></div>
<label>Until (optional; judged on the clock for lanes, In force)</label><input name="until" type="datetime-local">
<div class="k-row"><button type="submit" class="k-btn">Read it back</button></div></form>`;
  return `<h2>Damgar\u2019s own</h2>
${say2("With these, a payment to you needs nothing from you.", ["Damgar answers and signs the receipt by itself, below the cap. Without them, everything waits in Waiting."])}
${ls.map((x) => lane(x)).join("")}
${own("receipts", "Receipts and invoices, by itself", "Damgar checks a payment to you from the rail\u2019s own evidence and signs the receipt; it answers an invoice request with an address, or with an invoice your node made through its receive-only link (below).")}
${own("payouts", "Referral shares, by itself", "When someone buys your work through a repost and your offer promises the reposter a share, Damgar asks for that payment by itself; you still pay it in your wallet, from Waiting.")}
<div id="lane-review"></div>
<h3>The node link (receive-only)</h3>${lines(l.linkSay.map((text3) => ({ text: text3 })))}
${web ? note("", "The web client never makes a link to a node: use Damgar on your computer.") : l.link ? `<p>A receive-only link is kept.</p><div class="k-row"><button type="button" class="k-btn" data-action="link remove">Remove it</button></div>` : `<form id="link"><label>Your node\u2019s REST address</label><input name="rest" placeholder="https://127.0.0.1:8080" spellcheck="false" required>
<label>The receive-only permission\u2019s file (on lnd, the macaroon baked with invoices:write and invoices:read)</label><input name="macaroonFile" spellcheck="false" required>
<label>The node\u2019s certificate file (tls.cert)</label><input name="certFile" spellcheck="false" required>
<div class="k-row"><button type="submit" class="k-btn">Check it and keep it</button></div></form>`}`;
}
var RAIL_FIELDS = {
  lightning: {
    fields: (v) => `<label>Your wallet\u2019s node key (66 hexadecimal characters; the test wallet shows it)</label><input name="lightning" autocomplete="off" spellcheck="false" value="${e(v.lightning ?? "")}">`,
    network: true
  },
  onchain: {
    fields: (v) => `<label>A Bitcoin key of your wallet, x-only (64 hexadecimal characters)</label><input name="onchain" autocomplete="off" spellcheck="false" value="${e(v.onchain ?? "")}"><label class="damgar-check"><input type="checkbox" name="newRequestKey"${v.newRequestKey === "on" ? " checked" : ""}> Make a new on-chain request key (the old one then no longer counts for new payments)</label>`,
    network: true
  }
};
var railsAccepted = (accept) => accept.filter((a) => a.kind === "Module" && a.accepted && RAIL_FIELDS[a.key]);
function railsForm(accept, chosen, values) {
  const can = railsAccepted(accept);
  if (!can.length) return `<p class="k-soft">You accept no rail Module yet: accept one in Settings, Rules I follow (the Lightning rail, the on-chain rail), then choose it here.</p>`;
  const cards = chosen.map((k) => can.find((a) => a.key === k)).filter((a) => !!a).map((a, n) => `<div class="k-box damgar-rail" data-rail-card="${e(a.key)}"><div class="k-row"><h4 class="k-grow">${n + 1}. ${e(a.name)}</h4><button type="button" class="k-btn k-q k-small" data-action="rail-remove" data-rail="${e(a.key)}">Remove</button></div><p class="k-small k-soft">${e(a.does)}</p>${RAIL_FIELDS[a.key].fields(values)}</div>`).join("");
  const left = can.filter((a) => !chosen.includes(a.key));
  const add = left.length ? `<div class="k-row damgar-rail-add"><select name="rail-add" aria-label="A rail to add">${left.map((a) => `<option value="${e(a.key)}">${e(a.name)}</option>`).join("")}</select><button type="button" class="k-btn" data-action="rail-add">${chosen.length ? "+ Add a rail" : "Choose this rail"}</button></div>` : "";
  const network = chosen.some((k) => RAIL_FIELDS[k]?.network) ? `<label>Network</label><select name="network"><option value="3"${values.network !== "2" ? " selected" : ""}>regtest</option><option value="2"${values.network === "2" ? " selected" : ""}>signet</option></select>` : "";
  return `<form id="rails">${chosen.length ? "" : '<p class="k-small k-soft">First choose a rail: the page then asks only what that rail needs.</p>'}${cards}${add}${network}${chosen.length ? '<div class="k-row"><button type="submit" class="k-btn">Read it back</button></div>' : ""}</form>`;
}
function paidPane(r, problem, accept = [], chosen = [], values = {}) {
  const pointer = r?.pointer ? `<div class="k-box k-fill"><dl class="k-facts"><dt>In force</dt><dd>version ${r.pointer.version}${r.pointer.forked ? " (its chain is forked: the last pointer before the fork counts)" : ""} \xB7 ${actId2(r.pointer.act)}</dd>${r.pointer.rails.map((x, n) => `<dt>${n + 1}. ${e(x.name)}</dt><dd class="k-mono">${e(x.said)}${x.accepted ? "" : " (a rail Module you do not accept)"}</dd>`).join("")}</dl></div>` : '<p class="k-soft">You have no payee pointer yet: nobody can pay you until you say where.</p>';
  const vault = r?.vault ? `${lines(r.vault.entries.map((x) => ({ text: `${x.unit.said}, on ${x.railName}: ${x.said}.` })))}<p class="k-small k-soft">Declared in your identity\u2019s chain (act ${actId2(r.vault.declaredBy)}), with the chain key: changed only in Ki\u0161ib, in a change of keys, never here. Move money into it from Waiting, To the vault.</p>` : '<p class="k-small k-soft">None declared: every payment goes to your flow. A vault, and its limit per unit, is declared with the chain key, in Ki\u0161ib.</p>';
  return `<h2>Where you are paid</h2>
${say2("Your payee pointer: where payments to you go, with each rail\u2019s costs.", ["Read back with each rail\u2019s stated costs before it is signed. A new pointer replaces the one in force for new payments."])}
${problem ? note("error", e(problem)) : pointer}
${fold("Change it", `<div id="rails-at">${railsForm(accept, chosen, values)}</div><div id="rails-review"></div>`, { attrs: 'id="rails-fold"', open: !!values.open })}
${r?.requestKey ? `<p class="k-small k-soft">The on-chain request key Damgar holds: ${hashButton(r.requestKey)}</p>` : ""}
<div class="k-box"><h3>The vault</h3>${vault}</div>`;
}
function railsReview(r) {
  return `<div class="k-box"><h3>Your new payee pointer</h3>${lines(r.lines)}</div>
${r.costs.length ? `<div class="damgar-costs"><h3>What each rail costs you, stated by its Module</h3>${lines(r.costs)}</div>` : ""}
<div class="k-row"><button type="button" class="k-btn k-p" data-action="rails publish" data-digest="${e(r.digest)}">Sign and publish it</button></div>`;
}
function acceptPane(s) {
  return `<h2>Rules I follow</h2>
${say2(`Sealed to your identity at its homes${s.list.version ? ` (version ${s.list.version})` : ""}: every app holding it reads it.`, ["Each app changes only its part; Damgar the Money layer\u2019s. An act under something you do not accept is shown unknown, and never signed."])}
${s.list.merged.length ? note("", `Two apps changed it at once; merged: ${lines(s.list.merged.map((t) => ({ text: t })))}`) : ""}
${s.list.here ? note("", "Kept in Damgar only: the rules ticked below are not sealed to this identity yet, so the other apps do not see them. Save them again once they can be sealed.") : ""}
<form id="accept">${acceptList(s.accept)}<div class="k-row"><button type="submit" class="k-btn k-p">Save to my list</button><button type="submit" class="k-btn" data-in="here">In Damgar only</button></div><p class="k-small k-soft">Save to my list: sealed to this identity, every app reads it. In Damgar only: kept here, your list unchanged, so the other apps still ask; a rule already on your list stays on it.</p></form>
<div class="k-row"><span class="k-grow k-small k-soft">${s.list.published ? "Published: anyone can read which specifications you accept." : "Private: sealed to yourself (the default)."}</span><button type="button" class="k-btn" data-action="publish list" data-on="${s.list.published ? "false" : "true"}">${s.list.published ? "Make it private again" : "Publish it"}</button></div>`;
}
function relaysPane(s, chain) {
  const i = s.identity;
  return `<h2>Homes and relays</h2><dl class="k-facts"><dt>Homes</dt><dd>${e(i.homes.join(", "))} (its chain names them; changed in Ki\u0161ib)</dd><dt>The chain followed</dt><dd>${e(chain)}</dd></dl>
<form id="relays"><label>Relays its money acts go to, one per line</label><textarea name="relays">${e(i.relays.join("\n"))}</textarea><div class="k-row"><button type="submit" class="k-btn">Save the relays</button></div></form>`;
}
function manualPane(on) {
  return `<h2>Every step by hand</h2><p class="k-soft">For those who want to follow the real process step by step: every signature waits for you, as in round 1. Off by default.</p>
<label class="damgar-check"><input type="checkbox" id="manual"${on ? " checked" : ""}> Follow every step by hand (a clear demonstration of the real process)</label>`;
}
var actChoice = (acts) => acts.length > 1 ? `<div class="damgar-ways">${acts.map((x, i) => `<label class="k-row"><input type="radio" name="act" value="${e(x.id)}"${i === 0 ? " checked" : ""}> <span>${e(x.said)} ${actId2(x.id)}</span></label>`).join("")}</div>` : `<input type="hidden" name="act" value="${e(acts[0].id)}"><p class="k-small"><b>${e(acts[0].said)}</b> ${actId2(acts[0].id)}</p>`;
var noAct = '<p class="k-soft">This card is not yet an act on MOR (a draft waiting to be signed here): there is nothing to rely on or anchor.</p>';
function relyForm(acts) {
  if (!acts.length) return noAct;
  return `<form id="rely">${say2("Relying on an act keeps it visible as disputed should its author ever disown it.", ["A witness act (Identity type 15), public at your homes and relays, naming the act: it relies on it, it pays nothing. Signed with your key, checked first; through Ki\u0161ib\u2019s panel where Ki\u0161ib holds this identity."])}${actChoice(acts)}<label>Type RELY to sign the witness act</label><input name="typed" autocomplete="off" autocapitalize="characters" spellcheck="false" required><div class="k-row"><button type="submit" class="k-btn k-p">Sign the witness act</button></div></form>`;
}
function anchorForm(acts, offers2, service = "", chosen = "") {
  if (!acts.length) return noAct;
  const which = chosen ? acts.filter((x) => x.id === chosen) : acts;
  return `<form id="anchor-offers">${say2("An anchor puts this act\u2019s fingerprint on the Bitcoin chain, through a pooled anchoring service, paid here.", ["Anyone may anchor any act (the anchoring cMIP). The service is sent a leaf (the act\u2019s fingerprint mixed with a random secret Damgar keeps), never the act. Damgar signs the payment\u2019s request at once; you pay the invoice in To pay; it shows in Account \u203A Anchors. Round 1 runs on regtest: its coins are worth nothing."])}${actChoice(which.length ? which : acts)}
<label>The anchoring service\u2019s ID</label><div class="k-row"><input name="service" value="${e(service)}" required spellcheck="false" autocomplete="off" class="k-grow">${contactsButtonFor("service")}<button type="submit" class="k-btn">Read its offer</button></div></form>${offers2 === null ? "" : offers2.length ? `<form id="anchor" data-service="${e(service)}" data-act="${e(chosen)}"><div class="damgar-ways">${offers2.flatMap((o) => o.tiers.map((t, i) => `<label class="k-row"><input type="radio" name="tier" value="${e(o.act)}:${t.tier}"${i === 0 ? " checked" : ""}> <span>${e(t.words)}${o.words ? ` <span class="k-small k-soft">${e(o.words)}</span>` : ""}</span></label>`)).join("")}</div><div class="k-row"><button type="submit" class="k-btn k-p">Anchor it: sign the payment\u2019s request</button></div></form>` : '<p class="k-small k-soft">No standing offer of that service was found.</p>'}`;
}

// src/page/ui.ts
var errorOf = (err) => err instanceof Error ? err.message : String(err);
var TABS = ["waiting", "account", "lanes", "settings"];
var RECEIVE = /* @__PURE__ */ new Set(["invoice", "address", "receipt", "uncounted"]);
function mount(app2, b) {
  const $ = (id) => document.getElementById(id);
  app2.classList.add("k-page", "k-damgar");
  let state = null;
  let tab = null;
  let part = "";
  let acting = null;
  let counts = { toPay: 0, toReceive: 0, asked: 0, inForce: 0, ended: 0 };
  let timer = null;
  let reviewed = null;
  let vaultAsked = null;
  let laneAsked = null;
  const popup2 = new Popup(app2);
  attachClosing();
  try {
    const at = JSON.parse(sessionStorage.getItem("damgar:at") ?? "null");
    if (at && TABS.includes(at.tab)) [tab, part] = [at.tab, at.part];
  } catch {
  }
  const keepAt = () => {
    try {
      sessionStorage.setItem("damgar:at", JSON.stringify(tab ? { tab, part } : null));
    } catch {
    }
  };
  function say3(kind, html) {
    let s = $("status");
    if (!s) {
      app2.insertAdjacentHTML("beforeend", '<div id="status" class="k-status"></div>');
      s = $("status");
    }
    s.innerHTML = note(kind, html);
    s.scrollIntoView({ block: "nearest" });
  }
  const fail = (err) => {
    if (b.unpaired?.(err)) {
      app2.innerHTML = pairing();
      return;
    }
    const m = errorOf(err);
    if (/^This identity’s signing key was changed elsewhere/.test(m)) return warnKey(m);
    say3("error", e(m));
  };
  function warnKey(said) {
    const i = state?.identity;
    keyChanged(app2, said && i ? { id: i.id, name: i.name ?? "This identity", say: said, form: renewForm() } : null);
  }
  const done = (r) => {
    if (r?.lines?.length) say3("done", lines(r.lines));
  };
  const broughtSay = (r) => {
    const first = state?.stage === "accept" ? app2.querySelector(".damgar-first h2") : null;
    if (first) {
      first.insertAdjacentHTML("beforebegin", `<div class="k-box damgar-own">${ownIdNow()}</div>`);
      return done(r);
    }
    say3("done", `${lines(r.lines)}${ownIdNow()}`);
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
  const NOT_WATCHED = /* @__PURE__ */ new Set(["runner asking", "runner", "state", "runner drop", "to sign", "pay", "account", "lanes", "rails", "collectives", "names", "contacts"]);
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
            host: "Damgar",
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
  const contacts = attachContacts(app2, { app: "Damgar", ask: (op, a) => b.ask(op, a), said: (kind, html) => say3(kind, html) });
  attachIds(app2, { names: (ids, fresh) => b.ask("names", { ids, fresh: !!fresh }) });
  const signerNames = /* @__PURE__ */ new Map();
  async function nameSigners(root) {
    const ids = [...new Set([...root.querySelectorAll("[data-k-signer]")].map((x) => x.dataset.kSigner))].filter((id) => /^[0-9a-f]{64}$/.test(id));
    if (!ids.length) return;
    try {
      for (const [id, n] of Object.entries(await b.ask("names", { ids }))) signerNames.set(id, n);
    } catch {
      for (const id of ids) if (!signerNames.has(id)) signerNames.set(id, { published: { state: "unreached" } });
    }
    for (const c of root.querySelectorAll("[data-k-signer]")) {
      const n = signerNames.get(c.dataset.kSigner);
      const box = c.querySelector(":scope > .k-signer .k-names");
      if (!n || !box) continue;
      box.innerHTML = namesHtml(n, { retry: false });
      const d = drawn.get(c.dataset.kAct);
      if (d) d.act.signer.named = n;
    }
  }
  const ownIdNow = () => state?.identity ? `<p class="k-small k-soft">Its ID, to give to whoever pays it or is paid by it:</p>${ownId({ form: state.identity.form, link: state.identity.link ?? state.identity.form })}` : "";
  async function show(s) {
    state = s;
    if (s.identity?.id !== shownFor) railsChosen = null;
    shownFor = s.identity?.id ?? null;
    if (timer) clearInterval(timer);
    timer = null;
    closePanel();
    if (acting && !s.identity?.collectives.some((c) => c.id === acting.id)) acting = null;
    if (s.stage === "identity") {
      app2.innerHTML = firstScreen(b.web);
      return;
    }
    if (s.stage === "accept") {
      app2.innerHTML = acceptScreen(s);
      return;
    }
    await draw();
    void contacts.refresh();
    void b.ask("check").then((c) => warnKey(c.current ? null : c.say)).catch(() => void 0);
    timer = setInterval(() => {
      if (document.visibilityState === "visible" && tab === "waiting" && (part === "to-pay" || part === "to-receive") && !app2.querySelector("textarea:focus,input:focus") && !popup2.open && !panelOpen()) void refresh(true);
    }, 2e4);
  }
  async function draw() {
    keepAt();
    if (!tab) {
      app2.innerHTML = home(state, b.web, acting);
      return;
    }
    app2.innerHTML = tabPage(state, tab, part, counts, acting);
    await fill();
  }
  function drawCounts() {
    if (!tab) return;
    const col = app2.querySelector(".k-col");
    if (!col) return;
    const n = { "to-pay": counts.toPay, "to-receive": counts.toReceive, asked: counts.asked, "in-force": counts.inForce, ended: counts.ended };
    for (const [k, x] of Object.entries(n)) {
      const b2 = col.querySelector(`[data-k-col="${k}"] .k-k`);
      if (b2) b2.textContent = String(x);
    }
  }
  const pane = () => $("pane");
  let filling = 0;
  const held = /* @__PURE__ */ new Map();
  const heldKey = () => `${meId()}\0${acting?.id ?? ""}\0${tab}\0${part}`;
  async function fill() {
    const p = pane();
    if (!p) return;
    const mine = ++filling;
    const key = heldKey();
    const before = held.get(key);
    if (p.dataset.shown !== key) {
      p.dataset.shown = key;
      if (before) {
        p.innerHTML = `<p class="k-small k-faint damgar-looking" role="status">Looking\u2026</p>${before.html}`;
        drawn.clear();
        for (const [id, c] of before.drawn) drawn.set(id, c);
      } else p.innerHTML = '<p class="k-empty damgar-looking" role="status">Looking\u2026</p>';
    }
    try {
      const html = await partHtml();
      if (mine !== filling || !p.isConnected) return void (cards = []);
      p.innerHTML = html;
      drawCards();
      held.set(key, { html, drawn: [...drawn] });
      void nameSigners(p);
      const ids = cardsUntimed(p);
      if (ids.length)
        void b.ask("clock words", { ids }).then((w) => p.isConnected && stampCards(p, w)).catch(() => void 0);
    } catch (err) {
      if (mine !== filling) return;
      p.innerHTML = "";
      fail(err);
    }
    drawCounts();
  }
  let lookedFor = "";
  function lookThenFill(which) {
    if (lookedFor === which) return void (lookedFor = "");
    void b.ask("look").catch(() => void 0).then(async () => {
      if (part !== which) return;
      lookedFor = which;
      await fill();
    });
  }
  async function refresh(quiet = false) {
    const looked = await b.ask("look").catch((err) => {
      if (!quiet) fail(err);
      return null;
    });
    const typed = /* @__PURE__ */ new Map();
    let focused = null;
    for (const x of app2.querySelectorAll("#pane form[data-id] [name], #pane form[data-key] [name]")) {
      const f = x.form;
      const k = `${f.dataset.id ?? f.dataset.key}\0${x.name}`;
      if (x.value) typed.set(k, x.value);
      if (document.activeElement === x) focused = k;
    }
    state = await b.ask("state").catch(() => state);
    await fill();
    for (const x of app2.querySelectorAll("#pane form[data-id] [name], #pane form[data-key] [name]")) {
      const f = x.form;
      const k = `${f.dataset.id ?? f.dataset.key}\0${x.name}`;
      if (typed.has(k) && !x.value) x.value = typed.get(k);
      if (k === focused) x.focus();
    }
    if (!quiet && looked) say3(looked.lines.length ? "done" : "", lines([...looked.lines, ...looked.problems.map((t) => ({ text: t, tone: "warn" }))]) || "Nothing new arrived.");
  }
  const drawn = /* @__PURE__ */ new Map();
  let cards = [];
  let anchoring = [];
  const meId = () => state?.identity?.id ?? "";
  const kitWho = (w) => {
    const form2 = formOf(w.id, "mid");
    return { id: w.id, form: form2, link: form2, name: null, named: signerNames.get(w.id) ?? { published: { state: "loading" } }, me: w.me, followed: contacts.list().some((c) => c.id === w.id) };
  };
  const cardOf = (x) => {
    const a = { id: x.id, form: formOf(x.id), signer: kitWho(x.who), kind: x.kind ?? null, text: x.text, html: x.html, labels: x.labels, verified: !!x.verified, alarm: x.alarm ?? null };
    cards.push({ act: a, who: x.who, lines: x.lines, acts: x.acts ?? [] });
    return card(a);
  };
  function drawCards() {
    drawn.clear();
    for (const c of cards) drawn.set(c.act.id, c);
    cards = [];
  }
  const itemCard = (t) => cardOf({ id: t.id, who: t.from, kind: `${t.kind === "draft" ? t.byHand ? "pasted by hand" : t.app ? `from ${t.app}` : "a draft" : t.kind === "lane" ? `lane \xB7 from ${t.app ?? "an app"}` : t.kind}`, text: t.title, html: `<div class="k-box">${itemActs(t)}</div>`, labels: t.unknown ? [{ text: "unknown here: nothing can be signed for it", tone: "warn" }] : [], verified: !t.unknown, lines: t.lines, acts: [] });
  const byWords = (x) => x.by.me ? "you" : x.kind === "claim" ? "the payer" : "the payee";
  const paymentCard = (p, forPay) => {
    const bad = p.proofs.some((x) => x.rail.answer === "invalid");
    const unverified = p.proofs.length > 0 && !bad && !p.proofs.some((x) => x.rail.answer === "valid");
    const first = p.proofs[0];
    const acts = [
      ...p.proofs.filter((x) => x.kind === "receipt").map((x) => ({ id: x.act, said: `The receipt, by ${byWords(x)}` })),
      ...p.proofs.filter((x) => x.kind === "claim").map((x) => ({ id: x.act, said: `The claim, by ${byWords(x)}` })),
      ...p.request ? [{ id: p.request, said: "The invoice request that began it" }] : []
    ];
    return cardOf({
      acts,
      id: first?.act ?? p.request ?? p.key,
      who: first ? first.by : p.side === "out" ? { id: meId(), short: "", me: true } : p.other,
      kind: p.to === "vault" && p.other.me ? "to your vault" : p.side === "out" ? "you pay" : "paid to you",
      text: `${p.side === "out" ? p.other.me ? "To your vault \xB7 " : "" : ""}${p.amount.said}`,
      // H96, H121: whom it pays, or who paid, by their names; the short ID a button.
      html: `${p.other.me ? "" : `<p class="k-small">${p.side === "out" ? "To" : "From"} ${whoOf(p.other)}</p>`}<div class="k-box">${payment(p, forPay)}</div>`,
      labels: [...p.deal ? [{ text: `under the deal \u201C${p.deal}\u201D` }] : [], { text: p.stageSaid }, ...[...new Set(p.proofs.map((x) => `${x.kind === "claim" ? "claim" : "receipt"}: ${x.how}`))].map((text3) => ({ text: text3 })), ...unverified ? [{ text: unverifiedSaid(p), tone: "warn" }] : []],
      verified: confirmed(p),
      alarm: bad ? "A proof that does not hold" : null,
      lines: [...p.lines, ...p.proofs.map((x) => ({ text: `${x.kind === "claim" ? "Claim" : "Receipt"} by ${byWords(x)}: the rail says ${x.rail.answer}${x.rail.why ? ` (${x.rail.why})` : ""}; beside it ${x.beside.answer}${x.beside.why ? ` (${x.beside.why})` : ""}; ${x.how}.`, tone: x.rail.answer === "invalid" ? "bad" : void 0 }))]
    });
  };
  attachCards(app2, {
    app: "Damgar",
    // Rely on it and Anchor it, below the line, on every act (decided by Nobody, allegedly: "Agreed"; Damgar's round 3, question 3): a witness act signed here, an anchor prepared and paid here.
    signs: true,
    act: (id) => drawn.get(id)?.act,
    signerItems: (a) => a.signer.me ? [] : [{ key: "tip", label: "Tip" }],
    actItems: () => ({ before: [], after: [] }),
    async choose(key, a) {
      const c = drawn.get(a.id);
      if (!c) return;
      if (key === "why") return void popup2.show("Why it\u2019s valid", `${lines(c.lines)}<p class="k-small k-faint">Each judged from the rail\u2019s own evidence, with what you accept.</p>`);
      if (key === "profile") return void popup2.show(a.signer.me ? "You" : nameOf(a.signer.named) ?? "Their profile", `<p>${whoOf({ id: a.signer.id, me: a.signer.me }, false)}</p><dl class="k-facts"><dt>ID</dt><dd class="k-mono">${e(a.signer.form)}</dd></dl><div class="k-row"><button type="button" class="k-btn k-small" data-action="copy" data-text="${e(a.signer.form)}">Copy ID</button></div><p class="k-small k-soft">Full record in Ki\u0161ib. Their posts and profile are in Dub.</p>`);
      if (key === "follow") {
        const nick = await askNick(app2, { title: `Follow ${nameOf(a.signer.named) ?? "this identity"}: add to contacts`, current: null, yes: "Add to contacts", skip: "Add without a nickname" });
        if (nick === void 0) return;
        const r = await act(() => b.ask("contact add", { id: a.signer.id, nick: nick ?? "" }));
        if (r) await contacts.refresh(), done(r);
        return;
      }
      if (key === "unfollow") {
        const r = await act(() => b.ask("contact remove", { id: a.signer.id }));
        if (r) await contacts.refresh(), done(r);
        return;
      }
      if (key === "mute" || key === "unmute") return void popup2.show("Muting is Dub\u2019s", '<p class="k-soft">Damgar keeps no muted list: mute in Dub, from their card or profile. Your contacts, top left, are the one list every app reads.</p>');
      if (key === "tip") return void popup2.show(`Tip ${nameOf(a.signer.named) ?? ""}`.trim(), `<p class="k-small">To ${whoOf({ id: a.signer.id })}</p>${tipForm(a.signer.id)}`);
      if (key === "rely") return void popup2.show("Rely on it", relyForm(c.acts));
      if (key === "anchor") {
        anchoring = c.acts;
        return void popup2.show("Anchor it", anchorForm(c.acts, null));
      }
      if (key === "correct") return void popup2.show("Correct it", '<p class="k-soft">Corrections are Dub\u2019s: Damgar signs no text.</p>');
    }
  });
  const tipForm = (to) => `<form id="tip" data-to="${e(to)}"><div class="k-row"><input name="value" inputmode="numeric" placeholder="Amount" required class="k-grow"><select name="unit">${units().map((u2) => `<option value="${e(u2.hash)}"${/regtest/.test(u2.label) ? " selected" : ""}>${e(u2.label)}</option>`).join("")}</select></div><input name="whatFor" placeholder="What for (optional)" maxlength="280"><p class="k-small k-soft">It waits in To pay, read in plain words, to be signed there; you pay it in your own wallet.</p><div class="k-row"><button type="submit" class="k-btn k-p">Prepare the tip</button></div></form>`;
  const units = () => (state?.accept ?? []).filter((x) => x.key === "bitcoin-units").flatMap((x) => x.hashes.map((h, i) => ({ hash: h, label: `${["Bitcoin", "testnet", "signet", "regtest"][i] ?? h.slice(0, 8)} satoshis` })));
  async function partHtml() {
    const s = state;
    if (tab === "waiting") {
      if (part === "paste") return pastePane();
      if (part === "collective") {
        const r = await b.ask("collectives");
        return collectivePane(r.collectives.find((c) => c.id === acting?.id) ?? null, acting ? who({ id: acting.id, collective: true, inline: true }) : "");
      }
      const items = (await b.ask("to sign")).items;
      const pays = (await b.ask("pay")).payments;
      const own = items.filter((t) => t.kind !== "lane" && !RECEIVE.has(t.kind));
      const out = pays.filter((p) => !(p.to === "vault" && p.other.me));
      counts = { ...counts, toPay: own.length + out.length, toReceive: items.filter((t) => RECEIVE.has(t.kind)).length, asked: items.filter((t) => t.kind === "lane").length };
      if (part === "to-receive") {
        const rec = items.filter((t) => RECEIVE.has(t.kind));
        return `<h2>To receive</h2>${say2("Invoices to make when someone pays you; receipts to sign once a payment to you is proven.", ["With Damgar\u2019s own lanes (Lanes), it does both by itself, below their cap."])}<div class="k-row"><span class="k-grow"></span><button type="button" class="k-btn k-q" data-action="look">Look again</button></div><div class="k-feed" id="waiting-feed">${rec.map(itemCard).join("") || '<p class="k-empty">Nothing to receive.</p>'}</div>`;
      }
      if (part === "vault") {
        let rails = null;
        let problem = null;
        try {
          rails = await b.ask("rails");
        } catch (e3) {
          problem = errorOf(e3);
        }
        const mine = pays.filter((p) => p.to === "vault" && p.other.me);
        return vaultPane(rails, problem, mine.length ? `<h3>Transfers waiting</h3><div class="k-feed">${mine.map((p) => paymentCard(p, true)).join("")}</div>` : "");
      }
      return `<h2>To pay</h2>${say2("Each payment read in plain words, signed here, paid in your own wallet, its proof pasted back.", ["Drafts the other apps put on MOR, sealed to you; what you pasted by hand; requests others sent. Signing one sends the payee an invoice request; once they answer, the invoice or address to pay shows on its card. Damgar holds no wallet."])}<div class="k-row"><span class="k-grow"></span><button type="button" class="k-btn k-q" data-action="look">Look again</button></div><div class="k-feed" id="waiting-feed">${[...own.map(itemCard), ...out.map((p) => paymentCard(p, true))].join("") || '<p class="k-empty">Nothing to pay.</p>'}</div>`;
    }
    if (tab === "account") {
      if (part === "under") {
        lookThenFill("under");
        const l = await b.ask("lanes");
        const apps = l.lanes.filter((x) => !x.here);
        const stageOf = (p) => {
          const who2 = p.to.name ?? "the payee";
          return p.stage === "paid" ? "Paid: its claim signed under the lane" : p.stage === "refused" ? `Refused by ${who2}: not counted` : `Asked: waiting for ${who2}\u2019s invoice`;
        };
        const tally = (x) => {
          const ps = x.payments ?? [];
          const n = (st) => ps.filter((p) => p.stage === st).length;
          return `<p class="k-small k-soft" data-under-tally>Paid: ${n("paid") ? `${n("paid")}${x.paid ? `, ${e(x.paid.said)}` : ""}` : "none yet"} \xB7 Asked, not paid yet: ${n("asked") ? `${n("asked")}${x.asked ? `, ${e(x.asked.said)}` : ""}` : "none"}${n("refused") ? ` \xB7 Refused: ${n("refused")}` : ""}</p>`;
        };
        return `<h2>Under the lanes</h2>${say2("What other apps asked and paid under their lanes: they finish those payments themselves; the record is kept here.", ["Asked: the app signed an invoice request under the lane; nothing has moved until the payee answers with an invoice and it is paid in the wallet. Paid: its claim is signed, with the rail\u2019s proof.", "Read from the acts under each lane whose keys the app delivered to this identity. An act whose key was not delivered (an identity used through Ki\u0161ib\u2019s runner in that app) is counted as sealed, and said."])}${apps.map((x) => `<h3>${e(x.label)} <span class="k-small k-soft">${e(x.state)}</span></h3>${tally(x)}<dl class="k-facts">${laneTotal(x)}</dl><div class="k-feed">${(x.payments ?? []).map((p) => cardOf({ id: p.claims[0] ?? p.request ?? p.key, who: { id: meId(), short: "", me: true }, kind: null, text: `${stageOf(p)}
${p.amount.said}${p.whatFor ? ` \xB7 for \u201C${p.whatFor}\u201D` : ""} \xB7 under \u201C${x.label}\u201D`, html: `<p class="k-small">To ${whoOf(p.to)}</p>`, labels: [], verified: p.stage === "paid", lines: [{ text: `Signed by ${x.app} under the lane \u201C${x.label}\u201D, not with your own key.` }], acts: [...p.claims.map((c) => ({ id: c, said: "Its claim, signed under the lane" })), ...p.request ? [{ id: p.request, said: "Its invoice request, signed under the lane" }] : []] })).join("") || '<p class="k-empty">No payment under it read yet.</p>'}${x.sealed ? `<p class="k-small k-soft">${x.sealed} act${x.sealed === 1 ? "" : "s"} sealed: not counted.</p>` : ""}</div>`).join("") || '<p class="k-empty">No app holds a lane of this identity.</p>'}`;
      }
      const a = await b.ask("account");
      if (part === "payments") return `<h2>Payments</h2>${say2("Each payment a card: its claim and receipt, how each was signed, and whether each verifies.", ["Paid and confirmed: settled, its receipt and a claim each valid by the rail\u2019s own evidence. Open a card\u2019s ID for why it is valid."])}<div class="k-feed" id="account-feed">${a.payments.map((p) => paymentCard(p, false)).join("") || '<p class="k-empty">No payment yet.</p>'}</div>`;
      if (part === "shared") {
        const ds = a.shared ?? [];
        return `<h2>Shared deals</h2>${say2("The deals you share in with other people: what was paid to each, and what its split service paid you.", ["Each payment to a deal is receipted by its split service in the name of the deal\u2019s own payee, and sealed to every person sharing in it; each split names what it pays each of you. A tip to you personally is under Payments, not here."])}${ds.map((d) => `<h3>\u201C${e(d.name)}\u201D ${actId2(d.version)}</h3><div class="k-feed">${[
          ...d.payments.map((x) => cardOf({ id: x.receipt, who: x.payer, kind: x.kind, text: d.collective ? `${x.kind === "a tip" ? "A tip" : "A sale"} of the collective\u2019s work \xB7 your share ${x.amount.said}` : `${x.kind === "a tip" ? "A tip" : "A sale"} to the deal \xB7 ${x.amount.said}`, labels: [{ text: x.standing, ...x.rail.answer === "valid" ? {} : { tone: "warn" } }], verified: x.rail.answer === "valid", lines: [] })),
          ...d.payouts.map((x) => cardOf({ id: x.split, who: { id: meId(), short: "", me: true }, kind: "your payout", text: `Its split pays you ${x.amount.said}${x.role ? ` (${x.role})` : ""}`, labels: [{ text: x.paid ? "paid to you by its split service, its rail answer valid" : "named in its split; its payment here is not yet shown valid by its rail: unknown" }], verified: x.paid, lines: [] }))
        ].join("") || '<p class="k-empty">Nothing yet.</p>'}</div>`).join("") || '<p class="k-empty">No deal shared with you yet: a deal is set up in Edubba, where you sign it.</p>'}`;
      }
      if (part === "anchors") {
        const an = a.payments.filter((p) => p.ticket);
        return `<h2>Anchors</h2>${say2("Payments for anchoring an act on Bitcoin: each waiting, anchored at its block, its deadline met or missed.", ["Asked in Edubba for a collective\u2019s act, in Ummia for a release, in Dub for any act; paid here. Kept simple: it shows that anchoring exists."])}<div class="k-feed">${an.map((p) => paymentCard(p, false)).join("") || '<p class="k-empty">No anchor paid from here.</p>'}</div>`;
      }
      return summaryPane(a);
    }
    if (tab === "lanes") {
      if (part === "asked") {
        const items = (await b.ask("to sign")).items.filter((t) => t.kind === "lane");
        counts.asked = items.length;
        return `<h2>Asked</h2>${say2("Lanes other apps asked for, read in plain words, to grant or decline.", ["An app asks through MOR, sealed to you. Granting signs a public grant of this identity to itself, naming the key that app holds."])}<div class="k-feed">${items.map(itemCard).join("") || '<p class="k-empty">No lane asked.</p>'}</div>`;
      }
      if (part === "in-force") lookThenFill("in-force");
      const l = await b.ask("lanes");
      counts = { ...counts, inForce: l.lanes.filter((x) => x.state === "in force" && !x.here).length, ended: l.lanes.filter((x) => x.state !== "in force").length };
      if (part === "own") return ownPane(l.lanes.filter((x) => x.here && x.state === "in force"), units().map((u2) => ({ ...u2, label: u2.label.replace(" satoshis", "") })), l, b.web);
      if (part === "ended") return `<h2>Ended</h2><p class="k-small k-soft">Revoked, or past their expiry: nothing signed under them after that counts.</p>${l.lanes.filter((x) => x.state !== "in force").map((x) => lane(x, false)).join("") || '<p class="k-empty">No lane ended.</p>'}`;
      return inForcePane(l.lanes.filter((x) => x.state === "in force" && !x.here), l.clock, l.manual, !!l.dubsar);
    }
    if (tab === "settings") {
      if (part === "accept") return acceptPane(s);
      if (part === "manual") return manualPane((await b.ask("lanes")).manual);
      if (part === "relays") {
        const r2 = await b.ask("rails").catch(() => null);
        return relaysPane(s, r2?.chain ?? "");
      }
      let r = null;
      let problem = null;
      try {
        r = await b.ask("rails");
      } catch (e3) {
        problem = errorOf(e3);
      }
      if (!railsChosen) railsChosen = (r?.pointer?.rails ?? []).map((x) => s.accept.find((a) => a.hashes.includes(x.module))?.key).filter((k) => !!k && !!RAIL_FIELDS[k]);
      return paidPane(r, problem, s.accept, railsChosen, {});
    }
    return "";
  }
  let railsChosen = null;
  let shownFor = null;
  const railValues = () => {
    const f = app2.querySelector("form#rails");
    if (!f) return {};
    const out = {};
    for (const [k, x] of new FormData(f)) out[k] = String(x);
    return out;
  };
  function redrawRails(chosen) {
    railsChosen = chosen;
    const at = $("rails-at");
    if (!at || !state) return;
    at.innerHTML = railsForm(state.accept, chosen, railValues());
    const review = $("rails-review");
    if (review) review.innerHTML = "";
  }
  let adding = false;
  function panelHtml(inside) {
    const s = state;
    const ids = s.held.map((h) => ({
      id: h.id,
      form: formOf(h.id, "mid"),
      // H96: its name as read (Loading…, its name, No name published, Name not reached); H88: the one in use with its ID whole, Copy ID and Share your ID link.
      name: h.name ?? null,
      named: h.named ?? null,
      link: h.active ? s.identity?.link ?? void 0 : void 0,
      on: h.active && !acting,
      collectives: h.active ? (s.identity?.collectives ?? []).map((c) => ({ id: c.id, form: c.form, name: c.name, named: c.named ?? null, on: acting?.id === c.id })) : []
    }));
    return identityPanel({ ids, adding, add: ADD(b.web), foot: b.web ? "This browser: the web client, for testing only." : "This app: Damgar on this computer. Money acts always show Ki\u0161ib\u2019s panel for an identity used through it.", inside });
  }
  function openIdentityPanel(inside) {
    if (panelOpen()) redrawPanel(panelHtml(inside));
    else openPanel(app2, panelHtml(inside));
  }
  async function identityMenu(button, id) {
    const items = IDENTITY_MENU.filter(([k]) => state?.held.find((h) => h.id === id)?.runner ? k !== "renew" : true).map(([key, label, hint], i, all) => ({ key, label, hint: hint || void 0, line: i === all.length - 1 }));
    const held2 = state?.held.find((h) => h.id === id);
    const called = nameOf(held2?.named) ?? held2?.name ?? null;
    popAt(button, `<div class="k-pop" role="menu"><div class="k-t">${e(called ?? "Its settings")}</div>${items.map((m) => `${m.line ? "<hr>" : ""}<button type="button" role="menuitem" data-k-item="${m.key}">${e(m.label)}${m.hint ? `<span class="k-k">${e(m.hint)}</span>` : ""}</button>`).join("")}</div>`, "below", async (key) => {
      if (id !== state?.identity?.id && key !== "remove") {
        await act(() => b.ask("use", { id }));
        state = await b.ask("state");
      }
      if (key === "remove") return void openConfirm(app2, removeSaid("Damgar", called ?? "this identity").replace("data-k-remove>", `data-k-remove data-id="${e(id)}">`));
      closePanel();
      if (key === "words") {
        const c = await act(() => b.ask("carry"));
        if (c) popup2.show("The signing key\u2019s words", wordsShown(c));
      } else if (key === "line") popup2.show("Line and homes", lineShown(state));
      else if (key === "renew") popup2.show("New words from Ki\u0161ib", renewForm());
      else if (key === "collective") popup2.show("A collective under it", collectiveForm(state.identity.collectives));
    });
  }
  async function addPart(k) {
    if (state?.stage === "identity") {
      app2.innerHTML = firstScreen(b.web, k);
      if (k === "kishib") await runnerPart($("first-part"));
      return;
    }
    closePanel();
    const body = popup2.show(k === "make" ? "Make an identity" : k === "bring" ? "Bring an identity" : "Use one from Ki\u0161ib", k === "make" ? makeForm() : k === "bring" ? bringForm() : '<p class="k-small k-soft">Reading Ki\u0161ib\u2019s runner\u2026</p>');
    if (k === "kishib") await runnerPart(body);
  }
  async function runnerPart(into) {
    const r = await raw("runner").catch((e3) => ({ available: true, state: null, code: null, identities: [], problem: errorOf(e3) }));
    if (into.isConnected) into.innerHTML = runnerForm(r);
  }
  attachColumn(app2, async (key) => {
    part = key;
    keepAt();
    await fill();
  });
  app2.addEventListener("click", async (ev) => {
    const t = ev.target;
    const tile = t.closest("[data-k-tile]");
    if (tile) {
      tab = tile.dataset.kTile;
      part = firstPart(tab);
      return void await draw();
    }
    const tb = t.closest("[data-tab]");
    if (tb) {
      tab = tb.dataset.tab;
      part = firstPart(tab);
      return void await draw();
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
      if (use.dataset.kUnder) {
        const c = state?.identity?.collectives.find((x) => x.id === id2);
        acting = acting?.id === id2 || !c ? null : { id: id2, form: c.form, name: c.name, named: c.named ?? null };
        closePanel();
        if (acting) [tab, part] = ["waiting", "collective"];
        else if (tab === "waiting" && part === "collective") part = "to-pay";
        return void await draw();
      }
      acting = null;
      closePanel();
      await act(() => b.ask("use", { id: id2 }));
      return void await show(await b.ask("state"));
    }
    const menu2 = t.closest("[data-k-idmenu]");
    if (menu2) return void await identityMenu(menu2, menu2.dataset.kIdmenu);
    if (t.closest("[data-k-remove-no]")) return void redrawPanel(panelHtml());
    const yes = t.closest("[data-k-remove-yes]");
    if (yes) {
      const id2 = yes.closest("[data-k-remove]")?.dataset.id ?? state?.identity?.id ?? "";
      closePanel();
      await act(() => b.ask("forget", { id: id2 }));
      return void await show(await b.ask("state"));
    }
    const take = t.closest("[data-runner-take]");
    if (take) {
      const r = await act(() => raw("runner take", { id: take.dataset.runnerTake }));
      if (r) {
        popup2.close();
        await show(await b.ask("state"));
        broughtSay(r);
      }
      return;
    }
    const cr = t.closest("[data-collective-remove]");
    if (cr) {
      const r = await act(() => b.ask("collective remove", { id: cr.dataset.collectiveRemove }));
      state = await b.ask("state");
      const body = popup2.open ? popup2.replace(collectiveForm(state.identity.collectives)) : null;
      if (r && body) body.insertAdjacentHTML("afterbegin", note("done", lines(r.lines)));
      return;
    }
    const el = t.closest("[data-action]");
    if (!el) return;
    const a = el.dataset.action;
    const id = el.dataset.id ?? "";
    switch (a) {
      case "home-tiles":
        tab = null;
        return void await draw();
      // H112: the first-use step never locks the app: Later, or back to the first page.
      // H117: the browser's own wallet (WebLN), where there is one: it asks the person to approve, and its proof is taken back here.
      case "webln": {
        const w = window.webln;
        if (!w) return;
        try {
          await w.enable();
          const r = await w.sendPayment(el.dataset.invoice);
          const f = app2.querySelector(`form.paid[data-key="${CSS.escape(el.dataset.key)}"]`);
          const proof = f?.querySelector("input[name=proof]");
          if (f && proof && /^[0-9a-f]{64}$/i.test(r.preimage)) {
            proof.value = r.preimage;
            f.requestSubmit();
          } else fail(new Error("Your browser\u2019s wallet gave no proof Damgar can read: paste the preimage from it below."));
        } catch (err) {
          fail(new Error(`Your browser\u2019s wallet did not pay it (${errorOf(err)}). Nothing was signed.`));
        }
        return;
      }
      case "rail-add": {
        const k = app2.querySelector('form#rails select[name="rail-add"]')?.value;
        if (k) redrawRails([...railsChosen ?? [], k]);
        return;
      }
      case "rail-remove":
        return redrawRails((railsChosen ?? []).filter((k) => k !== el.dataset.rail));
      case "accept-later": {
        const r = await act(() => b.ask("accept later"));
        if (r) {
          await show(await b.ask("state"));
          done(r);
        }
        return;
      }
      case "first-back": {
        const r = await act(() => b.ask("first back"));
        if (r) await show(await b.ask("state"));
        return;
      }
      case "renew":
        return void popup2.show("New words from Ki\u0161ib", renewForm());
      case "copy": {
        const ok = await copy(el.dataset.text ?? "");
        el.textContent = ok ? "Copied" : "Select it and copy it";
        return;
      }
      case "look":
        return void await act(() => refresh());
      case "runner-pair": {
        const r = await act(() => raw("runner pair"));
        if (r) await runnerPart(el.closest("#first-part, .k-mbody"));
        return;
      }
      case "runner-look":
        return void await runnerPart(el.closest("#first-part, .k-mbody"));
      case "sign draft":
      case "decline":
      case "accept debt":
      case "pay request":
      case "grant lane":
      case "answer address":
      case "sign receipt": {
        const r = await act(() => b.ask(a, a === "sign receipt" ? { key: id } : { id }));
        if (r) {
          state = await b.ask("state");
          await fill();
          done(r);
        }
        return;
      }
      case "refuse invoice": {
        const why = prompt("Why (sent to them, sealed)?", "not expected") ?? "";
        const r = await act(() => b.ask("refuse invoice", { id, why }));
        if (r) await fill(), done(r);
        return;
      }
      case "recheck": {
        const r = await act(() => b.ask("recheck", { key: el.dataset.key }));
        if (r) await fill(), done(r);
        return;
      }
      case "revoke lane review": {
        const r = await act(() => b.ask("revoke lane review", { grant: el.dataset.grant }));
        const at = app2.querySelector(`[data-revoke="${CSS.escape(el.dataset.grant ?? "")}"]`);
        if (r && at) at.innerHTML = revokeReview(el.dataset.grant ?? "", r.lines);
        return;
      }
      case "revoke lane": {
        const r = await act(() => b.ask("revoke lane", { grant: el.dataset.grant }));
        if (r) await fill(), done(r);
        return;
      }
      case "own lane": {
        if (!laneAsked) return;
        const r = await act(() => b.ask("own lane", { ...laneAsked, digest: el.dataset.digest }));
        if (r) {
          laneAsked = null;
          await fill();
          done(r);
        }
        return;
      }
      case "link remove": {
        const r = await act(() => b.ask("link", { remove: true }));
        if (r) await fill(), done(r);
        return;
      }
      case "publish list": {
        const r = await act(() => b.ask("publish list", { on: el.dataset.on === "true" }));
        if (r) {
          state = await b.ask("state");
          await fill();
          done(r);
        }
        return;
      }
      case "vault transfer": {
        if (!vaultAsked) return;
        const r = await act(() => b.ask("vault transfer", { ...vaultAsked, digest: el.dataset.digest }));
        if (r) {
          vaultAsked = null;
          await fill();
          done(r);
        }
        return;
      }
      case "rails publish": {
        if (!reviewed) return;
        const r = await act(() => b.ask("rails publish", { ...reviewed, digest: el.dataset.digest }));
        if (r) {
          reviewed = null;
          await fill();
          done(r);
        }
        return;
      }
      case "collective-promise": {
        const f = el.closest("form.collective-promise");
        if (!f) return;
        const fd = new FormData(f);
        const r = await act(() => b.ask("collective promise", { collective: f.dataset.collective, to: str(fd, "to"), value: str(fd, "value"), unit: "", whatFor: str(fd, "whatFor"), digest: el.dataset.digest }));
        if (r) await fill(), done(r);
        return;
      }
    }
  });
  app2.addEventListener("change", async (ev) => {
    const el = ev.target;
    if (el.id !== "manual") return;
    done(await act(() => b.ask("manual", { on: el.checked })));
  });
  const str = (fd, k) => String(fd.get(k) ?? "");
  app2.addEventListener("submit", async (ev) => {
    const f = ev.target;
    const fid = f.getAttribute("id");
    if (fid === "pair") return;
    ev.preventDefault();
    const fd = new FormData(f);
    const into = (html) => {
      const box = f.closest(".k-mbody") ?? $("first-part") ?? pane();
      if (box) box.innerHTML = html;
    };
    switch (fid) {
      case "bring": {
        const r = await act(() => b.ask("bring", { id: str(fd, "id"), words: str(fd, "words"), address: str(fd, "address"), relays: str(fd, "relays") }));
        if (r) popup2.close(), await show(await b.ask("state")), broughtSay(r);
        return;
      }
      case "make": {
        const r = await act(() => b.ask("make", { homes: str(fd, "homes"), relays: str(fd, "relays") }));
        if (r) into(makeWords(r));
        return;
      }
      case "make-confirm": {
        const typed = [...f.querySelectorAll("input")].map((x) => x.value.trim());
        const r = await act(() => b.ask("make confirm", { typed }));
        if (r) popup2.close(), await show(await b.ask("state")), broughtSay(r);
        return;
      }
      case "renew": {
        const r = await act(() => b.ask("renew", { words: str(fd, "words") }));
        if (r) popup2.close(), keyChanged(app2, null), await show(await b.ask("state")), done(r);
        return;
      }
      case "collective-add": {
        const r = await act(() => b.ask("collective add", { id: str(fd, "id") }));
        if (r) {
          state = await b.ask("state");
          popup2.replace(collectiveForm(state.identity.collectives))?.insertAdjacentHTML("afterbegin", note("done", lines(r.lines)));
        }
        return;
      }
      case "accept": {
        const keys = [...f.querySelectorAll("input[name=accept]:checked")].map((x) => x.value);
        const first = state?.stage === "accept";
        const kept = ev.submitter?.getAttribute("data-in") === "here" ? "here" : "list";
        const r = await act(() => b.ask("accept", { keys, where: first ? "first" : "settings", in: kept }));
        if (r) {
          state = await b.ask("state");
          if (first) await show(state);
          else await fill();
          done(r);
        }
        return;
      }
      case "paste": {
        const r = await act(() => b.ask("paste", { text: str(fd, "text") }));
        if (r) {
          state = await b.ask("state");
          part = "to-pay";
          await draw();
          done({ lines: r.lines.slice(0, 1) });
        }
        return;
      }
      case "rely": {
        const r = await act(() => b.ask("rely", { id: str(fd, "act"), typed: str(fd, "typed") }));
        if (r) popup2.close(), done(r);
        return;
      }
      case "anchor-offers": {
        const service = str(fd, "service");
        const chosen = str(fd, "act");
        const r = await act(() => b.ask("anchor offers", { service }));
        if (r) popup2.replace(anchorForm(anchoring, r.offers, service, chosen));
        return;
      }
      case "anchor": {
        const [offer, tier] = str(fd, "tier").split(":");
        const r = await act(() => b.ask("anchor", { id: f.dataset.act, service: f.dataset.service, offer, tier: Number(tier) }));
        if (r) {
          popup2.close();
          state = await b.ask("state");
          [tab, part] = ["account", "anchors"];
          await draw();
          done(r);
        }
        return;
      }
      case "tip": {
        const r = await act(() => b.ask("tip", { to: f.dataset.to, value: str(fd, "value"), unit: str(fd, "unit"), whatFor: str(fd, "whatFor") }));
        if (r) {
          popup2.close();
          state = await b.ask("state");
          [tab, part] = ["waiting", "to-pay"];
          await draw();
          done({ lines: r.lines.slice(0, 1) });
        }
        return;
      }
      case "vault-transfer": {
        const a = { entry: Number(str(fd, "entry") || 0), value: str(fd, "value") };
        const r = await act(() => b.ask("vault transfer read", a));
        if (r) {
          vaultAsked = a;
          $("vault-review").innerHTML = vaultReview(r);
        }
        return;
      }
      case "rails": {
        const on = railsChosen ?? [];
        const a = { lightning: on.includes("lightning") ? str(fd, "lightning") : "", onchain: on.includes("onchain") ? str(fd, "onchain") : "", network: Number(str(fd, "network") || 3), newRequestKey: fd.get("newRequestKey") === "on", order: on };
        const r = await act(() => b.ask("rails review", a));
        if (r) {
          reviewed = a;
          $("rails-review").innerHTML = railsReview(r);
        }
        return;
      }
      case "clock":
        return void done(await act(() => b.ask("clock", { clock: str(fd, "clock") })));
      case "link": {
        const r = await act(() => b.ask("link", { rest: str(fd, "rest"), macaroonFile: str(fd, "macaroonFile"), certFile: str(fd, "certFile") }));
        if (r) await fill(), done(r);
        return;
      }
      case "relays": {
        const r = await act(() => b.ask("relays", { relays: str(fd, "relays") }));
        if (r) state = await b.ask("state"), done(r);
        return;
      }
    }
    if (f.classList.contains("invoice")) {
      const r = await act(() => b.ask("answer invoice", { id: f.dataset.id, invoice: str(fd, "invoice") }));
      if (r) await fill(), done(r);
    } else if (f.classList.contains("paid")) {
      const r = await act(() => b.ask("paid", { key: f.dataset.key, proof: str(fd, "proof") }));
      if (r) state = await b.ask("state"), await fill(), done(r);
    } else if (f.classList.contains("vault-invoice")) {
      const r = await act(() => b.ask("vault invoice", { key: f.dataset.key, invoice: str(fd, "invoice") }));
      if (r) await fill(), done(r);
    } else if (f.classList.contains("own-lane")) {
      const until = str(fd, "until");
      const a = { role: f.dataset.role, cap: str(fd, "cap"), unit: str(fd, "unit"), until: until ? Math.floor(new Date(until).getTime() / 1e3) : null };
      const r = await act(() => b.ask("own lane review", a));
      if (r) {
        laneAsked = a;
        $("lane-review").innerHTML = laneReview(r);
      }
    } else if (f.classList.contains("collective-promise")) {
      const args = { collective: f.dataset.collective, to: str(fd, "to"), value: str(fd, "value"), unit: "", whatFor: str(fd, "whatFor") };
      const r = await act(() => b.ask("collective promise read", args));
      const box = f.querySelector(".promise-read");
      if (r && box) box.innerHTML = promiseRead(r);
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
var app = document.getElementById("app");
var damgar;
var ask2 = (op, a = {}) => run(damgar, op, a);
var ui = mount(app, { web: true, ask: ask2, start });
async function start() {
  if (!window.isSecureContext || !crypto?.getRandomValues || !window.indexedDB) {
    app.innerHTML = alone(`${note("error", "This page keeps a key in the browser, which browsers allow only over https (or on the machine itself), and only where their storage is open to it.")}`);
    return;
  }
  try {
    damgar ??= new Damgar(await WebKeep.open(), { web: true, chain: null });
  } catch (err) {
    app.innerHTML = alone(`${note("error", `This browser does not let the page keep anything (${e(err instanceof Error ? err.message : String(err))}).`)}`);
    return;
  }
  try {
    await ui.show(await damgar.state());
  } catch (err) {
    app.innerHTML = alone(`${note("error", e(err instanceof Error ? err.message : String(err)))}`);
  }
}
void start();
