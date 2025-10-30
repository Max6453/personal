import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(request: Request) {
  try {
    const { ticket } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'Webhub Support <onboarding@resend.dev>',
      to: [ADMIN_EMAIL!],
      subject: `New Support Ticket: ${ticket.subject}`,
      html: `
        <h2>New Support Ticket Received</h2>
        <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
        <p><strong>From:</strong> ${ticket.email}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Description:</strong></p>
        <p>${ticket.description}</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send notification email' },
      { status: 500 }
    );
  }
}