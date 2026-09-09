import { useState } from "react";
import "../App.css";

/* =========================================================
   WEATHER RISK ENGINE
========================================================= */

const getRiskLevel = (weather) => {
  if (!weather) return "low";

  const temp = weather.main?.temp ?? 0;
  const humidity = weather.main?.humidity ?? 0;
  const wind = weather.wind?.speed ?? 0;
  const condition = weather.weather?.[0]?.main?.toLowerCase() ?? "";

  if (
    condition.includes("thunderstorm") ||
    temp >= 35 ||
    wind >= 10 ||
    humidity >= 85
  ) {
    return "high";
  }

  if (
    condition.includes("rain") ||
    condition.includes("drizzle") ||
    temp >= 30 ||
    humidity >= 70 ||
    wind >= 6
  ) {
    return "medium";
  }

  return "low";
};

/* =========================================================
   COMMON WEATHER FACTORS
========================================================= */

const getWeatherFactors = (weather) => {
  if (!weather) return [];

  return [
    {
      label: "Temperature",
      value: `${weather.main?.temp?.toFixed(1) ?? "--"}°C`,
    },
    {
      label: "Feels Like",
      value: `${weather.main?.feels_like?.toFixed(1) ?? "--"}°C`,
    },
    {
      label: "Humidity",
      value: `${weather.main?.humidity ?? "--"}%`,
    },
    {
      label: "Wind",
      value: `${weather.wind?.speed?.toFixed(1) ?? "--"} m/s`,
    },
    {
      label: "Condition",
      value: weather.weather?.[0]?.description ?? "Unknown",
    },
    {
      label: "Visibility",
      value: `${((weather.visibility ?? 0) / 1000).toFixed(1)} km`,
    },
  ];
};

/* =========================================================
   CHAT ANALYSIS
========================================================= */

