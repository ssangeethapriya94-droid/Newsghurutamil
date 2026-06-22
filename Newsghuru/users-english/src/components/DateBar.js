import React, { useState, useEffect, useRef } from "react";
import "../styles/DateBar.css";
import { FaCalendarAlt, FaClock, FaSun, FaMoon, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom"; // Added for routing without reload

const thithis = [
  "Prathamai", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shasthi", "Saptami", "Ashtami", 
  "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Pournami", "Amavasai"
];

const natchathirams = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya",
  "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
  "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const yogams = ["Siddha Yogam", "Amrita Yogam", "Marana Yogam"];
const karanams = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];

const dailyThoughts = [
  "If home life has love and virtue, that is its character and benefit.",
  "Avoiding hostility is the path to peace in life.",
  "Learn flawlessly what is to be learned, and then stand by what you have learned.",
  "To discern the truth in everything, by whomever spoken, is wisdom.",
  "Decorum gives excellence, so decorum should be cherished more than life.",
  "Speaking harsh words when sweet ones are available is like choosing raw fruit over ripe fruit.",
  "Patience is wider than the ocean. Those who are patient will rule the world.",
  "Love is God. The good deeds we do for others elevate us.",
  "Effort produces wealth; lack of effort brings poverty.",
  "Give to the needy and live with fame; there is no greater gain for life.",
  "Truthfulness is speaking words that are free from even the slightest harm.",
  "It is not good to forget a benefit; it is good to forget an injury on the very day.",
  "Anger is a killer of those who harbor it, and it burns up the protective raft of friendship.",
  "Weigh the strength of the deed, your own strength, the enemy's strength, and the ally's strength before acting.",
  "The world does not consider the decline of a person who is upright and fair as a ruin.",
  "Wisdom is a weapon that wards off destruction; it is an inner fortress that enemies cannot destroy.",
  "Speak words that are useful; do not speak words that are useless.",
  "To be pure in mind is all virtue; everything else is empty show.",
  "He who lives without deceit in his heart lives in the hearts of all people.",
  "Rain makes food for the hungry, and is itself food for the thirsty.",
  "Think before you act; to say 'we will think after acting' is a disgrace.",
  "A timely help, though small, is larger than the world itself.",
  "Greatness is always humble; vanity boasts about itself.",
  "Water flows from a sandy well as deep as you dig; wisdom flows as deep as you learn.",
  "Friendship hastens to remove distress, like the hand that grabs slipping clothes.",
  "Education is the indestructible wealth of a person; other riches are not real wealth.",
  "Whatever else you fail to guard, guard your tongue, lest you suffer for your words.",
  "As the letter A is the first of all letters, so the eternal God is the first of the world.",
  "The anger of those who have climbed the hill of virtue is hard to endure even for a moment.",
  "Smile when trouble comes; there is nothing like it to overcome difficulties.",
  "Though the world spins in many ways, it follows the plough; so agriculture is the highest occupation."
];

