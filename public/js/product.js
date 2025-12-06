/**
 * product.js - 상품 관련 JavaScript 기능
 * 
 * 역할:
 * - 상품 관련 페이지에서 사용되는 프론트엔드 JavaScript 기능 제공
 * - 이미지 업로드 및 미리보기 (클라이언트 사이드)
 * - AJAX를 통한 상품 인터랙션 (찜하기, 상태 변경, 삭제)
 * - 댓글/답글 UI 제어 및 AJAX 삭제
 * 
 * 사용 페이지:
 * - views/product/list.ejs (상품 목록 - 찜하기 기능)
 * - views/product/detail.ejs (상품 상세 - 찜하기, 댓글, 이미지 갤러리)
 * - views/product/write.ejs (상품 등록 - 이미지 업로드 미리보기)
 * - views/product/edit.ejs (상품 수정 - 이미지 업로드 미리보기, 상태 변경)
 * 
 * 주요 기능:
 * 
 * 1. 이미지 업로드 및 미리보기 (프론트엔드 전용)
 *    - #image-upload 파일 선택 시 미리보기 표시
 *    - 제품이미지 한개 파일 업로드
 *    - 이미지 파일만 허용
 *    - 실제 업로드는 HTML 폼 제출 시 서버에서 처리
 *    ⚠️ 백엔드 구현 필요: routes/productRoutes.js, controllers/productController.js, middlewares/upload.js
 * 
 * 2. 찜하기 기능 (AJAX)
 *    - .like-button 클릭 시 AJAX로 찜하기 토글
 *    - POST /api/product/:id/like
 *    - 응답: { liked: boolean, likeCount: number }
 *    - 아이콘 및 찜 개수 실시간 업데이트
 *    ⚠️ 백엔드 구현 필요: routes/productRoutes.js에 POST /api/product/:id/like 라우트 추가
 *                        controllers/productController.js에 toggleLike 함수 구현
 * 
 * 3. 상품 상태 변경 (AJAX)
 *    - input[name="product-status"] 라디오 버튼 변경 시 AJAX로 상태 변경
 *    - POST /product/:id/status
 *    - 응답: { status: string }
 *    - 상태 뱃지 실시간 업데이트
 *    ⚠️ 백엔드 구현 필요: routes/productRoutes.js에 POST /product/:id/status 라우트 추가
 *                        controllers/productController.js에 updateStatus 함수 구현
 * 
 * 4. 상품 삭제 (AJAX)
 *    - window.deleteProduct(productId) 함수 호출
 *    - POST /product/:id/delete
 *    - 삭제 성공 시 상품 목록 페이지로 리다이렉트
 *    ⚠️ 백엔드 구현 필요: routes/productRoutes.js에 POST /product/:id/delete 라우트 추가
 *                        controllers/productController.js에 deleteProduct 함수 구현 (권한 체크 필요)
 * 
 * 5. 이미지 갤러리 슬라이더 (프론트엔드 전용)
 *    - .image-gallery 내 썸네일 클릭 시 메인 이미지 변경
 *    - 인디케이터 클릭으로 이미지 전환
 *    - 자동 슬라이드 (5초 간격, 선택사항)
 * 
 * 6. 댓글 및 대댓글 기능
 *    - 답글 버튼 클릭: .reply-form 표시/숨김 (프론트엔드 전용)
 *    - 답글 취소 버튼: .reply-form 숨김 및 내용 초기화 (프론트엔드 전용)
 *    - 댓글/답글 삭제: DELETE /product/comment/:id (AJAX)
 *    - 댓글 시간 표시: Utils.getRelativeTime() 사용하여 상대 시간 표시
 *    - 동적 댓글 추가 감지: MutationObserver 사용
 *    ⚠️ 백엔드 구현 필요:
 *      - 댓글 작성: POST /product/:id/comment (HTML 폼 제출, views/product/detail.ejs)
 *      - 답글 작성: POST /product/:id/comment/:commentId/reply (HTML 폼 제출, views/product/detail.ejs)
 *      - 댓글/답글 삭제: DELETE /product/comment/:id (routes/productRoutes.js, controllers/productController.js)
 * 
 * 의존성:
 * - common.js의 Utils 객체 필요 (showNotification, getRelativeTime)
 * - CSS: pages.css의 .product-*, .comment-* 클래스 사용
 * 
 * 주의사항:
 * - 이 파일은 상품 관련 페이지에서만 로드됨
 * - 백엔드 구현이 필요한 기능은 각 섹션에 ⚠️ 표시 및 상세 주석 포함
 * - HTML 폼 제출은 서버 사이드에서 처리 (댓글/답글 작성)
 */

