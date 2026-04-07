# Feature Spec

# Trainer Management
## Trainer Registration
## Trainer Login

---

# Member Management

## Member List
Displayed information:
- Name
- Phone number
- Membership type
- Payment status
- Remaining sessions
- Membership expiry date

## Member Registration
Input fields:
- Name
- Phone number
- Membership type
- Membership price
- Membership expiry date
- Payment method
- Payment status

## Member Detail
Displayed information:
- Name
- Phone number
- Membership list
    - Membership type
    - Membership expiry status
    - Membership expiry date (extendable)
    - Payment status
    - Payment method
    - Attended sessions
    - No-show sessions
    - Remaining sessions
- Re-registration button
- Delete button
    - Requires trainer password confirmation before deletion

---

# Session Pass Management

## Session Pass List
## Session Pass Registration
## Session Pass Update
## Session Pass Delete

---

# Schedule Management
Weekly view

## Add Session Schedule
Input fields:
- Member name
    - Validates that the selected member has a valid active membership
- Time (selectable in 1-hour increments)

## Add Unavailable Hours
Time slots marked as unavailable cannot be booked for sessions
- Time range

## Delete Schedule

## Select Schedule
- Attendance management popup
    - Mark as Attended or No-show
    - If No-show is selected:
        - Display total no-show count to date
        - Display number of sessions deducted due to no-shows
        - Prompt confirmation before deducting a session

## Session Reminder Notification
Automatically sends SMS or KakaoTalk notification to members who have a session scheduled the following day

---

# Financials
View monthly income and expenses

## Financials Main Page

**Expense List**
- Date
- Category
- Memo
- Amount

**Revenue List**
- Date
- Payment method
- Total amount collected
- Recognized revenue
- Deferred revenue

**Summary**
- Total recognized revenue
- Total deferred revenue
- Gross revenue
- Net profit (calculated based on recognized revenue)
```
    Net Profit = Total Recognized Revenue - Total Expenses
```

## Add Expense
Input fields:
- Date
- Category
- Memo
- Amount