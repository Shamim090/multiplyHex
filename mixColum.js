function multiplyHexReduced(hex1, hex2) {
  // Convert hex strings to binary polynomials
  const poly1 = convertHexToPoly(hex1);
  const poly2 = convertHexToPoly(hex2);
  console.log(poly1);
  console.log(poly2);
  // Reduce the product polynomial using the irreducible polynomial for GF(2^8)
  const irreduciblePoly = [0, 0, 0, 1, 1, 0, 1, 1]; // Irreducible polynomial for GF(2^8) (binary representation)
  // Perform polynomial multiplication
  const { combinedResult, finalResult } = multiplyPolynomials(
    poly1,
    poly2,
    irreduciblePoly
  );
  console.log(finalResult);

  return { combinedResult, finalResult };
}

// Functions for conversion and operations (implement details as described earlier)
function convertHexToPoly(hex) {
  if (hex.length !== 2) {
    throw new Error("Invalid input: Hex string must be 2 digits long.");
  }
  // 1. Convert hex string to binary string with leading zeros
  const binary = hex
    .split("")
    .map((digit) => parseInt(digit, 16).toString(2).padStart(4, "0"));

  const binaryString = binary.join("");
  console.log("binary string:" + binaryString);

  // 2. Create a polynomial string based on the binary representation
  let polyString = "";
  for (let i = 0; i < binaryString.length; i++) {
    if (binaryString[i] === "1") {
      const power = binaryString.length - 1 - i;
      polyString += (power > 0 ? `x^${power}` : "1") + "+";
    }
  }

  // 3. Remove the trailing "+" sign
  return polyString.slice(0, -1);
}

function multiplyPolynomials(poly1, poly2, irreduciblePoly) {
  // Helper function to parse term and split it into coefficient and exponent
  function parseTerm(term) {
    const parts = term.split("^");
    const coef = extractCoefficient(term);
    const exp = parts.length > 1 ? parseInt(parts[1]) : 0;
    return [coef, exp];
  }

  function extractCoefficient(term) {
    // Regular expression to match the coefficient part of the term
    const coefficientRegex = /^(-?\d*)X/;

    // Match the coefficient part of the term using the regex
    const match = term.match(coefficientRegex);

    // If there's a match, return the coefficient, otherwise return 1 (if no coefficient is explicitly provided)
    return match ? parseInt(match[1]) || 1 : 1;
  }

  // Split the polynomials into individual terms
  const terms1 = poly1.split("+");
  const terms2 = poly2.split("+");

  // Initialize the result array
  const result = [];

  // Multiply each term of poly1 with each term of poly2
  terms1.forEach((term1) => {
    terms2.forEach((term2) => {
      // Parse terms
      const [coef1, exp1] = parseTerm(term1);
      const [coef2, exp2] = parseTerm(term2);

      // Multiply coefficients and add exponents
      const coefResult = coef1 * coef2;
      const expResult = exp1 + exp2;

      // Construct the multiplied term
      const multipliedTerm = `${coefResult === 0 ? "0" : coefResult}${
        expResult !== 0 ? "X^" + expResult : ""
      }`;
      result.push(multipliedTerm);
    });
  });

  // Combine like terms by summing coefficients
  const combinedResult = result.reduce((acc, term) => {
    const [coef, exp] = parseTerm(term);
    acc[exp] = (acc[exp] || 0) + coef;
    return acc;
  }, {});
  console.log(combinedResult);
  reducePolynomial(combinedResult, irreduciblePoly);
  console.log(combinedResult);

  // Construct the final result string
  const finalResult = Object.entries(combinedResult)
    .map(([exp, coef]) => {
      if (coef === 0) return "0";
      if (coef === 1) {
        if (exp === "0") return "1"; // For the constant term
        return "X" + (exp !== "1" ? "^" + exp : ""); // For terms with X
      }
      return coef + (exp !== "0" ? "X^" + exp : "");
    })
    .filter((term) => term !== "0")
    .join("+");

  return { combinedResult, finalResult };
}

function reducePolynomial(combinedResult, irreduciblePoly) {
  // Check if there is any key with exponent 8
  if (combinedResult.hasOwnProperty("8")) {
    // Remove the entry with exponent 8
    delete combinedResult["8"];
    // Increase the value for keys suggested by irreduciblePoly
    // If a key doesn't exist, it will be created and its value set to 1
    for (let i = 0; i < irreduciblePoly.length; i++) {
      if (irreduciblePoly[irreduciblePoly.length - i - 1] == 1) {
        const key = i.toString();
        combinedResult[key] = (combinedResult[key] || 0) + 1;
      }
    }
  }

  // Drop key-value pairs where the value is greater than 1
  for (const key in combinedResult) {
    if (combinedResult[key] > 1) {
      delete combinedResult[key];
    }
  }

  return combinedResult;
}

// Helper function for simplifying a single term (x^n)
function simplifyTerm(term) {
  const power = term.slice(1); // Extract the power (assuming format "x^n")
  return power === "0" ? "1" : `x^${power}`; // Replace x^0 with 1
}

function convertToNumber(obj) {
  // Initialize an array to store the binary digits
  const binaryArray = [];

  // Loop through each bit position (0 to 7)
  for (let i = 0; i <= 7; i++) {
    // Start from highest significant bit
    // If the current bit position is present in the object, set it to 1, otherwise set it to 0
    binaryArray.unshift(obj.hasOwnProperty(i.toString()) ? "1" : "0");
  }

  // Join the binary digits and pad it to make it 8-bit
  const binaryString = binaryArray.join("").padStart(8, "0");

  // Convert the binary string to hexadecimal
  const hexValue = parseInt(binaryString, 2).toString(16).toUpperCase();

  return { binary: binaryString, hex: hexValue };
}

function multiplyAndShow() {
  const hex1 = document.getElementById("hex1").value;
  const hex2 = document.getElementById("hex2").value;

  try {
const { combinedResult, finalResult } = multiplyHexReduced(hex1, hex2);
    const { binary: binaryString, hex: hexValue } =
      convertToNumber(combinedResult);
    const resultElement1 = document.getElementById("resultBinary");
    const resultElement2 = document.getElementById("resultHex");
    if (hex1 == 0 || hex2 == 0) {
      // const { binary, hex } = convertPolyToHex(combinedResult);

      resultElement1.textContent = `Reduced Binary: 00000000`;

      resultElement2.textContent = `Reduced Hex: 00`;
    } else {
      resultElement1.textContent = `Reduced Binary: ${binaryString}`;
      resultElement2.textContent = `Reduced Hex:${hexValue}`;
    }
    }
  catch (error) {
    console.error("Error:", error);
    alert(
      "Invalid input or error occurred. Please check the values and try again."
    );
  }
}
