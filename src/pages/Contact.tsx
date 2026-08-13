import { useState } from 'react'
import { Container, Page } from '../components/chrome'
import { CONTACT, HAS_PHONE, HAS_WHATSAPP, PHONE_HREF, REACH, whatsappHref } from '../data/site'

/**
 * Contact, as a three-step intake.
 *
 * One long form is answered by fewer people than three short ones, and the
 * questions here are not admin: they are what turns a first reply into a useful
 * one. Knowing the trade, what the business actually does, and how the problem
 * is handled today is most of the preparation for a first call.
 *
 * **The record contract is shared.** These exact keys land in the Google Sheet
 * behind the Apps Script endpoint and in the Formspree notification. Renaming
 * one here silently drops a column in the Sheet, so change it in the Apps Script
 * `fields` array in the same pass.
 */

const SHEET_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbyBys5ISNQzCsNEplcHt81oPM1MDOlcXXJJip-fOfC9hfP4yKTQEioqOaREr-MkeNw/exec'
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xjgqkkkq'

const INDUSTRIES = [
  'Manufacturing',
  'Construction',
  'Industrial supply',
  'Trading',
  'Services',
  'Other',
]

type Status = 'editing' | 'sending' | 'sent' | 'error'

interface Answers {
  industry: string
  company: string
  does: string
  challenge: string
  current: string
  name: string
  role: string
  city: string
  email: string
  phone: string
}

const EMPTY: Answers = {
  industry: '',
  company: '',
  does: '',
  challenge: '',
  current: '',
  name: '',
  role: '',
  city: '',
  email: '',
  phone: '',
}

