
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  propertyType?: string;
  location?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received contact form submission");
    
    const formData: ContactFormRequest = await req.json();
    console.log("Form data:", formData);

    // Send email to business
    const businessEmailResponse = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: ["appletechbusinesssolutions@gmail.com"],
      subject: `New Contact Form Submission - ${formData.service || 'General Inquiry'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Contact Details:</h3>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          ${formData.phone ? `<p><strong>Phone:</strong> ${formData.phone}</p>` : ''}
          ${formData.service ? `<p><strong>Service Needed:</strong> ${formData.service}</p>` : ''}
          ${formData.propertyType ? `<p><strong>Property Type:</strong> ${formData.propertyType}</p>` : ''}
          ${formData.location ? `<p><strong>Preferred Location:</strong> ${formData.location}</p>` : ''}
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3>Message:</h3>
          <p style="white-space: pre-wrap;">${formData.message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px;">
          <p style="margin: 0; color: #0066cc;">
            <strong>Action Required:</strong> Please respond to this inquiry within 4 hours to maintain premium service standards.
          </p>
        </div>
      `,
    });

    console.log("Business email sent:", businessEmailResponse);

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "ABS Business Solutions <onboarding@resend.dev>",
      to: [formData.email],
      subject: "Thank you for contacting ABS Business Solutions",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #D4AF37, #B8860B); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Thank You, ${formData.name}!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your premium service experience begins now</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thank you for reaching out to ABS Business Solutions. We have received your inquiry and our luxury property experts will respond within <strong>4 hours</strong>.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #D4AF37; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Your Inquiry Summary:</h3>
              ${formData.service ? `<p style="margin: 5px 0;"><strong>Service:</strong> ${formData.service}</p>` : ''}
              ${formData.propertyType ? `<p style="margin: 5px 0;"><strong>Property Type:</strong> ${formData.propertyType}</p>` : ''}
              ${formData.location ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${formData.location}</p>` : ''}
            </div>
            
            <div style="background: linear-gradient(135deg, #D4AF37, #B8860B); padding: 20px; border-radius: 8px; color: white; text-align: center; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">What happens next?</h3>
              <p style="margin: 0; font-size: 14px;">✓ Expert review of your requirements<br>✓ Personalized property recommendations<br>✓ Direct contact from our premium team</p>
            </div>
            
            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
              Need immediate assistance? Call us at <strong>+260 972 333 053</strong><br>
              Email: appletechbusinesssolutions@gmail.com
            </p>
          </div>
        </div>
      `,
    });

    console.log("Customer email sent:", customerEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact form submitted successfully",
        businessEmailId: businessEmailResponse.data?.id,
        customerEmailId: customerEmailResponse.data?.id
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
