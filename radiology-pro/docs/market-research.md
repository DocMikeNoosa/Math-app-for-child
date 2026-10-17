# Market research: AI radiology dictation/report SaaS for Poland

Research date: 2026-10-13. Method: web search only. Direct page fetching was blocked in this environment (DNS and proxy denial), so every claim comes from search-engine snippets and summaries of the cited URLs. Anything marked **UNVERIFIED** was not confirmed. Vendor claims are reported as vendor claims.

---

## 1. Competitors in Poland

### Direct competitors: Polish-language AI tools that write radiology reports from dictation

| Product | What it does | Polish | AI report generation | Price | Model / target |
|---|---|---|---|---|---|
| **opisy.ai** | The radiologist dictates only the pathology. The app writes a full report "in your style", ready to paste into any RIS. It learns style from the doctor's past reports. The site says transcription can run locally in the browser. [opisy.ai](https://www.opisy.ai/), [blog](https://www.opisy.ai/news/jak-sztuczna-inteligencja-przyspiesza-tworzenie-opisow-badan/) | Yes | Yes (LLM) | Not found | Individual radiologists; copy-paste, no integration |
| **Nodum Radiologia** | Turns dictation into a report split into fields: technique, findings, conclusions, recommendations. It claims 5–15 more reports per day (labelled an estimate), EU hosting and GDPR compliance, and offers 100 free reports. [nodum.tech](https://nodum.tech/) | Yes | Yes | Not found (free trial of 100 reports) | Individual radiologists |
| **askRadek** | Learns the radiologist's template and turns rough notes into a structured CT/MR report. Browser dictation in Chrome and Edge. In beta, free with "RadCoins" after PWZ verification. No uptime guarantee. Paid plans are announced but not yet set. [askradek.com](https://www.askradek.com/) | Yes | Yes | Free (beta) | Individual radiologists |

**Key finding:** at least three Polish products already sell almost exactly the same idea (dictation, then template, then LLM report). The market is not empty. None publishes a price, which suggests the market is early.

### Polish-language speech recognition (dictation only, or dictation plus templates)

| Product | What it does | AI report generation | Price | Model / target |
|---|---|---|---|---|
| **MagicSpeech / Magic Speech Scribe (Radcomp sp. z o.o.)** | Speech recognition with radiology and pathology dictionaries. Integrates with HIS/RIS/PACS. Bundled with a Philips SpeechMike. The vendor says the engine runs locally and data never leaves the hospital. [radcomp.eu](https://radcomp.eu/), [dla medycyny](https://radcomp.eu/dla-medycyny/) | No (transcription only, per sources) | 3-year radiologist starter kit **16,297.50 zł**. 90-day and 12-month subscriptions exist; the 90-day plan auto-renews. [shop](https://magicscribesklep.pl/pl/p/Zestaw-Startowy-dla-Diagnosty-na-okres-3-lat./110), [90-day](http://www.magicscribesklep.pl/pl/p/Magic-Speech-Scribe-Diagnostyka-Subskrypcja-90-cio-dniowa/103) | Online shop plus hospital sales |
| **Newton Dictate (Newton Technologies, CZ)** | General Polish dictation. Used by LUX MED radiologists with a radiology dictionary, per a press release. [38pr.prowly.com](https://38pr.prowly.com/174351-sztuczna-inteligencja-w-sluzbie-radiologii) | No | Old prices: START 349 zł, BUSINESS 2,099 zł, PROFESSIONAL 4 4,699 zł (archived). [benchmark.pl](https://www.benchmark.pl/testy_i_recenzje/newton-dictate-4-program-do-zamiany-mowy-na-tekst.html), [komputronik](https://www.komputronik.pl/product/258907/newton-dictate-4-professional.html). A "Medycyna" edition was announced but its release is UNVERIFIED. | One-off licences; courts, administration, healthcare |
| **Alteris RIS** | RIS/PACS with a speech recognition module, voice recordings and templates. [alteris.pl](https://www.alteris.pl/ris-r) | Not stated | Not public | Hospitals (bundled) |
| **Philips SpeechLive** | Cloud dictation and speech recognition. Third-party listings name Polish among 17 languages; this is not confirmed on Philips' site. [capterra.ca](https://www.capterra.ca/software/1041090/speechlive) | No | Not found | Subscription, legal and medical |

### General AI scribes in Poland (not radiology-specific; they compete for the same budget)

- **Medly**: visit transcription and SOAP notes, "**199 zł/mc**", GDPR claims. [medly.com.pl](https://www.medly.com.pl/)
- **Medfile Asystent głosowy**: integrated with Medfile EDM. Its structured data shows **299 PLN**, but whether that is monthly is UNVERIFIED. [medfile.pl](https://www.medfile.pl/asystent-glosowy-lekarza)
- **Mentis Notes** (14-day trial, price not found), **Noa Notes (Docplanner/Znany Lekarz)**, **VitaAI**. [mentisnotes.pl](https://mentisnotes.pl/), [noa.ai](https://noa.ai/pl/noa-notes), [vitaai.pl](https://vitaai.pl/)
- **Heidi Health**: used as an "AI scribe" in a Poznań emergency department (SOR). It runs outside the hospital network, and data is deleted after 6 hours. [interia](https://wydarzenia.interia.pl/wielkopolskie/news-w-poznanskim-szpitalu-pojawila-sie-zadziwiajaca-tabliczka-pa,nId,23317258), [ESKA](https://poznan.eska.pl/sztuczna-inteligencja-pomaga-lekarzom-w-poznaniu-skryba-ai-oszczedza-kilka-godzin-pracy-dziennie-aa-fG8L-gH3k-YF7n.html). Pro is listed at $90/user/month; 2026 reviews say $150. [heidihealth pricing](https://webflow.heidihealth.com/pricing), [veroscribe](https://www.veroscribe.com/blog/heidi-health-review-2026). Polish is listed in directories. [capterra](https://www.capterra.ca/software/1062261/heidi)
- **PulsNote (Łukasiewicz)**: local, offline scribe piloted in Siemianowice Śląskie. [rynekzdrowia](https://www.rynekzdrowia.pl/E-zdrowie/AI-skroci-biurokracje-w-gabinecie-lekarza-do-kilkudziesieciu-sekund-Rozpozna-tez-slaska-gware,289873,7.html)
- **"Skryba"**: an EU-funded project by Wasko (2022–2023). [wasko.pl](https://www.wasko.pl/projekty-ue/projekt-skryba/)

### Image-analysis AI (adjacent, not report writing from dictation)

- **Carebot** (CZ) via Synektik produces structured Polish results from images. [itwiz](https://itwiz.pl/polska-jako-pierwsza-w-europie-wdrozy-ai-w-diagnostyce-na-skale-ogolnokrajowa/)
- **NEXT DATA AI** (La Vie + PCSS) is a research project on automating chest CT/MR reports. [pcss.pl](https://www.pcss.pl/projekty/next-data-ai/)

### Searched for but not found or not relevant

- **Voicelab**: call transcription and conversational intelligence; no medical dictation product found. [voicelab.ai](https://voicelab.ai/)
- **Talkie.ai**: voicebots for patient phone calls, not dictation. [eu-startups](https://www.eu-startups.com/2022/07/polish-startup-talkie-ai-raises-e2-5-million-for-its-medtech-solution-boosting-customer-service/)
- **Asseco**: Medical VoiceBot for appointments. **Comarch**: no dictation product found. [search summary sources: comarch.pl/ai](https://www.comarch.pl/ai/)
- **Dragon Medical One**: Polish is not among its documented languages (EN, NL, FR, DE, IT, ES, SV). [commure](https://www.commure.com/blog-scribe/nuance-dragon-medical-one-review)
- **Grundig DigtaSoft / SPS SpeechExec**: Polish support is UNVERIFIED. [grundig-gbs](https://www.grundig-gbs.com/en/solutions/workflow-dictation/digtasoft-pro/)
- **Smart Reporting**: no Polish deployment found.
- No company called "Sagra/Primaris", "SpeechMed" or "MedVoice" was found for Poland.

---

## 2. International AI radiology reporting tools

| Tool | What it does | Public price |
|---|---|---|
| **Rad AI (Reporting, Impressions, Omni)** | Generates the impression and full report draft; the radiologist signs. | **Not public.** Annual enterprise contracts quoted per health system. [usagepricing](https://www.usagepricing.com/blueprint/rad-ai), [intuitionlabs](https://intuitionlabs.ai/software/radiology-workflow-informatics/radiologist-productivity-tools/rad-ai-impressions) |
| **Microsoft PowerScribe One + Smart Impression** | Market-leading reporting platform; AI drafts the impression in the radiologist's style. [MS support](https://support.microsoft.com/powerscribe-one/get-oriented) | **Not public.** A competitor estimates $5,000–10,000 per radiologist per year (vendor marketing). [getvoibe](https://www.getvoibe.com/resources/best-dictation-software-for-radiologists/) |
| **Microsoft Dragon Copilot (radiology preview)** | Summarises prior reports alongside PowerScribe. [5cnetwork](https://www.5cnetwork.com/resources/best-radiology-ai-dictation-tools) | Not public |
| **Dragon Medical One** | Cloud speech recognition (not Polish). | Reseller rates $99/$89/$79 per user per month on 1-, 2- and 3-year terms, plus ~$525 setup. [getvoibe](https://www.getvoibe.com/resources/dragon-medical-one-cost/), [spokenly](https://spokenly.app/blog/dragon-medical-one-cost) |
| **Fluency for Imaging (Solventum)** | PowerScribe rival; reportedly moving to Jacobian. [radwiz](https://www.radwiz.ai/blog/ai-radiology-reporting-comparison-2026) | Not public |
| **Smart Reporting** | Template and decision-tree structured reporting (e.g. LI-RADS). [5cnetwork](https://www.5cnetwork.com/resources/best-radiology-ai-dictation-tools) | Not public |
| **Harrison.ai (Harrison.Rad 1.5)** | Drafts reports from images and priors (June 2026); research access only. [axisimagingnews](https://axisimagingnews.com/market-trends/cloud-computing/machine-learning-ai/harrison-ai-unveils-radiology-ai-model-designed-draft-reports-images-priors) | Not public |
| **Annalise.ai** | Image detection (chest, mammography), not a report writer. | Not public |
| **Augnito** | Speech recognition, per-user subscription. | Quote only |
| **PatientNotes (radiology)** | AI scribe. | **$50/radiologist/month** or $600/year (vendor page). [patientnotes.ai](https://patientnotes.ai/specialties/radiology) |
| **RadRocket.AI** | AI report drafting. | Free up to 100 reports/month; unlimited **from $30/month**. [radrocket.ai](https://radrocket.ai/) |

Takeaway: enterprise players do not publish prices and sell to health systems. Self-serve tools for individuals cost about **$30–150/month**.

---

## 3. Market size in Poland

- **Radiologists:** NIL figure of **4,282** radiology specialists; elsewhere "4.3 thousand"; "under 3 thousand" practising, per the NRL president. The Ministry of Health counted **3,933** specialists in 2022, plus 54 that year. About 19% are over 60. [rynekzdrowia](https://www.rynekzdrowia.pl/E-zdrowie/Ekspert-teleradiologia-i-sztuczna-inteligencja-remedium-na-deficyt-specjalistow,266114,7.html), [politykazdrowotna](https://politykazdrowotna.com/artykul/radiolog-pilnie-poszukiwany-n1198848), [NIL table](https://nil.org.pl/uploaded_files/1583227918_zestawienie-nr-04.pdf). A clean 2025 NIL number was not found. Residents in training are an additional, uncounted segment.
- **Imaging volume:** The Ministry of Health reports **1.9 million CT scans in 2024**, 138 thousand more than 2023. NFZ CT and MR volumes rose 74% and 87% respectively between 2019 and 2024. [ezdrowie.gov.pl](https://ezdrowie.gov.pl/portal/home/badania-i-dane/zdrowe-dane/monitorowanie/diagnostyka-obrazowa-tk-i-rm), [cowzdrowiu](https://cowzdrowiu.pl/aktualnosci/post/dluzsze-kolejki-do-rezonansu-i-tomografii-choc-nfz-ich-nie-limituje). A separate Alivia/NFZ figure of 6.8 million CT+MR "services" for Q1–Q3 2024 counts billing items, not studies, and is inconsistent with the 1.9 million figure. [alivia](https://alivia.org.pl/aktualnosci/prawie-milion-wykonanych-w-2024-roku-badan-obrazowych-wciaz-nierozliczonych-przez-nfz/). An absolute 2024 MR count was not found; NFZ monthly data is on dane.gov.pl. NFZ partly reintroduced limits from 1 April 2026. [cowzdrowiu](https://cowzdrowiu.pl/aktualnosci/post/dluzsze-kolejki-do-rezonansu-i-tomografii-choc-nfz-ich-nie-limituje)
- **Teleradiology companies:**
  - Telediagnosis: claims to be the largest, with 90+ facilities and 65k studies a month. [telediagnosis.pl](https://telediagnosis.pl/en/about-us/)
  - Voxel. [medicalonline](https://medicalonline.pl/teleradiologia-w-polsce-spojrzenie-praktyka/)
  - MKJ Teleradiologia. [mkjteleradiologia.pl](https://mkjteleradiologia.pl/)
  - Teleradius: raised 1.5 million PLN. [mycompanypolska](https://mycompanypolska.pl/artykul/polski-teleradius-z-nowym-finansowaniem-ai-przyspieszy-diagnoze-typowych-przypadkow/13216)
  - Affidea. [affidea.pl](https://affidea.pl/teleradiologia/)
  - Others: JEKA ([jekarad.pl](https://jekarad.pl/)), Telediag ([telediag.pl](https://telediag.pl/)), MR Diagnostic ([mrdiagnostic.pl](https://mrdiagnostic.pl/o-nas/teleradiologia/)), Eurodiagnosis ([zwrotnikraka](https://www.zwrotnikraka.pl/zdalny-opis-badan-obrazowych-mr-tk-eurodiagnosis/)), Telediagnosis-Apex ([cennik](https://telediagnosis-apex.pl/cennik/)), Radiolance (UA → PL) ([radiolance](https://radiolance.ua/pl/oferta-wspolpracy/)).
- **Pay per report** (what facilities pay; the radiologist's own cut was not found):
  - Mazovia: **200–230 zł per CT report**, per hospital directors (article date unknown). [rynekzdrowia](https://www.rynekzdrowia.pl/Finanse-i-zarzadzanie/Stawki-za-podstawowe-badania-TK-i-MR-w-dol-a-za-opisy-w-gore-Ceny-z-kosmosu-kolejki-rosna,276622,1.html)
  - One provider's price list: CT **10 EUR per region** (+10 EUR for contrast), MR **11 EUR per region**. [telediagnosis-apex](https://telediagnosis-apex.pl/cennik/)
  - Second-opinion reports: 250 zł (single region) and 400 zł (multi-region). [MBK](https://zdrowie.mbk.clinic/badania-kliniczne/opisy-badan-radiologicznych/)
  - A 2019 forum anecdote mentions 50 zł gross per CT. [konsylium24](https://konsylium24.pl/k24/posts/137536)
- **Willingness-to-pay logic (estimate, not sourced):** at even ~20–50 zł per CT report earned by the radiologist, saving 2–3 reports' worth of time per month covers a ~250–400 zł subscription. Fee-for-report radiologists (teleradiology, B2B) have the strongest incentive.

---

## 4. Pricing benchmarks and suggested prices

**Observed benchmarks:**

| Product | Price |
|---|---|
| Medly (PL scribe) | 199 zł/month ([medly](https://www.medly.com.pl/)) |
| Medfile voice assistant | 299 PLN (period unclear) ([medfile](https://www.medfile.pl/asystent-glosowy-lekarza)) |
| MagicSpeech radiologist kit | 16,297.50 zł / 3 years, about **453 zł/month** with hardware ([shop](https://magicscribesklep.pl/pl/p/Zestaw-Startowy-dla-Diagnosty-na-okres-3-lat./110)) |
| Dragon Medical One | ~$79–99/month ([getvoibe](https://www.getvoibe.com/resources/dragon-medical-one-cost/)) |
| Heidi Pro | $90–150/month |
| PatientNotes | $50/month |
| RadRocket | from $30/month |
| Newton Dictate | 349–4,699 zł one-off |

Polish competitors (opisy.ai, Nodum, askRadek) offer free trials or free betas, which pushes entry prices down.

**Suggested price points (my recommendation; netto, + 23% VAT, see 5d):**

| Plan | Price | Reasoning |
|---|---|---|
| **Free trial** | 14 days or 100 reports | Matches Nodum's 100 free reports; essential against free askRadek |
| **Solo** | **199–249 zł/month** (annual: 1,990–2,490 zł/year) | Equal to Medly; below MagicSpeech's ~453 zł/month; under ~$60. Include a fair-use cap (e.g. 1,500 reports a month) to protect Claude API cost. |
| **Pro / heavy reader** | **349–399 zł/month** | Unlimited, custom template library, English/Polish, priority model |
| **Teleradiology / B2B** | **1–2 zł per report** or per-seat volume pricing | Below 1% of the 200 zł facility price per CT; easy to approve |

Before fixing prices, compute API cost per report from Anthropic's current price list and real token counts. This research did not verify current per-token prices.

---

## 5. Regulatory

**(a) EU MDR status**

- MDCG 2019-11 qualifies software as medical device software (MDSW) when it acts on data beyond storage, communication or "simple search", for the benefit of individual patients, with a medical intended purpose. [EC PDF](https://health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_en_0.pdf), [Johner](https://blog.johner-institute.com/iec-62304-medical-software/software-as-medical-device-definition-and-classification/)
- Pure transcription is generally argued not to be MDSW. Generating clinical conclusions is riskier. No MDCG example specifically on LLM report writers was found.
- Sweden's Medical Products Agency reportedly found that an AI scribe (Tandem) cannot be Class I and is at least **Class IIa** under Rule 11. Tandem then obtained Class IIa certification. This is reported by the vendor, not confirmed at source. [tandem](https://tandemhealth.ai/resources/news/mdr-class-i-is-not-enough-for-an-ai-medical-scribe-a-summary-of-sweden-s-medical-products-agency-s-inspection-findings), [tandem IIa](https://tandemhealth.ai/resources/news/tandem-s-ai-scribe-is-now-mdr-class-iia-certified)
- The UK MHRA says summarisation alone does not make a product a device. [brodies](https://brodies.com/insights/healthcare-and-life-sciences/mhra-clarifies-that-ai-scribes-are-not-automatically-medical-devices/)
- AI Act: transparency duties under Art. 50 apply from 2 Aug 2026. Duties for AI built into medical devices apply from 2 Aug 2028 (dates from a search-engine summary of an unnamed AI Act article; **UNVERIFIED**, check the AI Act text). The Dec 2025 Commission proposal to move MDR/IVDR to Annex I Section B is pending. [vdf.ai](https://vdf.ai/blog/eu-ai-act-healthcare-medical-devices/)
- **Implication:** an app that writes the **conclusion (wnioski)** is the most exposed feature. Options:
  1. Keep the intended purpose to "formatting and editing text dictated by the physician; no diagnostic suggestions", with the radiologist approving every report, and get a written regulatory opinion.
  2. Plan for a Class IIa route.
- This needs a regulatory consultant; no definitive answer was found.

**(b) GDPR and the Claude API**

- Anthropic's documentation offers **Zero Data Retention (ZDR)** and **HIPAA-ready** arrangements. Under ZDR, prompts and responses are not stored at rest after the response. [platform.claude.com](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)
- Third-party guides say ZDR is approved via sales, not on by default, and that standard API data is deleted within ~30 days (UNVERIFIED at source). [compound.law](https://compound.law/en-DE/tools/claude-zdr/)
- Guides say the Art. 28 DPA is incorporated into the Commercial Terms. [sonomos](https://sonomos.ai/blog/claude-dpa-explained-2026/)
- **Residency:** the first-party API `inference_geo` setting accepts only `"global"` or `"us"`, with US-only billed at 1.1x. Workspace data-at-rest geo is "us" only. **There is no EU option on the direct API.** [platform.claude.com data residency](https://platform.claude.com/docs/en/build-with-claude/data-residency)
- EU-region Claude is available via **AWS Bedrock** (Frankfurt, Ireland, Paris, Stockholm, EU cross-region) and **Google Vertex AI** (EU endpoints). [sonomos](https://sonomos.ai/blog/claude-eu-data-residency-2026/), [teamazing](https://www.teamazing.com/blog/claude-for-enterprise-eu-review-2026/)
- **Implication:** use Bedrock or Vertex in an EU region (or the direct API with ZDR + DPA + SCCs). Strip identifiers (name, PESEL) from dictations. Sign a data-processing agreement with each customer as processor. Run a DPIA, since health data is special-category data under Art. 9.

**(c) KSeF e-invoicing**

- Receiving invoices through KSeF has been mandatory for all businesses since 1 Feb 2026.
- Issuing: large taxpayers (>200 million zł) since 1 Feb 2026; everyone else since **1 Apr 2026**.
- Micro-sellers with ≤10,000 zł of invoiced sales per month: from **1 Jan 2027**.
- Penalties from 1 Jan 2027. An MF draft (16 Sep 2026) proposes moving them to 2028; this is not law.
- B2C invoices to consumers are not mandatory in KSeF. [varico](https://web.varico.pl/blog/ksef-od-kiedy-obowiazkowy-harmonogram-wdrozenia-krajowego-systemu-e-faktur-2026-2027/), [jpk.info.pl](https://jpk.info.pl/faktury/e-faktura-ustrukturyzowana-ksef/obowiazek-korzystania/), [vatax](https://www.vatax.pl/blog/ksef-fiskus-nie-bedzie-karac)
- Doctors buying as businesses (JDG or spółka) are B2B, so **every subscription invoice must go through KSeF**. Use invoicing software with KSeF integration (Fakturownia, inFakt, iFirma, wFirma, etc.; their KSeF features were not individually verified) connected to the payment webhook.

**(d) VAT**

- Software and SaaS are taxed at the standard **23%**. A specialised medical program for online consultations was held to be non-medical and taxed at 23% (NSA I FSK 1242/12, as reported). [pit.pl](https://www.pit.pl/aktualnosci/uslugi-medyczne-w-internecie-z-23-stawka-vat-czy-ze-stawka-zwolniona-917606), [ksiegowego.pl](https://www.ksiegowego.pl/artykul/specjalistyczne-oprogramowanie-medyczne-a-stawka-vat)
- The 8% rate applies to goods that are medical devices, including software, but only if the product is a certified medical device. [MF](https://finanse-arch.mf.gov.pl/documents/766655/1402295/Interpretacja+ogolna+-+stawka+VAT+-+wyroby+medyczne.pdf)
- **Important:** most radiologists' medical services are VAT-exempt (art. 43(1)(18–19a)). They usually **cannot deduct input VAT**, so the gross price is their real cost. Consider presenting gross prices.
- Confirm with a tax adviser; an individual interpretation is recommended.

---

## 6. Payments for subscriptions in Poland

| Provider | Recurring support | Fees (third-party, verify) |
|---|---|---|
| **Stripe** | Cards: yes (Stripe Billing). **BLIK recurring: public preview since 2026-04-22**, PLN only, mandates up to 2,000 PLN per transaction. [Stripe changelog](https://docs.stripe.com/changelog/dahlia/2026-04-22/stripe-billing-blik-recurring-payments). **P24 via Stripe: no recurring.** [Stripe P24 docs](https://docs.stripe.com/payments/p24/accept-a-payment) | EU cards 1.4–1.5% + €0.25; BLIK ~1.4% [freenance](https://freenance.io/przedsiebiorczosc/stripe-vs-payu-2026-co-wybrac-dla-firmy-koszty-prowizje-integracja/) |
| **Przelewy24 (Nexi) direct** | Recurring payments including recurring BLIK. [przelewy24](https://www.przelewy24.pl/en/payment-solutions/recurring-payments) | Cards 1.4% + 0.30 PLN; BLIK 0.79% on a 50 PLN/month plan [freenance](https://freenance.io/przedsiebiorczosc/bramki-platnosci-2026-ranking-stripe-payu-przelewy24-tpay-bluemedia-porownanie/) |
| **PayU** | Recurring cards ("płatności cykliczne"), **49 zł netto/month** fee. [woocommerce.pl](https://woocommerce.pl/jak-wlaczyc-platnosci-cykliczne-payu-poradnik-krok-po-kroku-dla-sprzedawcow/) | 1.1% + 0.30 zł promo for 3 months, then ~1.49% [kcmobile](https://kcmobile.pl/baza-wiedzy/porownania/payu-vs-przelewy24-porownanie/) |
| **Tpay** | Has recurring and subscription packages; rates **not found**. [helpguru](https://helpguru.eu/news/przelewy24-tpay-payu-stripe-porownanie-integracji-2026/) | Not found |

**Recommendation:**
- Stripe Billing: cards plus BLIK recurring (preview), with good SaaS tooling (trials, dunning, customer portal).
- Annual prepayment by BLIK or bank transfer as a one-off for customers who avoid cards.
- Pair with KSeF invoicing software rather than Stripe Invoicing.

---

## 7. Name check

Results come from web search only. **EUIPO eSearch and the UPRP database could not be queried from this environment**, so trademark status is UNVERIFIED for all names.

| Name | Findings |
|---|---|
| **Opisio** | No product, company or mark found in two web searches (no relevant hits). |
| **OpisAI** | Not found. Close in sound: OpinioAI (market research). Note **opisy.ai** is a direct competitor with a confusingly similar name; **avoid**. [opisy.ai](https://www.opisy.ai/) |
| **Raportio** | Not found. Similar: ReporticaAI (UK documentation). [g2](https://www.g2.com/sellers/reporticaai) |
| **RadScribe** | No exact product found, but it is crowded with "Scribe" radiology brands (ScribeMD radiology, rScriptor, PowerScribe). Weak distinctiveness and risk of confusion with **PowerScribe** (Microsoft). [scribemd](https://scribemd.ai/specialty/radiology) |
| **Radiq** | Nothing found (only RadiantQ, a .NET vendor). [componentsource](https://www.componentsource.com/brand/radiantq/about) |
| **Radiolog.ai** | Site not indexed. Similar names: RadioLogical.ai (US startup), RADLogics, Radiologs (FR). "Radiolog" is a generic Polish word and hard to protect. [polsky](https://polsky.uchicago.edu/2023/11/15/meet-the-transform-cohort-2-startups-radiological-ai/) |

**Three further suggestions** (no hits found in a quick search for "Radiopis"; the others are untested; run EUIPO/UPRP and domain checks before use):
1. **Radiopis**: "radio" + "opis"; clear Polish meaning. A web search for "Radiopis" returned no relevant hits.
2. **Wnioskio**: emphasises the conclusion (wnioski), the differentiating feature. Untested.
3. **Skanopis**: "skan" + "opis"; easy to say in Polish. Untested.

Of the original six, **Radiq** and **Opisio** look the freest. **OpisAI** should be avoided because of opisy.ai.

---

## 8. What would make us the best in Poland (gaps found)

1. **Built by a practising emergency radiologist.** No competitor found advertises this, and the radiologist's own template library is a credible differentiator. Emphasise emergency (SOR) CT protocols: trauma, stroke, PE, acute abdomen.
2. **Transparent public pricing in PLN.** None of opisy.ai, Nodum or askRadek publishes a price, and askRadek is free with no SLA. A clear 199–249 zł plan with a free trial wins self-serve buyers.
3. **Clear GDPR/medical-data posture.** Offer EU-region processing (Bedrock or Vertex EU), ZDR, a ready DPA (umowa powierzenia) and a DPIA template. Nodum claims EU hosting; MagicSpeech wins hospitals on "data stays local". Match that with an anonymisation step that strips PESEL and names before the LLM call.
4. **Reliability guarantees.** Offer an uptime SLA and support in Polish. askRadek explicitly offers none.
5. **Safety against hallucination** (buyers' key fear, per [5cnetwork](https://www.5cnetwork.com/resources/best-radiology-ai-dictation-tools)):
   - Highlight every sentence not directly dictated.
   - Show the dictation-to-report diff.
   - Never add findings that were not dictated.
   - Mandatory physician approval.
6. **Regulatory clarity.** Publish the intended purpose and MDR position. No Polish competitor found does this.
7. **Workflow fit without integration:**
   - One-click copy to any RIS (works with every Polish RIS without IT projects).
   - Keyboard shortcuts and SpeechMike button support (MagicSpeech's advantage).
   - Later, HL7/API integration for teleradiology firms.
8. **B2B channel.** Per-report pricing for teleradiology companies (Telediagnosis, Voxel, MKJ, Teleradius, etc.), whose radiologists are paid per report and feel the time savings directly.
9. **Bilingual Polish and English dictation.** Covers foreign or Ukrainian radiologists working in Poland and English-language teleradiology.
10. **KSeF-compliant invoicing and BLIK.** Small but expected by Polish B2B buyers.

---

### Key uncertainties

- Competitor prices (opisy.ai, Nodum): not public.
- Current NIL radiologist count for 2025: not found.
- 2024 MR study count: not found.
- Per-report pay to radiologists (as opposed to facility price): not found.
- Trademark registers: not queried.
- Stripe BLIK recurring: still in preview.
- MDR classification of LLM report generation: unresolved; needs expert opinion.
