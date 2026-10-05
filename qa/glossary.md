# FoodMe — QA Glossary (English / Հայերեն / Русский)

Definitions are short paraphrases based on the **ISTQB® Glossary** and the
**CTFL v4.0** syllabus. For the official wording see https://glossary.istqb.org
(the glossary is available in English and Russian there).

Armenian terms: there is no single official Armenian ISTQB glossary, so the
Armenian column uses the most common translation, with the English term in
brackets where Armenian QA practice usually keeps it.

Back to [README.md](README.md).

---

## Chapter 1 — Fundamentals of Testing

| English | Հայերեն | Русский | Definition | FoodMe example |
|---|---|---|---|---|
| Testing | Թեստավորում | Тестирование | Activities that find defects and evaluate the quality of software and related work products. | Running the checkout flow and comparing the result with the expected order confirmation. |
| Test object | Թեստավորման օբյեկտ | Объект тестирования | The work product that is being tested. | The storefront checkout page, or `POST /api/orders`. |
| Test basis | Թեստային հիմք | Тестовый базис | The knowledge used as the basis for test analysis and design (requirements, user stories, designs, code). | `@Size(min = 8, max = 72)` on the password in `CustomerRegisterRequestDto`. |
| Test condition | Թեստային պայման | Тестовое условие | A testable aspect of a component or system. | "Registration rejects a password shorter than 8 characters." |
| Test case | Թեստային դեպք (test case) | Тестовый сценарий (тест-кейс) | Preconditions, inputs, actions, expected results and postconditions, built from test conditions. | TC-12 "Register a new customer account" in [test-cases.md](test-cases.md). |
| Test procedure | Թեստային ընթացակարգ | Тестовая процедура | A sequence of test cases in execution order, with any setup and cleanup. | Register a customer via API → add dish → checkout → verify order. |
| Test suite | Թեստային հավաքածու | Набор тестов | A set of test cases or test procedures run together. | `storefront-flows.spec.ts`. |
| Test data | Թեստային տվյալներ | Тестовые данные | Data needed to execute a test. | Unique email `qa-20261002-01@example.com`, password `secret123`. |
| Test oracle | Թեստային օրակուլ | Тестовый оракул | A source that tells the expected result. | The acceptance criteria, or the price shown on the chef's menu. |
| Testware | Թեստային արտեֆակտներ (testware) | Тестовое обеспечение (testware) | Work products produced during testing. | Everything in `qa/`, the Playwright specs, test reports. |
| Coverage | Ծածկույթ | Покрытие | The degree to which coverage items are exercised by a test suite, in %. | 11 of 15 test cases in [test-cases.md](test-cases.md) are automated ≈ 73%. |
| Traceability | Հետագծելիություն | Трассируемость | The link between test basis, test conditions, test cases, results and defects. | REQ-03 → TC-09 → `happy-path.spec.ts` → SCRUM-6. |
| Error (mistake) | Սխալ (մարդկային) | Ошибка | A human action that produces a wrong result. | A developer writes `throw` in `handleSubmit`. |
| Defect (bug, fault) | Դեֆեկտ (բագ) | Дефект (баг) | An imperfection in a work product. | The `throw` line in `Checkout/index.tsx`. |
| Failure | Խափանում (ձախողում) | Отказ (сбой) | The system does not do what it should when the defect is executed. | "Place order" hangs and the user gets no order. |
| Root cause | Արմատային պատճառ | Первопричина | The fundamental reason a problem happened. | The simulated-bug code was merged without review. |
| Debugging | Վրիպազերծում (debugging) | Отладка | Finding, analysing and removing the causes of failures. A development activity, not testing. | A developer steps through `handleSubmit` to find the `throw`. |
| Quality assurance (QA) | Որակի ապահովում | Обеспечение качества | Process-oriented, preventive activities that improve how work is done. | Rules in `.agents/rules/`, review checklists. |
| Quality control (QC) | Որակի վերահսկում | Контроль качества | Product-oriented, corrective activities; testing is one form of QC. | Running the Playwright suite before a release. |
| Verification | Վերիֆիկացիա (ստուգում) | Верификация | Checking that the product meets the specified requirements ("built it right?"). | Password shorter than 8 characters is rejected, as specified. |
| Validation | Վալիդացիա (վավերացում) | Валидация | Checking that the product meets user needs ("built the right thing?"). | Users can actually order a soup from Alan's Kitchen easily. |

## Chapter 2 — Testing Throughout the SDLC

