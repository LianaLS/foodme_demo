> Գրել է Claude-ը (Gemini-ն հասանելի չէր. օրական սահմանաչափը սպառված էր), ստուգված է թեստավորման արդյունքների հետ — 2026-10-15։

# Պատվերի չեղարկում՝ մինչև խոհանոցի ընդունելը (SCRUM-9)

## 1. Օգտատերերի համար

**Ի՞նչ է նոր։** Հիմա դուք կարող եք ինքներդ չեղարկել ձեր պատվերը, քանի դեռ խոհանոցը այն չի ընդունել (կարգավիճակը՝ "Received")։ Ավելացել է նոր կարգավիճակ՝ "Cancelled"։ Գումարի վերադարձ պետք չէ, որովհետև վճարումը կանխիկ է՝ առաքման պահին։ Չեղարկման պատճառը չի հարցվում։

**Ինչպես չեղարկել պատվերը**
1. Մուտք գործեք https://foodme-lianals.onrender.com կայք։
2. Բացեք "My Orders" էջը կամ պատվերի հետևման էջը։
3. "Received" կարգավիճակով պատվերի մոտ սեղմեք "Cancel order"։
4. Կհայտնվի հարց՝ "Cancel order FM-xxxxxx? This can't be undone." (FM-xxxxxx-ը պատվերի համարն է)։ Պատուհանն ունի նաև փակելու (×) կոճակ։
   - "Keep order" — պատուհանը փակվում է, պատվերը չի փոխվում։
   - "Cancel order" — պատվերը չեղարկվում է։ "My Orders"-ում այն կերևա "Cancelled" կարգավիճակով՝ մոխրագույն, ի տարբերություն կարմիր "Declined"-ի։
5. Հետևման էջում չեղարկված պատվերի համար առաջընթացի գծի ոչ մի քայլ ընթացիկ չի նշվում։

**Ե՞րբ չեղարկել հնարավոր չէ**
- Երբ խոհանոցն արդեն ընդունել է պատվերը (Accepted, Delivered կամ Declined)՝ "Cancel order" կոճակը չի երևում, իսկ չեղարկումը մերժվում է "Only new orders can be cancelled." հաղորդագրությամբ։
- Եթե խոհանոցը պատվերն ընդունել է հենց ձեր հաստատելուց առաջ, կտեսնեք "Only new orders can be cancelled.", և էջը կթարմացնի պատվերի իրական կարգավիճակը։
- Արդեն "Cancelled" պատվերը կրկին չեղարկել չի կարելի։ "Cancelled"-ը վերջնական է. ոչ ոք, այդ թվում ադմին թիմը, չի կարող այն փոխել։
- Առանց մուտք գործելու չեղարկել չի կարելի։ Ուրիշի պատվերը չեղարկել չի կարելի։

Ամբողջ ընթացքը ստուգված է Desktop 1920×1080, Laptop 1366×768, Pixel 7, Galaxy S24 սարքերում, ինչպես նաև iPhone 15-ի և iPad-ի էկրանի չափերով Chromium-ում։ iPhone 15-ը և iPad-ը Safari-ում (WebKit) դեռ ստուգված չեն։

