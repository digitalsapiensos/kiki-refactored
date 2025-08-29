/**
 * File Accumulation System - Mock ZIP Generation
 * Manages file collection across all phases and generates mock ZIP archives
 */

import { FileGeneration, Agent, ChatSession } from './types';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'documentation' | 'configuration' | 'code' | 'data' | 'assets';
  phase: number;
  agentId: string;
  createdAt: Date;
  size: number; // in bytes
}

export interface ZipArchive {
  id: string;
  name: string;
  files: ProjectFile[];
  totalSize: number;
  createdAt: Date;
  downloadUrl?: string; // Mock URL for download
}

export class FileAccumulationSystem {
  private projectFiles: Map<string, ProjectFile> = new Map();
  private archives: ZipArchive[] = [];

  constructor() {
    this.initializeSystem();
  }

  // Initialize with sample file templates
  private initializeSystem() {
    // Pre-populate with realistic file templates
    this.createFileTemplates();
  }

  // Create realistic file templates for each phase
  private createFileTemplates() {
    const templates = {
      phase1: [
        {
          name: 'project-concept.md',
          path: '/docs/',
          content: this.generateProjectConceptContent(),
          type: 'documentation' as const,
          agentId: 'peter'
        },
        {
          name: 'user-stories.md', 
          path: '/docs/',
          content: this.generateUserStoriesContent(),
          type: 'documentation' as const,
          agentId: 'peter'
        },
        {
          name: 'mvp-features.json',
          path: '/config/',
          content: this.generateMVPFeaturesContent(),
          type: 'configuration' as const,
          agentId: 'peter'
        }
      ],
      phase2: [
        {
          name: 'competitor-analysis.md',
          path: '/research/',
          content: this.generateCompetitorAnalysisContent(),
          type: 'documentation' as const,
          agentId: 'sara'
        },
        {
          name: 'market-validation.md',
          path: '/research/',
          content: this.generateMarketValidationContent(),
          type: 'documentation' as const,
          agentId: 'sara'
        },
        {
          name: 'target-audience.json',
          path: '/data/',
          content: this.generateTargetAudienceContent(),
          type: 'data' as const,
          agentId: 'sara'
        }
      ],
      phase3: [
        {
          name: 'tech-stack.md',
          path: '/architecture/',
          content: this.generateTechStackContent(),
          type: 'documentation' as const,
          agentId: 'toni'
        },
        {
          name: 'system-architecture.md',
          path: '/architecture/',
          content: this.generateSystemArchitectureContent(),
          type: 'documentation' as const,
          agentId: 'toni'
        },
        {
          name: 'database-schema.sql',
          path: '/database/',
          content: this.generateDatabaseSchemaContent(),
          type: 'code' as const,
          agentId: 'toni'
        },
        {
          name: 'api-endpoints.yaml',
          path: '/api/',
          content: this.generateAPIEndpointsContent(),
          type: 'configuration' as const,
          agentId: 'toni'
        }
      ],
      phase4: [
        {
          name: 'product-requirements.md',
          path: '/docs/',
          content: this.generatePRDContent(),
          type: 'documentation' as const,
          agentId: 'chris'
        },
        {
          name: 'technical-specs.md',
          path: '/docs/',
          content: this.generateTechnicalSpecsContent(),
          type: 'documentation' as const,
          agentId: 'chris'
        },
        {
          name: 'user-manual.md',
          path: '/docs/',
          content: this.generateUserManualContent(),
          type: 'documentation' as const,
          agentId: 'chris'
        },
        {
          name: 'api-documentation.md',
          path: '/docs/',
          content: this.generateAPIDocsContent(),
          type: 'documentation' as const,
          agentId: 'chris'
        }
      ],
      phase5: [
        {
          name: 'docker-compose.yml',
          path: '/deployment/',
          content: this.generateDockerComposeContent(),
          type: 'configuration' as const,
          agentId: 'quentin'
        },
        {
          name: 'deployment-guide.md',
          path: '/deployment/',
          content: this.generateDeploymentGuideContent(),
          type: 'documentation' as const,
          agentId: 'quentin'
        },
        {
          name: 'ci-cd-pipeline.yml',
          path: '/.github/workflows/',
          content: this.generateCICDPipelineContent(),
          type: 'configuration' as const,
          agentId: 'quentin'
        },
        {
          name: 'monitoring-setup.md',
          path: '/monitoring/',
          content: this.generateMonitoringSetupContent(),
          type: 'documentation' as const,
          agentId: 'quentin'
        }
      ]
    };

    // Store templates for later generation
    Object.entries(templates).forEach(([phase, files]) => {
      files.forEach(template => {
        const phaseNumber = parseInt(phase.replace('phase', ''));
        const projectFile: ProjectFile = {
          id: `template-${phaseNumber}-${template.name}`,
          name: template.name,
          path: template.path,
          content: template.content,
          type: template.type,
          phase: phaseNumber,
          agentId: template.agentId,
          createdAt: new Date(),
          size: new Blob([template.content]).size
        };
        
        this.projectFiles.set(projectFile.id, projectFile);
      });
    });
  }

