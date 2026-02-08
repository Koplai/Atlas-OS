-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('PLANNED', 'RUNNING', 'BLOCKED', 'VERIFIED', 'FAILED', 'ABORTED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFO', 'WARN', 'ERROR', 'SECURITY');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('UI', 'AGENT', 'N8N', 'BRIDGE', 'DOCKER', 'CLOUDFLARE', 'GITHUB', 'MODEL');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "linkedRunIds" TEXT[],
    "evidenceRefs" TEXT[],
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "steps" JSONB,
    "inputs" JSONB,
    "outputs" JSONB,
    "evidenceRefs" TEXT[],
    "approvals" JSONB,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogEntry" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" "Severity" NOT NULL DEFAULT 'INFO',
    "source" "Source" NOT NULL DEFAULT 'UI',
    "message" TEXT NOT NULL,
    "runId" TEXT,
    "taskId" TEXT,
    "agentId" TEXT,
    "docId" TEXT,
    "workflowId" TEXT,
    "evidenceRef" JSONB,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doc" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "typeTag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bodyMd" TEXT NOT NULL,
    "versions" JSONB,
    "links" TEXT[],

    CONSTRAINT "Doc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "systemPromptVersion" TEXT NOT NULL,
    "toolsAllowed" TEXT[],
    "lastRunId" TEXT,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastTestAt" TIMESTAMP(3),
    "scopesSummary" TEXT,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pointer" TEXT NOT NULL,
    "hash" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linkedRunId" TEXT,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);
