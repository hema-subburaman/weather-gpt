import { useState } from "react";
import "../App.css";

/* =========================================================
   RISK LEVEL
========================================================= */

function getRiskLevel(weather) {
  const temp = weather.main.temp;
  const humidity = weather.main.humidity;
  const wind = weather.wind.speed;
  const condition = weather.weather[0].main;

  if (
    condition === "Thunderstorm" ||
    temp >= 35 ||
    wind >= 10 ||
    humidity >= 85
  ) {
    return "High";
  }

  if (
    condition === "Rain" ||
    condition === "Drizzle" ||
    temp >= 30 ||
    humidity >= 70 ||
    wind >= 6
  ) {
    return "Medium";
  }

  return "Low";
}

/* =========================================================
   WHAT-IF ANALYSIS
========================================================= */

function analyzeWhatIf(weather) {
  const temp = weather.main.temp;
  const humidity = weather.main.humidity;
  const wind = weather.wind.speed;
  const condition = weather.weather[0].main;
  const description = weather.weather[0].description;

  let risk = "Low";
  const reasons = [];

  if (temp >= 35) {
    risk = "High";
    reasons.push(`high temperature (${temp.toFixed(1)}°C)`);
  } else if (temp >= 30) {
    risk = "Medium";
    reasons.push(`warm temperature (${temp.toFixed(1)}°C)`);
  }

  if (humidity >= 80) {
    risk = "High";
    reasons.push(`high humidity (${humidity}%)`);
  } else if (humidity >= 70) {
    if (risk === "Low") {
      risk = "Medium";
    }
    reasons.push(`high humidity (${humidity}%)`);
  }

  if (wind >= 10) {
    risk = "High";
    reasons.push(`strong wind (${wind.toFixed(1)} m/s)`);
  } else if (wind >= 6) {
    if (risk === "Low") {
      risk = "Medium";
    }
    reasons.push(`moderate-to-strong wind (${wind.toFixed(1)} m/s)`);
  }

  if (
    condition === "Rain" ||
    condition === "Drizzle" ||
    condition === "Thunderstorm"
  ) {
    risk = "High";
    reasons.push(`current condition is ${description}`);
  }

  let recommendation;

  if (risk === "High") {
    recommendation =
      "It is better to postpone this activity or choose a safer alternative.";
  } else if (risk === "Medium") {
    recommendation =
      "The activity is possible, but reduce duration or intensity and take suitable precautions.";
  } else {
    recommendation =
      "The current weather conditions are generally suitable for this activity.";
  }

  return {
    risk,
    reasons,
    recommendation,
  };
}

/* =========================================================
   CURRENT WEATHER QUESTION ANALYSIS
========================================================= */