  // Generate files based on FileGeneration progress
  generateProjectFile(fileGen: FileGeneration): ProjectFile | null {
    if (fileGen.status !== 'completed') return null;

    const templateFile = Array.from(this.projectFiles.values()).find(
      f => f.name === fileGen.fileName && f.agentId === fileGen.agentId
    );

    if (!templateFile) {
      // Create a basic file if no template exists
      const projectFile: ProjectFile = {
        id: `generated-${fileGen.id}`,
        name: fileGen.fileName,
        path: this.getPathForFileType(fileGen.type),
        content: this.generateBasicContent(fileGen),
        type: this.mapFileGenTypeToProjectType(fileGen.type),
        phase: this.getPhaseForAgent(fileGen.agentId),
        agentId: fileGen.agentId,
        createdAt: new Date(),
        size: 0
      };
      
      projectFile.size = new Blob([projectFile.content]).size;
      this.projectFiles.set(projectFile.id, projectFile);
      return projectFile;
    }

    return templateFile;
  }

  // Get files by phase
  getFilesByPhase(phase: number): ProjectFile[] {
    return Array.from(this.projectFiles.values()).filter(f => f.phase === phase);
  }

  // Get all project files
  getAllFiles(): ProjectFile[] {
    return Array.from(this.projectFiles.values());
  }

  // Generate mock ZIP archive
  generateZipArchive(
    name: string, 
    phases: number[] = [1, 2, 3, 4, 5],
    session?: ChatSession
  ): ZipArchive {
    const filesToInclude = Array.from(this.projectFiles.values())
      .filter(f => phases.includes(f.phase));

    // Add files that have been generated in the session
    if (session) {
      session.fileGenerations
        .filter(fg => fg.status === 'completed')
        .forEach(fg => {
          const generatedFile = this.generateProjectFile(fg);
          if (generatedFile && !filesToInclude.find(f => f.id === generatedFile.id)) {
            filesToInclude.push(generatedFile);
          }
        });
    }

    const totalSize = filesToInclude.reduce((sum, file) => sum + file.size, 0);
    
    const archive: ZipArchive = {
      id: `archive-${Date.now()}`,
      name: name || `project-${new Date().getTime()}.zip`,
      files: filesToInclude,
      totalSize,
      createdAt: new Date(),
      downloadUrl: this.generateMockDownloadUrl(name)
    };

    this.archives.push(archive);
    return archive;
  }

  // Get archive history
  getArchives(): ZipArchive[] {
    return [...this.archives];
  }

  // Generate mock download URL
  private generateMockDownloadUrl(filename: string): string {
    // In a real app, this would be a real download endpoint
    return `https://kiki-generator.app/download/${encodeURIComponent(filename)}?token=${Math.random().toString(36).substr(2)}`;
  }

