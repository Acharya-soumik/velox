import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  // Ensure proper response headers
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, must-revalidate'
  };

  try {
    const supabase = await createClient();
    
    // Get the current user first
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401, headers }
      );
    }

    const { resumeId, profileData, jobDescription } = await req.json();

    // Validate input
    if (!resumeId || !profileData || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers }
      );
    }

    // Verify resume ownership
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404, headers }
      );
    }

    // Prepare messages for the AI
    const messages = [
      {
        role: 'system',
        content: 'You are an expert resume tailoring assistant that provides responses in JSON format.'
      },
      {
        role: 'user',
        content: `
          Analyze this job description and candidate profile to create a tailored resume.
          Provide your response in this exact JSON format:
          {
            "tailoredContent": {
              // Modified version of the profile data
            },
            "missingInformation": [
              {
                "id": string,
                "type": "text" | "textarea",
                "label": string,
                "description": string,
                "placeholder": string,
                "required": boolean
              }
            ],
            "suggestions": string[]
          }

          Job Description:
          ${jobDescription}

          Candidate Profile:
          ${JSON.stringify(profileData, null, 2)}

          Focus on:
          1. Tailoring the content to match job requirements
          2. Identifying missing skills or experiences
          3. Suggesting improvements and highlights
        `
      }
    ];

    try {
      // Validate environment variables
      if (!process.env.DEEPSEEK_API_BASE_URL || !process.env.DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API configuration missing');
      }

      // Use DeepSeek API
      const response = await fetch(`${process.env.DEEPSEEK_API_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        })
      });

      // Check for non-200 response
      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API error response:', errorText);
        return NextResponse.json(
          { error: "AI service unavailable" },
          { status: 503, headers }
        );
      }

      // Validate content type
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const errorText = await response.text();
        console.error('Invalid content type:', contentType, 'Response:', errorText);
        return NextResponse.json(
          { error: "Invalid response from AI service" },
          { status: 503, headers }
        );
      }

      const completion = await response.json();
      
      if (!completion?.choices?.[0]?.message?.content) {
        console.error('Unexpected API response structure:', completion);
        return NextResponse.json(
          { error: "Invalid response from AI service" },
          { status: 503, headers }
        );
      }

      const analysisText = completion.choices[0].message.content;
      
      // Validate JSON response
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
        
        // Validate required fields
        if (!analysis.tailoredContent || !Array.isArray(analysis.missingInformation) || !Array.isArray(analysis.suggestions)) {
          throw new Error('Invalid analysis format');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', analysisText);
        return NextResponse.json(
          { error: "Invalid response format from AI service" },
          { status: 503, headers }
        );
      }

      // Update the resume with the analysis
      const { error: updateError } = await supabase
        .from("resumes")
        .update({
          content: {
            ...profileData,
            aiAnalysis: {
              suggestions: analysis.suggestions,
              needsMoreInfo: analysis.missingInformation.length > 0,
              questions: analysis.missingInformation
            },
            tailoredContent: analysis.tailoredContent,
            lastUpdated: new Date().toISOString()
          }
        })
        .eq("id", resumeId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error('Failed to update resume:', updateError);
        return NextResponse.json(
          { error: "Failed to save analysis results" },
          { status: 500, headers }
        );
      }

      return NextResponse.json({
        success: true,
        needsMoreInfo: analysis.missingInformation.length > 0,
        questions: analysis.missingInformation
      }, { headers });
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      
      // Fallback to mock analysis if AI fails
      const mockAnalysis = {
        success: true,
        needsMoreInfo: true,
        questions: [
          {
            id: "relevantProjects",
            type: "textarea",
            label: "Relevant Projects",
            description: "Please describe any projects that are relevant to this role",
            placeholder: "Describe your projects...",
            required: true
          }
        ]
      };

      // Update with mock content
      const { error: updateError } = await supabase
        .from("resumes")
        .update({
          content: {
            ...profileData,
            aiAnalysis: {
              suggestions: ["Add more details about your technical projects"],
              needsMoreInfo: true,
              questions: mockAnalysis.questions
            },
            tailoredContent: profileData,
            lastUpdated: new Date().toISOString()
          }
        })
        .eq("id", resumeId)
        .eq("user_id", user.id);

      if (updateError) {
        console.error('Failed to update resume with mock data:', updateError);
        return NextResponse.json(
          { error: "Failed to save analysis results" },
          { status: 500, headers }
        );
      }

      return NextResponse.json(mockAnalysis, { headers });
    }
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500, headers }
    );
  }
} 
