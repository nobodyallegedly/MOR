# Founding cMIPs

Community specifications for the tasks the MIPs hand out, and for what no task foresaw. Not core: each is named by its hash, frozen at publication, and competes with any other cMIP for the same job.

Planned for MOR V1:

| cMIP | What it does |
| --- | --- |
| Relay transport (`cmip-relay-transport-draft-2.md`, draft 2, approved by Nobody, allegedly; `cmip-relay-transport-draft-3.md`, draft 3 adding the delivery record, F184, not yet approved) | How a client publishes, fetches and follows acts, delivers to an inbox, and asks a home for a receipt; in draft 3, how a relay signs a delivery record that counts as evidence once the payer's claim acknowledges it. The core deliberately leaves this open. |
| Release manifest (`cmip-release-manifest-draft-1.md`, draft 1, approved by Nobody, allegedly; `cmip-release-manifest-draft-2.md`, draft 2 for Law draft 7, not yet approved) | How the collective that governs the code publishes a release, file by file, with its members' visible signatures, and how anyone verifies it (roadmap step 5a). No task: a new kind of thing, named as an extension. |
| Payment (`cmip-payment-draft-2.md`, draft 2, experimental, not approved) | Task 6 (payment, F112): how rail Modules plug in, the payment commitment a rail carries, the proof a receipt or claim carries, how they are verified, and what a payer does when the vault leaves nowhere to pay (roadmap step 12). Code: `payment/` (crate `mor-payment`). |
| Long-form text format (`cmip-long-form-draft-1.md`, draft 1, approved by Nobody, allegedly) | Task 4 (text format): a strict subset of Markdown on top of canonical text, hiding only its declared markup, in its declared positions (F149), adding nothing and keeping the order of the bytes (roadmap step 8). |
| Website (`cmip-website-draft-3.md`, draft 3, **not yet approved**; draft 2 kept beside it) | A site as a signed manifest naming each page and file by hash, published on relays; a gateway serving the sites its operator chose at their addresses, each at the version its operator sets (by default the publisher's latest), with MOR's released display client checking every page in the visitor's browser; a page's icon from one of the site's own pictures (draft 3); the hostile gateway as a stated cost (roadmap step 10a). No task: a new kind of thing. |

Media types such as JPEG are Modules and live in `modules/`.