const analyzeQuestion = (question, weather) => {
  const text = question.toLowerCase().trim();

  const temp = weather.main?.temp ?? 0;
  const feelsLike = weather.main?.feels_like ?? temp;
  const humidity = weather.main?.humidity ?? 0;
  const wind = weather.wind?.speed ?? 0;
  const visibility = (weather.visibility ?? 0) / 1000;

  const condition = weather.weather?.[0]?.main ?? "";
  const description = weather.weather?.[0]?.description ?? condition;

  let risk = getRiskLevel(weather);
  let answer = "";
  let recommendation = "";

  /* Umbrella / Rain */
  if (
    text.includes("umbrella") ||
    text.includes("rain") ||
    text.includes("raining")
  ) {
    if (
      condition.toLowerCase().includes("rain") ||
      condition.toLowerCase().includes("drizzle") ||
      condition.toLowerCase().includes("thunderstorm")
    ) {
      risk = "medium";
      answer = `Yes, carrying an umbrella is recommended because the current weather condition is ${description}.`;
      recommendation = "Carry an umbrella and be prepared for wet conditions.";
    } else {
      risk = "low";
      answer = `Rain is not currently indicated. The current weather condition is ${description}.`;
      recommendation =
        "An umbrella is not necessary based on the current observed condition.";
    }
  } else if (

  /* Hot / Temperature */
    text.includes("hot") ||
    text.includes("temperature") ||
    text.includes("heat") ||
    text.includes("cold")
  ) {
    if (temp >= 35 || feelsLike >= 40) {
      risk = "high";
      answer = `It is very hot right now. The temperature is ${temp.toFixed(
        1,
      )}°C and it feels like ${feelsLike.toFixed(1)}°C.`;
      recommendation =
        "Avoid prolonged heat exposure, stay hydrated, and take breaks in a cool place.";
    } else if (temp >= 30 || feelsLike >= 35) {
      risk = "medium";
      answer = `The weather is quite warm. The temperature is ${temp.toFixed(
        1,
      )}°C and it feels like ${feelsLike.toFixed(1)}°C.`;
      recommendation = "Limit prolonged exposure to heat and stay hydrated.";
    } else if (temp <= 18) {
      risk = "medium";
      answer = `It is relatively cool outside. The temperature is ${temp.toFixed(
        1,
      )}°C.`;
      recommendation =
        "Consider wearing suitable clothing for the cooler conditions.";
    } else {
      risk = "low";
      answer = `The current temperature is ${temp.toFixed(
        1,
      )}°C and it feels like ${feelsLike.toFixed(1)}°C.`;
      recommendation = "The temperature is generally comfortable.";
    }
  } else if (

  /* Running / Exercise */
    text.includes("run") ||
    text.includes("running") ||
    text.includes("exercise") ||
    text.includes("workout")
  ) {
    if (risk === "high") {
      answer =
        "Running or intense exercise is not recommended right now because the current weather conditions may increase outdoor activity risk.";
      recommendation =
        "Consider postponing intense exercise or moving it indoors.";
    } else if (risk === "medium") {
      answer = `Running is possible with caution. The temperature is ${temp.toFixed(
        1,
      )}°C, feels like ${feelsLike.toFixed(
        1,
      )}°C, and humidity is ${humidity}%.`;
      recommendation =
        "Keep the run moderate, stay hydrated, and take breaks if needed.";
    } else {
      answer =
        "The current conditions are generally suitable for running or light exercise.";
      recommendation =
        "A normal workout should be reasonable under the current conditions.";
    }
  } else if (

  /* Outdoor activity */
    text.includes("outdoor") ||
    text.includes("outside") ||
    text.includes("activity")
  ) {
    if (risk === "high") {
      answer =
        "Outdoor activity is not advisable under the current conditions because one or more weather factors indicate high risk.";
      recommendation =
        "Avoid prolonged outdoor exposure and consider postponing the activity.";
    } else if (risk === "medium") {
      answer = `Outdoor activity may require some caution because the temperature is ${temp.toFixed(
        1,
      )}°C, feels like ${feelsLike.toFixed(
        1,
      )}°C, and humidity is ${humidity}%.`;
      recommendation =
        "Consider keeping the activity shorter and adjust the intensity according to the conditions.";
    } else {
      answer =
        "The current weather conditions are generally suitable for outdoor activity.";
      recommendation =
        "Normal outdoor activity should be reasonable while staying aware of changing conditions.";
    }
  } else if (text.includes("wind") || text.includes("windy")) {

  /* Wind */
    if (wind >= 10) {
      risk = "high";
      answer = `The wind is strong right now at ${wind.toFixed(1)} m/s.`;
      recommendation = "Avoid activities that may be affected by strong winds.";
    } else if (wind >= 6) {
      risk = "medium";
      answer = `The wind is moderately strong at ${wind.toFixed(1)} m/s.`;
      recommendation =
        "Use caution for outdoor activities that are sensitive to wind.";
    } else {
      risk = "low";
      answer = `The wind is relatively light at ${wind.toFixed(1)} m/s.`;
      recommendation = "Wind conditions are generally manageable.";
    }
  } else if (text.includes("humidity")) {

  /* Humidity */
    if (humidity >= 80) {
      risk = "medium";
      answer = `Humidity is high at ${humidity}%, which can make the weather feel more uncomfortable.`;
      recommendation =
        "Stay hydrated and take breaks during prolonged outdoor activity.";
    } else if (humidity >= 60) {
      risk = "low";
      answer = `Humidity is ${humidity}%, which is moderately humid.`;
      recommendation = "Normal activity is reasonable while staying hydrated.";
    } else {
      risk = "low";
      answer = `Humidity is relatively low at ${humidity}%.`;
      recommendation = "Current humidity conditions are generally comfortable.";
    }
  } else if (

  /* Visibility */
    text.includes("visibility") ||
    text.includes("clear") ||
    text.includes("see")
  ) {
    if (visibility < 2) {
      risk = "high";
      answer = `Visibility is low at ${visibility.toFixed(
        1,
      )} km, which can make travel and outdoor activities more difficult.`;
      recommendation =
        "Use extra caution while travelling and avoid unnecessary outdoor exposure.";
    } else if (visibility < 5) {
      risk = "medium";
      answer = `Visibility is ${visibility.toFixed(
        1,
      )} km, so some caution may be needed.`;
      recommendation = "Be cautious during travel and outdoor activities.";
    } else {
      risk = "low";
      answer = `Visibility is good at ${visibility.toFixed(1)} km.`;
      recommendation = "Visibility conditions are generally favourable.";
    }
  } else {

  /* Generic weather */
    answer = `The current weather in ${
      weather.name
    } is ${description}. The temperature is ${temp.toFixed(
      1,
    )}°C and it feels like ${feelsLike.toFixed(1)}°C.`;

    recommendation =
      "Ask about outdoor activity, running, rain, umbrella, temperature, wind, humidity, or visibility for a more specific assessment.";
  }

  return {
    type: "chat",
    risk,
    answer,
    recommendation,
    factors: getWeatherFactors(weather),
    source: "OpenWeather API",
  };
};

