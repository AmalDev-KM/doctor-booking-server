================================================================================
                    DOCTOR APPOINTMENT BOOKING SYSTEM (API)
                              API DOCUMENTATION
================================================================================

This document outlines the architecture, logic flow, and detailed functionality
of all the API routes available in the Doctor Appointment Booking System Backend.

The project is built using:
- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose
- Clean Architecture (Controllers -> Services -> Models)
- Joi for robust object validation

================================================================================
                             1. HEALTH ENDPOINT
================================================================================

GET  /api/health
Description: A simple ping to verify that the Backend API server is active and 
             running without failures. Evaluates system uptime.
Access: Public


================================================================================
                               2. AUTHENTICATION
    (All endpoints are heavily protected against brute force via rate-limiting)
================================================================================

POST /api/auth/register
   Description: Registers a new user into the database securely. Automatically 
                sends a 6-digit OTP to their respective email address.
   Payload: { name, email, password, role }
   Access: Public

POST /api/auth/verify-otp
   Description: Checks the 6-digit OTP mapping against the email provided. 
                If valid, marks the User status as Verified.
   Payload: { email, otp }
   Access: Public

POST /api/auth/login
   Description: Validates credentials and returns a secure JWT containing the 
                user ID, role, and email. Denies unverified accounts.
   Payload: { email, password }
   Access: Public

POST /api/auth/forgot-password
   Description: Sends a secure password reset token URL securely to the user's
                verified email address.
   Payload: { email }
   Access: Public

POST /api/auth/reset-password
   Description: Verifies the email token and updates the user's password securely.
   Payload: { token, newPassword, confirmPassword }
   Access: Public


================================================================================
                                3. DEPARTMENTS
================================================================================
Handles hospital departments that group multiple doctors. Most interactions 
here strictly require the 'ADMIN' role.

GET    /api/departments
   Description: Fetches all active departments.
   Access: Any Logged-In User

POST   /api/departments
   Description: Creates a new department mapping. Accepts image uploads securely
                via Cloudinary (multipart/form-data).
   Payload: FormData { departmentName, departmentDescription, departmentImage }
   Access: Admin Only

GET    /api/departments/:id
   Description: Fetches a specific department by its DB ObjectId.
   Access: Admin Only

PUT    /api/departments/:id
   Description: Edits an existing department, including an optional new image.
   Access: Admin Only

DELETE /api/departments/:id
   Description: Deletes a department completely.
   Access: Admin Only


================================================================================
                               4. DOCTOR PROFILE
================================================================================
Allows doctors to set up their identity, qualifications, and clinics in a tightly
controlled, strictly sequenced chronological order. 
(Sequence: Init -> Basic Info -> Professional Info -> Qualifications -> Clinics)

POST   /api/doctor-profile/init
   Description: Initialized an empty profile binding referencing the requesting
                doctor. Prevents overlapping.
   Access: Doctor Only

PUT    /api/doctor-profile/basic-info
   Description: Submits core details (name, email, phone). 
   Access: Doctor Only

PUT    /api/doctor-profile/professional-info
   Description: Submits clinical info (fees, experiences). Throws 403 Forbidden 
                if basic-info wasn't completed yet.
   Access: Doctor Only

POST   /api/doctor-profile/qualifications
   Description: Appends a newly created Qualification Object. Throws 403 
                Forbidden if Professional Info isn't completed first.
   Access: Doctor Only

PUT    /api/doctor-profile/qualifications/:index
DELETE /api/doctor-profile/qualifications/:index
   Description: Edits or deletes an existing Qualification. 
                NOTE: Locked if the profile is 'approved'.
   Access: Doctor Only

POST   /api/doctor-profile/clinics
   Description: Appends a new Clinic Object. Throws 403 Forbidden if the 
                user hasn't created at least one qualification previously.
   Access: Doctor Only

PUT    /api/doctor-profile/clinics/:index
   Description: Edits an existing Clinic. Locked if profile is 'approved'.
   Access: Doctor Only

DELETE /api/doctor-profile/clinics/:index
   Description: Drops a Clinic from the schema. Allowed even if 'approved'.
   Access: Doctor Only

GET    /api/doctor-profile/me
   Description: Fetches the requesting doctor's custom profile properties.
                Dynamically injects `completedStep` (1, 2, 3, or 4) so the 
                frontend knows exactly which form state to render next!
   Access: Doctor Only

DELETE /api/doctor-profile/
   Description: Soft-Deletes the profile by triggering the boolean `isDeleted` 
                property, shielding internal DB integrity.
   Access: Doctor Only

PATCH  /api/doctor-profile/verify/:id
   Description: System Administrator reviews the comprehensive sequence and marks 
                it as 'approved' or 'rejected'. Locks out arbitrary structural edits.
   Access: Admin Only