**Ադմին թիմի համար (https://foodme-lianals.onrender.com/backoffice)**
- Չեղարկված պատվերներն ունեն իրենց առանձին կարգավիճակն ու գույնը՝ ցուցակում և մանրամասներում։ Ցուցակը կարելի է ֆիլտրել՝ ցույց տալու միայն չեղարկվածները։
- Չեղարկված պատվերի մանրամասներում կա "Cancelled by customer" նշումը։ Այդ պատվերը չունի Accept, Deliver կամ Reject կոճակներ։
- Մյուս պատվերների կարգավիճակը ադմինը փոխում է ինչպես նախկինում, բայց պատվերը Cancelled դարձնել չի կարող. դա կարող է միայն պատվիրած հաճախորդը։
- Dashboard-ի "Recent revenue" թիվը չի ներառում Cancelled և Declined պատվերները (ներառում է Received, Accepted և Delivered)։ Թիվը հաշվվում է միայն վերջին 100 պատվերից։

**Հայտնի խնդիրներ այսօր (Jira SCRUM-10, Minor, Low)**
- Չեղարկելուց հետո հետևման էջում վերնագիրը "Order cancelled" է և "You cancelled this order." տողը, ոչ թե "Cancelled" կարգավիճակի վերնագիրը։
- Հետևման էջում "Cancel order" կոճակը երևում է նաև մուտք գործած այն հաճախորդին, ով պատվերի տերը չէ. սերվերը միևնույն է մերժում է (404), ոչինչ չի փոխվում։ «Կոճակը տեսնում է միայն տերը» կանոնը դեռ պետք է հաստատի product owner-ը։
- Ադմին վահանակում կարգավիճակը գրված է "CANCELLED" (ցուցակում, մանրամասներում և ֆիլտրում), ոչ թե "Cancelled"։
- Ադմինի պատվերների ցուցակում "Cancelled by customer" նշումը չի երևում. այն կա միայն մանրամասներում։

## 2. IT թիմի համար

- **Թեստի օբյեկտ.** https://foodme-lianals.onrender.com (storefront և API), ադմին՝ /backoffice, API՝ /api/** և /admin/**; build `main` at `fb452d5` (PR #7), Render։
- **Կարգավիճակներ API-ում.** NEW (ցուցադրվում է Received), ACCEPTED, DELIVERED, REJECTED (ցուցադրվում է Declined), CANCELLED։
- **Չեղարկման հարցման պատասխաններ** (API-ի 14 test case-ից 14-ն անցել են).
  - տերը չեղարկում է NEW պատվեր → HTTP 200, կարգավիճակը՝ CANCELLED;
  - ACCEPTED, DELIVERED, REJECTED կամ արդեն CANCELLED → HTTP 400, "Only new orders can be cancelled.";
  - ուրիշի պատվեր → HTTP 404, նույնը, ինչ անհայտ համարի դեպքում (օր.՝ FM-999999);
  - առանց մուտքի → HTTP 401։
- **Ադմինի endpoint.** /admin/order/{id}/status։ CANCELLED պատվերի ցանկացած փոփոխություն → HTTP 400 "Cannot transition order from CANCELLED to …"։ Ադմինը չի կարող դնել CANCELLED (HTTP 400, պատվերը մնում է NEW)։
- **Մոնիտորինգ.** Չեղարկված պատվերները հաշվվում են տեղադրված պատվերների կողքին։ Այս ցիկլում չի ստուգվել (ֆունկցիոնալ թեստավորման շրջանակից դուրս է)։
- **Render (անվճար).** Պարապուրդից հետո առաջին հարցումը մի քանի րոպե կարող է պատասխանել 503 "Application loading"; հարցումներն ունեն 200–1500 ms արհեստական ուշացում։
- **Ավտոմատ թեստեր (Playwright, apps/web).**
  - e2e/scrum-9-cancel-order.spec.ts — TC-SCRUM-9-34 (գրանցում, պատվեր, չեղարկում "My Orders"-ից, Desktop 1920x1080) և TC-SCRUM-9-22 (տերը չեղարկում է հետևման էջից; նշված է որպես հայտնի defect SCRUM-10);
  - e2e/api/scrum-9-cancel-order.api.spec.ts — TC-SCRUM-9-02 (Accepted պատվերի չեղարկումը մերժվում է) և TC-SCRUM-9-06 (մեկ հաճախորդը չի կարող չեղարկել ուրիշի պատվերը)։
  - Գործարկել apps/web-ից. `npx playwright test e2e/scrum-9-cancel-order.spec.ts e2e/api/scrum-9-cancel-order.api.spec.ts`
  - Դիտման ռեժիմ՝ ավելացնել `--ui`; հաշվետվություն՝ `npx playwright show-report`։ Թեստերն աշխատում են playwright.config.ts-ի baseURL-ում նշված Render հասցեի վրա։
- **Արդյունքներ (ձեռքով թեստավորում, 2026-10-15).** 37 test case՝ 26 passed, 7 failed, 4 blocked։ "Recent revenue"-ի before/after test case-երը blocked են (test design-ի խնդիր), այնպես որ revenue-ի կանոնը դեռ պաշտոնապես հաստատված չէ, թեև ամեն դիտարկման ժամանակ թիվը համընկել է առանց Cancelled և Declined պատվերների գումարին։

---

**Approval:** approved by Liana Sarajyan, 2026-10-15 · posted to Jira SCRUM-9 as comment **10150** (https://liana-qa.atlassian.net/browse/SCRUM-9?focusedCommentId=10150)