// 이미지 업로드 및 미리보기 기능
// ⚠️ 백엔드 구현 필요:
//   - routes/productRoutes.js: POST /product/write, POST /product/:id/edit 라우트 확인
//   - controllers/productController.js: createProduct, updateProduct 함수에서 이미지 업로드 처리
//   - middlewares/upload.js: Multer 설정 확인 (이미지 파일 업로드 처리)
//   - 실제 파일 업로드는 HTML 폼 제출 시 서버에서 처리됨 (이 코드는 클라이언트 사이드 미리보기만 담당)
(function() {
  'use strict';
  
  /**
   * 이미지 개수 업데이트
   */
  function updateImageCount() {
    const preview = document.getElementById('image-preview');
    const countElement = document.getElementById('image-count');
    if (preview && countElement) {
      const count = preview.children.length;
      countElement.textContent = count;
    }
  }
  
  /**
   * 이미지 업로드 핸들러 (클라이언트 사이드 미리보기)
   * 실제 파일 업로드는 폼 제출 시 서버에서 처리됩니다.
   * @param {Event} event - 파일 입력 이벤트
   */
  function handleImageUpload(event) {
    const files = event.target.files;
    const preview = document.getElementById('image-preview');

    if (!preview) return;

    // 파일이 선택되지 않은 경우
    if (files.length === 0) {
      return;
    }

    // 1장 제한
    if (files.length > 1) {
      alert("상품 이미지는 1장만 업로드할 수 있습니다.");
      event.target.value = "";
      preview.innerHTML = "";
      document.getElementById("image-count").textContent = "0";
      return;
    }

    // 기존 이미지 제거 후 새 이미지 추가
    preview.innerHTML = "";

    const file = files[0];

    if (!file || !file.type.startsWith('image/')) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
      const div = document.createElement('div');
      div.className = 'preview-image-wrapper';

      div.innerHTML = `
        <img class="preview-image" src="${e.target.result}" alt="미리보기 이미지" />
        <span class="preview-main-badge">대표</span>
        <button type="button" class="preview-remove-button" onclick="removePreviewImage(this)">
          <span class="material-symbols-outlined">close</span>
        </button>
      `;

      preview.appendChild(div);
      document.getElementById("image-count").textContent = "1";
    };

    reader.readAsDataURL(file);
  }
  
  /**
   * 미리보기 이미지 제거
   * @param {HTMLElement} button - 제거 버튼 요소
   */
  window.removePreviewImage = function(button) {
  const wrapper = button.closest('.preview-image-wrapper');
  if (wrapper) {
    wrapper.remove();
    document.getElementById("image-count").textContent = "0";

    const imageUpload = document.getElementById('image-upload');
    if (imageUpload) imageUpload.value = "";
  }
};
  
  // 이미지 업로드 입력 필드에 이벤트 리스너 연결
  document.addEventListener('DOMContentLoaded', function() {
    const imageUpload = document.getElementById('image-upload');
    if (imageUpload) {
      imageUpload.addEventListener('change', handleImageUpload);
    }
    // 초기 이미지 개수 표시
    updateImageCount();
  });
  
  // 드래그 앤 드롭 기능 (선택사항)
  document.addEventListener('DOMContentLoaded', function() {
    const uploadDropzone = document.querySelector('.upload-dropzone');
    const imageUpload = document.getElementById('image-upload');
    
    if (uploadDropzone && imageUpload) {
      uploadDropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadDropzone.style.borderColor = '#1392ec';
        uploadDropzone.style.backgroundColor = 'rgba(19, 146, 236, 0.1)';
      });
      
      uploadDropzone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadDropzone.style.borderColor = '';
        uploadDropzone.style.backgroundColor = '';
      });
      
      uploadDropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadDropzone.style.borderColor = '';
        uploadDropzone.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          // FileList는 직접 할당할 수 없으므로 DataTransfer를 사용
          const dataTransfer = new DataTransfer();
          for (let i = 0; i < files.length; i++) {
            dataTransfer.items.add(files[i]);
          }
          imageUpload.files = dataTransfer.files;
          
          // change 이벤트 발생
          const event = new Event('change', { bubbles: true });
          imageUpload.dispatchEvent(event);
        }
      });
    }
  });
})();

