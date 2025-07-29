# Organization Card - Not Advertiser Fullscreen

This document describes the structure of the organization (POI) card exported from Figma under `figma_export/org/state_not_advertiser_fullscreen` and lists which UI components from `figma_export/org/components` are used.

## Source
- Figma export page: [`figma_export/org/state_not_advertiser_fullscreen/pages/0001.html`](../figma_export/org/state_not_advertiser_fullscreen/pages/0001.html)
- Preview image: [`figma_export/org/state_not_advertiser_fullscreen/assets/images/img-408e4063.jpg`](../figma_export/org/state_not_advertiser_fullscreen/assets/images/img-408e4063.jpg)

The export represents a mobile bottomsheet in fullscreen mode (`state_not_advertiser_fullscreen`). It combines several reusable components defined in `figma_export/org/components`.

## Component blocks
Below is a list of high‑level blocks that appear in the card. Component folder paths are given for reference.

1. **Header** – shows organization name and controls.
   - Folder: [`figma_export/org/components/header_not_advertiser`](../figma_export/org/components/header_not_advertiser)
2. **Alert** – optional notice (e.g., "temporarily closed").
   - Folder: [`figma_export/org/components/alert`](../figma_export/org/components/alert)
3. **About** – short description of the company.
   - Folder: [`figma_export/org/components/about`](../figma_export/org/components/about)
4. **Address** – location information and route buttons.
   - Folder: [`figma_export/org/components/adress`](../figma_export/org/components/adress)
5. **Contacts** – phone number, website and messenger buttons.
   - Folder: [`figma_export/org/components/contacts`](../figma_export/org/components/contacts)
6. **Worktime** – opening hours block.
   - Folder: [`figma_export/org/components/worktime`](../figma_export/org/components/worktime)
7. **Menu** – list of goods or services (if available).
   - Folder: [`figma_export/org/components/menu`](../figma_export/org/components/menu)
8. **Feedback** – customer reviews summary.
   - Folder: [`figma_export/org/components/feedback`](../figma_export/org/components/feedback)
9. **Friends** – activity of user’s friends in the app.
   - Folder: [`figma_export/org/components/friends`](../figma_export/org/components/friends)
10. **Branches** – information about additional locations.
    - Folder: [`figma_export/org/components/branch`](../figma_export/org/components/branch)
11. **Discounts** – promotions and special offers.
    - Folder: [`figma_export/org/components/discounts`](../figma_export/org/components/discounts)
12. **Info** – extra details about the organization.
    - Folder: [`figma_export/org/components/info`](../figma_export/org/components/info)
13. **Tab bar** – tabs for switching between Overview, Menu, Photos, Reviews, Info and Discounts.
    - Folder: [`figma_export/org/components/tabbar`](../figma_export/org/components/tabbar)
14. **Bottom action bar** – fixed row of quick actions at the bottom (call, route, etc.).
    - Folder: [`figma_export/org/components/actionbar_full`](../figma_export/org/components/actionbar_full)

Additional minor elements such as icons and buttons come from subcomponents inside each folder. The stylesheets referenced by the page are located in `assets/styles` inside the state folder.

## Typical order of blocks
The fullscreen card shows the following sequence from top to bottom (as seen in the exported HTML and image):

1. Header with dragger and action buttons.
2. Alert message (if present).
3. About section.
4. Address block with route button(s).
5. Contacts information.
6. Worktime schedule.
7. Menu or other main content.
8. Feedback (reviews).
9. Friends activity block.
10. Branches / Discounts / Additional info (if available).
11. Tab bar for switching between sections.
12. Bottom action bar (persistent at the very bottom).

This order corresponds to the component arrangement in the exported Figma page `0001.html`.
