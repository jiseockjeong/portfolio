$(document).ready(function () {
  let currentIndex = 0;
  const sections = $('.section');
  const totalSections = sections.length;
  let isScrolling = false;
  const BREAKPOINT = 1024; // 풀페이지 해제 기준 해상도
  let isMobile = window.innerWidth <= BREAKPOINT;

  // ===================================================
  // 1. 반응형 모드 감지 & 풀페이지 / 일반 스크롤 제어
  // ===================================================

  // 100vh 초과 여부 체크 및 프로그레스 바 표시 클래스 부여 (PC 전용)
  function checkProgressVisibility() {
    if (isMobile) {
      sections.removeClass('has_progress');
      return;
    }

    sections.each(function () {
      const $sec =$(this);
      const scrollHeight = this.scrollHeight;
      const clientHeight = this.clientHeight;

      if (scrollHeight > clientHeight + 1) {
        $sec.addClass('has_progress');
      } else {
        $sec.removeClass('has_progress');
      }
    });
  }

  // 네비게이션 버튼 active 동기화
  function updateNav(index) {
    $('.a_list .a_btn').removeClass('active');
    const currentSecElem = sections.eq(index);
    $('.a_list .a_btn').each(function () {
      const targetSecClass = $(this).data('sec');
      if (currentSecElem.hasClass(targetSecClass)) {
        $(this).addClass('active');
      }
    });
  }

  // [PC 전용] 풀페이지 섹션 이동 함수
  function moveToSection(index) {
    if (isMobile) return;

    isScrolling = true;
    currentIndex = index;
    updateNav(currentIndex);

    const targetTop = -(currentIndex * window.innerHeight);
    $('.full_wrap').css('transform', `translateY(${targetTop}px)`);

    setTimeout(function () {
      isScrolling = false;
    }, 650);
  }

  // 화면 리사이즈 시 PC <-> 1024px 이하 모드 자동 전환
  function handleResponsiveMode() {
    const nowMobile = window.innerWidth <= BREAKPOINT;

    if (nowMobile !== isMobile) {
      // 모드가 바뀐 순간 (PC -> 모바일 또는 모바일 -> PC)
      isMobile = nowMobile;

      if (isMobile) {
        // [PC -> 1024px 이하로 진입]
        isScrolling = false;
        $('.full_wrap').css('transform', 'none');
        sections.removeClass('has_progress');

        // 풀페이지에서 보고 있던 섹션 위치로 일반 스크롤 위치 이동
        const targetOffset = sections.eq(currentIndex).offset().top;
        $('html, body').scrollTop(targetOffset);
      } else {
        // [1024px 이하 -> PC로 진입]
        $('html, body').scrollTop(0);
        sections.scrollTop(0);

        // 현재 인덱스에 맞춰 풀페이지 위치 재정렬
        const targetTop = -(currentIndex * window.innerHeight);
        $('.full_wrap').css('transform', `translateY(${targetTop}px)`);
        checkProgressVisibility();
      }
    } else if (!isMobile) {
      // PC 상태에서 창 크기만 조절된 경우
      checkProgressVisibility();
      const targetTop = -(currentIndex * window.innerHeight);
      $('.full_wrap').css('transform', `translateY(${targetTop}px)`);
    }
  }

  // 초기 실행
  checkProgressVisibility();
  if (isMobile) {
    $('.full_wrap').css('transform', 'none');
  }

  // 섹션별 내부 스크롤 이벤트 (PC 프로그레스 바 계산)
  sections.each(function () {
    const $sec =$(this);
    const $bar =$sec.find('.progress_bar .bar');

    $sec.on('scroll', function () {
      if (isMobile || !$sec.hasClass('has_progress')) return;

      const scrollTop = $sec.scrollTop();
      const scrollHeight = this.scrollHeight;
      const clientHeight = this.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll > 0) {
        const progress = (scrollTop / maxScroll) * 100;
        $bar.css('width', `${progress}%`);
      }
    });
  });

  // 네비게이션 버튼(.a_btn) 클릭 시 이동 (PC / 모바일 분기 처리)
  $('.a_list').on('click', '.a_btn', function () {
    const targetClass = $(this).data('sec');
    const $targetSection =$('.section.' + targetClass);

    if ($targetSection.length === 0) return;
    const targetIndex = sections.index($targetSection);

    if (isMobile) {
      // [1024px 이하]: 일반 웹처럼 해당 섹션 위치로 부드럽게 스크롤 이동
      currentIndex = targetIndex;
      updateNav(currentIndex);
      const offsetTop = $targetSection.offset().top;
      $('html, body').stop().animate({ scrollTop: offsetTop }, 500);
    } else {
      // [PC]: 풀페이지 트랜지션 이동
      if (isScrolling) return;
      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        moveToSection(targetIndex);
      }
    }
  });

  // [PC 전용] 마우스 휠 풀페이지 이벤트
  $(window).on('wheel', function (e) {
    // 1024px 이하에서는 휠 이벤트를 완전히 무시하고 브라우저 기본 스크롤 사용
    if (isMobile || isScrolling) return;

    const currentSection = sections.eq(currentIndex)[0];
    const delta = e.originalEvent.deltaY;

    const scrollTop = Math.ceil(currentSection.scrollTop);
    const scrollHeight = currentSection.scrollHeight;
    const clientHeight = currentSection.clientHeight;

    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
    const isAtTop = scrollTop <= 0;

    if (delta > 0) {
      if (isAtBottom && currentIndex < totalSections - 1) {
        moveToSection(currentIndex + 1);
      }
    } else {
      if (isAtTop && currentIndex > 0) {
        moveToSection(currentIndex - 1);
      }
    }
  });

  // [1024px 이하 전용] 일반 스크롤 시 현재 섹션 감지하여 currentIndex 및 네비게이션 갱신
  $(window).on('scroll', function () {
    if (!isMobile) return;

    const scrollPos = $(window).scrollTop() + (window.innerHeight / 3);

    sections.each(function (idx) {
      const top = $(this).offset().top;
      const bottom = top + $(this).outerHeight();

      if (scrollPos >= top && scrollPos < bottom) {
        if (currentIndex !== idx) {
          currentIndex = idx;
          updateNav(currentIndex);
        }
      }
    });
  });

  // 창 리사이즈 감지
  $(window).on('resize', function () {
    handleResponsiveMode();
  });

  // ===================================================
  // 2. SEC3 (PROJECT) 인터랙션 제어 (PC/모바일 공통 작동)
  // ===================================================
  const $sec3 =$('.sec3');
  const $points =$sec3.find('.sub_text .point');
  const $projectItems =$sec3.find('.right .info_cont > li');
  const defaultImgSrc = $sec3.find('.left .img_box img').attr('src');

  const initialPointTexts = [];
  $points.each(function (idx) {
    const text = $(this).text().trim();
    initialPointTexts[idx] = text;
    wrapChars($(this), text);
  });

  function wrapChars($el, text) {
    let html = '';
    for (let i = 0; i < text.length; i++) {
      html += `<span class="char">${text[i]}</span>`;
    }
    $el.html(html);
  }

  function animatePointText($el, newText) {
    const currentText = $el.text().trim();
    if (currentText === String(newText)) return;

    const $oldChars =$el.find('.char');
    const staggerDelay = 50;

    $oldChars.each(function (i) {
      const $char =$(this);
      setTimeout(function () {
        $char.addClass('out');
      }, i * staggerDelay);
    });

    const totalOutTime = $oldChars.length * staggerDelay + 250;

    setTimeout(function () {
      let newHtml = '';
      const str = String(newText);
      for (let i = 0; i < str.length; i++) {
        newHtml += `<span class="char out">${str[i]}</span>`;
      }
      $el.html(newHtml);

      const $newChars =$el.find('.char');
      requestAnimationFrame(function () {
        $newChars.each(function (i) {
          const $char =$(this);
          setTimeout(function () {
            $char.removeClass('out');
          }, i * staggerDelay);
        });
      });
    }, totalOutTime);
  }

  function padZero(num) {
    return num < 10 ? '0' + num : String(num);
  }

  function updateProjectDetail($btn) {
    const $blind =$btn.find('.blind');
    const name = $blind.find('.name').text().trim() || '없음';
    const url = $blind.find('.url').text().trim() || '준비중';
    const duration = $blind.find('.duration').text().trim() || '없음';
    const ac = $blind.find('.ac').text().trim() || '없음';

    const $blindImg =$blind.find('img');
    const customImgSrc = $blindImg.attr('src');
    const customImgAlt = $blindImg.attr('alt');

    const $textBox =$sec3.find('.left .text_box');
    const $imgBox =$sec3.find('.left .img_box');
    const $img =$imgBox.find('img');

    $textBox.addClass('changing');$imgBox.addClass('changing');

    setTimeout(function () {
      $('#name').text(name);
      $('#duration').text(duration);
      $('#ac').text(ac);

      const $urlLi =$('#url');
      if (url === '준비중' || url === '없음' || !url.startsWith('http')) {
        $urlLi.html(`<a href="#none" class="url">${url}</a>`);
      } else {
        $urlLi.html(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="url">${url}</a>`);
      }

      const finalSrc = customImgSrc ? customImgSrc : defaultImgSrc;
      const finalAlt = customImgAlt ? customImgAlt : `${name} 프로젝트 이미지`;

      $img.attr('src', finalSrc);$img.attr('alt', finalAlt);

      $textBox.removeClass('changing');$imgBox.removeClass('changing');
    }, 180);
  }

  $sec3.on('click', '#url a[href="#none"]', function (e) {
    e.preventDefault();
  });

  function filterProjectsByYear() {
    const $activeTab =$sec3.find('.tab_btn_list .tab_btn.on');

    if ($activeTab.length > 0) {
      const targetYear = $activeTab.text().trim();
      let totalCount = 0;
      let waCount = 0;

      $projectItems.each(function () {
        const $li =$(this);
        const itemYear = $li.find('.blind .year').text().trim();
        const itemAc = $li.find('.blind .ac').text().trim();

        if (itemYear === targetYear) {
          $li.show();
          totalCount++;
          if (itemAc.startsWith('웹 접근성')) {
            waCount++;
          }
        } else {
          $li.hide();
        }
      });

      animatePointText($points.eq(0), targetYear);
      animatePointText($points.eq(1), padZero(totalCount));
      animatePointText($points.eq(2), padZero(waCount));

    } else {
      $projectItems.show();

      animatePointText($points.eq(0), initialPointTexts[0]);
      animatePointText($points.eq(1), initialPointTexts[1]);
      animatePointText($points.eq(2), initialPointTexts[2]);
    }

    const $visibleItems = $projectItems.filter(':visible');$sec3.find('.project_btn').removeClass('on');

    if ($visibleItems.length > 0) {
      const $firstBtn = $visibleItems.first().find('.project_btn');$firstBtn.addClass('on');
      updateProjectDetail($firstBtn);
    }

    checkProgressVisibility();
  }

  $sec3.on('click', '.tab_btn_list .tab_btn', function () {
    const $this = $(this);$sec3.find('.tab_btn_list .tab_btn').not($this).removeClass('on');$this.toggleClass('on');

    filterProjectsByYear();
  });

  $sec3.on('click', '.project_btn', function () {
    const $this =$(this);
    if ($this.hasClass('on')) return;

    $sec3.find('.project_btn').removeClass('on');$this.addClass('on');

    updateProjectDetail($this);
  });

  if ($sec3.find('.tab_btn_list .tab_btn.on').length > 0) {
    filterProjectsByYear();
  } else {
    const $initProjectBtn =$sec3.find('.project_btn.on').first();
    if ($initProjectBtn.length > 0) {
      updateProjectDetail($initProjectBtn);
    }
  }
});

$(function(){
  $('.project_btn').on('click', function(){
    if($(window).innerWidth() < 1300){
      $('.sec3 .text_box').fadeIn();
      $('body').addClass('modal');
    }
  });

  $('.close_btn').on('click', function(){
    if($(window).innerWidth() < 1300){
      $('.sec3 .text_box').fadeOut();
      $('body').removeClass('modal');
    }
  });
});