import { UserProfile, SkillGapAnalysis, Company } from '../types';
import { ROLE_TAXONOMY, INITIAL_COMPANIES } from '../data/initialData';

export const matchingService = {
  analyzeSkillGap(targetRole: string, userSkills: string[]): SkillGapAnalysis {
    const roleConfig = ROLE_TAXONOMY[targetRole] || ROLE_TAXONOMY['Software Developer'];
    const requiredSkills = roleConfig.requiredSkills;

    const normalizedUserSkills = (userSkills || []).map((s) => s.trim().toLowerCase());
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    requiredSkills.forEach((req) => {
      const match = normalizedUserSkills.includes(req.toLowerCase());
      if (match) {
        matchedSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    });

    const skillMatchPercentage = Math.round((matchedSkills.length / Math.max(1, requiredSkills.length)) * 100);

    const recommendations = missingSkills.map((skill, index) => {
      let priority: 'high' | 'medium' | 'low' = index === 0 ? 'high' : index === 1 ? 'high' : 'medium';
      let reason = `Crucial requirement for ${targetRole} positions to build production systems.`;
      let time = '1 - 2 weeks';

      if (skill.includes('SQL') || skill.includes('Database')) {
        reason = 'Every engineering team expects solid relational data modeling, query optimization, and transaction understanding.';
        time = '1 week (focused practice on multi-table joins & indexing)';
      } else if (skill.includes('React') || skill.includes('Next.js')) {
        reason = 'Essential for building modern reactive user interfaces and handling state effectively.';
        time = '2 weeks (building an end-to-end interactive project)';
      } else if (skill.includes('Git') || skill.includes('GitHub')) {
        reason = 'Fundamental for version control, branching strategies, and collaborative team development.';
        time = '3 days (branching, PR workflows, merge conflict resolution)';
      } else if (skill.includes('TypeScript')) {
        reason = 'Industry standard for enterprise frontend and full-stack codebases to eliminate runtime type errors.';
        time = '1 - 2 weeks (type generics, interfaces, and strict compiler configs)';
      } else if (skill.includes('Spring Boot') || skill.includes('Django')) {
        reason = 'Top enterprise frameworks for building scalable, secure backend microservices.';
        time = '2 - 3 weeks';
      }

      return {
        skill,
        priority,
        reason,
        estimatedTimeToLearn: time,
      };
    });

    return {
      targetRole,
      currentSkills: userSkills,
      requiredSkills,
      matchedSkills,
      missingSkills,
      skillMatchPercentage,
      disclaimer: 'This percentage represents only the comparison between known skills and role requirements. It is NOT probability of getting hired, interview selection, or prediction of employment.',
      recommendations,
    };
  },

  matchCompanies(profile: UserProfile, averageScore: number = 75): Company[] {
    const userSkills = (profile.skills || []).map((s) => s.toLowerCase());
    const targetRole = profile.career?.targetRole || 'Software Developer';

    const scored = INITIAL_COMPANIES.map((company) => {
      const companySkills = company.commonSkills.map((s) => s.toLowerCase());
      const matching: string[] = [];
      const missing: string[] = [];

      company.commonSkills.forEach((s) => {
        if (userSkills.includes(s.toLowerCase())) {
          matching.push(s);
        } else {
          missing.push(s);
        }
      });

      const roleOverlap = company.relevantRoles.some(
        (r) => r.toLowerCase().includes(targetRole.toLowerCase()) || targetRole.toLowerCase().includes(r.toLowerCase())
      );

      // Score computation
      let matchScore = Math.round((matching.length / Math.max(1, company.commonSkills.length)) * 70);
      if (roleOverlap) matchScore += 20;
      if (averageScore >= 75) matchScore += 10;
      matchScore = Math.min(95, Math.max(45, matchScore));

      const whyMatches = `Your skills in ${matching.slice(0, 3).join(', ') || 'core technologies'} align with several technical expectations for early-career ${targetRole} positions at ${company.name}.`;

      return {
        ...company,
        matchScore,
        matchingSkills: matching,
        skillsToImprove: missing,
        whyMatches,
      };
    });

    return scored.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  },
};