/* =========================================================
   WHAT-IF ANALYSIS
========================================================= */

const analyzeWhatIf = (activity, weather) => {
  const temp = weather.main?.temp ?? 0;
  const feelsLike = weather.main?.feels_like ?? temp;
  const humidity = weather.main?.humidity ?? 0;
  const wind = weather.wind?.speed ?? 0;

  const condition = weather.weather?.[0]?.main?.toLowerCase() ?? "";
  const description = weather.weather?.[0]?.description ?? condition;

  let risk = "low";
  const reasons = [];

  if (condition.includes("thunderstorm") || condition.includes("rain")) {
    risk = "high";
    reasons.push(`Current condition is ${description}.`);
  }

  if (temp >= 35 || feelsLike >= 40) {
    risk = "high";
    reasons.push(
      `High heat: ${temp.toFixed(1)}°C, feels like ${feelsLike.toFixed(1)}°C.`,
    );
  } else if (temp >= 30) {
    if (risk !== "high") risk = "medium";
    reasons.push(`Warm temperature: ${temp.toFixed(1)}°C.`);
  }

  if (humidity >= 80) {
    if (risk !== "high") risk = "medium";
    reasons.push(`High humidity: ${humidity}%.`);
  }

  if (wind >= 10) {
    risk = "high";
    reasons.push(`Strong wind: ${wind.toFixed(1)} m/s.`);
  } else if (wind >= 6) {
    if (risk !== "high") risk = "medium";
    reasons.push(`Moderate wind: ${wind.toFixed(1)} m/s.`);
  }

  if (reasons.length === 0) {
    reasons.push("Current weather factors are generally favourable.");
  }

  let answer = "";
  let recommendation = "";

  if (risk === "high") {
    answer = `Doing ${
      activity || "this activity"
    } right now may involve higher weather-related risk based on the current conditions.`;

    recommendation = `Avoid or postpone ${
      activity || "the activity"
    } if possible because the current conditions indicate higher weather-related risk.`;
  } else if (risk === "medium") {
    answer = `Doing ${
      activity || "this activity"
    } is possible, but the current weather conditions suggest that some caution is needed.`;

    recommendation = `You can consider ${
      activity || "the activity"
    } with caution. Keep the activity moderate and monitor the conditions.`;
  } else {
    answer = `The current weather conditions are generally suitable for ${
      activity || "this activity"
    }.`;

    recommendation = `Current conditions are generally suitable for ${
      activity || "the activity"
    }.`;
  }

  return {
    type: "what-if",
    risk,
    activity: activity || "Outdoor activity",
    answer,
    reasons,
    recommendation,
    factors: getWeatherFactors(weather),
    source: "OpenWeather API",
  };
};

/* =========================================================
   CLAIM VERIFICATION
========================================================= */

