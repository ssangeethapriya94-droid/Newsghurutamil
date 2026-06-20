import React, { useState, useEffect, useRef } from "react";
import "../styles/DateBar.css";
import { FaCalendarAlt, FaClock, FaSun, FaMoon, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom"; // Added for routing without reload

const thithis = [
  "பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சடுத்து", "அஷ்டமி", 
  "நவமி", "தசமி", "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்தசி", "பௌர்ணமி", "அமாவாசை"
];

const natchathirams = [
  "அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்", "திருவாதிரை", "புனர்பூசம்", "பூசம்",
  "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்", "அஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்",
  "கேட்டை", "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
];

const yogams = ["சித்த யோகம்", "அமிர்த யோகம்", "மரண யோகம்"];
const karanams = ["பவம்", "பாலவம்", "கௌலவம்", "சைதுலை", "கரசை", "வனசை", "பத்திரை"];

const dailyThoughts = [
  "அன்பும் அறனும் உடைத்தாயின் இல்வாழ்க்கை பண்பும் பயனும் அது.",
  "விரோதம் தவிர்ப்பதுவே வாழ்வின் அமைதிக்கு வழி.",
  "கற்க கசடறக் கற்பவை கற்றபின் நிற்க அதற்குத் தக.",
  "எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள் மெய்ப்பொருள் காண்ப தறிவு.",
  "ஒழுக்கம் விழுப்பம் தரலான் ஒழுக்கம் உயிரினும் ஓம்பப் படும்.",
  "இனிய உளவாக இன்னாத கூறல் கனிஇருப்பக் காய்கவர்ந் தற்று.",
  "பொறுமை கடலினும் பெரிது. பொறுத்தார் பூமி ஆள்வார்.",
  "அன்பே சிவம். பிறருக்கு செய்யும் நல்ல காரியங்களே நம்மை உயர்த்தும்.",
  "முயற்சி திருவினையாக்கும் முயற்றின்மை இன்மை புகுத்தி விடும்.",
  "ஈதல் இசைபட வாழ்தல் அதுவல்லது ஊதியம் இல்லை உயிர்க்கு.",
  "வாய்மை எனப்படுவது யாதெனின் யாதொன்றும் தீமை இலாத சொலல்.",
  "நன்றி மறப்பது நன்றன்று நன்றல்லது அன்றே மறப்பது நன்று.",
  "சினம் என்னும் சேர்ந்தாரைக் கொல்லி இனம் என்னும் ஏமப் புணையைச் சுடும்.",
  "வினைவலியும் தன்வலியும் மாற்றான் வலியும் துணைவலியும் தூக்கிச் செயல்.",
  "கெடுவாக வையா துலகம் நடுவாக நன்றிக்கண் தங்கியான் தாழ்வு.",
  "அறிவற்றங் காக்கும் கருவி செறுவார்க்கும் உள்ளழிக்கல் ஆகா அரண்.",
  "சொல்லுக சொல்லில் பயனுடைய சொல்லற்க சொல்லில் பயனிலாச் சொல்.",
  "மனத்துக்கண் மாசிலன் ஆதல் அனைத்துஅறன் ஆகுல நீர பிற.",
  "உள்ளத்தால் பொய்யாது ஒழுகின் உலகத்தார் உள்ளத்துள் எல்லாம் உளன்.",
  "துப்பார்க்குத் துப்பாய துப்பாக்கித் துப்பார்க்குத் துப்பாய தூஉம் மழை.",
  "எண்ணித் துணிக கருமம் துணிந்தபின் எண்ணுவம் என்பது இழுக்கு.",
  "காலத்தினால் செய்த நன்றி சிறிதுஎனினும் ஞாலத்தின் மாணப் பெரிது.",
  "பணியுமாம் என்றும் பெருமை சிறுமை அணியுமாம் தன்னை வியந்து.",
  "தொட்டனைத் தூறும் மணற்கேணி மாந்தர்க்குக் கற்றனைத் தூறும் அறிவு.",
  "உடுக்கை இழந்தவன் கைபோல ஆங்கே இடுக்கண் களைவதாம் நட்பு.",
  "கேடில் விழுச்செல்வம் கல்வி ஒருவற்கு மாடல்ல மற்றை யவை.",
  "யாகாவார் ஆயினும் நாகாக்க காவாக்கால் சோகாப்பர் சொல்லிழுக்குப் பட்டு.",
  "அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.",
  "குணமென்னும் குன்றேறி நின்றார் வெகுளி கணமேயும் காத்தல் அரிது.",
  "இடுக்கண் வருங்கால் நகுக அதனை அடுத்தூர்வது அஃதொப்பது இல்.",
  "சுழன்றும்ஏர்ப் பின்னது உலகம் அதனால் உழந்தும் உழவே தலை."
];

const dayOfWeekTimings = {
  0: {
    nallaNeramMorning: "07:30 AM - 08:30 AM",
    nallaNeramEvening: "03:30 PM - 04:30 PM",
    raghuKalam: "04:30 PM - 06:00 PM",
    yamagandam: "12:00 PM - 01:30 PM",
    kuligai: "03:00 PM - 04:30 PM",
    soolam: "மேற்கு",
    parigaram: "வெல்லம்",
    chandrashtamam: "பூராடம்"
  },
  1: {
    nallaNeramMorning: "06:30 AM - 07:30 AM",
    nallaNeramEvening: "04:30 PM - 05:30 PM",
    raghuKalam: "07:30 AM - 09:00 AM",
    yamagandam: "10:30 AM - 12:00 PM",
    kuligai: "01:30 PM - 03:00 PM",
    soolam: "கிழக்கு",
    parigaram: "தயிர்",
    chandrashtamam: "உத்திராடம்"
  },
  2: {
    nallaNeramMorning: "07:30 AM - 08:30 AM",
    nallaNeramEvening: "04:30 PM - 05:30 PM",
    raghuKalam: "03:00 PM - 04:30 PM",
    yamagandam: "09:00 AM - 10:30 AM",
    kuligai: "12:00 PM - 01:30 PM",
    soolam: "வடக்கு",
    parigaram: "பால்",
    chandrashtamam: "திருவோணம்"
  },
  3: {
    nallaNeramMorning: "09:00 AM - 10:30 AM",
    nallaNeramEvening: "04:30 PM - 05:30 PM",
    raghuKalam: "12:00 PM - 01:30 PM",
    yamagandam: "07:30 AM - 09:00 AM",
    kuligai: "10:30 AM - 12:00 PM",
    soolam: "வடக்கு",
    parigaram: "புளிதண்ணீர்",
    chandrashtamam: "அவிட்டம்"
  },
  4: {
    nallaNeramMorning: "09:00 AM - 10:30 AM",
    nallaNeramEvening: "04:30 PM - 05:30 PM",
    raghuKalam: "01:30 PM - 03:00 PM",
    yamagandam: "06:00 AM - 07:30 AM",
    kuligai: "09:00 AM - 10:30 AM",
    soolam: "தெற்கு",
    parigaram: "தயிர்",
    chandrashtamam: "சதயம்"
  },
  5: {
    nallaNeramMorning: "09:00 AM - 10:30 AM",
    nallaNeramEvening: "04:30 PM - 05:30 PM",
    raghuKalam: "10:30 AM - 12:00 PM",
    yamagandam: "03:00 PM - 04:30 PM",
    kuligai: "07:30 AM - 09:00 AM",
    soolam: "மேற்கு",
    parigaram: "சர்க்கரை",
    chandrashtamam: "பூரட்டாதி"
  },
  6: {
    nallaNeramMorning: "07:30 AM - 08:30 AM",
    nallaNeramEvening: "05:00 PM - 06:00 PM",
    raghuKalam: "09:00 AM - 10:30 AM",
    yamagandam: "01:30 PM - 03:00 PM",
    kuligai: "06:00 AM - 07:30 AM",
    soolam: "கிழக்கு",
    parigaram: "எண்ணெய்",
    chandrashtamam: "உத்திரட்டாதி"
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
  const tamilWeekDays = ["ஞாயிறு", "திங்கள்", "செவ்வாய்", "புதன்", "வியாழன்", "வெள்ளி", "சனி"];
  const tamilMonths = ["சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"];
  const tamilYears = [
    "பிரபவ","விபவ","சுக்ல","பிரமோதூத","பிரஜோற்பத்தி","ஆங்கீரச","ஸ்ரீமுக","பவ","யுவ","தாது","ஈஸ்வர","வெகுதான்ய","பிரமாதி",
    "விக்ரம","விஷு","சித்திரபானு","சுபானு","தாரண","பார்த்திப","விய","சர்வஜித்","சர்வதாரி","விரோதி","விக்ருதி","கர","நந்தன","விஜய",
    "ஜய","மன்மத","துர்முகி","ஹேவிளம்பி","விளம்பி","விகாரி","சார்வரி","பிலவ","சுபகிருது","சோபகிருது","குரோதி","விசுவாவசு","பராபவ",
    "பிலவங்க","கீலக","சௌமிய","சாதாரண","விரோதிகிருது","பரிதாபி","பிரமாதீச","ஆனந்த","ராக்ஷச","நள","பிங்கள","காளயுக்தி",
    "சித்தார்த்தி","ரௌத்திரி","துன்மதி","துந்துபி","रुத்ரோத்காரி","ரக்தாட்சி","குரோதன","அட்சய"
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

  const normalDate = `${date} ${displayDate.toLocaleString("ta-IN", { month: "long" })} ${year}`;
  const tamilFullDate = `${tamilDate} ${tamilMonth}, ${tamilYear} ஆண்டு`;

  const time = currentTime.toLocaleTimeString("ta-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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
              🌐 {visitorCount.toLocaleString()} பார்வையாளர்கள்
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="date-dropdown-menu">
          <div className="dinamalar-calendar-panel" onClick={(e) => e.stopPropagation()}>
            {/* Row 1: Header Navigation */}
            <div className="dc-header">
              <button type="button" className="dc-nav-btn" onClick={handlePrevDay}>&lt; முந்தைய</button>
              
              <div 
                className="dc-date-picker-wrapper" 
                ref={calendarWrapperRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCalendar(!showCalendar);
                }}
                title="தேதியைத் தேர்ந்தெடுக்கவும்"
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
                        {calendarMonth.toLocaleString("ta-IN", { month: "long" })}, {calendarMonth.getFullYear()}
                      </span>
                      <div className="cc-nav-arrows">
                        <button type="button" className="cc-arrow-btn" onClick={prevMonth} title="முந்தைய மாதம்">
                          <FaChevronUp size={10} />
                        </button>
                        <button type="button" className="cc-arrow-btn" onClick={nextMonth} title="அடுத்த மாதம்">
                          <FaChevronDown size={10} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="cc-weekdays">
                      {["ஞா", "தி", "செ", "பு", "வி", "வெ", "ச"].map(d => (
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
                        அழி
                      </button>
                      <button type="button" className="cc-footer-btn" onClick={handleCalendarToday}>
                        இன்று
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
                அடுத்த &gt;
              </button>
            </div>

            {/* Row 2: Display Info */}
            <div className="dc-big-dates-row">
              <div className="dc-big-date-box left-box">
                <div className="dc-month-text">{displayDate.toLocaleString("ta-IN", { month: "long" })}</div>
                <div className="dc-huge-text">{date}</div>
              </div>
              <div className="dc-big-date-box right-box">
                <div className="dc-month-text">{tamilMonth} <br/> {tamilYear} வருடம்</div>
                <div className="dc-huge-text highlight-text">{tamilDate}</div>
                <div className="dc-special-days"></div>
              </div>
            </div>

            {/* Row 3: Info Bar */}
            <div className="dc-day-info-bar">
              <span>{displayDate.toLocaleString("ta-IN", { month: "long" })} {date}, {year}</span>
              <span className="dc-day-name">{tamilWeekDays[day]}</span>
              <span></span>
            </div>

            {/* Row 4: Timings Section */}
            <div className="dc-timings-section" onClick={(e) => e.stopPropagation()}>
              <div className="dc-timings-col">
                <div className="dc-timing-item">
                  <span className="dc-label">நல்ல நேரம் (காலை)</span>
                  <span className="dc-val">{info.nallaNeramMorning}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">நல்ல நேரம் (மாலை)</span>
                  <span className="dc-val">{info.nallaNeramEvening}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">இராகு காலம்</span>
                  <span className="dc-val">{info.raghuKalam}</span>
                </div>
              </div>

              <div className="dc-timings-icon">
                <FaSun size={30} style={{ color: "#eab308" }} />
              </div>

              <div className="dc-timings-col">
                <div className="dc-timing-item">
                  <span className="dc-label">எமகண்டம்</span>
                  <span className="dc-val">{info.yamagandam}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">குளிகை</span>
                  <span className="dc-val">{info.kuligai}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">சூலம் / பரிகாரம்</span>
                  <span className="dc-val">{info.soolam} / {info.parigaram}</span>
                </div>
              </div>
            </div>

            {/* Row 5: Panchangam Section */}
            <div className="dc-panchangam-section" onClick={(e) => e.stopPropagation()}>
              <div className="dc-panchangam-col">
                <div className="dc-timing-item">
                  <span className="dc-label">திதி</span>
                  <span className="dc-val">{info.thithi}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">நட்சத்திரம்</span>
                  <span className="dc-val">{info.natchathiram}</span>
                </div>
              </div>
              <div className="dc-panchangam-col">
                <div className="dc-timing-item">
                  <span className="dc-label">யோகம்</span>
                  <span className="dc-val">{info.yogam}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">கரணம்</span>
                  <span className="dc-val">{info.karanam}</span>
                </div>
                <div className="dc-timing-item">
                  <span className="dc-label">சந்திராஷ்டமம்</span>
                  <span className="dc-val">{info.chandrashtamam}</span>
                </div>
              </div>
            </div>

            {/* Row 6: Daily Quote Box */}
            <div className="dc-info-box" onClick={(e) => e.stopPropagation()}>
              <div className="dc-info-text">
                <p style={{ margin: "0 0 5px 0", color: "var(--text-primary)", fontWeight: "700" }}>இன்றைய சிந்தனை:</p>
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