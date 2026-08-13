# Translation review

Ten locales ship complete. Every string below was translated for meaning rather than
word for word, in the register a shop floor worker uses, and English loanwords are
written in the local script wherever that is the word an operator would recognise
(shift, reject, rework, machine, casting, PIN, online, offline).

Nothing here is a machine translation of English placed straight into the file, and
no locale falls back to English for any key. What follows is the list of strings that
should be read by a native speaker before this goes in front of an operator, with the
reason each one is on the list.

Files live in `src/i18n/locales/<locale>.json`. Keys are flat and dot namespaced.
`src/i18n/index.ts` warns to the console for any key missing from a locale, so a gap
shows up during a build rather than as an empty button in a foundry.

## Priority

Tamil is the default operator language at this plant and carries the most weight.
Bhojpuri, Odia, Bengali and Assamese matter next, because the migrant workforce on
C shift is the reason the language layer exists at all.

---

## Every locale

These keys are the ones an operator acts on. A wrong word here changes what gets
counted, so they are worth reading first in all ten languages.

| Key | Why it needs checking |
|---|---|
| `close.unaccounted` | The central idea of the whole tool. "Unaccounted" has no single natural equivalent in most of these languages, and the chosen wording leans on the everyday phrase for "not in the accounts" rather than a technical term. |
| `close.state.variance`, `close.state.approval` | These must read as a requirement, never as an accusation. Tone matters more than literal accuracy. |
| `close.blocked` | Must read as "this is what is still needed", not "you have done something wrong". |
| `home.passed`, `close.passed` | The verb for sending castings on to the next station differs by plant and by region. |
| `home.rework`, `close.rework` | Whether the loanword or the local term is used varies. The loanword is used here. |
| `variance.UNKNOWN` | Must carry no shame. It should read as a plain statement that the cause is not known. |
| `count.units` | The word for a casting. The English loanword is used here on the assumption that it is what is said on the floor. |
| `count.tapToEnter` | Instruction for the one screen the operator spends their time on. Must read as plain spoken guidance. |
| `close.approve` | The shift in-charge's approval button, which carries their own first name. Check the verb agrees with a person's name in front of it. |

---

## ta, Tamil

| Key | Note |
|---|---|
| `shift.stage` | Rendered as பிரிவு, section. Confirm whether operators say பிரிவு, செக்ஷன் or the station name alone. |
| `close.opening` | முந்தைய ஷிப்ட் பாக்கி, the balance left by the previous shift. Confirm this is how a carry forward is described. |
| `reason.COLDSHUT`, `reason.SHRINKAGE` | Kept as loanwords in Tamil script. Confirm the fettling and inspection benches use these rather than Tamil terms. |
| `close.supervisor.who` | ஷிப்ட் இன்சார்ஜ். Confirm against the plant's own title for the role. |

## hi, Hindi

| Key | Note |
|---|---|
| `close.unaccounted` | हिसाब से बाहर. Confirm this reads naturally rather than as an accounting term. |
| `reason.SANDINC` | रेत मिल गई. Confirm whether बालू is the word used in the foundry. |
| `home.instruction` | Long sentence. Check it does not read as an instruction to a child. |

## bho, Bhojpuri

| Key | Note |
|---|---|
| All keys | Bhojpuri has no settled written standard in industrial use. This file was written in the spoken register in Devanagari. A native speaker should confirm verb endings throughout, particularly the imperative forms used on every button. |
| `close.state.approval`, `close.instruction.approval` | The longest sentences in the file and the most likely to read as stilted. |
| Speech | Browsers do not ship a Bhojpuri voice. The Hindi voice is used for the read aloud control, since it reads the Devanagari closely enough to help. Confirm this is acceptable rather than confusing. |

## or, Odia

| Key | Note |
|---|---|
| `close.unaccounted` | ହିସାବ ବାହାରେ. Confirm phrasing. |
| `reason.CORESHIFT`, `reason.SHRINKAGE` | Technical foundry terms. Confirm whether the English term in Odia script is more recognisable than the translation given. |
| `home.instruction`, `close.instruction.approval` | Long sentences. Check the honorific level is right for a supervisor speaking to an operator. |

## bn, Bengali

| Key | Note |
|---|---|
| `count.pass.title`, `count.reject.title` | Question forms. Confirm they read as spoken questions rather than written ones. |
| `reason.MISRUN` | মিসরান, পুরো ভরেনি. Confirm the gloss is useful rather than redundant. |
| `close.supervisor.who` | শিফট ইনচার্জ. Confirm the plant's own title. |

## te, Telugu

| Key | Note |
|---|---|
| Whole file | Telugu strings run noticeably longer than the English. Every button was tested for wrapping at 380px, but a native speaker may find shorter natural phrasings that would read better on a cracked screen. |
| `close.state.approval` | The longest string in the application in this locale. |
| `home.action.pass` | ముందుకు పంపినది నమోదు చేయండి. Confirm నమోదు is the word used rather than a loanword. |

## kn, Kannada

| Key | Note |
|---|---|
| Whole file | As with Telugu, strings run long. Check wrapping on the three action buttons on the stage home screen. |
| `close.unaccounted` | ಲೆಕ್ಕಕ್ಕೆ ಸಿಗದ್ದು. Confirm. |
| `reason.SANDINC` | ಮರಳು ಸೇರಿಕೊಂಡಿದೆ. Confirm against the term used at the fettling bay. |

## mr, Marathi

| Key | Note |
|---|---|
| `close.opening` | मागच्या शिफ्टचे शिल्लक. Confirm शिल्लक is right for a physical carry forward rather than a financial balance. |
| `variance.MIXED_BATCH` | दुसऱ्या पार्ट नंबरमध्ये मिसळले. Confirm. |

## as, Assamese

| Key | Note |
|---|---|
| Whole file | Assamese is written here in the Assamese script with the ৰ and ৱ letters. Confirm no Bengali forms have crept in. |
| `shift.name` | শ্বিফ্ট. Confirm the spelling of the loanword. |
| `close.state.approval` | Long sentence, check register. |
| Speech | Browsers rarely ship an Assamese voice. The read aloud control hides itself when no voice is present, which is the intended behaviour rather than a fault. |

---

## Points that are not translation questions but affect the translations

- Numerals stay in Western Arabic digits in every locale. Operators read counts off
  tally sheets and gauges in Western digits, so localising them would make the screen
  harder to read, not easier.
- Employee numbers, part numbers and times are never translated.
- The plant name is never translated.
- The read aloud control speaks the instruction line only, not the figures.