| English | Հայերեն | Русский | Definition | FoodMe example |
|---|---|---|---|---|
| Test level | Թեստավորման մակարդակ | Уровень тестирования | A group of test activities organised and managed together for one stage of development. | Component, integration, system, acceptance. |
| Component testing (unit) | Կոմպոնենտային (յունիթ) թեստավորում | Компонентное (модульное) тестирование | Testing a single component in isolation. | A JUnit test for one service method. |
| Component integration testing | Կոմպոնենտների ինտեգրացիոն թեստավորում | Компонентное интеграционное тестирование | Testing interfaces and interactions between components. | `OrderControllerTest` with controller + service + H2 database. |
| System testing | Համակարգային թեստավորում | Системное тестирование | Testing the whole system against its requirements. | Playwright E2E tests on the deployed app. |
| System integration testing | Համակարգերի ինտեգրացիոն թեստավորում | Системное интеграционное тестирование | Testing interfaces with other systems and external services. | An error from `/boom` reaches GlitchTip. |
| Acceptance testing | Ընդունման թեստավորում | Приемочное тестирование | Testing that the system is ready for use by users or the business. | Product owner checks that a takeaway order works without an address. |
| Test type | Թեստավորման տեսակ | Тип тестирования | A group of test activities based on a specific quality characteristic or goal. | Functional, non-functional, black-box, white-box. |
| Functional testing | Ֆունկցիոնալ թեստավորում | Функциональное тестирование | Testing *what* the system does. | Adding a dish puts it in the cart. |
| Non-functional testing | Ոչ ֆունկցիոնալ թեստավորում | Нефункциональное тестирование | Testing *how well* the system does it (performance, usability, security…). | Measuring response times with the 200–1500 ms simulated latency. |
| Black-box testing | «Սև արկղի» թեստավորում | Тестирование методом черного ящика | Tests based on the specification, without looking at the code. | Manual test cases in [test-cases.md](test-cases.md). |
| White-box testing | «Սպիտակ արկղի» թեստավորում | Тестирование методом белого ящика | Tests based on the internal structure (code). | Writing tests until every branch of a service method is executed. |
| Confirmation testing (re-testing) | Հաստատող թեստավորում (re-test) | Подтверждающее тестирование (ретест) | Testing that a reported defect has been fixed. | Re-running TC-09 after the SCRUM-6 fix. |
| Regression testing | Ռեգրեսիոն թեստավորում | Регрессионное тестирование | Testing that a change did not break something that worked before. | Running the full E2E suite after the checkout fix. |
| Shift left | Shift left (թեստավորումը ավելի վաղ) | Сдвиг влево (shift left) | Starting testing activities earlier in the life cycle. | Reviewing acceptance criteria before the feature is coded. |
| Maintenance testing | Սպասարկման թեստավորում | Тестирование сопровождения | Testing changes to a system that is already in operation. | Testing after a new Flyway migration on Render. |

## Chapter 3 — Static Testing

| English | Հայերեն | Русский | Definition | FoodMe example |
|---|---|---|---|---|
| Static testing | Ստատիկ թեստավորում | Статическое тестирование | Testing work products without executing them. | Reviewing a test case or a pull request. |
| Dynamic testing | Դինամիկ թեստավորում | Динамическое тестирование | Testing that involves running the software. | Running Playwright tests. |
| Review | Ռևյու (վերանայում) | Рецензирование (ревью) | Static testing done by people; types: informal review, walkthrough, technical review, inspection. | A teammate reviews [test-cases.md](test-cases.md). |
| Static analysis | Ստատիկ վերլուծություն | Статический анализ | Tool-based evaluation of code without running it. | `npm run lint` (oxlint, eslint). |

## Chapter 4 — Test Analysis and Design

