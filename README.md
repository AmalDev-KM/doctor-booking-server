<div align="center">

# 🏥 Doctor Appointment Booking System (API)

**A high-performance, fully typed, and secure MERN-based backend architecture engineered for modern clinical environments.**

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

</div>

---

## 🚀 Overview

This backend server drives the **Doctor Appointment System**, handling tightly constrained roles, extensive credential management, automated JSON Web Tokens, sequential profile initiation constraints, and cloud-native asset storage integrations. Built under a strict **Clean Architecture** paradigm using isolated Service boundaries, robust Validators via Joi, and pure thin Controllers. 

---

## ✨ Enterprise-Grade Features

* 🛡️ **Zero-Trust Security**: Multi-tier authentication enforcing OTPs on registration with heavily rate-limited verification routes.
* 🧩 **Role-Based Access Control (RBAC)**: Distinct, isolated scopes between `ADMIN`, `DOCTOR`, and `PATIENT`. 
* 📐 **Strict Sequence Validation**: Intelligent architectural rules preventing profile corruption by forcing doctors through chronological state-machine-like form tracking gracefully tracking `completedStep` variables internally!
* 🔧 **Robust Joi Validations**: Hardened API schemas rejecting malicious inputs natively before resolving database interactions.
* 📦 **Cloud Media Integrations**: Cloudinary native image integrations mapping `multipart/form-data` flawlessly safely storing references to Mongo instances.

---

## 📚 API Reference Modules

<details>
<summary><b>🟢 1. Health & Core</b></summary>

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System ping to verify active status & uptime telemetry. |

</details>

<details>
<summary><b>🔐 2. Authentication</b></summary>
<br>

*Built heavily protected against brute-force environments via express-rate-limit natively.*

| Method | Route | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Dispatches 6-digit OTP mapping via SendGrid/Nodemailer. |
| `POST` | `/api/auth/verify-otp` | Public | Validates OTP and activates user. |
| `POST` | `/api/auth/login` | Public | Produces cryptographically signed `Bearer Tokens`. |
| `POST` | `/api/auth/forgot-password` | Public | Queues secure reset URLs independently preventing extraction payloads. |
| `POST` | `/api/auth/reset-password` | Public | Rotates authentication keys securely referencing specific tokens. |

</details>

<details>
<summary><b>🏥 3. Hospital Departments</b></summary>

| Method | Route | Access | Description |
|---|---|---|---|
| `GET` | `/api/departments` | Authenticated | Fetches all active department groupings gracefully. |
| `POST` | `/api/departments` | Admin | Form-Data uploads containing banner files appending the schema. |
| `PUT / DELETE`| `/api/departments/:id` | Admin | Manages department deletions / patches. |

</details>

<details>
<summary><b>🩺 4. Doctor Profiles (Sequenced Engine)</b></summary>
<br>

*Doctors are strictly constrained securely preventing form skipping out of bounds. The system yields an automated tracking sequence (`completedStep` 1 to 4) securely dictating frontend routes!*

| Method | Route | Access | Functional Guard |
|---|---|---|---|
| `POST` | `/init` | Doctor | Yields empty blueprint instance schema. |
| `PUT` | `/basic-info` | Doctor | Sets standard profiles natively. |
| `PUT` | `/professional-info` | Doctor | 🔒 Validates `basic-info` presence. |
| `POST` | `/qualifications` | Doctor | 🔒 Validates prior `professional-info`. |
| `POST` | `/clinics` | Doctor | 🔒 Validates at least one `qualification`. |
| `PATCH`| `/verify/:id` | Admin | 🛡️ Approves the blueprint thereby globally locking structure updates. |

</details>

---

## 🏗️ Architecture

```text
src/
├── controllers/    # Thin HTTP wrappers bridging Express to services
├── services/       # Core business logic processing and document mutating
├── models/         # Mongoose Schemas mapped perfectly via InferSchemaType
├── routes/         # Network gateways hooking native Router instances
├── validators/     # Joi structural dictionaries filtering payloads
├── middlewares/    # Authentication interceptors & file mappers 
└── constants/      # Strictly unified Response statuses globally
```

---

<div align="center">

*Engineered with precision ❤️ MERN Stack*

</div>
