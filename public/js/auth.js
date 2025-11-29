/**
 * auth.js - 인증 관련 JavaScript 기능
 * 
 * 역할:
 * - 로그인/회원가입 페이지에서 사용되는 JavaScript 기능
 * - 비밀번호 표시/숨김 토글
 * - 폼 유효성 검사 (이메일, 비밀번호 등)
 * - 로그인/회원가입 폼 전환 (슬라이드 효과)
 * 
 * 사용 페이지:
 * - views/auth/login.ejs (로그인 및 회원가입 폼 포함)
 * 
 * 주요 기능:
 * 
 * 1. 비밀번호 표시/숨김 토글
 *    - .password-toggle-button 클릭 시 비밀번호 표시/숨김
 *    - Material Icons의 visibility/visibility_off 아이콘 사용
 *    - input[type="password"] ↔ input[type="text"] 전환
 * 
 * 2. 폼 유효성 검사
 *    - Utils.validateForm() 사용하여 필수 필드 검사
 *    - 이메일 형식 검사 (정규식)
 *    - 비밀번호 최소 길이 검사 (6자 이상)
 *    - 검사 실패 시 에러 메시지 표시
 * 
 * 3. 로그인/회원가입 폼 전환
 *    - .auth-slider-container에 .show-join 클래스 추가/제거
 *    - 회원가입 폼 표시 시 로그인 폼은 opacity: 0으로 숨김
 *    - 회원가입 폼은 중앙에 위치하며 슬라이드 효과
 *    - 비밀번호 확인 검사 (회원가입 폼 제출 시)
 * 
 * 의존성:
 * - common.js의 Utils 객체 필요 (validateForm, showNotification)
 * - CSS: pages.css의 .auth-* 클래스 사용
 * 
 * 주의사항:
 * - 이 파일은 로그인/회원가입 페이지에서만 로드됨
 * - HTML 폼 제출은 서버 사이드에서 처리 (이 파일은 클라이언트 사이드 검사만)
 */

(function() {
  'use strict';
  
  /**
   * 비밀번호 표시/숨김 토글
   */
  function initPasswordToggle() {
    const passwordToggles = document.querySelectorAll('.password-toggle-button');
    
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input[type="password"], input[type="text"]');
        const icon = this.querySelector('.material-symbols-outlined');
        
        if (!input) return;
        
        if (input.type === 'password') {
          input.type = 'text';
          if (icon) {
            icon.textContent = 'visibility';
            icon.style.fontVariationSettings = "'FILL' 0";
          }
        } else {
          input.type = 'password';
          if (icon) {
            icon.textContent = 'visibility_off';
            icon.style.fontVariationSettings = "'FILL' 0";
          }
        }
      });
    });
  }
  
  /**
   * 폼 유효성 검사 (로그인/회원가입 공통)
   * - 필수 필드 검사
   * - 이메일 형식 검사
   * - 비밀번호 길이 검사
   * - 회원가입 폼의 경우 비밀번호 확인 검사
   */
  function initFormValidation() {
    const forms = document.querySelectorAll('.auth-form');
    
    forms.forEach(form => {
      form.addEventListener('submit', function(e) {
        // 필수 필드 검사
        if (!Utils.validateForm(this)) {
          e.preventDefault();
          Utils.showNotification('모든 필수 항목을 입력해주세요.', 'error');
          return false;
        }
        
        // 이메일 형식 검사
        const emailInput = this.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailInput.value)) {
            e.preventDefault();
            Utils.showNotification('올바른 이메일 형식을 입력해주세요.', 'error');
            emailInput.focus();
            return false;
          }
        }
        
        // 비밀번호 길이 검사
        const passwordInput = this.querySelector('input[name="password"]');
        if (passwordInput && passwordInput.value) {
          if (passwordInput.value.length < 6) {
            e.preventDefault();
            Utils.showNotification('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
            passwordInput.focus();
            return false;
          }
        }
        
        // 회원가입 폼인 경우 비밀번호 확인 검사
        const isJoinForm = this.id === 'join-form';
        if (isJoinForm) {
          const passwordConfirmInput = this.querySelector('input[name="passwordConfirm"]');
          const joinErrorMessage = document.getElementById('join-error-message');
          
          if (passwordInput && passwordConfirmInput) {
            if (passwordInput.value !== passwordConfirmInput.value) {
              e.preventDefault();
              if (joinErrorMessage) {
                joinErrorMessage.textContent = '비밀번호가 일치하지 않습니다.';
              }
              Utils.showNotification('비밀번호가 일치하지 않습니다.', 'error');
              passwordConfirmInput.focus();
              return false;
            }
          }
        }
      });
    });
  }
  
  /**
   * 로그인/회원가입 폼 전환 기능 (UI 제어만)
   * - 회원가입 링크 클릭 시 회원가입 폼 표시
   * - 취소 버튼 클릭 시 로그인 폼으로 복귀 및 폼 초기화
   */
  function initAuthFormToggle() {
    const sliderContainer = document.querySelector('.auth-slider-container');
    const showJoinLink = document.getElementById('show-join-form');
    const cancelJoinBtn = document.getElementById('cancel-join-form');
    const joinForm = document.getElementById('join-form');
    const joinErrorMessage = document.getElementById('join-error-message');
    
    if (!sliderContainer) return;
    
    // 회원가입 폼 보이기
    if (showJoinLink) {
      showJoinLink.addEventListener('click', function(e) {
        e.preventDefault();
        sliderContainer.classList.add('show-join');
        // 회원가입 폼 초기화
        if (joinForm) {
          joinForm.reset();
          if (joinErrorMessage) {
            joinErrorMessage.textContent = '';
          }
        }
      });
    }
    
    // 취소 버튼 - 로그인 폼으로 돌아가기
    if (cancelJoinBtn) {
      cancelJoinBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sliderContainer.classList.remove('show-join');
        // 폼 초기화
        if (joinForm) {
          joinForm.reset();
          if (joinErrorMessage) {
            joinErrorMessage.textContent = '';
          }
        }
      });
    }
  }
  
  // 페이지 로드 시 초기화
  document.addEventListener('DOMContentLoaded', function() {
    initPasswordToggle();
    initFormValidation();
    initAuthFormToggle();
  });
})();

