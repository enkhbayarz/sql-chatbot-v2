# AI Academy Asia - V1 Infrastructure Architecture

## System Overview

```mermaid
flowchart TB
    subgraph Users["Users (Students/Teachers)"]
        Web["Web Browser"]
        Mobile["Mobile Browser"]
    end

    subgraph Frontend["Frontend Layer"]
        Vercel["Vercel (Free Tier)"]
        NextJS["Next.js App"]
    end

    subgraph Auth["Authentication"]
        Clerk["Clerk (10K MAU Free)"]
    end

    subgraph Backend["Backend Layer"]
        EC2["AWS EC2"]
        FastAPI["FastAPI Server"]
    end

    subgraph AI["AI Services"]
        OpenAI["OpenAI API"]
        GPT4o["GPT-4o Chat"]
        Vision["GPT-4o Vision"]
        Embed["text-embedding-3-small"]
    end

    subgraph Audio["Audio Services"]
        Chimege["Chimege API"]
        STT["Speech-to-Text"]
        TTS["Text-to-Speech"]
    end

    subgraph Data["Data Layer"]
        PG["PostgreSQL + pgvector"]
        Redis["Upstash Redis"]
        S3["AWS S3"]
    end

    subgraph Infra["Infrastructure"]
        CF["CloudFront CDN"]
        PostHog["PostHog Analytics"]
        Sentry["Sentry Monitoring"]
    end

    Web & Mobile --> CF
    CF --> Vercel
    Vercel --> NextJS
    NextJS --> Clerk
    NextJS --> FastAPI
    FastAPI --> OpenAI
    FastAPI --> Chimege
    FastAPI --> PG
    FastAPI --> Redis
    FastAPI --> S3
    NextJS --> PostHog
    FastAPI --> Sentry
```

---

## Detailed Service Architecture

```mermaid
flowchart LR
    subgraph Client["Client Layer"]
        Browser["Browser"]
    end

    subgraph Edge["Edge Layer"]
        CDN["CloudFront CDN"]
        VercelEdge["Vercel Edge Network"]
    end

    subgraph App["Application Layer"]
        direction TB
        NextJS["Next.js Frontend<br/>- React UI<br/>- API Routes (proxy)<br/>- SSR/SSG"]

        subgraph API["FastAPI Backend"]
            AuthAPI["Auth Routes"]
            ChatAPI["Chat Routes"]
            DocAPI["Document Routes"]
            AudioAPI["Audio Routes"]
            VisionAPI["Vision Routes"]
        end
    end

    subgraph Services["External Services"]
        direction TB
        Clerk["Clerk Auth<br/>- JWT validation<br/>- User management<br/>- 10K MAU free"]

        OpenAI["OpenAI API<br/>- GPT-4o chat<br/>- GPT-4o vision<br/>- Embeddings"]

        Chimege["Chimege API<br/>- Mongolian STT<br/>- Mongolian TTS"]
    end

    subgraph Storage["Storage Layer"]
        direction TB
        PG["PostgreSQL<br/>+ pgvector<br/>(PlanetScale/RDS)"]
        Redis["Upstash Redis<br/>- Sessions<br/>- Cache<br/>- Rate limiting"]
        S3["AWS S3<br/>- Documents<br/>- Audio files<br/>- Images"]
    end

    subgraph Observability["Observability"]
        PostHog["PostHog<br/>1M events free"]
        Sentry["Sentry<br/>Error tracking"]
    end

    Browser --> CDN --> VercelEdge --> NextJS
    NextJS --> API
    API --> Clerk
    API --> OpenAI
    API --> Chimege
    API --> PG
    API --> Redis
    API --> S3
    NextJS --> PostHog
    API --> Sentry
```

---

## Data Flow Diagrams

### 1. Text Chat Flow (RAG)

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js
    participant F as FastAPI
    participant C as Clerk
    participant PG as PostgreSQL
    participant R as Redis
    participant O as OpenAI

    U->>N: Send message
    N->>C: Validate JWT
    C-->>N: Valid
    N->>F: POST /api/chat
    F->>R: Check rate limit
    R-->>F: OK
    F->>O: Generate embedding
    O-->>F: Vector [1536]
    F->>PG: Similarity search (pgvector)
    PG-->>F: Top 5 relevant chunks
    F->>R: Get chat history
    R-->>F: Previous messages
    F->>O: GPT-4o (context + query)
    O-->>F: Stream response
    F-->>N: SSE stream
    N-->>U: Display response
    F->>R: Save to history
```

### 2. Audio Chat Flow

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js
    participant F as FastAPI
    participant CH as Chimege
    participant O as OpenAI
    participant R as Redis
    participant PG as PostgreSQL

    U->>N: Record audio
    N->>F: POST /api/audio (blob)
    F->>CH: Speech-to-Text
    CH-->>F: Mongolian text

    Note over F,PG: Same RAG flow as text chat
    F->>O: Generate embedding
    F->>PG: Similarity search
    F->>O: GPT-4o response
    O-->>F: Response text

    F->>O: Summarize (max 300 chars)
    O-->>F: Short text
    F->>CH: Text-to-Speech
    CH-->>F: Audio blob
    F->>R: Cache audio (10min TTL)
    F-->>N: Audio response
    N-->>U: Play audio
```