function analyzeQuestion(question, weather) {
  const q = question.toLowerCase().trim();

  const temp = weather.main.temp;
  const feelsLike = weather.main.feels_like;
  const humidity = weather.main.humidity;
  const wind = weather.wind.speed;
  const visibility = weather.visibility ? weather.visibility / 1000 : null;

  const condition = weather.weather[0].main;
  const description = weather.weather[0].description;

  let response = "";
  let recommendation = "";

  /* =======================================================
     1. RAIN / UMBRELLA
     Must come before generic weather conditions.
  ======================================================= */

  const isRainQuestion =
    q.includes("umbrella") ||
    q.includes("rain") ||
    q.includes("raining") ||
    q.includes("rainy");

  if (isRainQuestion) {
    const isRaining =
      condition === "Rain" ||
      condition === "Drizzle" ||
      condition === "Thunderstorm";

    if (isRaining) {
      response = `Yes, carrying an umbrella is recommended because the current weather condition is ${description}.`;

      recommendation = "Carry an umbrella and be prepared for wet conditions.";
    } else {
      response = `The current weather condition is ${description}, so rain is not currently reported.`;

      recommendation =
        "An umbrella is not currently necessary based on the available current weather data.";
    }
  } else if (

  /* =======================================================
     2. TEMPERATURE / HOT / COLD
     
     IMPORTANT:
     This comes BEFORE "outside/outdoor".
     
     So:
     "Is it too hot outside?"
     will correctly enter this block instead of Outdoor.
  ======================================================= */
    q.includes("too hot") ||
    q.includes("very hot") ||
    q.includes("extremely hot") ||
    q.includes("hot outside") ||
    q.includes("hot weather") ||
    q.includes("is it hot") ||
    q.includes("too cold") ||
    q.includes("very cold") ||
    q.includes("extremely cold") ||
    q.includes("cold outside") ||
    q.includes("cold weather") ||
    q.includes("is it cold") ||
    q.includes("temperature") ||
    q === "hot" ||
    q === "cold"
  ) {
    response = `The current temperature is ${temp.toFixed(
      1,
    )}°C and it feels like ${feelsLike.toFixed(1)}°C.`;

    /* ---------- HOT ---------- */

    if (q.includes("hot") || q.includes("warm")) {
      if (feelsLike >= 38 || temp >= 35) {
        response += ` It feels very hot because the apparent temperature is ${feelsLike.toFixed(
          1,
        )}°C, with humidity at ${humidity}%.`;

        recommendation =
          "Avoid prolonged outdoor exposure, stay hydrated, and take breaks in a cool place.";
      } else if (feelsLike >= 32 || temp >= 30) {
        response += ` It feels warm to hot, especially because the humidity is ${humidity}%.`;

        recommendation =
          "Stay hydrated and avoid prolonged outdoor activity during the hottest part of the day.";
      } else {
        response +=
          " The temperature is not particularly hot based on the current weather data.";

        recommendation =
          "Normal outdoor activity should generally be comfortable from a temperature perspective.";
      }
    } else if (q.includes("cold") || q.includes("cool")) {

    /* ---------- COLD ---------- */
      if (temp <= 10) {
        response += " The current temperature indicates very cold conditions.";

        recommendation =
          "Wear warm clothing and limit prolonged exposure to the cold.";
      } else if (temp <= 18) {
        response +=
          " The current temperature indicates cool to cold conditions.";

        recommendation = "Consider wearing suitable warm clothing outdoors.";
      } else {
        response +=
          " The current temperature does not indicate particularly cold conditions.";

        recommendation =
          "Normal clothing should generally be sufficient based on temperature.";
      }
    } else {

    /* ---------- DIRECT TEMPERATURE QUESTION ---------- */
      if (temp >= 35) {
        recommendation =
          "Very warm conditions. Avoid prolonged outdoor exposure.";
      } else if (temp >= 30) {
        recommendation =
          "Warm conditions. Stay hydrated during outdoor activities.";
      } else if (temp <= 10) {
        recommendation = "Cold conditions. Consider wearing warm clothing.";
      } else {
        recommendation = "The temperature is currently moderate.";
      }
    }
  } else if (

  /* =======================================================
     3. RUNNING / EXERCISE
     
     This comes before generic outdoor activity.
  ======================================================= */
    q.includes("running") ||
    q.includes("run") ||
    q.includes("jogging") ||
    q.includes("jog") ||
    q.includes("exercise") ||
    q.includes("workout")
  ) {
    const reasons = [];

    if (temp >= 35) {
      reasons.push(`the temperature is high at ${temp.toFixed(1)}°C`);
    } else if (temp >= 30) {
      reasons.push(`the temperature is warm at ${temp.toFixed(1)}°C`);
    }

    if (feelsLike >= 35) {
      reasons.push(`it feels like ${feelsLike.toFixed(1)}°C`);
    }

    if (humidity >= 80) {
      reasons.push(`humidity is high at ${humidity}%`);
    } else if (humidity >= 70) {
      reasons.push(`humidity is ${humidity}%`);
    }

    if (wind >= 10) {
      reasons.push(`strong wind is present at ${wind.toFixed(1)} m/s`);
    } else if (wind >= 6) {
      reasons.push(`wind speed is ${wind.toFixed(1)} m/s`);
    }

    if (
      condition === "Rain" ||
      condition === "Drizzle" ||
      condition === "Thunderstorm"
    ) {
      reasons.push(`the weather condition is ${description}`);
    }

    if (visibility !== null && visibility < 5) {
      reasons.push(`visibility is reduced to ${visibility.toFixed(1)} km`);
    }

    if (reasons.length === 0) {
      response = `The current conditions look reasonably suitable for running. The temperature is ${temp.toFixed(
        1,
      )}°C with ${humidity}% humidity.`;

      recommendation =
        "A normal run should be reasonable under the current conditions.";
    } else {
      response = `Running may be uncomfortable because ${reasons.join(", ")}.`;

      recommendation =
        "If you run, consider reducing the duration or intensity, stay hydrated, and stop if you feel uncomfortable.";
    }
  } else if (

  /* =======================================================
     4. OUTDOOR ACTIVITY
     
     IMPORTANT:
     Only reaches here when the question is genuinely
     about outdoor activity.
  ======================================================= */
    q.includes("outdoor activity") ||
    q.includes("outdoor") ||
    q.includes("outside") ||
    q.includes("go outside") ||
    q.includes("outdoor event")
  ) {
    const reasons = [];

    if (temp >= 35) {
      reasons.push(`the temperature is high at ${temp.toFixed(1)}°C`);
    } else if (temp >= 30) {
      reasons.push(`the temperature is warm at ${temp.toFixed(1)}°C`);
    }

    if (feelsLike >= 35) {
      reasons.push(`it feels like ${feelsLike.toFixed(1)}°C`);
    }

    if (humidity >= 70) {
      reasons.push(`humidity is high at ${humidity}%`);
    }

    if (wind >= 6) {
      reasons.push(`wind speed is ${wind.toFixed(1)} m/s`);
    }

    if (
      condition === "Rain" ||
      condition === "Drizzle" ||
      condition === "Thunderstorm"
    ) {
      reasons.push(`the current condition is ${description}`);
    }

    if (reasons.length === 0) {
      response = `Current conditions look generally suitable for outdoor activity. The weather is ${description} with a temperature of ${temp.toFixed(
        1,
      )}°C.`;

      recommendation = "Outdoor activity is generally suitable.";
    } else {
      response = `Outdoor activity may require some caution because ${reasons.join(
        ", ",
      )}.`;

      recommendation =
        "Consider keeping the activity shorter and adjust the intensity according to the current conditions.";
    }
  } else if (q.includes("wind") || q.includes("windy")) {

  /* =======================================================
     5. WIND
  ======================================================= */
    response = `The current wind speed is ${wind.toFixed(1)} m/s.`;

    if (wind >= 10) {
      recommendation =
        "Strong winds are present. Outdoor activities may be risky.";
    } else if (wind >= 6) {
      recommendation =
        "Moderate to strong winds are present. Take some caution outdoors.";
    } else {
      recommendation = "Wind conditions are relatively calm.";
    }
  } else if (q.includes("humidity") || q.includes("humid")) {

  /* =======================================================
     6. HUMIDITY
  ======================================================= */
    response = `The current humidity is ${humidity}%.`;

    if (humidity >= 80) {
      recommendation =
        "High humidity may make outdoor activities feel uncomfortable.";
    } else if (humidity >= 60) {
      recommendation =
        "Humidity is moderately high and may increase discomfort in warm weather.";
    } else {
      recommendation = "Humidity is relatively comfortable.";
    }
  } else if (

  /* =======================================================
     7. VISIBILITY
  ======================================================= */
    q.includes("visibility") ||
    q.includes("visible") ||
    q.includes("fog")
  ) {
    if (visibility !== null) {
      response = `Current visibility is ${visibility.toFixed(1)} km.`;

      if (visibility < 2) {
        recommendation =
          "Poor visibility. Take extra caution while travelling.";
      } else if (visibility < 5) {
        recommendation =
          "Visibility is moderate. Be cautious while travelling.";
      } else {
        recommendation = "Visibility is generally good.";
      }
    } else {
      response =
        "Visibility data is not available from the current weather response.";

      recommendation = "No visibility-based recommendation can be made.";
    }
  } else {

  /* =======================================================
     8. GENERIC CURRENT WEATHER
  ======================================================= */
    response = `The current weather in ${
      weather.name
    } is ${description}. The temperature is ${temp.toFixed(
      1,
    )}°C, humidity is ${humidity}%, and wind speed is ${wind.toFixed(1)} m/s.`;

    recommendation =
      "This assessment is based on the current weather factors available from the weather API.";
  }

  return {
    response,
    recommendation,
    risk: getRiskLevel(weather),
    weatherData: {
      temperature: temp,
      feelsLike,
      humidity,
      wind,
      visibility,
      condition: description,
    },
  };
}