| English | Հայերեն | Русский | Definition | FoodMe example |
|---|---|---|---|---|
| Equivalence partitioning (EP) | Համարժեքության դասերի բաժանում | Разбиение на классы эквивалентности | Splitting data into partitions that the system should treat the same; one test per partition. | Password length: `< 8` invalid, `8–72` valid, `> 72` invalid. |
| Boundary value analysis (BVA) | Սահմանային արժեքների վերլուծություն | Анализ граничных значений | Testing values at the edges of partitions (2-value or 3-value BVA). | 2-value BVA for password: 7, 8, 72, 73. |
| Decision table testing | Որոշումների աղյուսակով թեստավորում | Тестирование с помощью таблицы решений | Testing combinations of conditions and their resulting actions. | Delivery / takeaway × logged in / guest × address filled / empty. |
| State transition testing | Վիճակների անցումների թեստավորում | Тестирование переходов состояний | Testing how the system moves between states on events. | Cart: empty → has items → "Switch kitchens?" dialog. |
| Statement coverage | Հրահանգների ծածկույթ | Покрытие операторов | % of executable statements run by the tests. | JaCoCo: backend line (statement) coverage 51.4% on 2026-10-05. |
| Branch coverage | Ճյուղերի ծածկույթ | Покрытие ветвей (решений) | % of branches (if/else outcomes) run by the tests. 100% branch coverage implies 100% statement coverage. | Both "delivery" and "takeaway" branches in checkout are executed. |
| Error guessing | Սխալների կանխագուշակում | Предугадывание ошибок | Designing tests from experience of typical mistakes. | Double-clicking "Place order"; pressing Back after checkout. |
| Exploratory testing | Հետազոտական թեստավորում | Исследовательское тестирование | Simultaneous learning, test design and execution, often time-boxed with a charter. | 30-minute session: "Explore checkout on a slow network." |
| Checklist-based testing | Չեկլիստի վրա հիմնված թեստավորում | Тестирование на основе чек-листа | Testing guided by a list of conditions to check. | UI checklist: empty states, error messages, mobile layout. |
| Acceptance criteria | Ընդունման չափանիշներ | Критерии приемки | Conditions a user story must meet to be accepted. | "Given an empty cart, when I open checkout, then I see a message and cannot place an order." |
| ATDD | Ընդունման թեստերով առաջնորդվող մշակում (ATDD) | Разработка через приемочное тестирование (ATDD) | Writing acceptance tests from acceptance criteria before development. | Writing the takeaway E2E test before the takeaway feature. |

## Chapter 5 — Managing the Test Activities

| English | Հայերեն | Русский | Definition | FoodMe example |
|---|---|---|---|---|
| Test plan | Թեստավորման պլան | План тестирования | Describes objectives, scope, approach, resources, schedule and risks of testing. | [test-plan.md](01-planning/test-plan.md). |
| Entry criteria | Մուտքի չափանիշներ | Критерии входа | Conditions to start a test activity. | Backend is running on :8081 and seed data is loaded. |
| Exit criteria | Ելքի չափանիշներ | Критерии выхода | Conditions to declare a test activity complete. | All High-priority test cases pass; no open Critical defects. |
| Risk | Ռիսկ | Риск | A factor that may cause negative consequences; risk level = likelihood × impact. | Orders fail during peak time. |
| Product risk | Արտադրանքի ռիսկ | Риск продукта | A risk related to the quality of the product. | Wrong total price in the cart. |
| Project risk | Նախագծային ռիսկ | Проектный риск | A risk related to managing the project. | Render free tier sleeps, so test runs are slow. |
| Risk-based testing | Ռիսկի վրա հիմնված թեստավորում | Тестирование на основе рисков | Choosing and prioritising tests by risk level. | Checkout gets more test cases than the About page. |
| Test pyramid | Թեստային բուրգ | Пирамида тестирования | Model: many fast low-level tests, fewer slow high-level tests. | Many JUnit tests, some API tests, few E2E tests. |
| Testing quadrants | Թեստավորման քառորդներ | Квадранты тестирования | Model that groups test types by business/technology facing and support/critique. | Q2 functional E2E, Q4 performance tests. |
| Test progress report | Թեստավորման ընթացքի հաշվետվություն | Отчет о ходе тестирования | Regular report on status during testing. | Daily: 12 passed, 2 failed, 1 blocked. |
| Test completion report | Թեստավորման ավարտի հաշվետվություն | Отчет о завершении тестирования | Summary at the end of testing: results, defects, lessons learned. | End-of-sprint report for the checkout release. |
| Defect report | Դեֆեկտի հաշվետվություն (բագ ռեպորտ) | Отчет о дефекте (баг-репорт) | Document describing a defect so it can be reproduced and resolved. | SCRUM-6 in Jira. |
| Severity | Կրիտիկականություն (severity) | Серьезность (критичность) | The impact of a defect on the system. | SCRUM-6: Critical — no order can be placed. |
| Priority | Առաջնահերթություն | Приоритет | How urgently a defect should be fixed. | A typo on the home page: Low severity, but High priority before a demo. |
| Configuration management | Կոնֆիգուրացիայի կառավարում | Управление конфигурацией | Identifying and controlling versions of work products. | Git commits; test results linked to a commit hash. |

## Chapter 6 — Test Tools

| English | Հայերեն | Русский | Definition | FoodMe example |
|---|---|---|---|---|
| Test automation | Թեստերի ավտոմատացում | Автоматизация тестирования | Using software to run tests and compare results. | Playwright E2E suites in `apps/web/e2e`. |
| Flaky test | Անկայուն թեստ (flaky) | Нестабильный (флаки) тест | A test that passes and fails without code changes. Industry term, a typical risk of automation. | `flake-cart-persistence.spec.ts`. |
| Test management tool | Թեստերի կառավարման գործիք | Инструмент управления тестированием | Tool for test cases, runs, traceability and defects. | Jira, Qase. |