// 찜하기 기능 (AJAX)
// ⚠️ 백엔드 구현 필요:
//   - routes/productRoutes.js: POST /api/product/:id/like 라우트 추가
//   - controllers/productController.js: toggleLike 함수 구현 (JSON 응답: { liked: boolean, likeCount: number })
(function() {
  'use strict';
  
  /**
   * 찜하기 토글
   * @param {number} productId - 상품 ID
   * @param {HTMLElement} button - 찜하기 버튼 요소
   */
  async function toggleLike(productId, button) {
    try {
      const res = await fetch(`/product/${productId}/like`, {
        method: "POST"
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "찜하기 오류");

        return;
      }

      // UI 아이콘 업데이트
      const icon = button.querySelector(".material-symbols-outlined");

      if (data.liked) {
        icon.textContent = "favorite";
        icon.style.fontVariationSettings = "'FILL' 1";
        button.classList.add("liked");
      } else {
        icon.textContent = "favorite_border";
        icon.style.fontVariationSettings = "'FILL' 0";
        button.classList.remove("liked");
      }

      // 찜 개수 업데이트
      const productCard = button.closest(".product-card");
      if (productCard) {
        const likeCountEl = productCard.querySelector(".like-count");
        if (likeCountEl) {
          likeCountEl.textContent = data.likeCount ?? 0;
        }
      }

    } catch (err) {
      console.error(err);
      alert("찜하기 오류");
    }
  }
  
  // 찜하기 버튼에 이벤트 리스너 연결
  document.addEventListener('DOMContentLoaded', function() {
    const likeButtons = document.querySelectorAll('.like-button, [data-like-product]');
    
    likeButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const productId = button.dataset.likeProduct || 
                        button.closest('[data-product-id]')?.dataset.productId ||
                        window.location.pathname.split('/').pop();
        
        toggleLike(parseInt(productId), button);
      });
    });
  });
  
  // 전역으로 사용할 수 있도록 export
  window.toggleLike = toggleLike;
})();