const dayOfWeekTimings = {
  0: {
    nallaNeramMorning: "07:30 AM - 08:30 AM",
    nallaNeramEvening: "03:30 PM - 04:30 PM",
    raghuKalam: "04:30 PM - 06:00 PM",
    yamagandam: "12:00 PM - 01:30 PM",
    kuligai: "03:00 PM - 04:30 PM",
    soolam: "West",
    parigaram: "Jaggery",
    chandrashtamam: "Pooradam"
  },
  1: {
    nallaNeramMorning: "06:30 AM - 07:30 AM",
    nallaNeramEvening: "04:30 PM - 05:30 PM",
    raghuKalam: "07:30 AM - 09:00 AM",
    yamagandam: "10:30 AM - 12:00 PM",
    kuligai: "01:30 PM - 03:00 PM",
    soolam: "East",
    parigaram: "Curd",
    chandrashtamam: "Uthiradam"
  },
  2: {
    nallaNeramMorning: "07:30 AM - 08:30 AM",
    nallaNeramEvening: "04:30 PM - 05:30 PM",
    raghuKalam: "03:00 PM - 04:30 PM",
    yamagandam: "09:00 AM - 10:30 AM",
    kuligai: "12:00 PM - 01:30 PM",
    soolam: "North",
    parigaram: "Milk",
    chandrashtamam: "Thiruvonam"
  },
  3: {
    nallaNeramMorning: "09:00 AM - 10:30 AM",
    nallaNeramEvening: "04:30 PM - 05:30 PM",
    raghuKalam: "12:00 PM - 01:30 PM",
    yamagandam: "07:30 AM - 09:00 AM",
    kuligai: "10:30 AM - 12:00 PM",
    soolam: "North",
    parigaram: "Tamarind Water",
    chandrashtamam: "Avittam"
  },
  4: {
    nallaNeramMorning: "09:00 AM - 10:30 AM",
    nallaNeramEvening: "04:30 PM - 05:30 PM",
    raghuKalam: "01:30 PM - 03:00 PM",
    yamagandam: "06:00 AM - 07:30 AM",
    kuligai: "09:00 AM - 10:30 AM",
    soolam: "South",
    parigaram: "Curd",
    chandrashtamam: "Sathayam"
  },
  5: {
    nallaNeramMorning: "09:00 AM - 10:30 AM",
    nallaNeramEvening: "04:30 PM - 05:30 PM",
    raghuKalam: "10:30 AM - 12:00 PM",
    yamagandam: "03:00 PM - 04:30 PM",
    kuligai: "07:30 AM - 09:00 AM",
    soolam: "West",
    parigaram: "Sugar",
    chandrashtamam: "Poorattadhi"
  },
  6: {
    nallaNeramMorning: "07:30 AM - 08:30 AM",
    nallaNeramEvening: "05:00 PM - 06:00 PM",
    raghuKalam: "09:00 AM - 10:30 AM",
    yamagandam: "01:30 PM - 03:00 PM",
    kuligai: "06:00 AM - 07:30 AM",
    soolam: "East",
    parigaram: "Oil",
    chandrashtamam: "Uthirattadhi"
  }
};

const getDynamicCalendarInfo = (targetDate) => {
  const dVal = targetDate.getDate();
  const dayVal = targetDate.getDay();

  const timings = dayOfWeekTimings[dayVal] || dayOfWeekTimings[0];
  const thithi = thithis[(dVal - 1) % thithis.length];
  const natchathiram = natchathirams[(dVal - 1) % natchathirams.length];
  const yogam = yogams[(dVal + dayVal) % yogams.length];
  const karanam = karanams[(dVal * 2) % karanams.length];
  const thought = dailyThoughts[(dVal - 1) % dailyThoughts.length];

  return {
    ...timings,
    thithi,
    natchathiram,
    yogam,
    karanam,
    thought
  };
};

