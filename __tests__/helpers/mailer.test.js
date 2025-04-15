import { sendMail } from "../../helpers/mailer.js";
import nodemailer from "nodemailer";

// Import jest explicitly for mocks in ESM environment
import { jest } from "@jest/globals";

// Mock nodemailer properly
jest.mock("nodemailer", () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ response: "250 Message sent" }),
    }),
  };
});

describe("Mailer Helper", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it("should send an email successfully", async () => {
    const email = "test@example.com";
    const subject = "Test Subject";
    const text = "<p>Test email content</p>";

    await sendMail(email, subject, text);

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalledWith({
      from: process.env.SMTP_MAIL,
      to: email,
      subject: subject,
      html: text,
    });
  });

  it("should handle email sending errors", async () => {
    // Setup error scenario
    const error = new Error("Failed to send email");
    nodemailer.createTransport.mockReturnValueOnce({
      sendMail: jest.fn().mockRejectedValueOnce(error),
    });

    const consoleSpy = jest.spyOn(console, "log");

    const email = "test@example.com";
    const subject = "Test Subject";
    const text = "<p>Test email content</p>";

    const result = await sendMail(email, subject, text);

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("email not sent!");
    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(result).toEqual(error);
  });
});