// 상품 상태 변경 기능 (AJAX)
// ⚠️ 백엔드 구현 필요:
//   - routes/productRoutes.js: POST /product/:id/status 라우트 추가
//   - controllers/productController.js: updateStatus 함수 구현 (JSON 응답: { status: string })
(function() {
  'use strict';
  
  /**
   * 상품 상태 변경
   * @param {number} productId - 상품 ID
   * @param {string} status - 새로운 상태 ('For Sale', 'Reserved', 'Sold')
   */
  async function updateProductStatus(productId, status) {
    if (!productId || !status) {
      Utils.showNotification('상품 ID 또는 상태가 없습니다.', 'error');
      return;
    }
    
    try {
      const response = await fetch(`/product/${productId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `product-status=${encodeURIComponent(status)}`,
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        Utils.showNotification('상품 상태가 변경되었습니다.', 'success');
        
        // 상태 뱃지 업데이트
        const statusBadge = document.querySelector('.product-status-badge');
        if (statusBadge) {
          statusBadge.textContent = data.status || status;
        }
      } else {
        throw new Error('상태 변경 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      Utils.showNotification(error.message || '상태 변경 중 오류가 발생했습니다.', 'error');
    }
  }
  
  // 상태 라디오 버튼에 이벤트 리스너 연결
  document.addEventListener('DOMContentLoaded', function() {
    const statusRadios = document.querySelectorAll('input[name="product-status"]');
    const statusForm = document.querySelector('form[action*="/status"]');
    
    // 폼 제출을 AJAX로 처리 (한 번만 등록)
    if (statusForm) {
      statusForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const productId = window.location.pathname.split('/').pop();
        const checkedRadio = document.querySelector('input[name="product-status"]:checked');
        if (checkedRadio) {
          updateProductStatus(parseInt(productId), checkedRadio.value);
        }
      });
    }
    
    // 라디오 버튼 변경 시 즉시 AJAX로 처리 (선택사항)
    statusRadios.forEach(radio => {
    radio.addEventListener("change", function() {
      const productId = window.location.pathname.split("/")[2];
      updateProductStatus(productId, this.value);
      });
    });
  });
  
  // 전역으로 사용할 수 있도록 export
  window.updateProductStatus = updateProductStatus;
})();

// 상품 삭제 기능
// ⚠️ 백엔드 구현 필요:
//   - routes/productRoutes.js: POST /product/:id/delete 라우트 추가
//   - controllers/productController.js: deleteProduct 함수 구현 (권한 체크: 본인 또는 관리자만 삭제 가능)
(function() {
  'use strict';
  
  /**
   * 상품 삭제 확인 및 실행
   * @param {number} productId - 상품 ID
   */
  window.deleteProduct = async function(productId) {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await fetch(`/product/${productId}/delete`, {
        method: 'POST',
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        Utils.showNotification('상품이 삭제되었습니다.', 'success');
        setTimeout(() => {
          window.location.href = '/product/list';
        }, 1000);
      } else {
        throw new Error('상품 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      Utils.showNotification(error.message || '상품 삭제 중 오류가 발생했습니다.', 'error');
    }
  };
})();

// 이미지 갤러리 슬라이더 (상품 상세 페이지)
(function() {
  'use strict';
  
  /**
   * 이미지 갤러리 초기화
   */
  function initImageGallery() {
    const gallery = document.querySelector('.image-gallery');
    if (!gallery) return;
    
    const mainImage = gallery.querySelector('.main-image');
    const thumbnails = gallery.querySelectorAll('.thumbnail');
    const indicators = gallery.querySelectorAll('.image-indicator');
    
    if (!mainImage || thumbnails.length === 0) return;
    
    let currentIndex = 0;
    const images = Array.from(thumbnails).map(thumb => thumb.dataset.imageSrc);
    
    // 썸네일 클릭 이벤트
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', function() {
        currentIndex = index;
        updateMainImage(images[index]);
        updateIndicators(index);
      });
    });
    
    // 인디케이터 클릭 이벤트
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', function() {
        currentIndex = index;
        if (images[index]) {
          updateMainImage(images[index]);
          updateIndicators(index);
        }
      });
    });
    
    function updateMainImage(src) {
      mainImage.src = src;
    }
    
    function updateIndicators(activeIndex) {
      indicators.forEach((indicator, index) => {
        if (index === activeIndex) {
          indicator.classList.add('image-indicator-active');
        } else {
          indicator.classList.remove('image-indicator-active');
        }
      });
    }
    
    // 자동 슬라이드 (선택사항)
    if (images.length > 1) {
      setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        updateMainImage(images[currentIndex]);
        updateIndicators(currentIndex);
      }, 5000);
    }
  }
  
  // 페이지 로드 시 갤러리 초기화
  document.addEventListener('DOMContentLoaded', initImageGallery);
})();

// 댓글 및 대댓글 기능
// ⚠️ 백엔드 구현 필요:
//   [댓글 작성] - HTML 폼 제출 (views/product/detail.ejs)
//     - routes/productRoutes.js: POST /product/:id/comment 라우트 추가
//     - controllers/productController.js: createComment 함수 구현
//     - 요청 본문: { content: string }
//     - 응답: 댓글 작성 후 상품 상세 페이지로 리다이렉트 또는 JSON 응답
//   
//   [답글 작성] - HTML 폼 제출 (views/product/detail.ejs)
//     - routes/productRoutes.js: POST /product/:id/comment/:commentId/reply 라우트 추가
//     - controllers/productController.js: createReply 함수 구현
//     - 요청 본문: { content: string }
//     - 응답: 답글 작성 후 상품 상세 페이지로 리다이렉트 또는 JSON 응답
//
//   [댓글/답글 삭제] - AJAX 호출 (아래 initDeleteButtons 참고)
(function() {
  'use strict';
  
  /**
   * 답글 버튼 클릭 핸들러
   * (프론트엔드 전용 - UI 제어만 담당)
   */
  function initReplyButtons() {
    const replyButtons = document.querySelectorAll('.comment-reply-btn');
    replyButtons.forEach(button => {
      button.addEventListener('click', function() {
        const commentId = this.getAttribute('data-comment-id');
        const replyForm = document.querySelector(`.reply-form[data-parent-id="${commentId}"]`);
        
        if (replyForm) {
          const isVisible = replyForm.style.display !== 'none';
          replyForm.style.display = isVisible ? 'none' : 'flex';
          
          if (!isVisible) {
            const textarea = replyForm.querySelector('textarea');
            if (textarea) {
              textarea.focus();
            }
          }
        }
      });
    });
  }
  
  /**
   * 답글 취소 버튼 핸들러
   * (프론트엔드 전용 - UI 제어만 담당)
   */
  function initCancelButtons() {
    const cancelButtons = document.querySelectorAll('.comment-cancel-btn');
    cancelButtons.forEach(button => {
      button.addEventListener('click', function() {
        const parentId = this.getAttribute('data-parent-id');
        const replyForm = document.querySelector(`.reply-form[data-parent-id="${parentId}"]`);
        
        if (replyForm) {
          replyForm.style.display = 'none';
          const textarea = replyForm.querySelector('textarea');
          if (textarea) {
            textarea.value = '';
          }
        }
      });
    });
  }
  
  /**
   * 댓글 삭제 핸들러
   * ⚠️ 백엔드 구현 필요:
   *   - routes/productRoutes.js: DELETE /product/comment/:id 라우트 추가
   *   - controllers/productController.js: deleteComment 함수 구현 (권한 체크: 본인만 삭제 가능)
   *   - JSON 응답: { success: boolean, message?: string }
   */
  function initDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.comment-delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const commentId = this.getAttribute('data-comment-id');
        const replyId = this.getAttribute('data-reply-id');
        const id = commentId || replyId;
        
        if (!confirm('정말 삭제하시겠습니까?')) {
          return;
        }
        
        // 삭제 요청 (서버 구현 필요)
        fetch(`/product/comment/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const item = document.querySelector(`[data-comment-id="${commentId}"]`) || 
                        document.querySelector(`[data-reply-id="${replyId}"]`);
            if (item) {
              item.remove();
              if (typeof Utils !== 'undefined' && Utils.showNotification) {
                Utils.showNotification('댓글이 삭제되었습니다.', 'success');
              }
            }
          } else {
            if (typeof Utils !== 'undefined' && Utils.showNotification) {
              Utils.showNotification(data.message || '삭제에 실패했습니다.', 'error');
            }
          }
        })
        .catch(error => {
          console.error('Error:', error);
          if (typeof Utils !== 'undefined' && Utils.showNotification) {
            Utils.showNotification('삭제 중 오류가 발생했습니다.', 'error');
          }
        });
      });
    });
  }
  
  /**
   * 댓글 시간 표시 업데이트
   */
  function updateCommentTimes() {
    if (typeof Utils === 'undefined' || !Utils.getRelativeTime) {
      return;
    }
    
    const timeElements = document.querySelectorAll('.comment-time');
    
    timeElements.forEach(element => {
      // 이미 변환된 경우 스킵 (data-relative-time 속성 확인)
      if (element.hasAttribute('data-relative-time')) {
        return;
      }
      
      const timeText = element.textContent.trim();
      
      // 서버에서 온 날짜 문자열이 있다면 상대 시간으로 변환
      if (timeText && timeText !== '방금 전') {
        try {
          // ISO 형식이나 일반 날짜 형식 파싱 시도
          const date = new Date(timeText);
          if (!isNaN(date.getTime())) {
            const relativeTime = Utils.getRelativeTime(date);
            element.textContent = relativeTime;
            // 원본 시간과 변환된 시간 저장
            element.setAttribute('data-original-time', timeText);
            element.setAttribute('data-relative-time', 'true');
          }
        } catch (e) {
          // 파싱 실패 시 원본 유지
          console.debug('Time parsing failed:', timeText);
        }
      } else if (timeText === '방금 전') {
        // 이미 상대 시간인 경우 표시
        element.setAttribute('data-relative-time', 'true');
      }
    });
  }
  
  /**
   * 댓글이 동적으로 추가될 때 시간 업데이트
   */
  function observeNewComments() {
    if (typeof MutationObserver === 'undefined') {
      return;
    }
    
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
          // 새 노드가 추가되면 시간 업데이트
          setTimeout(updateCommentTimes, 100);
        }
      });
    });
    
    observer.observe(commentsList, {
      childList: true,
      subtree: true
    });
  }
  
  // 페이지 로드 시 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (document.querySelector('.comments-section')) {
        initReplyButtons();
        initCancelButtons();
        initDeleteButtons();
        updateCommentTimes();
        observeNewComments();
      }
    });
  } else {
    // 이미 로드된 경우 즉시 실행
    if (document.querySelector('.comments-section')) {
      initReplyButtons();
      initCancelButtons();
      initDeleteButtons();
      updateCommentTimes();
      observeNewComments();
    }
  }
})();

