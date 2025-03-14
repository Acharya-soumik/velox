import { ResumeData } from "@/app/resume/constants";
import { ReactNode } from "react";

interface ModernTemplateProps {
  data: ResumeData;
  className?: string;
}

export function ModernTemplate({ data, className = "" }: ModernTemplateProps) {
  return (
    <div className={`max-w-[800px] mx-auto p-8 ${className}`}>
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{data.personalInfo.name}</h1>
        <p className="text-xl text-muted-foreground mb-4">{data.personalInfo.title}</p>
        <div className="flex justify-center gap-4 text-sm text-muted-foreground">
          <span>{data.personalInfo.contact.email}</span>
          <span>{data.personalInfo.contact.phone}</span>
          {data.personalInfo.contact.socialLinks.linkedin && (
            <span>LinkedIn</span>
          )}
          {data.personalInfo.contact.socialLinks.github && (
            <span>GitHub</span>
          )}
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 pb-2 border-b">Summary</h2>
        <p className="text-muted-foreground">{data.summary}</p>
      </section>

      {/* Technical Skills */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 pb-2 border-b">Technical Skills</h2>
        <div className="grid gap-4">
          {Object.entries(data.technicalSkills).map(([category, skills]: [string, string[]]) => (
            <div key={category}>
              <h3 className="font-medium capitalize mb-2">
                {category.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <p className="text-muted-foreground">
                {skills.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 pb-2 border-b">Experience</h2>
        <div className="space-y-6">
          {data.experience.map((exp, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{exp.company}</h3>
                  <p className="text-muted-foreground">{exp.position}</p>
                </div>
                <span className="text-sm text-muted-foreground">{exp.duration}</span>
              </div>
              {exp.responsibilities && (
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {exp.responsibilities.map((resp: string, i: number) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              )}
              {exp.technologies && (
                <p className="text-sm mt-2">
                  <strong>Technologies:</strong>{" "}
                  <span className="text-muted-foreground">
                    {exp.technologies.join(", ")}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 pb-2 border-b">Education</h2>
        <div className="space-y-4">
          {data.education.map((edu, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{edu.institution}</h3>
                  {edu.degree && (
                    <p className="text-muted-foreground">{edu.degree}</p>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{edu.year}</span>
              </div>
              {edu.courses && (
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  {edu.courses.map((course: string, i: number) => (
                    <li key={i}>{course}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3 pb-2 border-b">Achievements</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {data.achievements.map((achievement: string, index: number) => (
              <li key={index}>{achievement}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
} 
