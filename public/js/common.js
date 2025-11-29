/**
 * common.js - 공통 JavaScript 기능
 * 
 * 역할:
 * - 모든 페이지에서 공통으로 사용되는 JavaScript 기능 제공
 * - 전역 유틸리티 함수 및 헬퍼 함수
 * - 다크모드 토글 기능
 * - 검색 기능 (debounce 적용)
 * 
 * 사용 페이지: 모든 페이지 (footer.ejs를 통해 자동 로드)
 * 
 * 주요 기능:
 * 
 * 1. 다크모드 토글
 *    - localStorage에 테마 저장
 *    - 시스템 설정 감지 (prefers-color-scheme)
 *    - #dark-mode-toggle 버튼 클릭 시 토글
 *    - window.darkMode.toggle() 전역 함수 제공
 * 
 * 2. Utils 객체 (전역)
 *    - formatNumber(num): 숫자 천 단위 콤마 포맷팅
 *    - formatDate(date): 날짜 한국어 형식 포맷팅
 *    - getRelativeTime(date): 상대 시간 표시 ("3분 전", "2시간 전" 등)
 *    - debounce(func, wait): 디바운스 함수 (연속 호출 방지)
 *    - throttle(func, limit): 스로틀 함수 (일정 시간마다 실행)
 *    - validateForm(form): 폼 유효성 검사
 *    - showNotification(message, type): 알림 메시지 표시
 * 
 * 3. 검색 기능
 *    - .search-form에 debounce 적용
 *    - Enter 키 입력 시 검색 실행
 *    - 중복 제출 방지
 * 
 * 사용법:
 * - Utils.formatNumber(1234567) // "1,234,567"
 * - Utils.showNotification('성공!', 'success')
 * - window.darkMode.toggle()
 * 
 * 주의사항:
 * - 이 파일은 footer.ejs에서 로드되므로 모든 페이지에서 사용 가능
 * - 다른 JS 파일에서 Utils 객체를 사용할 수 있음
 */

// 다크모드 토글 기능
(function() {
  'use strict';
  
  // 다크모드 상태 확인 및 적용
  function initDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  // 다크모드 토글
  function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }
  
  // 즉시 다크모드 초기화 (페이지 로드 전에 실행)
  initDarkMode();
  
  // DOMContentLoaded 시에도 다시 초기화 (안전장치)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
  } else {
    initDarkMode();
  }
  
  // 다크모드 토글 버튼 이벤트 연결 함수
  function attachDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      // 기존 이벤트 리스너 제거 후 추가 (중복 방지)
      darkModeToggle.removeEventListener('click', toggleDarkMode);
      darkModeToggle.addEventListener('click', toggleDarkMode);
    }
  }
  
  // 즉시 실행 및 DOMContentLoaded 시에도 실행
  attachDarkModeToggle();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachDarkModeToggle);
  }
  
  // 전역으로 사용할 수 있도록 export
  window.darkMode = {
    toggle: toggleDarkMode,
    init: initDarkMode
  };
})();

// 공통 유틸리티 함수
const Utils = {
  /**
   * 숫자를 천 단위 콤마로 포맷팅
   * @param {number} num - 포맷팅할 숫자
   * @returns {string} 포맷팅된 문자열
   */
  formatNumber: function(num) {
    return num.toLocaleString('ko-KR');
  },
  
  /**
   * 날짜를 한국어 형식으로 포맷팅
   * @param {Date|string} date - 포맷팅할 날짜
   * @returns {string} 포맷팅된 날짜 문자열
   */
  formatDate: function(date) {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  /**
   * 상대 시간 표시 (예: "3분 전", "2시간 전")
   * @param {Date|string} date - 날짜
   * @returns {string} 상대 시간 문자열
   */
  getRelativeTime: function(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    return this.formatDate(date);
  },
  
  /**
   * 디바운스 함수 (연속 호출 방지)
   * @param {Function} func - 실행할 함수
   * @param {number} wait - 대기 시간 (ms)
   * @returns {Function} 디바운스된 함수
   */
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  },
  
  /**
   * 스로틀 함수 (일정 시간마다 실행)
   * @param {Function} func - 실행할 함수
   * @param {number} limit - 제한 시간 (ms)
   * @returns {Function} 스로틀된 함수
   */
  throttle: function(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  /**
   * 폼 유효성 검사 헬퍼
   * @param {HTMLFormElement} form - 검사할 폼 요소
   * @returns {boolean} 유효성 여부
   */
  validateForm: function(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        input.classList.add('error');
      } else {
        input.classList.remove('error');
      }
    });
    
    return isValid;
  },
  
  /**
   * 알림 메시지 표시
   * @param {string} message - 표시할 메시지
   * @param {string} type - 메시지 타입 ('success', 'error', 'info')
   */
  showNotification: function(message, type = 'info') {
    // 간단한 알림 구현 (필요시 더 복잡한 UI로 확장 가능)
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background-color: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#1392ec'};
      color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
};

// 전역으로 사용할 수 있도록 export
window.Utils = Utils;

// 검색 입력에 debounce 적용
(function() {
  'use strict';
  
  function initSearchDebounce() {
    const searchInput = document.querySelector('.search-input');
    const searchForm = document.querySelector('.search-form');
    
    if (!searchInput || !searchForm) return;
    
    let isSubmitting = false;
    
    // 폼 제출 함수 (debounce 적용)
    const debouncedSubmit = Utils.debounce(function() {
      if (!isSubmitting) {
        isSubmitting = true;
        searchForm.submit();
      }
    }, 300);
    
    // Enter 키 입력 시 검색
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        debouncedSubmit();
      }
    });
    
    // 폼 제출 이벤트 리스너 (중복 제출 방지)
    searchForm.addEventListener('submit', function(e) {
      if (isSubmitting) {
        e.preventDefault();
        return false;
      }
      isSubmitting = true;
    });
  }
  
  // 페이지 로드 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchDebounce);
  } else {
    initSearchDebounce();
  }
})();

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

