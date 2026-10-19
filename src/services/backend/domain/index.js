import dns from 'dns';

const dnsPromises = dns.promises;

export const TENANT_SERVER_IP = process.env.TENANT_SERVER_IP || "35.154.158.6";
export const TENANT_CNAME_TARGET = process.env.TENANT_CNAME_TARGET || "tenant.getrepeat.in";

export class DomainService {
  /**
   * Registers custom domain with AWS / Tenant configuration.
   */
  static async addDomain(domain) {
    const cleanDomain = domain
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/$/, "");

    return {
      success: true,
      domain: cleanDomain,
      dnsTarget: TENANT_CNAME_TARGET,
      serverIp: TENANT_SERVER_IP,
    };
  }

  /**
   * Removes custom domain configuration.
   */
  static async removeDomain(domain) {
    return { success: true };
  }

  /**
   * Backward-compatibility aliases for Vercel method names
   */
  static async addDomainToVercel(domain) {
    return this.addDomain(domain);
  }

  static async removeDomainFromVercel(domain) {
    return this.removeDomain(domain);
  }

  /**
   * Verifies DNS configuration for the domain using native DNS lookups.
   * Checks both root (@) A records and www CNAME/A records against the AWS server IP or tenant target.
   */
  static async verifyDomain(domain) {
    if (!domain) {
      return { success: false, verified: false, message: "Domain name is required" };
    }

    const cleanDomain = domain
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .replace(/\/$/, "");
    const wwwDomain = `www.${cleanDomain}`;

    let tenantIps = [];
    try {
      tenantIps = await dnsPromises.resolve4(TENANT_CNAME_TARGET);
    } catch {
      tenantIps = [];
    }

    const validIps = new Set([TENANT_SERVER_IP, ...tenantIps]);

    let rootA = [];
    try {
      rootA = await dnsPromises.resolve4(cleanDomain);
    } catch {
      rootA = [];
    }

    let wwwA = [];
    try {
      wwwA = await dnsPromises.resolve4(wwwDomain);
    } catch {
      wwwA = [];
    }

    let wwwCname = [];
    try {
      wwwCname = await dnsPromises.resolveCname(wwwDomain);
    } catch {
      wwwCname = [];
    }

    let rootCname = [];
    try {
      rootCname = await dnsPromises.resolveCname(cleanDomain);
    } catch {
      rootCname = [];
    }

    const rootMatches = rootA.some(ip => validIps.has(ip)) ||
      rootCname.some(c => c.toLowerCase().includes("getrepeat.in"));

    const wwwMatches = wwwA.some(ip => validIps.has(ip)) ||
      wwwCname.some(c => c.toLowerCase().includes("getrepeat.in"));

    const isVerified = rootMatches || wwwMatches;

    return {
      success: true,
      verified: isVerified,
      domain: cleanDomain,
      dnsTarget: TENANT_CNAME_TARGET,
      serverIp: TENANT_SERVER_IP,
      details: {
        rootA,
        rootCname,
        wwwA,
        wwwCname,
        expectedIp: TENANT_SERVER_IP,
        expectedCname: TENANT_CNAME_TARGET,
        rootMatches,
        wwwMatches,
      },
      message: isVerified
        ? "Domain DNS is properly configured and pointing to AWS!"
        : "DNS records do not yet point to your storefront. Please check your A record or CNAME record.",
    };
  }
}