const verifyClaim = (claim, weather) => {
  const text = claim.toLowerCase().trim();

  const condition = weather.weather?.[0]?.main?.toLowerCase() ?? "";
  const description = weather.weather?.[0]?.description ?? condition;

  const temp = weather.main?.temp ?? 0;
  const humidity = weather.main?.humidity ?? 0;
  const wind = weather.wind?.speed ?? 0;

  let status = "unverified";
  let explanation = "";

  /* Official warning claims */
  if (
    text.includes("cyclone") ||
    text.includes("warning") ||
    text.includes("alert") ||
    text.includes("storm warning")
  ) {
    status = "unverified";
    explanation =
      "This claim cannot be verified using the current weather data alone. Official weather warning data is required for reliable verification.";
  } else if (

  /* Rain claim */
    text.includes("rain") ||
    text.includes("raining") ||
    text.includes("drizzle")
  ) {
    if (
      condition.includes("rain") ||
      condition.includes("drizzle") ||
      condition.includes("thunderstorm")
    ) {
      status = "verified";
      explanation = `The current weather condition (${description}) supports the claim.`;
    } else {
      status = "contradicted";
      explanation = `The current weather condition is ${description}, so the claim is not supported by the current weather data.`;
    }
  } else if (text.includes("clear") || text.includes("sunny")) {

  /* Clear claim */
    if (condition.includes("clear")) {
      status = "verified";
      explanation = "The current weather condition supports the claim.";
    } else {
      status = "contradicted";
      explanation = `The current condition is ${description}.`;
    }
  } else if (text.includes("cloud")) {

  /* Cloud claim */
    if (condition.includes("cloud")) {
      status = "verified";
      explanation =
        "Cloudy conditions are currently reported by the weather data.";
    } else {
      status = "contradicted";
      explanation = `The current condition is ${description}.`;
    }
  } else if (text.includes("hot")) {

  /* Hot claim */
    if (temp >= 30) {
      status = "verified";
      explanation = `The current temperature is ${temp.toFixed(
        1,
      )}°C, which supports the claim that it is hot.`;
    } else {
      status = "contradicted";
      explanation = `The current temperature is ${temp.toFixed(
        1,
      )}°C, which does not strongly support the claim.`;
    }
  } else if (text.includes("cold")) {

  /* Cold claim */
    if (temp <= 18) {
      status = "verified";
      explanation = `The current temperature is ${temp.toFixed(
        1,
      )}°C, which supports the claim.`;
    } else {
      status = "contradicted";
      explanation = `The current temperature is ${temp.toFixed(
        1,
      )}°C, which does not support the claim.`;
    }
  } else if (text.includes("humid") || text.includes("humidity")) {

  /* Humidity claim */
    if (humidity >= 60) {
      status = "verified";
      explanation = `Current humidity is ${humidity}%.`;
    } else {
      status = "contradicted";
      explanation = `Current humidity is ${humidity}%.`;
    }
  } else if (text.includes("windy") || text.includes("wind")) {

  /* Wind claim */
    if (wind >= 6) {
      status = "verified";
      explanation = `Current wind speed is ${wind.toFixed(1)} m/s.`;
    } else {
      status = "contradicted";
      explanation = `Current wind speed is ${wind.toFixed(
        1,
      )} m/s, so strong wind is not currently indicated.`;
    }
  } else {
    status = "unverified";
    explanation =
      "The current weather data does not contain enough information to verify this claim reliably.";
  }

  return {
    type: "verify",
    status,
    explanation,
    factors: getWeatherFactors(weather),
    source: "OpenWeather API",
  };
};

/* =========================================================
   RISK BADGE
========================================================= */

const RiskBadge = ({ risk }) => (
  <span className={`risk-badge ${risk}`}>Risk: {risk}</span>
);

/* =========================================================
   FACTORS
========================================================= */

const WeatherFactors = ({ factors }) => (
  <div className="weather-card">
    <h4>Weather Factors Used</h4>

    <div className="weather-factors">
      {factors.map((factor) => (
        <div key={factor.label}>
          <span>{factor.label}</span>
          <strong>{factor.value}</strong>
        </div>
      ))}
    </div>
  </div>
);

/* =========================================================
   CHAT DASHBOARD
========================================================= */