  // Helper methods for file generation
  private getPathForFileType(type: string): string {
    const pathMap: Record<string, string> = {
      'Documentation': '/docs/',
      'Configuration': '/config/',
      'Research': '/research/',
      'Technical': '/architecture/',
      'API': '/api/',
      'Database': '/database/',
      'DevOps': '/deployment/',
      'Requirements': '/requirements/'
    };
    
    return pathMap[type] || '/misc/';
  }

  private mapFileGenTypeToProjectType(type: string): ProjectFile['type'] {
    const typeMap: Record<string, ProjectFile['type']> = {
      'Documentation': 'documentation',
      'Configuration': 'configuration', 
      'Research': 'documentation',
      'Technical': 'documentation',
      'API': 'configuration',
      'Database': 'code',
      'DevOps': 'configuration'
    };
    
    return typeMap[type] || 'documentation';
  }

  private getPhaseForAgent(agentId: string): number {
    const phaseMap: Record<string, number> = {
      'peter': 1,
      'sara': 2,
      'toni': 3,
      'chris': 4,
      'quentin': 5
    };
    
    return phaseMap[agentId] || 1;
  }

  private generateBasicContent(fileGen: FileGeneration): string {
    return `# ${fileGen.fileName}

This file was generated by ${fileGen.agentId} during the KIKI project wizard.

**Type**: ${fileGen.type}
**Status**: ${fileGen.status}
**Progress**: ${fileGen.progress}%
**Generated**: ${new Date().toISOString()}

---

*This is a mock file generated for demonstration purposes.*
*In a real implementation, this would contain actual project content.*
`;
  }

  // Content generators for each file type
  private generateProjectConceptContent(): string {
    return `# Project Concept Document

## Executive Summary
This document outlines the core concept, objectives, and initial vision for the project developed through the KIKI wizard system.

## Problem Statement
[User-defined problem that the project aims to solve]

## Solution Overview
[High-level description of the proposed solution]

## Target Audience
- Primary users
- Secondary stakeholders
- Market segments

## MVP Features
1. Core functionality
2. Essential user interactions
3. Minimum viable experience

## Success Metrics
- User engagement targets
- Business objectives
- Technical milestones

## Next Steps
- Market validation
- Technical architecture
- Implementation roadmap

---
*Generated by Peter - Project Conceptualization Specialist*
*Part of the KIKI 5-Phase Project Development System*
`;
  }

  private generateUserStoriesContent(): string {
    return `# User Stories

## Epic: Core User Journey

### User Registration & Onboarding
- **As a** new user
- **I want to** easily create an account and understand the platform
- **So that** I can quickly start using the core features

### Primary Use Cases
- **As a** [target user type]
- **I want to** [primary action]
- **So that** [desired outcome]

### Secondary Features
- **As a** [user type]
- **I want to** [supporting action]
- **So that** [enabling outcome]

## Acceptance Criteria
Each user story includes:
- ✅ Clear success conditions
- ✅ Error handling scenarios
- ✅ Performance requirements
- ✅ Accessibility considerations

---
*Generated by Peter - User Experience Architect*
`;
  }

  private generateMVPFeaturesContent(): string {
    return `{
  "mvpFeatures": {
    "core": [
      {
        "name": "User Authentication",
        "priority": "high",
        "complexity": "medium",
        "estimatedHours": 24
      },
      {
        "name": "Main Dashboard",
        "priority": "high", 
        "complexity": "high",
        "estimatedHours": 40
      }
    ],
    "secondary": [
      {
        "name": "User Profile Management",
        "priority": "medium",
        "complexity": "low",
        "estimatedHours": 16
      }
    ],
    "nice_to_have": [
      {
        "name": "Advanced Analytics",
        "priority": "low",
        "complexity": "high",
        "estimatedHours": 60
      }
    ]
  },
  "totalEstimatedHours": 140,
  "developmentWeeks": 4,
  "generatedBy": "peter",
  "lastUpdated": "${new Date().toISOString()}"
}`;
  }