const DateBar = ({ visitorCount }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Read initial date from URL React Router searchParams safely
  const getUrlDate = () => {
    try {
      const dateParam = searchParams.get('date');
      if (dateParam) {
        const d = new Date(dateParam);
        if (!isNaN(d.getTime())) return d;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef(null);

  const urlDate = getUrlDate();
  const displayDate = urlDate || currentTime;
  const info = getDynamicCalendarInfo(displayDate);

  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date((urlDate || new Date()).getFullYear(), (urlDate || new Date()).getMonth(), 1));
  const calendarWrapperRef = useRef(null);

  // Sync calendarMonth when displayDate changes or calendar is toggled open
  const displayYear = displayDate.getFullYear();
  const displayMonth = displayDate.getMonth();
  useEffect(() => {
    setCalendarMonth(new Date(displayYear, displayMonth, 1));
  }, [displayYear, displayMonth, showCalendar]);

  /* CLOSE CUSTOM CALENDAR WHEN CLICKING OUTSIDE */
  useEffect(() => {
    const handleClickOutsideCalendar = (event) => {
      if (calendarWrapperRef.current && !calendarWrapperRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideCalendar);
    return () => document.removeEventListener("mousedown", handleClickOutsideCalendar);
  }, []);

  const prevMonth = (e) => {
    e.stopPropagation();
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevTotalDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days to pad to 42
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handleCalendarDayClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate <= today) {
      navigateToDate(date);
      setShowCalendar(false);
    }
  };

  // Fixed: Reset parameters without triggering a hard window refresh
  const handleCalendarClear = (e) => {
    e.stopPropagation();
    navigate("/", { replace: true });
  };

  const handleCalendarToday = (e) => {
    e.stopPropagation();
    navigateToDate(new Date());
  };

  /* LIVE CLOCK */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fixed: Replaced window.location.href with soft React-Router navigate
  const navigateToDate = (newDate) => {
    const dateString = newDate.toISOString().split('T')[0];
    navigate(`?date=${dateString}`, { replace: true });
  };

  const handlePrevDay = () => {
    const prevDate = new Date(displayDate);
    prevDate.setDate(prevDate.getDate() - 1);
    navigateToDate(prevDate);
  };

  const handleNextDay = () => {
    if (isNextDisabled) return; 
    const nextDate = new Date(displayDate);
    nextDate.setDate(nextDate.getDate() + 1);
    navigateToDate(nextDate);
  };

  /* TAMIL CALENDAR DATA METRICS */
  const tamilWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const tamilMonths = ["Chithirai", "Vaikasi", "Aani", "Aadi", "Aavani", "Purattasi", "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni"];
  const tamilYears = [
    "Prabhava", "Vibhava", "Sukla", "Pramodhootha", "Prachopathi", "Aangeerasa", "Sreemuga", "Bhava", "Yuva", "Dhaathu", "Eesvara", "Vehudhanya", "Pramadhi",
    "Vikrama", "Vishu", "Chithrabhanu", "Subhanu", "Dharana", "Parthiba", "Viya", "Sarvajith", "Sarvadhari", "Virodhi", "Vikruthi", "Kara", "Nandhana", "Vijaya",
    "Jaya", "Manmadha", "Dhurmugi", "Hevilambi", "Vilambi", "Vikari", "Sarvari", "Plava", "Subhakrithu", "Sobhakrithu", "Krodhi", "Visvavasu", "Parabhava",
    "Plavanga", "Keelaga", "Saumya", "Sadharana", "Virodhikrithi", "Paridhabi", "Pramadheesa", "Anandha", "Rakshasa", "Nala", "Pingala", "Kalayukthi",
    "Siddharthi", "Rauthri", "Dhunmathi", "Dhundhubhi", "Rudhirodhgari", "Raktakshi", "Krodhana", "Akshaya"
  ];

  const day = displayDate.getDay();
  const date = displayDate.getDate();
  const year = displayDate.getFullYear();

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const tamilMonthLengths = [31, 31, 32, 31, 31, 30, 30, 29, 29, 30, 30, isLeapYear ? 32 : 31];
  const tamilNewYear = new Date(year, 3, 14);

  let diffDays = Math.floor((displayDate - tamilNewYear) / (1000 * 60 * 60 * 24));
  let cycleYear = year;

  if (diffDays < 0) {
    cycleYear = year - 1;
    const prevNY = new Date(year - 1, 3, 14);
    diffDays = Math.floor((displayDate - prevNY) / (1000 * 60 * 60 * 24));
  }

  let tamilMonthIndex = 0;
  while (diffDays >= tamilMonthLengths[tamilMonthIndex]) {
    diffDays -= tamilMonthLengths[tamilMonthIndex];
    tamilMonthIndex++;
    if (tamilMonthIndex === 12) tamilMonthIndex = 0;
  }

  const tamilDate = diffDays + 1;
  const tamilMonth = tamilMonths[tamilMonthIndex];
  const tamilYearIndex = ((cycleYear - 1987) % 60 + 60) % 60;
  const tamilYear = tamilYears[tamilYearIndex];

  const normalDate = `${date} ${displayDate.toLocaleString("en-US", { month: "long" })} ${year}`;
  const tamilFullDate = `${tamilMonth} ${tamilDate}, Year ${tamilYear}`;

  const time = currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const hour = currentTime.getHours();
  const TimeIcon = hour >= 6 && hour < 18 ? FaSun : FaMoon;

  const todayDateObj = new Date();
  todayDateObj.setHours(0, 0, 0, 0);
  const currentDisplayDateObj = new Date(displayDate);
  currentDisplayDateObj.setHours(0, 0, 0, 0);
  const isNextDisabled = currentDisplayDateObj >= todayDateObj;

  return (
    <div className="date-bar-container" ref={dropdownRef}>
      <div className="date-bar" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="date-section">
          <FaCalendarAlt className="date-icon" />
          <div className="date-content">
            <span className="date-text">{normalDate}</span>
            <span> | </span>
            <span className="date-text">{tamilWeekDays[day]}</span>
            <span> | </span>
            <span className="tamil-date-text">{tamilFullDate}</span>
          </div>
          <FaChevronDown className={`dropdown-icon ${isExpanded ? "open" : ""}`} />
        </div>

        <div className="time-section">
          <span className="time-text">{time}</span>
          {visitorCount > 0 && (
            <span
              style={{
                marginLeft: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                color: "#fff",
                padding: "3px 10px",
                borderRadius: "20px",
                fontSize: "0.95rem",
                fontWeight: "700",
                letterSpacing: "0.02em",
                boxShadow: "0 2px 8px rgba(249, 115, 22, 0.35)",
                whiteSpace: "nowrap",
              }}
            >
              🌐 {visitorCount.toLocaleString()} Visitors
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="date-dropdown-menu">
          <div className="dinamalar-calendar-panel" onClick={(e) => e.stopPropagation()}>
            {/* Row 1: Header Navigation */}
            <div className="dc-header">
              <button type="button" className="dc-nav-btn" onClick={handlePrevDay}>&lt; Prev</button>
              
              <div 
                className="dc-date-picker-wrapper" 
                ref={calendarWrapperRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCalendar(!showCalendar);
                }}
                title="Select Date"
              >
                <FaCalendarAlt className="dc-cal-icon" />
                <span className="dc-date-input-text">
                  {displayDate.toLocaleDateString("en-GB").replace(/\//g, "-")}
                </span>
                <FaChevronDown className="dc-cal-chevron" />
                
                {showCalendar && (
                  <div className="custom-calendar-popup" onClick={(e) => e.stopPropagation()}>
                    <div className="cc-header">
                      <span className="cc-month-year">
                        {calendarMonth.toLocaleString("en-US", { month: "long" })}, {calendarMonth.getFullYear()}
                      </span>
                      <div className="cc-nav-arrows">
                        <button type="button" className="cc-arrow-btn" onClick={prevMonth} title="Previous Month">
                          <FaChevronUp size={10} />
                        </button>
                        <button type="button" className="cc-arrow-btn" onClick={nextMonth} title="Next Month">
                          <FaChevronDown size={10} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="cc-weekdays">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                        <div key={d} className="cc-weekday">{d}</div>
                      ))}
                    </div>
                    
                    <div className="cc-days-grid">
                      {getCalendarDays().map(({ date: d, isCurrentMonth }, idx) => {
                        const isSelected = d.toDateString() === displayDate.toDateString();
                        const isToday = d.toDateString() === new Date().toDateString();
                        
                        const checkDay = new Date(d);
                        checkDay.setHours(0,0,0,0);
                        const isFuture = checkDay > todayDateObj;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`cc-day ${isCurrentMonth ? "" : "other-month"} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${isFuture ? "disabled-day" : ""}`}
                            onClick={() => !isFuture && handleCalendarDayClick(d)}
                            style={isFuture ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                          >
                            {d.getDate()}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="cc-footer">
                      <button type="button" className="cc-footer-btn" onClick={handleCalendarClear}>
                        Clear
                      </button>
                      <button type="button" className="cc-footer-btn" onClick={handleCalendarToday}>
                        Today
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="button"
                className={`dc-nav-btn ${isNextDisabled ? "disabled" : ""}`} 
                onClick={handleNextDay}
                disabled={isNextDisabled}
              >
                Next &gt;
              </button>
            </div>

            {/* Row 2: Display Info */}
            <div className="dc-big-dates-row">
              <div className="dc-big-date-box left-box">
                <div className="dc-month-text">{displayDate.toLocaleString("en-US", { month: "long" })}</div>
                <div className="dc-huge-text">{date}</div>
              </div>
              <div className="dc-big-date-box right-box">
                <div className="dc-month-text">{tamilMonth} <br/> Year {tamilYear}</div>
                <div className="dc-huge-text highlight-text">{tamilDate}</div>
                <div className="dc-special-days"></div>
              </div>
            </div>

            {/* Row 3: Info Bar */}
            <div className="dc-day-info-bar">
              <span>{displayDate.toLocaleString("en-US", { month: "long" })} {date}, {year}</span>
              <span className="dc-day-name">{tamilWeekDays[day]}</span>
              <span></span>
            </div>

            {/* Row 4: Timings Section */}
            <div className="dc-timings-section" onClick={(e) => e.stopPropagation()}>
              <div className="dc-timings-col">
                <div className="dc-timing-item">
                  <span className="dc-label">Good Time (Morning)</span>
                  <span className="dc-val">{info.nallaNeramMorning}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">Good Time (Evening)</span>
                  <span className="dc-val">{info.nallaNeramEvening}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">Rahu Kalam</span>
                  <span className="dc-val">{info.raghuKalam}</span>
                </div>
              </div>

              <div className="dc-timings-icon">
                <FaSun size={30} style={{ color: "#eab308" }} />
              </div>

              <div className="dc-timings-col">
                <div className="dc-timing-item">
                  <span className="dc-label">Yemagandam</span>
                  <span className="dc-val">{info.yamagandam}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">Kuligai</span>
                  <span className="dc-val">{info.kuligai}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">Soolam / Parigaram</span>
                  <span className="dc-val">{info.soolam} / {info.parigaram}</span>
                </div>
              </div>
            </div>

            {/* Row 5: Panchangam Section */}
            <div className="dc-panchangam-section" onClick={(e) => e.stopPropagation()}>
              <div className="dc-panchangam-col">
                <div className="dc-timing-item">
                  <span className="dc-label">Thithi</span>
                  <span className="dc-val">{info.thithi}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">Natchathiram</span>
                  <span className="dc-val">{info.natchathiram}</span>
                </div>
              </div>
              <div className="dc-panchangam-col">
                <div className="dc-timing-item">
                  <span className="dc-label">Yogam</span>
                  <span className="dc-val">{info.yogam}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">Karanam</span>
                  <span className="dc-val">{info.karanam}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">Chandrashtamam</span>
                  <span className="dc-val">{info.chandrashtamam}</span>
                </div>
              </div>
            </div>

            {/* Row 6: Daily Quote Box */}
            <div className="dc-info-box" onClick={(e) => e.stopPropagation()}>
              <div className="dc-info-text">
                <p style={{ margin: "0 0 5px 0", color: "var(--text-primary)", fontWeight: "700" }}>Today's Thought:</p>
                <p style={{ fontSize: "16.5px", color: "var(--accent-orange)", fontStyle: "italic", fontWeight: "600", margin: 0 }}>
                  "{info.thought}"
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DateBar;