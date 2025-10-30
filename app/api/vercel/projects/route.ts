import { NextResponse } from 'next/server';

export async function GET() {
  const vercelToken = process.env.VERCEL_API_TOKEN;

  if (!vercelToken) {
    return NextResponse.json(
      { 
        error: 'Vercel API token not configured :(',
        message: 'Please add VERCEL_API_TOKEN to your .env.local file'
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://api.vercel.com/v9/projects', {
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Vercel API error:', response.status, errorData);
      
      return NextResponse.json(
        { 
          error: `Vercel API error: ${response.status}`,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.projects) {
      return NextResponse.json(
        { error: 'No projects found in response' },
        { status: 500 }
      );
    }

    const projectsWithDeployments = await Promise.all(
      data.projects.map(async (project: any) => {
        try {
          const deploymentResponse = await fetch(
            `https://api.vercel.com/v6/deployments?projectId=${project.id}&limit=1`,
            {
              headers: {
                Authorization: `Bearer ${vercelToken}`,
              },
              cache: 'no-store',
            }
          );

          if (deploymentResponse.ok) {
            const deploymentData = await deploymentResponse.json();
            return {
              ...project,
              latestDeployments: deploymentData.deployments || [],
            };
          }
        } catch (err) {
          console.error(`Error fetching deployments for ${project.name}:`, err);
        }
        return project;
      })
    );

    return NextResponse.json({
      projects: projectsWithDeployments,
    });
  } catch (error) {
    console.error('Error fetching Vercel projects:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch projects from Vercel',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}