  private generateCompetitorAnalysisContent(): string {
    return `# Competitive Analysis Report

## Market Landscape Overview
Comprehensive analysis of existing solutions and competitive positioning.

## Direct Competitors

### Competitor A
- **Strengths**: Market leader, established user base
- **Weaknesses**: Legacy technology, poor UX
- **Market Share**: 35%
- **Pricing**: $29/month

### Competitor B  
- **Strengths**: Modern interface, good pricing
- **Weaknesses**: Limited features, poor support
- **Market Share**: 20%
- **Pricing**: $19/month

## Indirect Competitors
[Alternative solutions and workarounds users currently employ]

## Competitive Advantages
1. **Unique Value Proposition**: [What makes this solution different]
2. **Technology Edge**: [Technical advantages]
3. **User Experience**: [UX innovations]
4. **Pricing Strategy**: [Competitive pricing approach]

## Market Opportunities
- Underserved segments
- Feature gaps
- Emerging trends

## Strategic Recommendations
[Key insights for positioning and development]

---
*Generated by Sara - Market Research Specialist*
*Analysis Date: ${new Date().toLocaleDateString()}*
`;
  }

  private generateMarketValidationContent(): string {
    return `# Market Validation Report

## Validation Methodology
Multiple validation approaches used to confirm market opportunity.

## Target Market Analysis
- **Total Addressable Market (TAM)**: $X billion
- **Serviceable Addressable Market (SAM)**: $Y million  
- **Serviceable Obtainable Market (SOM)**: $Z thousand

## Customer Validation
### Survey Results (n=100)
- 78% expressed interest in the solution
- 45% would pay for the service
- Average willingness to pay: $25/month

### Interview Insights
- Pain points confirmed across user segments
- Feature priorities aligned with assumptions
- Pricing sensitivity within expected range

## Market Timing
- Industry trends support solution timing
- Technology readiness enables implementation
- Competitive landscape creates opportunity

## Risk Assessment
- **High Risk**: Market competition
- **Medium Risk**: Technical complexity
- **Low Risk**: User adoption

## Validation Score: 8.2/10
Strong market opportunity with manageable risks.

---
*Generated by Sara - Validation Specialist*
`;
  }

  private generateTargetAudienceContent(): string {
    return `{
  "primaryAudience": {
    "demographics": {
      "ageRange": "25-40",
      "education": "College+",
      "income": "$50k-100k",
      "location": "Urban/Suburban"
    },
    "psychographics": {
      "techSavvy": "moderate-high",
      "adoptionStyle": "early majority",
      "valueDrivers": ["efficiency", "cost-savings", "simplicity"]
    },
    "painPoints": [
      "Current solutions are too complex",
      "Existing tools lack key features",
      "Price point too high for value received"
    ]
  },
  "secondaryAudience": {
    "segment": "Small business owners",
    "size": "estimated 2M potential users",
    "acquisitionStrategy": "B2B partnerships"
  },
  "userPersonas": {
    "primary": {
      "name": "Alex the Professional",
      "goals": ["Save time", "Improve workflow"],
      "frustrations": ["Complex interfaces", "Poor support"]
    }
  },
  "marketSize": {
    "total": 5000000,
    "reachable": 500000,
    "convertible": 50000
  },
  "generatedBy": "sara",
  "lastUpdated": "${new Date().toISOString()}"
}`;
  }

  private generateTechStackContent(): string {
    return `# Technology Stack Recommendation

## Frontend Stack
- **Framework**: Next.js 14+ (React-based)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand / React Context
- **TypeScript**: Full type safety

## Backend Stack  
- **Runtime**: Node.js / Bun
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js / Supabase Auth
- **API**: REST + GraphQL (optional)

## Infrastructure
- **Hosting**: Vercel (Frontend) + Railway/Supabase (Backend)
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry
- **Domain**: Namecheap / Cloudflare

## Development Tools
- **Version Control**: Git + GitHub
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Testing**: Jest + Playwright

## Integrations
- **Payments**: Stripe
- **Email**: Resend / SendGrid
- **Storage**: Supabase Storage / Cloudinary

## Rationale
This stack prioritizes:
- **Developer Experience**: Modern, well-documented tools
- **Performance**: Edge-first architecture
- **Scalability**: Horizontal scaling capabilities
- **Cost Efficiency**: Generous free tiers, pay-as-you-grow
- **Security**: Built-in security best practices

## Migration Path
Start with Supabase for rapid prototyping, migrate to dedicated infrastructure as needed.

---
*Generated by Toni - Technical Architecture Specialist*
*Stack Version: 2025.1*
`;
  }

