# Honey Spa Bangi: listing & menu audit

Audit date: 29 Oct 2026. Purpose: populate the dashboard's treatment menu and company profile with what
Honey Spa Bangi actually publishes, and flag what still needs confirming with the outlet.

## Sources checked

| Source | What it gave us | Status |
| --- | --- | --- |
| Massage price list card (shared by the client, @honeyspabangi) | All massage prices below | Confirmed |
| Logo file (shared by the client) | Wordmark, flower + bee mark, strapline "Relax \| Rejuvenate \| Rejoice", colours | Confirmed |
| Instagram [@honeyspabangi](https://www.instagram.com/honeyspabangi/) | Not reachable from the build environment (network policy) | **Re-check by hand** |
| Facebook pages "honeyspabangi" and "HONEY SPA BANGI" (≈1.3k likes) | "Mix & match 3 treatments for only RM150" promo, extended to September | Seen via search; date unclear |
| TikTok visitor post (@anne_osman111) | Women-only muslimah spa, "head to toe" treatments, address 7-53-3, hours 10.30am–7.30pm, hashtags #mandibunga #totokwajah #urut | Third-party, promotional |
| TikTok "Honey Spa Bangi" discover page | Open daily, including Ramadan | Third-party |
| magicpin listing | 4.5 rating (96 ratings); address given as 7-53-**1** | Third-party; unit number conflicts |

## Menu now in the system (`src/data/packages.ts`)

| Treatment | Length | Price | Basis |
| --- | --- | --- | --- |
| Traditional / Relaxing Massage | 60 / 90 / 120 min | RM 80 / 120 / 160 | Price list |
| Prenatal Massage | 60 / 90 / 120 min | RM 90 / 120 / 160 | Price list |
| Back Massage | 30 min | RM 50 | Price list |
| Foot Massage | 30 min | RM 50 | Price list |
| Mandi Bunga (flower bath) | ~30 min | RM 60 **(placeholder)** | Advertised (#mandibunga), no published price |
| Totok Wajah (face acupressure) | ~30 min | RM 50 **(placeholder)** | Advertised (#totokwajah), no published price |
| Mix & Match: 3 treatments | ~90 min | RM 150 | Facebook promo, may have ended |

Placeholder prices are flagged `estimated` and show "Price to confirm" in the dashboard.

## Company profile now in the system

- **Name:** Honey Spa Bangi, tagline "Relax | Rejuvenate | Rejoice"
- **Address:** 7-53-3, Jalan Medan Pusat Bandar 8A, Seksyen 9, Bangi Sentral, 43650 Bandar Baru Bangi, Selangor
- **Hours:** daily, 10.30am – 7.30pm
- **Phone / WhatsApp bookings:** 012-244 5415
- **Social:** Instagram @honeyspabangi, Facebook "honeyspabangi"
- **Positioning:** women-only, muslimah-friendly spa

## Open questions for the client

1. Prices for mandi bunga and totok wajah, and whether there are other treatments (scrub/lulur, facial, bekam, urut bersalin) to list.
2. Is the Mix & Match RM150 promotion still running, and which treatments qualify?
3. Unit number: 7-53-3 (TikTok) or 7-53-1 (magicpin)?
4. Do therapists do home service, and in which areas? The dashboard assumes in-spa plus home service around Bangi.
5. A real contact email (the dashboard uses a placeholder, hello@honeyspabangi.my).
6. Deposit policy (set to 0% for every treatment for now).
7. Therapist roster, clients and booking history are still demo data and need replacing with real records.
