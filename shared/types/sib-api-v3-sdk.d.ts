declare module 'sib-api-v3-sdk' {
  export namespace ApiClient {
    interface instance {
      authentications: {
        'api-key': {
          apiKey: string;
        };
      };
    }
  }

  export class ApiClient {
    static instance: ApiClient.instance;
  }

  export class TransactionalEmailsApi {
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<any>;
  }

  export class SendSmtpEmail {
    to?: Array<{ email: string; name?: string }>;
    sender?: { email: string; name?: string };
    replyTo?: { email: string; name?: string };
    subject?: string;
    htmlContent?: string;
    textContent?: string;
  }
}