# Family BP Log

Build a modern, premium, mobile-first Blood Pressure Tracking web app for a family.

IMPORTANT:

Use the uploaded reference image ONLY as inspiration for the visual design language, spacing, card style, rounded corners, typography hierarchy, navigation style, and overall premium healthcare-app feel.

DO NOT copy the content, doctors, appointment screens, text, images, or exact layout from the reference image.

The app is for recording and viewing a family member's daily blood pressure readings. It should feel like a polished healthcare mobile app, but remain extremely simple and easy for parents/elderly users to use.

APP NAME:

"BP Care"

MAIN DESIGN STYLE:

- Clean premium healthcare UI

- Mobile-first responsive design

- Soft off-white/light background

- Use a sophisticated red + dark red accent inspired by the reference image

- White cards with large rounded corners

- Subtle shadows

- Large readable typography

- Clear icons

- Plenty of spacing

- Smooth micro-animations

- Bottom navigation on mobile

- Make it look like a real professionally designed health app

- Avoid a generic dashboard/template look

- Keep the interface uncluttered

CORE FEATURES:

1. DASHBOARD / HOME

Create a welcoming home screen.

Show:

- "Good Morning" / "Good Evening" based on time

- Patient name: "Dad's BP Record"

- Latest BP reading

- Right Arm BP

- Left Arm BP

- Latest pulse if available

- Date and time of latest reading

- Number of readings recorded today

Create a prominent:

"+ Add Reading" button.

Also show a small "Today's Readings" section with the latest few readings.

Do NOT give medical diagnosis or automatically tell the user that they have a disease.

If a reading is unusually high, show only a gentle informational warning such as:

"Your reading is higher than usual. Consider rechecking after resting and seek medical advice when appropriate."

2. ADD BP READING

This is the most important screen.

Create a beautiful, very simple form.

Fields:

Date

Time

RIGHT ARM

- Systolic

- Diastolic

LEFT ARM

- Systolic

- Diastolic

Optional:

- Pulse

- Notes

Example note:

"Before breakfast"

"After medicine"

"After resting"

Use large numeric input fields so an elderly person can easily enter values.

Add a large:

"Save Reading"

button.

After saving, show a friendly confirmation.

3. HISTORY

Create a dedicated History page.

Display readings chronologically, newest first.

Each reading should appear as a clean card showing:

Date

Time

Right Arm: 160/90

Left Arm: 170/90

Pulse: 78

Notes

Allow:

- View details

- Edit reading

- Delete reading

Add date filtering so the user can easily view previous days.

Use visually clear cards rather than a complicated spreadsheet.

4. BP TRENDS / GRAPH

Create a beautiful analytics screen.

Show:

- 7-day BP trend

- 30-day BP trend

- Systolic trend

- Diastolic trend

- Right vs Left arm comparison

Use clean, simple line charts.

Add filters:

7 Days

30 Days

All Time

Keep charts easy to understand for a non-technical user.

Do not make medical claims based on the charts.

5. REPORT

Create a Reports page.

Allow the user to select a date range and generate a clean BP report.

Report should include:

- Patient name

- Date range

- Number of readings

- Date/time of every reading

- Right arm BP

- Left arm BP

- Pulse if available

- Notes

- Simple BP trend chart

Provide:

"Generate Report"

"Download PDF"

"Share Report"

The report should look professional enough to show to a doctor.

6. SETTINGS

Keep settings very simple.

Include:

- Patient name

- Optional age

- App preferences

- Export data

- Delete all records

- About

- Privacy

Do not add unnecessary settings.

DATA:

Use a proper persistent database so readings are not lost when the browser is closed.

Each BP record should contain:

- id

- patient name/id

- date

- time

- right systolic

- right diastolic

- left systolic

- left diastolic

- pulse

- notes

- created_at

The data should persist after refresh.

NAVIGATION:

Mobile bottom navigation:

Home

History

Trends

Reports

Settings

Keep "+ Add Reading" as a prominent floating or primary action.

RESPONSIVE DESIGN:

The app must work beautifully on:

- iPhone

- Android phones

- Tablets

- Desktop

Mobile should be the primary design target.

UX:

- Large buttons

- Large readable numbers

- High contrast text

- Simple language

- Minimal steps

- Clear success/error states

- Empty states when there are no readings

- Confirmation before deleting a reading

- Smooth transitions and subtle animations

SAMPLE DATA:

Initially populate the interface with realistic sample readings so the UI looks complete during development.

Use sample readings similar to:

08:15 AM — Right 200/90 — Left 210/100

09:15 AM — Right unavailable — Left 110/90

10:30 AM — Right 190/90 — Left 180/100

11:20 AM — Right 160/90 — Left 170/90

12:30 PM — Right 160/90 — Left 160/90

01:45 PM — Right 160/90 — Left 180/90

04:25 PM — Right 160/90 — Left 170/90

05:30 PM — Right 170/90 — Left 170/90

07:00 PM — Right 190/100 — Left 180/100

Use these only as demo data.

IMPORTANT HEALTH SAFETY:

This app is ONLY for recording and visualizing blood pressure readings.

Do not provide diagnosis, medication recommendations, dosage recommendations, or treatment decisions.

Include a small disclaimer in the app:

"This app is for personal record keeping and does not replace professional medical advice."

FINAL RESULT:

Make the website feel like a polished premium healthcare application inspired by the uploaded reference image, but specifically designed as a simple family blood pressure diary.

Prioritize:

1. Beautiful UI

2. Ease of use

3. Mobile experience

4. Clear BP recording

5. History

6. Charts

7. Professional reports

8. Persistent data

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7924a143-53ff-4035-946b-556a6b3fa232).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