const ChatDashboard = ({ onAsk }) => {
  const questions = [
    "Is it good for outdoor activity?",
    "Should I carry an umbrella?",
    "What if I go for a run now?",
    "Is it too hot outside?",
  ];

  return (
    <div className="weather-dashboard chat-dashboard">
      <div className="dashboard-title">
        <h3>Ask WeatherGPT</h3>
        <p>
          Ask questions about the current weather and get explainable
          recommendations.
        </p>
      </div>

      <div className="dashboard-quick-questions">
        {questions.map((question) => (
          <button key={question} onClick={() => onAsk(question)}>
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   WHAT-IF DASHBOARD
========================================================= */

const WhatIfDashboard = ({ onAnalyze }) => {
  const [activity, setActivity] = useState("");

  const handleAnalyze = () => {
    if (!activity.trim()) return;

    onAnalyze(activity);
    setActivity("");
  };

  return (
    <div className="weather-dashboard what-if-dashboard">
      <div className="dashboard-title">
        <h3>What-If Weather Analysis</h3>
        <p>Check how the current weather may affect an activity.</p>
      </div>

      <div className="dashboard-form">
        <label>What activity are you planning?</label>

        <input
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          placeholder="Example: outdoor event, running, travelling"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAnalyze();
            }
          }}
        />

        <div className="current-condition-info">
          <span>Analysis based on</span>
          <strong>Current weather conditions</strong>
        </div>

        <button
          className="dashboard-action-btn"
          onClick={handleAnalyze}
          disabled={!activity.trim()}
        >
          Analyze Scenario
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   VERIFY CLAIM DASHBOARD
========================================================= */

const VerifyDashboard = ({ onVerify }) => {
  const [claim, setClaim] = useState("");

  const handleVerify = () => {
    if (!claim.trim()) return;

    onVerify(claim);
    setClaim("");
  };

  return (
    <div className="weather-dashboard verify-dashboard">
      <div className="dashboard-title">
        <h3>Verify Weather Claim</h3>
        <p>
          Check whether a weather-related claim matches the available current
          weather data.
        </p>
      </div>

      <div className="dashboard-form">
        <label>Enter a weather claim</label>

        <input
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Example: It is raining now"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleVerify();
            }
          }}
        />

        <button
          className="dashboard-action-btn"
          onClick={handleVerify}
          disabled={!claim.trim()}
        >
          Verify Claim
        </button>
      </div>

      <div className="verification-note">
        <strong>Note:</strong> Official cyclone and warning claims require
        official warning data and may currently be shown as unverified.
      </div>
    </div>
  );
};

/* =========================================================
   RESULT DASHBOARD
========================================================= */

const ResultDashboard = ({ result }) => {
  if (!result) return null;

  /* Chat / What-If */
  if (result.type === "chat" || result.type === "what-if") {
    return (
      <div className="weather-result-dashboard">
        <RiskBadge risk={result.risk} />

        {result.type === "what-if" && (
          <h4 className="scenario-heading">Scenario: {result.activity}</h4>
        )}

        <p className="result-answer">{result.answer}</p>

        {result.type === "what-if" && (
          <div className="what-if-reasons">
            <h4>Why?</h4>

            <ul>
              {result.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <WeatherFactors factors={result.factors} />

        <div className="recommendation-box">
          <strong>Recommendation</strong>
          <p>{result.recommendation}</p>
        </div>

        <div className="sources">Source: {result.source}</div>
      </div>
    );
  }

  /* Verify Claim */
  if (result.type === "verify") {
    return (
      <div className="weather-result-dashboard">
        <div className={`verification-badge ${result.status}`}>
          {result.status === "verified" && "VERIFIED"}
          {result.status === "contradicted" && "CONTRADICTED"}
          {result.status === "unverified" && "UNVERIFIED"}
        </div>

        <p className="result-answer">{result.explanation}</p>

        <WeatherFactors factors={result.factors} />

        <div className="sources">Source: {result.source}</div>
      </div>
    );
  }

  return null;
};

/* =========================================================
   MAIN WEATHER CHAT
========================================================= */

const WeatherChat = ({ weather }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleChat = (question) => {
    if (!question.trim()) return;

    const result = analyzeQuestion(question, weather);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        question,
        result,
      },
    ]);

    setInput("");
  };

  const handleWhatIf = (activity) => {
    if (!activity.trim()) return;

    const result = analyzeWhatIf(activity, weather);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        question: `What if I do ${activity}?`,
        result,
      },
    ]);
  };

  const handleVerify = (claim) => {
    if (!claim.trim()) return;

    const result = verifyClaim(claim, weather);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        question: claim,
        result,
      },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    handleChat(input);
  };

  const clearDashboard = (tab) => {
    setActiveTab(tab);
    setMessages([]);
    setInput("");
  };

  return (
    <div className="weather-gpt-shell">
      {/* Header */}
      <div className="chat-header">
        <h2>WeatherGPT</h2>
        <p>Explainable AI for Weather Intelligence</p>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        <button
          className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => clearDashboard("chat")}
        >
          Chat
        </button>

        <button
          className={`tab-btn ${activeTab === "what-if" ? "active" : ""}`}
          onClick={() => clearDashboard("what-if")}
        >
          What-If
        </button>

        <button
          className={`tab-btn ${activeTab === "verify" ? "active" : ""}`}
          onClick={() => clearDashboard("verify")}
        >
          Verify Claim
        </button>
      </div>

      {/* ===================================================
          ACTIVE DASHBOARD
      =================================================== */}

      {activeTab === "chat" && <ChatDashboard onAsk={handleChat} />}

      {activeTab === "what-if" && <WhatIfDashboard onAnalyze={handleWhatIf} />}

      {activeTab === "verify" && <VerifyDashboard onVerify={handleVerify} />}

      {/* ===================================================
          RESULTS
      =================================================== */}

      {messages.length > 0 && (
        <div className="dashboard-results">
          {messages.map((message) => (
            <div className="dashboard-conversation" key={message.id}>
              <div className="dashboard-user-question">{message.question}</div>

              <ResultDashboard result={message.result} />
            </div>
          ))}
        </div>
      )}

      {/* ===================================================
          CHAT INPUT ONLY
      =================================================== */}

      {activeTab === "chat" && (
        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask WeatherGPT about the current weather..."
          />

          <button className="send-btn" type="submit">
            Send
          </button>
        </form>
      )}
    </div>
  );
};

export default WeatherChat;