  private generateSystemArchitectureContent(): string {
    return `# System Architecture Design

## Architecture Overview
Modern, scalable architecture following best practices for web applications.

## High-Level Architecture

\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │────│     API     │────│  Database   │
│   Next.js   │    │  Gateway    │    │ PostgreSQL  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│     CDN     │    │   Auth      │    │   Storage   │
│   Vercel    │    │  Service    │    │  Supabase   │
└─────────────┘    └─────────────┘    └─────────────┘
\`\`\`

## Component Architecture

### Frontend Layer
- **Pages**: Route-based components
- **Components**: Reusable UI elements
- **Hooks**: Business logic abstraction
- **Services**: API communication layer

### API Layer
- **Routes**: RESTful endpoints
- **Middleware**: Authentication, validation
- **Controllers**: Business logic
- **Services**: Data access layer

### Data Layer
- **Models**: Data structures
- **Repositories**: Data access patterns
- **Migrations**: Schema evolution
- **Indexes**: Performance optimization

## Security Architecture
- JWT-based authentication
- Row-level security (RLS)
- Input validation & sanitization
- CORS configuration
- Rate limiting

## Performance Considerations
- Edge caching strategy
- Database connection pooling
- Image optimization
- Code splitting
- Lazy loading

## Scalability Plan
- Horizontal scaling capabilities
- Database read replicas
- CDN optimization
- Microservices migration path

---
*Generated by Toni - System Architect*
`;
  }

  private generateDatabaseSchemaContent(): string {
    return `-- Database Schema Design
-- Generated by KIKI Technical Architecture System

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  website VARCHAR(255),
  location VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core application entities
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;  
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generated by Toni - Database Architect
-- Schema Version: 1.0
-- Last Updated: ${new Date().toISOString()}
`;
  }

  private generateAPIEndpointsContent(): string {
    return `# API Endpoints Specification

openapi: 3.0.3
info:
  title: KIKI Project API
  version: 1.0.0
  description: RESTful API for KIKI-generated project

servers:
  - url: https://api.project.com/v1
    description: Production server
  - url: https://staging-api.project.com/v1
    description: Staging server

paths:
  /auth/login:
    post:
      summary: User authentication
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 6
      responses:
        200:
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

  /users/profile:
    get:
      summary: Get user profile
      tags: [Users]
      security:
        - bearerAuth: []
      responses:
        200:
          description: User profile data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'

  /projects:
    get:
      summary: List user projects
      tags: [Projects]
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        200:
          description: List of projects
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Project'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        createdAt:
          type: string
          format: date-time

    Project:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [active, completed, archived]
        createdAt:
          type: string
          format: date-time

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

# Generated by Toni - API Architect
# Version: 1.0
# Last Updated: ${new Date().toISOString()}
`;
  }

  private generatePRDContent(): string {
    return `# Product Requirements Document (PRD)

## Product Overview
Comprehensive requirements specification for the KIKI-generated project.

## Executive Summary
[High-level product vision, goals, and success criteria]

## User Stories & Requirements

### Functional Requirements
1. **User Management**
   - User registration and authentication
   - Profile management
   - Account settings

2. **Core Features**
   - [Primary functionality]
   - [Secondary features] 
   - [Supporting capabilities]

3. **Data Management**
   - Data input and validation
   - Storage and retrieval
   - Export capabilities

### Non-Functional Requirements
- **Performance**: Page load < 2 seconds
- **Scalability**: Support 10k concurrent users
- **Security**: SOC2 compliance
- **Accessibility**: WCAG 2.1 AA standard

## User Experience Requirements
- Responsive design (mobile-first)
- Intuitive navigation
- Accessibility compliance
- Multi-browser support

## Technical Requirements
- Modern web standards
- API-first architecture
- Real-time capabilities
- Offline functionality

## Success Metrics
- User adoption rate: 20% monthly growth
- User retention: 80% at 30 days
- Performance: 98% uptime
- Security: Zero major breaches

## Development Phases
1. **MVP** (4 weeks): Core functionality
2. **Phase 2** (6 weeks): Enhanced features
3. **Phase 3** (8 weeks): Advanced capabilities

## Risk Assessment
- Technical risks and mitigation
- Market risks and responses
- Resource risks and planning

---
*Generated by Chris - Product Documentation Specialist*
*Document Version: 1.0*
*Last Updated: ${new Date().toLocaleDateString()}*
`;
  }