/* =========================================================
   VERIFY CLAIM
========================================================= */

function verifyClaim(claim, weather) {
  const text = claim.toLowerCase().trim();

  const condition = weather.weather[0].main.toLowerCase();
  const description = weather.weather[0].description;
  const temp = weather.main.temp;
  const feelsLike = weather.main.feels_like;
  const humidity = weather.main.humidity;
  const wind = weather.wind.speed;

  /* -------------------------------------------------------
     OFFICIAL WARNINGS
  ------------------------------------------------------- */

  if (
    text.includes("cyclone") ||
    text.includes("warning") ||
    text.includes("alert") ||
    text.includes("storm warning")
  ) {
    return {
      status: "unverified",
      explanation:
        "The current weather API data cannot verify official cyclone warnings or weather alerts.",
      factors:
        "An official weather warning source is required for this type of claim.",
    };
  }

  /* -------------------------------------------------------
     RAIN
  ------------------------------------------------------- */

  if (
    text.includes("rain") ||
    text.includes("raining") ||
    text.includes("rainy")
  ) {
    const verified =
      condition === "rain" ||
      condition === "drizzle" ||
      condition === "thunderstorm";

    return {
      status: verified ? "verified" : "contradicted",
      explanation: verified
        ? `The current weather data reports ${description}.`
        : `The current weather data reports ${description}, not rain.`,
      factors: `Weather condition: ${description}`,
    };
  }

  /* -------------------------------------------------------
     CLEAR
  ------------------------------------------------------- */

  if (
    text.includes("clear sky") ||
    text.includes("clear weather") ||
    text === "it is clear" ||
    text === "clear"
  ) {
    const verified = condition === "clear";

    return {
      status: verified ? "verified" : "contradicted",
      explanation: verified
        ? "The current weather condition is Clear."
        : `The current weather condition is ${description}.`,
      factors: `Weather condition: ${description}`,
    };
  }

  /* -------------------------------------------------------
     CLOUD
  ------------------------------------------------------- */

  if (
    text.includes("cloud") ||
    text.includes("cloudy") ||
    text.includes("overcast")
  ) {
    const verified = condition === "clouds";

    return {
      status: verified ? "verified" : "contradicted",
      explanation: verified
        ? "The current weather data reports cloudy conditions."
        : `The current weather data reports ${description}.`,
      factors: `Weather condition: ${description}`,
    };
  }

  /* -------------------------------------------------------
     HOT
  ------------------------------------------------------- */

  if (
    text.includes("hot") ||
    text.includes("very hot") ||
    text.includes("too hot")
  ) {
    const verified = temp >= 30 || feelsLike >= 32;

    return {
      status: verified ? "verified" : "contradicted",
      explanation: verified
        ? `The temperature is ${temp.toFixed(
            1,
          )}°C and it feels like ${feelsLike.toFixed(
            1,
          )}°C, which supports the claim that it is hot.`
        : `The temperature is ${temp.toFixed(
            1,
          )}°C and it feels like ${feelsLike.toFixed(
            1,
          )}°C, so the available data does not strongly support the claim that it is hot.`,
      factors: `Temperature: ${temp.toFixed(
        1,
      )}°C | Feels like: ${feelsLike.toFixed(1)}°C`,
    };
  }

  /* -------------------------------------------------------
     COLD
  ------------------------------------------------------- */

  if (
    text.includes("cold") ||
    text.includes("very cold") ||
    text.includes("too cold")
  ) {
    const verified = temp <= 18;

    return {
      status: verified ? "verified" : "contradicted",
      explanation: verified
        ? `The temperature is ${temp.toFixed(
            1,
          )}°C, which supports the claim that it is cold.`
        : `The temperature is ${temp.toFixed(
            1,
          )}°C, so the available data does not support the claim that it is cold.`,
      factors: `Temperature: ${temp.toFixed(1)}°C`,
    };
  }

  /* -------------------------------------------------------
     HUMIDITY
  ------------------------------------------------------- */

  if (text.includes("humid") || text.includes("humidity")) {
    const verified = humidity >= 60;

    return {
      status: verified ? "verified" : "contradicted",
      explanation: verified
        ? `The current humidity is ${humidity}%, which supports the claim of relatively high humidity.`
        : `The current humidity is ${humidity}%, so the available data does not support the claim of high humidity.`,
      factors: `Humidity: ${humidity}%`,
    };
  }

  /* -------------------------------------------------------
     WIND
  ------------------------------------------------------- */

  if (text.includes("wind") || text.includes("windy")) {
    const verified = wind >= 6;

    return {
      status: verified ? "verified" : "contradicted",
      explanation: verified
        ? `The current wind speed is ${wind.toFixed(
            1,
          )} m/s, indicating noticeable wind.`
        : `The current wind speed is ${wind.toFixed(
            1,
          )} m/s, so the available data does not indicate strong wind.`,
      factors: `Wind speed: ${wind.toFixed(1)} m/s`,
    };
  }

  /* -------------------------------------------------------
     DEFAULT
  ------------------------------------------------------- */

  return {
    status: "unverified",
    explanation:
      "This claim cannot be verified reliably using the currently available weather data.",
    factors:
      "The current weather API does not provide enough information to verify this claim.",
  };
}

