export class AnalystNotesEngine {
  static generateNotes({ percentGrowth, topHoldingPct, yearsInvested, riskCategory, liquidityPreference, esgScore }) {
    const notes = [];

    // Combination-based messages
    if (percentGrowth < 0 && topHoldingPct > 0.75) {
      notes.push("🔻 The portfolio is underperforming and heavily concentrated. Rebalancing and risk review are advised.");
    }

    if (riskCategory === 'High' && esgScore < 50) {
      notes.push("⚠️ High-risk portfolio with low ESG alignment. Consider impact-focused growth alternatives.");
    }

    if (yearsInvested > 7 && liquidityPreference === 'Low') {
      notes.push("📈 Long-term horizon and low liquidity needs align well with compounding strategies.");
    }

    if (yearsInvested < 3 && liquidityPreference === 'High') {
      notes.push("💡 With a short time horizon and high liquidity preference, focus on capital preservation.");
    }

    if (percentGrowth > 15 && esgScore >= 80) {
      notes.push("🌟 Strong growth coupled with high ESG alignment — an excellent strategic position.");
    }

    if (topHoldingPct > 0.9 && riskCategory === 'Low') {
      notes.push("❗ High concentration conflicts with a low-risk appetite. Reassess portfolio construction.");
    }

    if (riskCategory === 'Moderate' && percentGrowth < 0) {
      notes.push("📉 Moderate risk tolerance with recent losses — reassess asset mix for balance and protection.");
    }

    if (liquidityPreference === 'High' && esgScore > 80) {
      notes.push("🌍 ESG-focused investor with high liquidity needs — explore ethical short-duration funds.");
    }

    if (riskCategory === 'Low' && percentGrowth > 10) {
      notes.push("📊 Conservative investor seeing strong returns — ensure profits align with long-term goals.");
    }

    if (esgScore >= 80 && topHoldingPct < 0.25) {
      notes.push("🌿 ESG-aligned and diversified — portfolio supports sustainability and reduces concentration risk.");
    }

    if (percentGrowth < -10 && esgScore < 40) {
      notes.push("⚠️ Poor performance with minimal ESG integration — consider re-evaluating strategy and impact.");
    }

    if (riskCategory === 'High' && liquidityPreference === 'Low' && percentGrowth > 20) {
      notes.push("💼 Aggressive strategy yielding strong returns — consider locking in gains or rebalancing.");
    }

    if (riskCategory === 'Low' && topHoldingPct > 0.8) {
      notes.push("⚖️ Conservative profile with a dominant holding — this may expose the portfolio to unwanted volatility.");
    }

    if (esgScore > 80 && percentGrowth < 0) {
      notes.push("♻️ ESG values are strong, but performance has lagged — assess sustainability vs. returns.");
    }

    if (topHoldingPct < 0.25 && riskCategory === 'High') {
      notes.push("🌍 Broad diversification supports your high-risk appetite — look for opportunistic growth.");
    }

    // If fewer than 3 combination-based notes are added, use fallback logic
    while (notes.length < 3) {
      if (percentGrowth < -15) {
        notes.push("📉 The portfolio has experienced a sharp decline. Immediate review of high-risk assets is recommended.");
      } else if (percentGrowth < -5) {
        notes.push("⚠️ Portfolio value has decreased moderately. Evaluate market conditions and portfolio composition.");
      } else if (percentGrowth < 5) {
        notes.push("⏸️ Portfolio growth is stagnant. Consider reallocating toward higher-performing asset classes.");
      } else if (percentGrowth < 15) {
        notes.push("📈 Portfolio is growing steadily. Maintain diversification and monitor market trends.");
      } else {
        notes.push("🚀 Exceptional portfolio growth! Strategy appears well-optimized for current conditions.");
      }

      if (topHoldingPct > 0.9) {
        notes.push("🔴 Over 90% of the portfolio is in one holding. This poses a major concentration risk.");
      } else if (topHoldingPct > 0.75) {
        notes.push("🟠 High concentration detected. Diversification may reduce portfolio volatility.");
      } else if (topHoldingPct > 0.5) {
        notes.push("🟡 Top holding is significant. Ensure alignment with investment objectives.");
      } else {
        notes.push("✅ Well-diversified portfolio. No significant concentration risks detected.");
      }

      if (riskCategory === 'High') {
        notes.push("🔥 High-risk appetite detected. Ensure asset volatility aligns with your tolerance and goals.");
      } else if (riskCategory === 'Moderate') {
        notes.push("🌀 Moderate risk profile. Diversification and regular reviews are essential.");
      } else if (riskCategory === 'Low') {
        notes.push("🛡️ Conservative investor. Focus on capital preservation and income-generating assets.");
      }

      if (liquidityPreference === 'High') {
        notes.push("💧 Preference for liquidity noted. Avoid long lock-in periods and favor flexible instruments.");
      } else if (liquidityPreference === 'Moderate') {
        notes.push("🔄 Balanced liquidity needs. Blend between growth and accessible instruments is suitable.");
      } else if (liquidityPreference === 'Low') {
        notes.push("🔒 Long-term lock-in acceptable. Optimize for yield and compounding potential.");
      }

      if (esgScore >= 80) {
        notes.push("🌱 Portfolio is strongly aligned with ESG principles. Positive impact and sustainability potential.");
      } else if (esgScore >= 50) {
        notes.push("♻️ Moderate ESG alignment. Consider increasing allocation to responsible investments.");
      } else {
        notes.push("⚙️ Limited ESG focus. Opportunities exist to align investments with sustainability goals.");
      }

      if (yearsInvested < 1) {
        notes.push("🍼 Portfolio is in its infancy. Conservative strategies and capital preservation are key.");
      } else if (yearsInvested < 3) {
        notes.push("📅 Medium-term investor. Blending stable and growth assets can help build momentum.");
      } else if (yearsInvested < 7) {
        notes.push("⏳ Solid investment history. Consider rebalancing toward long-term growth opportunities.");
      } else if (yearsInvested < 15) {
        notes.push("🏗️ Established investor. Optimize for long-term compounding and diversification.");
      } else {
        notes.push("🏆 Veteran portfolio. Legacy planning and yield-focused strategies may be appropriate.");
      }
    }

    notes.push("📌 Keep an eye on management fees as they can impact long-term growth.");
    notes.push("🌪️ Consider how macroeconomic shifts could affect your portfolio mix.");
    notes.push("🛠️ Ensure your portfolio reflects your evolving personal and financial goals.");
    notes.push("🧩 A periodic strategy review can improve alignment between performance and risk.");
    notes.push("🧭 Stick to your plan, but stay adaptable to market signals and life changes.");

    // Return the first 3 most relevant notes
    return notes.slice(0, 3);
  }
}