  private generateTechnicalSpecsContent(): string {
    return `# Technical Specifications

## Architecture Specifications
Detailed technical implementation guidelines and specifications.

## Frontend Specifications
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS + CSS Modules
- **Components**: React with TypeScript
- **State**: Zustand for global state
- **Forms**: React Hook Form + Zod validation

## Backend Specifications  
- **Runtime**: Node.js 20+ / Bun
- **Database**: PostgreSQL 15+
- **ORM**: Prisma / Drizzle
- **Authentication**: JWT + Refresh tokens
- **API**: RESTful with OpenAPI docs

## Data Models
\`\`\`typescript
interface User {
  id: string;
  email: string;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
\`\`\`

## API Specifications
- RESTful endpoints following OpenAPI 3.0
- Consistent error handling and responses
- Rate limiting and authentication
- Input validation and sanitization

## Security Specifications
- Password hashing with bcrypt
- JWT token management
- Input validation and XSS prevention
- CSRF protection
- Rate limiting per endpoint

## Performance Specifications
- Page load time < 2 seconds
- API response time < 200ms
- Database queries optimized with indexes
- Image optimization and lazy loading
- Code splitting and tree shaking

## Testing Specifications
- Unit tests: Jest + Testing Library
- Integration tests: Supertest
- E2E tests: Playwright
- Coverage target: >80%

## Deployment Specifications
- Containerized with Docker
- CI/CD with GitHub Actions
- Zero-downtime deployments
- Environment-specific configurations
- Monitoring and alerting

---
*Generated by Chris - Technical Documentation Specialist*
*Specification Version: 1.0*
`;
  }

  private generateUserManualContent(): string {
    return `# User Manual

## Welcome to Your New Application
Complete guide for users to effectively utilize the platform.

## Getting Started

### Account Setup
1. **Registration**
   - Visit the registration page
   - Provide email and create password
   - Verify email address
   - Complete profile setup

2. **First Login**
   - Navigate to login page
   - Enter credentials
   - Complete onboarding tutorial
   - Explore main dashboard

### Dashboard Overview
The main dashboard provides:
- Quick access to core features
- Recent activity overview
- Navigation to key sections
- Account settings access

## Core Features

### [Feature 1]
**Purpose**: [What this feature does]

**How to use**:
1. Navigate to [section]
2. Click [button/option]
3. Fill in required information
4. Save changes

**Tips**: 
- [Helpful tip 1]
- [Helpful tip 2]

### [Feature 2]
**Purpose**: [Feature description]

**Step-by-step guide**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Troubleshooting

### Common Issues
**Issue**: Login problems
**Solution**: 
- Check email/password
- Reset password if needed
- Clear browser cache
- Contact support if persistent

### FAQ
**Q: How do I reset my password?**
A: Click "Forgot Password" on login page and follow email instructions.

**Q: Can I export my data?**
A: Yes, visit Settings > Data Export to download your information.

## Support
- Email: support@project.com
- Help Center: help.project.com
- Live Chat: Available Mon-Fri 9am-5pm

---
*Generated by Chris - User Experience Documentation Specialist*
*Manual Version: 1.0*
*For questions, contact our support team*
`;
  }