### 3. Vision Flow (Image Analysis)

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js
    participant F as FastAPI
    participant S3 as AWS S3
    participant O as OpenAI
    participant PG as PostgreSQL

    U->>N: Upload image
    N->>F: POST /api/vision
    F->>S3: Store image
    S3-->>F: Image URL
    F->>O: GPT-4o Vision (image + query)
    O-->>F: Image analysis

    Note over F,PG: Optional RAG context
    F->>PG: Get related docs
    PG-->>F: Context

    F->>O: GPT-4o (analysis + context)
    O-->>F: Final response
    F-->>N: Response
    N-->>U: Display answer
```

### 4. Document Ingestion Pipeline

```mermaid
flowchart LR
    subgraph Upload["Document Upload"]
        Admin["Admin/Teacher"]
        File["PDF/DOCX/TXT"]
    end

    subgraph Process["Processing Pipeline"]
        Parse["Parse Document"]
        Chunk["Chunk Text<br/>1000 chars<br/>100 overlap"]
        Embed["Generate Embeddings<br/>text-embedding-3-small"]
    end

    subgraph Store["Storage"]
        S3["S3<br/>Original files"]
        PG["PostgreSQL<br/>pgvector"]
    end

    Admin --> File --> Parse --> Chunk --> Embed
    File --> S3
    Embed --> PG
```

---

## Tech Stack Summary

| Layer | Service | Pricing | Free Tier |
|-------|---------|---------|-----------|
| Frontend | Next.js on Vercel | $20/mo Pro | 100GB bandwidth |
| Auth | Clerk | $0.02/MAU after 10K | 10K MAU |
| Backend | FastAPI on AWS EC2 | ~$30-50/mo | - |
| Database | PostgreSQL + pgvector | $5/mo (PlanetScale) | - |
| Cache | Upstash Redis | Pay per command | 10K/day |
| AI Chat | OpenAI GPT-4o | $2.50/1M in + $10/1M out | - |
| Vision | OpenAI GPT-4o Vision | ~$0.01/image | - |
| Audio STT | Chimege | 15₮/15sec | - |
| Audio TTS | Chimege | 8₮/200chars | - |
| Storage | AWS S3 | $0.023/GB | 5GB |
| CDN | AWS CloudFront | $0.085/GB | 1TB |
| Analytics | PostHog | $0.00031/event | 1M events |
| Monitoring | Sentry | $26/mo Team | 5K errors |

---

## Cost Summary (Monthly)

| Users | OpenAI | Chimege | Infra | Total | Per User |
|-------|--------|---------|-------|-------|----------|
| 500 | $115 | $87 | $9 | $211 | $0.42 |
| 1,000 | $230 | $174 | $12 | $416 | $0.42 |
| 2,000 | $460 | $348 | $49 | $857 | $0.43 |
| 5,000 | $1,150 | $870 | $106 | $2,126 | $0.43 |

### Free Tier Limits (V1 Pilot)

| Service | Free Limit | Users Covered |
|---------|------------|---------------|
| Vercel | 100GB bandwidth | ~3,000 users |
| Clerk | 10K MAU | 10,000 users |
| Upstash | 10K commands/day | ~500 users |
| PostHog | 1M events/mo | ~5,000 users |
| S3 | 5GB storage | ~2,000 users |
| CloudFront | 1TB transfer | ~5,000 users |

---

## V1 vs Future Serverless Migration

```mermaid
flowchart LR
    subgraph V1["V1 (Current)"]
        EC2_V1["FastAPI on EC2<br/>Always running<br/>~$30-50/mo"]
    end

    subgraph Future["Future (Serverless)"]
        Lambda["AWS Lambda<br/>or Vercel Functions<br/>Pay per request"]
    end

    subgraph Benefits["Benefits"]
        Cost["Near-zero idle cost"]
        Scale["Auto-scaling"]
        Maintain["Easy maintenance"]
    end

    V1 --> |"Migrate"| Future
    Future --> Benefits
```

### Migration Path

| Phase | Action | Status |
|-------|--------|--------|
| 1 | FastAPI on EC2 (outsourced team) | V1 Pilot |
| 2 | Move auth to Clerk SDK | Future |
| 3 | Migrate simple endpoints to Next.js API routes | Future |
| 4 | Heavy RAG to AWS Lambda or EC2 with auto-scaling | Future |

---

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Next.js + Vercel | Free tier, SSR, easy deployment |
| Auth | Clerk | 10K free, handles complexity |
| Backend | FastAPI on EC2 | Inherited from outsource team, migrate later |
| Database | PostgreSQL | pgvector required for RAG |
| Cache | Upstash Redis | Serverless, free tier |
| AI | OpenAI GPT-4o | Best quality for education |
| Audio | Chimege | Only Mongolian STT/TTS option |
| Storage | AWS S3 | Reliable, cheap |
| CDN | CloudFront | Integrates with S3 |
| Analytics | PostHog | 1M events free |
| Monitoring | Sentry | Industry standard |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Cache
UPSTASH_REDIS_URL=redis://...
UPSTASH_REDIS_TOKEN=...

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# AI
OPENAI_API_KEY=sk-...

# Audio (Chimege)
STT_KEY=...
TTS_KEY=...

# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-northeast-1
S3_BUCKET=ai-academy-docs

# Monitoring
SENTRY_DSN=https://...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```
