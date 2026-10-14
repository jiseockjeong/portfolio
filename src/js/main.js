$(document).ready(function () {
  let currentIndex = 0;
  const sections = $('.section');
  const totalSections = sections.length;
  let isScrolling = false;

  // ===================================================
  // 1. 풀페이지 & 프로그레스 바 제어
  // ===================================================
  function checkProgressVisibility() {
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

  checkProgressVisibility();

  sections.each(function () {
    const $sec =$(this);
    const $bar =$sec.find('.progress_bar .bar');

    $sec.on('scroll', function () {
      if (!$sec.hasClass('has_progress')) return;

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

  function moveToSection(index) {
    isScrolling = true;
    currentIndex = index;
    updateNav(currentIndex);

    const targetTop = -(currentIndex * window.innerHeight);
    $('.full_wrap').css('transform', `translateY(${targetTop}px)`);

    setTimeout(function () {
      isScrolling = false;
    }, 650);
  }

  $('.a_list').on('click', '.a_btn', function () {
    if (isScrolling) return;
    const targetClass = $(this).data('sec');
    const $targetSection =$('.section.' + targetClass);

    if ($targetSection.length > 0) {
      const targetIndex = sections.index($targetSection);
      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        moveToSection(targetIndex);
      }
    }
  });

  $(window).on('wheel', function (e) {
    if (isScrolling) return;

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

  $(window).on('resize', function () {
    checkProgressVisibility();
    const targetTop = -(currentIndex * window.innerHeight);
    $('.full_wrap').css('transform', `translateY(${targetTop}px)`);
  });

  // ===================================================
  // 2. SEC3 (PROJECT) 인터랙션 제어
  // ===================================================
  const $sec3 =$('.sec3');
  const $points =$sec3.find('.sub_text .point'); // 0: 지나온길, 1: 42, 2: 12
  const $projectItems =$sec3.find('.right .info_cont > li');
  const defaultImgSrc = $sec3.find('.left .img_box img').attr('src'); // 기본 이미지 백업

  // 초기 기본 텍스트 저장 ('지나온길', '42', '12')
  const initialPointTexts = [];
  $points.each(function (idx) {
    const text = $(this).text().trim();
    initialPointTexts[idx] = text;
    wrapChars($(this), text);
  });

  // 텍스트를 한 글자씩 <span class="char">로 쪼개는 함수
  function wrapChars($el, text) {
    let html = '';
    for (let i = 0; i < text.length; i++) {
      html += `<span class="char">${text[i]}</span>`;
    }
    $el.html(html);
  }

  // .point 텍스트가 순차적으로 내려갔다가 새 텍스트로 올라오는 함수
  function animatePointText($el, newText) {
    const currentText = $el.text().trim();
    if (currentText === String(newText)) return;

    const $oldChars =$el.find('.char');
    const staggerDelay = 50;

    // 1단계: 기존 글자 순차 하강
    $oldChars.each(function (i) {
      const $char =$(this);
      setTimeout(function () {
        $char.addClass('out');
      }, i * staggerDelay);
    });

    const totalOutTime = $oldChars.length * staggerDelay + 250;

    // 2단계: 새 글자 세팅 후 순차 상승
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

  // 숫자 두 자리 포맷팅 (3 -> '03')
  function padZero(num) {
    return num < 10 ? '0' + num : String(num);
  }

  // 좌측 상세 정보 및 이미지 업데이트 함수
  function updateProjectDetail($btn) {
    const $blind =$btn.find('.blind');
    const name = $blind.find('.name').text().trim() || '없음';
    const url = $blind.find('.url').text().trim() || '준비중';
    const duration = $blind.find('.duration').text().trim() || '없음';
    const ac = $blind.find('.ac').text().trim() || '없음';

    // .blind 안에 설정한 img 경로 및 alt 추출
    const $blindImg =$blind.find('img');
    const customImgSrc = $blindImg.attr('src');
    const customImgAlt = $blindImg.attr('alt');

    const $textBox =$sec3.find('.left .text_box');
    const $imgBox =$sec3.find('.left .img_box');
    const $img =$imgBox.find('img');

    // 변경 시작: .info들과 이미지가 먼저 부드럽게 사라짐
    $textBox.addClass('changing');$imgBox.addClass('changing');

    setTimeout(function () {
      // 1. 텍스트 정보 교체
      $('#name').text(name);
      $('#duration').text(duration);
      $('#ac').text(ac);

      // 2. URL 링크 교체
      const $urlLi =$('#url');
      if (url === '준비중' || url === '없음' || !url.startsWith('http')) {
        $urlLi.html(`<a href="#none" class="url">${url}</a>`);
      } else {
        $urlLi.html(`<a href="${url}" target="_blank" rel="noopener noreferrer" class="url">${url}</a>`);
      }

      // 3. 이미지 경로 교체 (설정한 경로가 있으면 적용, 없으면 기본 이미지 유지)
      const finalSrc = customImgSrc ? customImgSrc : defaultImgSrc;
      const finalAlt = customImgAlt ? customImgAlt : `${name} 프로젝트 이미지`;

      $img.attr('src', finalSrc);$img.attr('alt', finalAlt);

      // 4. .info 순차 애니메이션 & 이미지 페이드 인 실행
      $textBox.removeClass('changing');$imgBox.removeClass('changing');
    }, 180);
  }

  // '준비중'(#none) 클릭 시 화면 상단 이동 방지
  $sec3.on('click', '#url a[href="#none"]', function (e) {
    e.preventDefault();
  });

  // 연도별 필터링 및 상단 카운트 갱신 함수
  function filterProjectsByYear() {
    const $activeTab =$sec3.find('.tab_btn_list .tab_btn.on');

    if ($activeTab.length > 0) {
      // 특정 연도 탭 선택 시
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
      // 모든 탭의 on이 꺼졌을 때 초기값('지나온길', '42', '12') 복원
      $projectItems.show();

      animatePointText($points.eq(0), initialPointTexts[0]);
      animatePointText($points.eq(1), initialPointTexts[1]);
      animatePointText($points.eq(2), initialPointTexts[2]);
    }

    // 표시된 리스트 중 첫 번째 프로젝트 자동 활성화
    const $visibleItems = $projectItems.filter(':visible');$sec3.find('.project_btn').removeClass('on');

    if ($visibleItems.length > 0) {
      const $firstBtn = $visibleItems.first().find('.project_btn');$firstBtn.addClass('on');
      updateProjectDetail($firstBtn);
    }

    checkProgressVisibility();
  }

  // 연도 탭(.tab_btn) 클릭 이벤트
  $sec3.on('click', '.tab_btn_list .tab_btn', function () {
    const $this = $(this);$sec3.find('.tab_btn_list .tab_btn').not($this).removeClass('on');$this.toggleClass('on');

    filterProjectsByYear();
  });

  // 우측 프로젝트 버튼(.project_btn) 클릭 이벤트
  $sec3.on('click', '.project_btn', function () {
    const $this =$(this);
    if ($this.hasClass('on')) return;

    $sec3.find('.project_btn').removeClass('on');$this.addClass('on');

    updateProjectDetail($this);
  });

  // 초기 진입 시 세팅
  if ($sec3.find('.tab_btn_list .tab_btn.on').length > 0) {
    filterProjectsByYear();
  } else {
    const $initProjectBtn =$sec3.find('.project_btn.on').first();
    if ($initProjectBtn.length > 0) {
      updateProjectDetail($initProjectBtn);
    }
  }
});