  private generateAPIDocsContent(): string {
    return `# API Documentation

## Introduction
Complete developer guide for integrating with the project API.

## Authentication
All API requests require authentication via Bearer token.

\`\`\`javascript
// Example authentication header
headers: {
  'Authorization': 'Bearer your-jwt-token-here',
  'Content-Type': 'application/json'
}
\`\`\`

## Base URL
- Production: \`https://api.project.com/v1\`
- Staging: \`https://staging-api.project.com/v1\`

## Core Endpoints

### Authentication
\`\`\`http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
\`\`\`

### User Profile
\`\`\`http
GET /users/profile
Authorization: Bearer {token}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "bio": "User bio text"
    }
  }
}
\`\`\`

## Error Handling
Standard HTTP status codes with detailed error messages.

\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Valid email is required"
      }
    ]
  }
}
\`\`\`

## Rate Limiting
- 1000 requests per hour per API key
- 429 status returned when limit exceeded
- Rate limit headers included in responses

## SDKs and Examples
- JavaScript/Node.js SDK available
- Python wrapper in development
- Example code in multiple languages

---
*Generated by Chris - API Documentation Specialist*
*API Version: 1.0*
*Last Updated: ${new Date().toISOString()}*
`;
  }

  private generateDockerComposeContent(): string {
    return `# Docker Compose Configuration
# Generated by KIKI Deployment System

version: '3.8'

services:
  # Application services
  app:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/appdb
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - redis
    command: npm run start

  # Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: appdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  # Redis for caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    driver: bridge

# Generated by Quentin - DevOps Specialist
# Configuration Version: 1.0
# Last Updated: ${new Date().toISOString()}
`;
  }

  private generateDeploymentGuideContent(): string {
    return `# Deployment Guide

## Production Deployment
Step-by-step guide for deploying to production environment.

## Prerequisites
- Docker and Docker Compose installed
- Domain name configured
- SSL certificates obtained
- Environment variables configured

## Deployment Steps

### 1. Server Setup
\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
\`\`\`

### 2. Application Deployment
\`\`\`bash
# Clone repository
git clone https://github.com/yourusername/your-project.git
cd your-project

# Configure environment
cp .env.example .env.production
# Edit .env.production with production values

# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose exec app npm run migrate
\`\`\`

### 3. SSL Configuration
\`\`\`bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
\`\`\`

## Environment Configuration

### Production Environment Variables
\`\`\`bash
NODE_ENV=production
DATABASE_URL=postgresql://user:secure_password@db:5432/proddb
NEXTAUTH_SECRET=your-very-secure-secret-key
NEXTAUTH_URL=https://yourdomain.com

# Third-party services
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG....
\`\`\`

## Monitoring Setup
- Health check endpoints
- Log aggregation with ELK stack
- Performance monitoring with New Relic
- Uptime monitoring with Pingdom

## Backup Strategy
- Daily database backups to S3
- Application file backups
- Configuration backups
- Disaster recovery procedures

## Security Checklist
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Database secured
- [ ] Environment variables encrypted
- [ ] Security headers configured
- [ ] Rate limiting enabled

## Rollback Procedure
\`\`\`bash
# Stop current deployment
docker-compose down

# Restore from backup
docker-compose -f docker-compose.backup.yml up -d

# Verify functionality
curl -f https://yourdomain.com/health
\`\`\`

---
*Generated by Quentin - DevOps Specialist*
*Deployment Guide Version: 1.0*
*Last Updated: ${new Date().toLocaleDateString()}*
`;
  }

  private generateCICDPipelineContent(): string {
    return `# CI/CD Pipeline Configuration
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
      
      - name: Run E2E tests
        run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: .next/

  deploy:
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-files
          path: .next/
      
      - name: Deploy to production
        uses: easingthemes/ssh-deploy@v4.1.10
        with:
          SSH_PRIVATE_KEY: \${{ secrets.SSH_PRIVATE_KEY }}
          ARGS: "-rlgoDzvc -i --delete"
          SOURCE: "."
          REMOTE_HOST: \${{ secrets.REMOTE_HOST }}
          REMOTE_USER: \${{ secrets.REMOTE_USER }}
          TARGET: \${{ secrets.REMOTE_TARGET }}
      
      - name: Restart application
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: \${{ secrets.REMOTE_HOST }}
          username: \${{ secrets.REMOTE_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd \${{ secrets.REMOTE_TARGET }}
            docker-compose down
            docker-compose up -d
            docker-compose exec app npm run migrate

# Generated by Quentin - CI/CD Specialist
# Pipeline Version: 1.0
# Last Updated: ${new Date().toISOString()}
`;
  }

