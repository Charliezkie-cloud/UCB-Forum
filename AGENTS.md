# AGENTS.md — Repository Instructions & Guidelines

## 1. Project Goal & Overview
- **Project Name:** UCB (University of Cebu - Banilad Campus) Forum
- **Ownership:** Developed solely by Charles Henry M. Tinoy Jr. Use "I" when referring to project updates, docs, or responses.
- **Core Goal:** To create a dedicated, modern discussion forum for University of Cebu (Banilad) that empowers Guests, Students, and Teachers to share knowledge, ask questions, and build academic and extracurricular communities.
- **Target Audience:** University students, faculty members, academic staff, and prospective/guest visitors.
- **Key Features:**
  - **Multi-Role Access & Permissions:** Tailored user experience, posting privileges, and moderation capabilities across Guests, Students, Teachers, Moderators, and Admins.
  - **Category & Tagging System:** Structured forums for academic departments, course subjects, campus announcements, and student life.
  - **Q&A & Community Discussions:** Support for rich text posts, threaded replies, upvoting/likes, and topic bookmarking.
  - **Secure RESTful API:** ASP.NET Core backend managing user authentication, role-based authorization, posts, and real-time community engagement.
  - **Responsive Web Interface:** React frontend powered by `shadcn/ui`, optimized for seamless interaction across desktop and mobile devices.

---