/* =========================================================
   WEATHER FACTORS CARD
========================================================= */

function WeatherCard({ data }) {
  return (
    <div className="weather-card">
      <h4>Weather Factors Used</h4>

      <div className="weather-factors">
        <div>
          <span>Temperature</span>
          <strong>{data.temperature.toFixed(1)}°C</strong>
        </div>

        <div>
          <span>Feels Like</span>
          <strong>{data.feelsLike.toFixed(1)}°C</strong>
        </div>

        <div>
          <span>Humidity</span>
          <strong>{data.humidity}%</strong>
        </div>

        <div>
          <span>Wind</span>
          <strong>{data.wind.toFixed(1)} m/s</strong>
        </div>

        <div>
          <span>Condition</span>
          <strong>{data.condition}</strong>
        </div>

        {data.visibility !== null && (
          <div>
            <span>Visibility</span>
            <strong>{data.visibility.toFixed(1)} km</strong>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   WEATHER CHAT COMPONENT
========================================================= */

export default function WeatherChat({ weather }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendMessage = () => {
    if (!input.trim() || !weather) return;

    const question = input.trim();

    const userMessage = {
      type: "user",
      text: question,
    };

    let botMessage;

    /* ---------- VERIFY TAB ---------- */

    if (activeTab === "verify") {
      const result = verifyClaim(question, weather);

      botMessage = {
        type: "bot",
        verify: result,
      };
    } else if (activeTab === "what-if") {

    /* ---------- WHAT-IF TAB ---------- */
      const result = analyzeWhatIf(weather);

      botMessage = {
        type: "bot",
        whatIf: result,
        question,
      };
    } else {

    /* ---------- CHAT TAB ---------- */
      const result = analyzeQuestion(question, weather);

      botMessage = {
        type: "bot",
        ...result,
      };
    }

    setMessages((prev) => [...prev, userMessage, botMessage]);

    setInput("");
  };

  /* =======================================================
     QUICK QUESTION
  ======================================================= */

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="weather-gpt-shell">
      <div className="chat-header">
        <h2>WeatherGPT</h2>
        <p>Explainable AI for Weather Intelligence</p>
      </div>

      {/* ================= TABS ================= */}

      <div className="tab-nav">
        <button
          className={activeTab === "chat" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("chat")}
        >
          Chat
        </button>

        <button
          className={activeTab === "what-if" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("what-if")}
        >
          What-If
        </button>

        <button
          className={activeTab === "verify" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("verify")}
        >
          Verify Claim
        </button>
      </div>

      {/* ================= MESSAGES ================= */}

      <div className="message-list">
        {messages.length === 0 && (
          <div className="empty-state">
            <h3>Ask WeatherGPT</h3>

            <p>
              Ask questions about the current weather and get explainable
              recommendations.
            </p>

            <div className="quick-questions">
              <button
                onClick={() =>
                  handleQuickQuestion("Is it good for outdoor activity?")
                }
              >
                Is it good for outdoor activity?
              </button>

              <button
                onClick={() =>
                  handleQuickQuestion("Should I carry an umbrella?")
                }
              >
                Should I carry an umbrella?
              </button>

              <button
                onClick={() =>
                  handleQuickQuestion("What if I go for a run now?")
                }
              >
                What if I go for a run now?
              </button>

              <button
                onClick={() => handleQuickQuestion("Is it too hot outside?")}
              >
                Is it too hot outside?
              </button>
            </div>
          </div>
        )}

        {/* ================= MESSAGE RENDER ================= */}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.type === "user" ? "user-message" : "bot-message"
            }`}
          >
            {/* USER */}

            {message.type === "user" ? (
              <div className="user-bubble">{message.text}</div>
            ) : message.verify ? (
              /* ================= VERIFY ================= */

              <div className="bot-bubble">
                <div className={`verification-badge ${message.verify.status}`}>
                  {message.verify.status.toUpperCase()}
                </div>

                <p>{message.verify.explanation}</p>

                <p className="verification-factors">
                  <strong>Reason:</strong> {message.verify.factors}
                </p>

                <div className="sources">
                  <strong>Source:</strong> OpenWeather API
                </div>
              </div>
            ) : message.whatIf ? (
              /* ================= WHAT-IF ================= */

              <div className="bot-bubble">
                <div className="what-if-result">
                  <h4>What-If Analysis</h4>

                  <p>
                    <strong>Scenario:</strong> {message.question}
                  </p>

                  <div className="what-if-grid">
                    <div className="option-a">
                      <h5>Option A — Do It Now</h5>

                      <div
                        className={`risk-badge ${message.whatIf.risk.toLowerCase()}`}
                      >
                        Risk: {message.whatIf.risk}
                      </div>

                      <p>
                        Based on the current weather conditions, this activity
                        has a {message.whatIf.risk.toLowerCase()} risk level.
                      </p>

                      {message.whatIf.reasons.length > 0 && (
                        <ul>
                          {message.whatIf.reasons.map((reason, reasonIndex) => (
                            <li key={reasonIndex}>{reason}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="option-b">
                      <h5>Option B — Wait</h5>

                      <div className="risk-badge low">Risk: Low</div>

                      <p>
                        Waiting for more suitable weather conditions can reduce
                        weather-related discomfort and risk.
                      </p>
                    </div>
                  </div>

                  <div className="recommendation-box">
                    <strong>Recommendation</strong>

                    <p>{message.whatIf.recommendation}</p>
                  </div>

                  <div className="sources">
                    <strong>Source:</strong> OpenWeather API
                  </div>
                </div>
              </div>
            ) : (
              /* ================= CHAT ================= */

              <div className="bot-bubble">
                <div className={`risk-badge ${message.risk.toLowerCase()}`}>
                  Risk: {message.risk}
                </div>

                <p>{message.response}</p>

                <WeatherCard data={message.weatherData} />

                <div className="recommendation-box">
                  <strong>Recommendation</strong>

                  <p>{message.recommendation}</p>
                </div>

                <div className="sources">
                  <strong>Source:</strong> OpenWeather API
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ================= INPUT ================= */}

      <div className="chat-input">
        <input
          type="text"
          value={input}
          placeholder={
            activeTab === "verify"
              ? "Enter a weather claim to verify..."
              : activeTab === "what-if"
                ? "Ask a what-if weather question..."
                : "Ask WeatherGPT about the current weather..."
          }
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button className="send-btn" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