  private generateMonitoringSetupContent(): string {
    return `# Monitoring and Observability Setup

## Monitoring Stack Overview
Comprehensive monitoring solution for production applications.

## Application Performance Monitoring (APM)

### Health Check Endpoints
\`\`\`javascript
// /api/health
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});

// /api/health/detailed
app.get('/health/detailed', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    external_apis: await checkExternalAPIs()
  };
  
  res.json({
    status: Object.values(checks).every(c => c.healthy) ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
});
\`\`\`

## Metrics Collection

### Key Performance Indicators (KPIs)
- **Response Time**: Average API response time < 200ms
- **Error Rate**: < 0.1% for critical endpoints
- **Uptime**: 99.9% availability target
- **Database Performance**: Query time < 50ms average

### Custom Metrics
\`\`\`javascript
// User registration rate
metrics.increment('user.registration.count');

// Feature usage tracking
metrics.gauge('feature.active_users', activeUserCount);

// Business metrics
metrics.timing('checkout.completion_time', completionTime);
\`\`\`

## Log Management

### Structured Logging
\`\`\`javascript
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'app-name',
    version: process.env.npm_package_version
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Usage example
logger.info('User login successful', {
  userId: user.id,
  method: 'email',
  duration: loginTime
});
\`\`\`

## Error Tracking

### Sentry Integration
\`\`\`javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error context
Sentry.setUser({ id: user.id, email: user.email });
Sentry.setTag('component', 'payment');
Sentry.captureException(error);
\`\`\`

## Infrastructure Monitoring

### Docker Health Checks
\`\`\`yaml
# docker-compose.yml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
\`\`\`

### Database Monitoring
- Connection pool status
- Query performance metrics
- Slow query logs
- Index usage statistics

## Alerting Rules

### Critical Alerts
- Application down (5xx errors > 50%)
- Database connection failures
- High memory usage (> 90%)
- Disk space low (< 10% free)

### Warning Alerts  
- Response time degradation (> 500ms)
- Error rate increase (> 1%)
- Memory usage high (> 80%)
- Database query slow (> 1s)

## Dashboard Setup

### Key Metrics Dashboard
- Request volume and response times
- Error rates by endpoint
- Database performance
- User activity metrics
- Business KPIs

### Infrastructure Dashboard
- Server resources (CPU, memory, disk)
- Network performance
- Container health status
- Database metrics

## Monitoring Tools Configuration

### Prometheus + Grafana
\`\`\`yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
\`\`\`

## Backup and Recovery Monitoring
- Backup job success/failure alerts
- Recovery time objective (RTO) tracking
- Data integrity verification

---
*Generated by Quentin - Monitoring and Observability Specialist*
*Monitoring Setup Version: 1.0*
*Last Updated: ${new Date().toLocaleDateString()}*
`;
  }

  // Clear all accumulated data
  reset(): void {
    this.projectFiles.clear();
    this.archives = [];
    this.initializeSystem();
  }
}

// Export singleton instance
export const fileAccumulationSystem = new FileAccumulationSystem();

// Utility functions
export const generateProjectZip = (
  name: string, 
  phases?: number[], 
  session?: ChatSession
) => {
  return fileAccumulationSystem.generateZipArchive(name, phases, session);
};

export const getProjectFiles = () => {
  return fileAccumulationSystem.getAllFiles();
};

export const getProjectFilesByPhase = (phase: number) => {
  return fileAccumulationSystem.getFilesByPhase(phase);
};