## 2. Technical Stack & Architecture
This repository is a full-stack Web Application generated from the ASP.NET Core + React template.
- **Backend:** ASP.NET Core Web API (C# / .NET) with Entity Framework Core
- **Database Engine:** Microsoft SQL Server (MS SQL Server)
- **Frontend:** React with TypeScript (located in `ClientApp/` or `src/`)
- **UI Library & Styling:** `shadcn/ui` + Tailwind CSS
- **Routing:** `react-router-dom`
- **Architecture:** Decoupled client-server architecture where the React SPA consumes RESTful JSON APIs exposed by the ASP.NET Core backend.

---

## 3. Database Design (MS SQL Server)

The application uses **MS SQL Server** managed via Entity Framework Core Code-First. AI agents must strictly follow this relational schema when writing EF Core Entities, DTOs, and migrations:

```dbml
Table Users {
  UserId INT [pk, increment, unique]
  CreatedAt DATETIME2 [not null]
  Email VARCHAR(254) [unique, not null]
  Password VARBINARY(64) [not null]

  /*
  User Roles:
    1 - Guests
    2 - UCB Student
    3 - Teacher / Faculty
    4 - Moderator
    5 - Admin
  */
  UserRoleCode INT [not null, default: 1]
}

Table Profiles {
  ProfileId INT [pk, increment, unique]
  CreatedAt DATETIME2 [not null]
  UpdatedAt DATETIME2 [not null]
  UserId INT [unique, not null]

  Username NVARCHAR(255) [not null]
  Bio NVARCHAR(500) [default: null]
  AvatarUrl VARCHAR(2048) [default: null]
  Facebook NVARCHAR(100) [default: null]
  Instagram NVARCHAR(100) [default: null]
  Twitter NVARCHAR(100) [default: null]
  Tiktok NVARCHAR(100) [default: null]

  // Student-specific verification
  IsVerifiedStudent BIT [default: 0]
  Program NVARCHAR(100) [default: null]
  YearLevel TINYINT [default: null]

  // Teacher-specific verification
  IsVerifiedTeacher BIT [default: 0]
  Department NVARCHAR(100) [default: null]

  Reputation INT [default: 0]
}

Table Categories {
  CategoryId INT [pk, increment, unique]
  ParentCategoryId INT [default: null]
  CreatedAt DATETIME2 [not null]

  Name NVARCHAR(100) [not null]
  Slug VARCHAR(120) [unique, not null]
  Description NVARCHAR(255) [default: null]
  IconClass VARCHAR(50) [default: null]
  DisplayOrder INT [default: 0]
  IsRestricted BIT [default: 0]
  IsPostingAllowed BIT [default: 1]
  IsActive BIT [default: 1]
}

Table Posts {
  PostID INT [pk, increment, unique]
  CategoryId INT [not null]
  ParentPostId INT [default: null] // NULL = Top-Level Post, NOT NULL = Threaded Comment/Reply
  AuthorId INT [not null]

  CreatedAt DATETIME2 [not null]
  UpdatedAt DATETIME2 [not null]

  Title NVARCHAR(255) [default: null]
  Content NVARCHAR(MAX) [not null]
  IsPinned BIT [default: 0]
  IsDeleted BIT [default: 0]
  
  // Counter Cache Column (Denormalized for fast feed sorting)
  LikesCount INT [default: 0]
}

Table PostLikes {
  PostId INT [not null]
  UserId INT [not null]
  CreatedAt DATETIME2 [not null]
}

Table Reputations {
  SourceUserId INT [not null]
  TargetUserId INT [not null]
  IsPositive BIT [not null]
  CreatedAt DATETIME2 [not null]
  UpdatedAt DATETIME2 [not null]
}

Table Notifications {
  NotificationId INT [pk, increment, unique]
  UserId INT [not null]
  RelatedPostId INT [default: null] // Optional deep-link to a post
  CreatedAt DATETIME2 [not null]

  /*
  Notification Types:
    1 - Reply
    2 - Like
    3 - Reputation
  */
  Type TINYINT [not null]

  Message NVARCHAR(500) [not null]
  IsRead BIT [default: 0]
}

// Foreign Key Relationships
Ref: Profiles.UserId - Users.UserId [delete: cascade, update: cascade]
Ref: Posts.AuthorId > Users.UserId [delete: no action]
Ref: Posts.CategoryId > Categories.CategoryId [delete: cascade]
Ref: Posts.ParentPostId > Posts.PostID [delete: no action]
Ref: Categories.ParentCategoryId > Categories.CategoryId [delete: no action]
Ref: PostLikes.(PostId, UserId) > (Posts.PostID, Users.UserId) [delete: cascade]
Ref: Reputations.SourceUserId > Users.UserId [delete: cascade]
Ref: Reputations.TargetUserId > Users.UserId [delete: no action]
Ref: Notifications.UserId > Users.UserId [delete: cascade]
Ref: Notifications.RelatedPostId > Posts.PostID [delete: set null]
```

## 4. USERS PERMISSIONS: User Role Code Permissions

- **STRICT PERMISSION:** Do NOT allow users to modify and delete each others table (Except for Moderators and Admin).

### Guest Permissions
| Operation | Create | Read | Update | Delete
| --- | --- | --- | --- | --- |
| Post | Yes | Yes | Yes | Yes |
| Post (with restricted category) | No | No | No | No |
| Post (with posting not allowed category) | No | No | No | No |
| Reply | Yes | Yes | Yes | Yes |
| Reply (with restricted category) | No | No | No | No |
| Reply (with posting not allowed category) | No | No | No | No |
| PostLikes | Yes | Yes | Yes | Yes |
| PostLikes (with restricted category) | No | No | No | No |
| PostLikes (with posting not allowed category) | Yes | Yes | Yes | Yes |
| Categories | No | Yes | No | No |

### UCB-Students and Faculty
| Operation | Create | Read | Update | Delete
| --- | --- | --- | --- | --- |
| Post | Yes | Yes | Yes | Yes |
| Post (with restricted category) | Yes | Yes | Yes | Yes |
| Post (with posting not allowed category) | No | No | No | No |
| Reply | Yes | Yes | Yes | Yes |
| Reply (with restricted category) | Yes | Yes | Yes | Yes |
| Reply (with posting not allowed category) | No | No | No | No |
| PostLikes | Yes | Yes | Yes | Yes |
| PostLikes (with restricted category) | Yes | Yes | Yes | Yes |
| PostLikes (with posting not allowed category) | Yes | Yes | Yes | Yes |
| Categories | No | Yes | No | No |

### Moderators and Admin
| Operation | Create | Read | Update | Delete
| --- | --- | --- | --- | --- |
| Post | Yes | Yes | Yes | Yes |
| Post (with restricted category) | Yes | Yes | Yes | Yes |
| Post (with posting not allowed category) | Yes | Yes | Yes | Yes |
| Reply | Yes | Yes | Yes | Yes |
| Reply (with restricted category) | Yes | Yes | Yes | Yes |
| Reply (with posting not allowed category) | Yes | Yes | Yes | Yes |
| PostLikes | Yes | Yes | Yes | Yes |
| PostLikes (with restricted category) | Yes | Yes | Yes | Yes |
| PostLikes (with posting not allowed category) | Yes | Yes | Yes | Yes |
| Categories | Yes | Yes | Yes | Yes |

## 5. STRICT RULES: Human-Authored Code Protection

### 🚨 Zero-Touch & Preservation Mandates
1. **Respect Human Code Boundaries:** Do NOT overwrite, rewrite, or refactor existing human-written modules, controllers, or components unless explicitly asked to do so in the prompt.
2. **No Unrequested Cleanup:** Do NOT modify un-targeted code to fit personal preferences. This includes:
   - Reordering existing import statements.
   - Renaming variables, functions, or parameters in human-written code.
   - Reformatting white spaces, curly braces, or indentation in untouched files.
   - Removing existing comments or todo statements written by human developers.
3. **Surgical Precision:** When adding new logic or fixing bugs, wrap modifications locally. Do not touch adjacent functions or helper files unless required for system compilation.
4. **Preserve Human Style Patterns:** When extending existing files, match the formatting, naming, and architectural patterns established by the human author rather than enforcing external preferences.
5. **Human Annotations Take Precedence:** Respect special comments like `// HUMAN-CODED`, `// DO NOT MODIFY`, or `/* KEEP ORIGINAL */`. Treat any annotated code block as strictly immutable.
6. **Avoid Unnecessary Comments:** Do not write self-explanatory or obvious comments. Only comment on complex business logic, edge cases, or non-obvious algorithms.
7. **Clean & Maintainable Code (DRY Principle):** Avoid repetitive code, hacky workarounds, and monolithic functions. Extract reusable logic into dedicated helper classes, services, or utility modules following standard architecture.

---

## 6. General Agent Workflows & Behaviors
- **Align with Project Goals:** Ensure every proposed feature or refactor supports the campus forum's usability, security, and community engagement goals.
- **Full-Stack Awareness:** Always consider end-to-end data flow (Database -> C# DTO -> API Controller -> TypeScript Type -> React Component/Hook).
- **Type Safety First:** Ensure model changes in C# backend APIs are mirrored accurately in TypeScript interfaces on the frontend.
- **Environment Isolation:** Do not hardcode ports or connection strings. Use `appsettings.json` / `appsettings.Development.json` on the server and environment variables on the client.

---

## 7. Backend Guidelines (ASP.NET Core / C#)

### Architectural & Controller Mandates
- **MVC API Controllers Mandatory:** All REST API endpoints MUST be implemented using Controller classes deriving from `ControllerBase` in the `Controllers/` directory.
- **No Minimal APIs:** Strictly avoid using ASP.NET Core Minimal APIs (`app.MapGet`, `app.MapPost`, `MapGroup`, etc.) in `Program.cs`. `Program.cs` should only register services (`builder.Services.AddControllers()`) and map controllers (`app.MapControllers()`).
- **Attributes:** Every controller must be decorated with `[ApiController]` and `[Route("api/[controller]")]`.

### Database & ORM
- **Database Engine:** Microsoft SQL Server. Use Microsoft.EntityFrameworkCore.SqlServer.
- **EF Core Conventions:** Use DbContext and Fluent API for defining constraints, foreign key cascades, unique indexes, and composite keys (e.g., PostLikes).
- **Counter Cache Management:** When a user likes or unlikes a post, update both PostLikes and Posts.LikesCount within a database transaction.
- **Migrations:** When changing C# database models, explicitly run or prompt for EF Core migration commands.

### Project Structure & Conventions
- **Language/Framework:** C# / .NET
- **Controllers:** Place REST API controllers in `Controllers/`.
  - Use `[ApiController]` and `[Route("api/[controller]")]` attributes.
  - Return strongly-typed `ActionResult<T>` responses.
- **Async Everywhere:** All database and I/O operations must be `async` using `Task<T>` and `await`. Pass `CancellationToken` where appropriate.

### Code Style & Patterns
- Follow standard C# Naming Conventions:
  - `PascalCase` for classes, methods, public properties, and controller endpoints.
  - `camelCase` or `_camelCase` for private fields/parameters.
- **DTOs:** Do not expose Entity Framework/Data models directly to the API responses. Use Data Transfer Objects (DTOs) or records for requests and responses.
- **Dependency Injection:** Inject services, DB contexts, and loggers via constructor injection.

---

## 8. Frontend Guidelines (React / TypeScript)

### Project Setup & UI Conventions
1. **Routing:** Check for `react-router-dom`. If it does not exist in the frontend project, install and set it up before creating multi-page layouts or navigation routes.
2. **UI Component Library:** Use `shadcn/ui` for building and styling UI components. Check if `shadcn/ui` is installed and initialized; if not, install and configure it before constructing interface elements.
3. **Global Styles Lock:** **Strictly avoid editing `index.css` without explicit human permission.** All custom styling should be managed through `shadcn/ui` primitives, Tailwind CSS utility classes, or component-level styles.
4. **Directory:** Located in `./src`.
5. **Language:** TypeScript (`.ts`, `.tsx`). Avoid `any` at all costs.
6. **Components:** Functional components with TypeScript interface props.
7. **Website Contents & Form Placeholders:**
   - **Tone:** Conversational, warm, and direct. Write like you're explaining something to a friend.
   - **Style:** Use short sentences, active voice, and clear everyday examples.
   - **Punctuation & Formatting:** Avoid em-dashes (`—`) to prevent robotic tone patterns; use commas, periods, or parentheses instead.
   - **Banned Words:** Avoid robotic AI fluff and corporate jargon (e.g., *seamless, leverage, delve, synergy, cutting-edge*).
   - **Form Placeholders:** Use generic, realistic names (e.g., `John Doe`, `Jane Smith`, `Alex Rivera`) or descriptive hints (e.g., `Enter your full name`). **Never use the developer's or owner's real name** as input placeholders or mock data.

### State & API Fetching
- Define explicit TypeScript interfaces matching backend DTO responses in `@/types` or `src/types`.
- Use custom React hooks or libraries like `@tanstack/react-query` / `Axios` for async data fetching.
- Keep API call definitions centralized in an `api/` or `services/` directory rather than scattering `fetch` calls directly inside component files.

### Route Authorization & Access Control
- **Unauthenticated (Public) Routes:**
  - `/login` — User authentication portal.
  - `/register` — New account registration.
  - *Behavior:* Accessible without an active session. If an authenticated user attempts to visit `/login` or `/register`, automatically redirect them to `/`.
- **Authenticated (Protected) Routes:**
  - `/**` — All other application routes (`/` main homepage, `/posts`, `/profiles`, `/users`, `/categories`, etc.).
  - *Behavior:* Wrapped in a protected layout route component (`<ProtectedRoute />`). Accessing any `/**` route without a valid auth token/session MUST automatically redirect the user to `/login`.

---

## 9. Build, Test & Development Commands

### Backend (.NET)
- Build solution: `dotnet build`
- Run backend API: `dotnet run`
- Apply EF Core Migration: `dotnet ef database update`
- Run tests: `dotnet test`

### Frontend (Node / React)
- Install dependencies: `npm install` (inside the frontend directory)
- Run dev server: `npm start` or `npm run dev`
- Run frontend tests: `npm test`

---

## 10. Definition of Done for Agents
When completing a task, ensure:
1. All rules in **Section 4 (Human-Authored Code Protection)** were strictly obeyed.
2. The implementation aligns with the **UCB Forum** project goal outlined in Section 1.
3. Both C# and React code compile without syntax or type errors.
4. UI components strictly leverage `shadcn/ui` and respect the `index.css` lock.
5. API contract updates are updated symmetrically in both C# models and TypeScript types.
6. Role-based permissions (Guest vs. Student vs. Teacher) are correctly preserved across endpoints and UI components.
7. No unused imports, warnings, or debug `Console.WriteLine` / `console.log` statements are left behind.