export default function Contact() {
  const [step, setStep] = useState(0)
  const [a, setA] = useState<Answers>(EMPTY)
  const [status, setStatus] = useState<Status>('editing')
  const [touched, setTouched] = useState(false)

  const set = (k: keyof Answers) => (v: string) => setA((prev) => ({ ...prev, [k]: v }))

  const stepValid =
    step === 0
      ? a.industry !== '' && a.company.trim() !== '' && a.does.trim() !== ''
      : step === 1
        ? a.challenge.trim() !== ''
        : a.name.trim() !== '' && a.email.trim() !== ''

  function next() {
    setTouched(true)
    if (!stepValid) return
    setTouched(false)
    setStep((s) => s + 1)
  }

  function back() {
    setTouched(false)
    setStep((s) => Math.max(0, s - 1))
  }

  async function submit() {
    setTouched(true)
    if (!stepValid) return
    setStatus('sending')

    const record = {
      Name: a.name.trim(),
      Role: a.role.trim() || 'Not provided',
      Email: a.email.trim(),
      Phone: a.phone.trim() || 'Not provided',
      Company: a.company.trim(),
      City: a.city.trim() || 'Not provided',
      Industry: a.industry,
      'What the business does': a.does.trim(),
      Challenge: a.challenge.trim(),
      'Handled today': a.current.trim() || 'Not provided',
    }

    // Sheet and email notification. no-cors means the response is opaque, so
    // this one cannot report failure and the Formspree call drives the state.
    void fetch(SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(() => {
      /* the Formspree copy is the one that has to arrive */
    })

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `New enquiry: ${record.Company || record.Name}`,
          ...record,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      window.halcyonTrackLead?.()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Page>
      <div className="border-b border-rule bg-sunk">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 py-2.5">
          <span className="field field-teal">Contact</span>
          <span className="field ml-auto hidden sm:block">{CONTACT.responseTime}</span>
        </Container>
      </div>

      <section>
        <Container className="py-14 sm:py-20">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* ------------------------------------------- Left: who you reach */}
            <div className="lg:col-span-5">
              <h1 className="display text-[2.3rem] leading-[1.04] sm:text-[3rem]">
                Tell us what the work looks like.
              </h1>
              <p className="prose-measure mt-6 text-[1.02rem] leading-relaxed text-ink-2">
                Three short questions. They exist so the first reply is useful rather than a request
                for more information, and Sanjith answers it himself.
              </p>

              <dl className="mt-10 border-t border-rule-strong">
                <Row label="Who replies">
                  {CONTACT.founder}
                  <span className="block text-ink-3">{CONTACT.role}</span>
                </Row>
                {HAS_WHATSAPP && (
                  <Row label="WhatsApp">
                    <a
                      href={whatsappHref()}
                      target="_blank"
                      rel="noreferrer"
                      className="num underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold-ink"
                    >
                      {CONTACT.whatsapp || CONTACT.phone}
                    </a>
                  </Row>
                )}
                {HAS_PHONE && (
                  <Row label="Phone">
                    <a
                      href={PHONE_HREF}
                      className="num underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold-ink"
                    >
                      {CONTACT.phone}
                    </a>
                  </Row>
                )}
                <Row label="Email">
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold-ink"
                  >
                    {CONTACT.email}
                  </a>
                </Row>
                <Row label="Reach">{REACH}</Row>
                <Row label="Response">{CONTACT.responseTime}</Row>
              </dl>

              <p className="mt-8 text-[0.86rem] leading-relaxed text-ink-3">
                Any of these reach the same person. The form is only worth using if you would rather
                set out the problem in one go than start a back and forth.
              </p>
            </div>

            {/* ------------------------------------------- Right: the intake */}
            <div className="lg:col-span-7">
              <div className="border border-rule-strong bg-raised">
                <div className="flex items-center justify-between border-b border-rule px-5 py-2.5 sm:px-7">
                  <span className="field">
                    {status === 'sent' ? 'Received' : `Step ${step + 1} of 3`}
                  </span>
                  <span className="field">
                    {status === 'sent' ? '' : ['Your business', 'The problem', 'You'][step]}
                  </span>
                </div>

                {/* Progress, as a rule that fills. */}
                <div className="h-px w-full bg-rule">
                  <div
                    className="h-px bg-gold transition-[width] duration-500 ease-out"
                    style={{
                      width: status === 'sent' ? '100%' : `${((step + 1) / 3) * 100}%`,
                    }}
                  />
                </div>

                <div className="p-5 sm:p-7">
                  {status === 'sent' ? (
                    <div className="settle py-8">
                      <span className="stamp">Received</span>
                      <h2 className="display mt-6 text-[1.7rem] sm:text-[2rem]">
                        That is with Sanjith.
                      </h2>
                      <p className="prose-measure mt-4 text-[0.98rem] leading-relaxed text-ink-2">
                        You will get a reply personally, within 24 hours. If it is urgent,{' '}
                        {HAS_WHATSAPP || HAS_PHONE
                          ? 'use the number on this page.'
                          : 'email ' + CONTACT.email + ' directly.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {step === 0 && (
                        <div className="settle space-y-6">
                          <Legend>What kind of business is it?</Legend>
                          <div>
                            <span className="field">Industry</span>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {INDUSTRIES.map((ind) => (
                                <button
                                  key={ind}
                                  type="button"
                                  onClick={() => set('industry')(ind)}
                                  aria-pressed={a.industry === ind}
                                  className={`border px-3.5 py-2 text-[0.86rem] transition-colors ${
                                    a.industry === ind
                                      ? 'border-ink bg-ink text-paper'
                                      : 'border-rule-strong text-ink-2 hover:border-ink'
                                  }`}
                                >
                                  {ind}
                                </button>
                              ))}
                            </div>
                            {touched && !a.industry && (
                              <FieldError>Pick the closest one.</FieldError>
                            )}
                          </div>

                          <Text
                            label="Company name"
                            value={a.company}
                            onChange={set('company')}
                            error={touched && !a.company.trim() ? 'We need the company name.' : ''}
                          />
                          <Area
                            label="What does the business actually do?"
                            hint="More specific than the industry. What you make, fit, supply or service."
                            value={a.does}
                            onChange={set('does')}
                            error={
                              touched && !a.does.trim()
                                ? 'A sentence is enough, but we need one.'
                                : ''
                            }
                          />
                        </div>
                      )}

                      {step === 1 && (
                        <div className="settle space-y-6">
                          <Legend>What is the job you keep doing twice?</Legend>
                          <Area
                            label="The main problem"
                            hint="The thing that takes too long, gets lost, or only one person knows how to do."
                            value={a.challenge}
                            onChange={set('challenge')}
                            rows={5}
                            error={touched && !a.challenge.trim() ? 'This is the useful part.' : ''}
                          />
                          <Area
                            label="How is it handled today?"
                            optional
                            hint="Spreadsheets, WhatsApp, paper, Tally, software that nobody likes."
                            value={a.current}
                            onChange={set('current')}
                          />
                        </div>
                      )}

                      {step === 2 && (
                        <div className="settle space-y-6">
                          <Legend>Where can we reach you?</Legend>
                          <div className="grid gap-6 sm:grid-cols-2">
                            <Text
                              label="Your name"
                              value={a.name}
                              onChange={set('name')}
                              autoComplete="name"
                              error={touched && !a.name.trim() ? 'We need a name.' : ''}
                            />
                            <Text
                              label="Your role"
                              optional
                              value={a.role}
                              onChange={set('role')}
                              autoComplete="organization-title"
                            />
                            <Text
                              label="Email"
                              type="email"
                              value={a.email}
                              onChange={set('email')}
                              autoComplete="email"
                              error={
                                touched && !a.email.trim() ? 'We need an email to reply to.' : ''
                              }
                            />
                            <Text
                              label="Phone"
                              optional
                              type="tel"
                              value={a.phone}
                              onChange={set('phone')}
                              autoComplete="tel"
                            />
                            <Text
                              label="City"
                              optional
                              hint="Helps us plan a visit."
                              value={a.city}
                              onChange={set('city')}
                              autoComplete="address-level2"
                            />
                          </div>
                          {status === 'error' && (
                            <div className="border border-rule-strong bg-sunk p-4">
                              <p className="text-[0.9rem] leading-relaxed text-ink">
                                That did not send. Email{' '}
                                <a
                                  href={`mailto:${CONTACT.email}`}
                                  className="underline decoration-gold decoration-2 underline-offset-4"
                                >
                                  {CONTACT.email}
                                </a>{' '}
                                and it will reach the same place.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-9 flex items-center gap-4 border-t border-rule pt-6">
                        {step > 0 && (
                          <button
                            type="button"
                            onClick={back}
                            className="text-[0.88rem] text-ink-3 transition-colors hover:text-ink"
                          >
                            ← Back
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={step === 2 ? submit : next}
                          disabled={status === 'sending'}
                          className="ml-auto border border-ink bg-ink px-7 py-3.5 text-[0.92rem] font-500 text-paper transition-colors hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          {status === 'sending' ? 'Sending…' : step === 2 ? 'Send this' : 'Next'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <p className="mt-4 text-[0.8rem] leading-relaxed text-ink-3">
                What you write here goes to Sanjith and nowhere else. No newsletter, no list, no
                third party.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </Page>
  )
}

/* ------------------------------------------------------------------ *
 * Form parts. Kept local: they carry this page's conventions, not the
 * site's, and there is no second form to share them with.
 * ------------------------------------------------------------------ */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-4 border-b border-rule py-4 sm:grid-cols-[9rem_1fr]">
      <dt className="field pt-1">{label}</dt>
      <dd className="text-[0.95rem] leading-relaxed text-ink">{children}</dd>
    </div>
  )
}

function Legend({ children }: { children: React.ReactNode }) {
  return <h2 className="display-sm text-[1.3rem] sm:text-[1.5rem]">{children}</h2>
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-2 text-[0.82rem] text-gold-ink">
      {children}
    </p>
  )
}

const inputCls =
  'mt-2.5 w-full border border-rule-strong bg-paper px-3.5 py-3 text-[0.95rem] text-ink transition-colors placeholder:text-ink-3/60 focus:border-gold focus:outline-none'

function Text({
  label,
  value,
  onChange,
  optional = false,
  hint,
  error,
  type = 'text',
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  optional?: boolean
  hint?: string
  error?: string
  type?: string
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="field">
        {label}
        {optional && <span className="text-ink-3/70"> · optional</span>}
      </span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={inputCls}
      />
      {hint && !error && <span className="mt-1.5 block text-[0.78rem] text-ink-3">{hint}</span>}
      {error && <FieldError>{error}</FieldError>}
    </label>
  )
}

function Area({
  label,
  value,
  onChange,
  optional = false,
  hint,
  error,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  optional?: boolean
  hint?: string
  error?: string
  rows?: number
}) {
  return (
    <label className="block">
      <span className="field">
        {label}
        {optional && <span className="text-ink-3/70"> · optional</span>}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={`${inputCls} resize-y leading-relaxed`}
      />
      {hint && !error && <span className="mt-1.5 block text-[0.78rem] text-ink-3">{hint}</span>}
      {error && <FieldError>{error}</FieldError>}
    </label>
  )
}
