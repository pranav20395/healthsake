# HealthSake

This is the code base of HealthSake, an interactive Patient Data Management System
developed primarily to facilitate the verification of the patients’ documents while buying medicines or making medical
claims.

## Table of contents

- [HealthSake](#healthsake)
    - [Table of contents](#table-of-contents)
    - [Overview](#overview)
        - [What is the project?](#what-is-the-project)
        - [What is the MVP (Minimal Viable Product)?](#what-is-the-mvp)
    - [Built with](#built-with)
    - [Relavent Links](#relavent-links)
    - [Understanding File Structure](#understanding-file-structure)
    - [License](#license)

## Overview

### What is the project?

A patient data management system is a software system developed primarily to facilitate the verification of the
patients’ documents while buying medicines or making medical claims. The focus of this project is to develop a portal
that facilitates the secure exchange and verification of electronic health records.

### What is the MVP?

Document Verification System: The patients will provide the documents to the healthcare professionals or organizations,
which need to verify automatically.

We have the following types of verification in the system.

- The patients issue verifiable documents and share them with healthcare professionals and organizations.
- The healthcare professionals issue verifiable documents and share them with the patients.
- Healthcare organizations issue verifiable documents and share them with the patients.

Digital signatures and hasing is used to share & verify the documents.

Some other features

- Mechanism to search professionals & organizations using type, name, & location.
- Creation and maintenance of various organizations’ lists.
- Ability to set/edit settings.
- Ability to delete their own medical records.
- An e-cash wallet (or a payment gateway) for performing financial transactions.
- Maintenance of profile information of the user/organization.
- Ability to buy medicines and get medical claims.
- Ability to provide documents to other users (patients/organizations).
- Ability to automatically verify the documents.
- Admin capabilities is being able to observe logs and remove any user.
- User-Admin approval process using a document upload.

## Built with

> Note: It only works on Node 16.x

- [Next.js](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://prisma.io/)
- [Next-Connect](https://www.npmjs.com/package/next-connect) for uploading and storing files.
- [Nodemailer](https://nodemailer.com/) for sending mails
- [PDFmake](https://pdfmake.org/) for generating prescriptions & bills.

## Achievement:
- Sustained Cyberattack for two weeks from 250+ students
- Highest Scoring course project in the course

## Relavent Links

- Website: [Link to Deployment](https://healthsake.jaideepguntupalli.com)

## Understanding File Structure:

    .
    ├── prisma # <-- prisma is added
    │ ├── migrations # <-- consists all changes made to the database
    │ │ └── [...]
    │ └── schema.prisma # <-- database schema
    ├── src
    │ ├── pages
    │ │ ├── _app.tsx # <-- Next.js App
    │ │ ├── api
    │ │ │ └── trpc
    │ │ │ └── [trpc].ts # <-- tRPC HTTP handler
    │ │ └── [..]
    │ ├── server
    │ │ ├── routers
    │ │ │ ├── _app.ts # <-- main app router
    │ │ │ ├── post.ts # <-- sub routers
    │ │ │ └── [..]
    │ │ ├── context.ts # <-- create app context
    │ │ └── trpc.ts # <-- procedure helpers
    │ └── utils
    │ └── trpc.ts # <-- typesafe tRPC hooks
    └── [..]


## License

[MIT](LICENSE)
