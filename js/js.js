document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('container');
    const colors = [
        'radial-gradient(circle, #ff00cc, #9900ff)',
        'radial-gradient(circle, #00ffcc, #0099ff)',
        'radial-gradient(circle, #ffcc00, #ff6600)',
        'radial-gradient(circle, #66ff00, #00ff66)',
        'radial-gradient(circle, #00ccff, #cc00ff)',
        'radial-gradient(circle, #ff0066, #cc00ff)'
    ];
    const logoUrl = "https://yach-static.zhiyinlou.com/online/person/1753170320413/fcj0rgvp0wd/a3475998-f72a-4552-8fbf-dabcf6eb5185.png";
    const ballCount = 12;
    let balls = [];
    let isDragging = false;
    let currentBall = null;
    let offsetX, offsetY;

    const logoImage = new Image();
    logoImage.src = logoUrl;

    for (let i = 0; i < ballCount; i++) {
        createLogoBall(colors[i % colors.length]);
    }

    function createLogoBall(color) {
        const ball = document.createElement('div');
        ball.className = 'logo-ball';

        const size = 80 + Math.random() * 40;
        const x = Math.random() * (window.innerWidth - size);
        const y = Math.random() * (window.innerHeight - size);

        ball.style.width = `${size}px`;
        ball.style.height = `${size}px`;
        ball.style.left = `${x}px`;
        ball.style.top = `${y}px`;
        ball.style.background = color;

        const logoElement = document.createElement('img');
        logoElement.className = 'logo';
        logoElement.src = logoUrl;
        ball.appendChild(logoElement);

        container.appendChild(ball);

        const ballObj = {
            element: ball,
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            size: size,
            mass: size * 0.2
        };

        balls.push(ballObj);

        ball.addEventListener('mousedown', startDrag);
        ball.addEventListener('touchstart', startDrag, { passive: false });

        function startDrag(e) {
            isDragging = true;
            currentBall = ballObj;

            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;

            offsetX = clientX - currentBall.x;
            offsetY = clientY - currentBall.y;

            e.preventDefault();
        }
    }

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);

    function drag(e) {
        if (!isDragging || !currentBall) return;

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        currentBall.x = clientX - offsetX;
        currentBall.y = clientY - offsetY;

        currentBall.element.style.left = `${currentBall.x}px`;
        currentBall.element.style.top = `${currentBall.y}px`;

        e.preventDefault();
    }

    function endDrag() {
        if (!isDragging || !currentBall) return;

        currentBall.vx = (currentBall.x - (currentBall.prevX || currentBall.x)) * 0.2;
        currentBall.vy = (currentBall.y - (currentBall.prevY || currentBall.y)) * 0.2;

        isDragging = false;
        currentBall = null;
    }

    const gravity = 0.2;
    const friction = 0.98;
    const bounce = 0.8;

    function animate() {
        if (!isDragging) {
            for (const ball of balls) {
                ball.prevX = ball.x;
                ball.prevY = ball.y;

                ball.vy += gravity;

                ball.x += ball.vx;
                ball.y += ball.vy;

                ball.vx *= friction;
                ball.vy *= friction;

                if (ball.x + ball.size > window.innerWidth) {
                    ball.x = window.innerWidth - ball.size;
                    ball.vx *= -bounce;
                } else if (ball.x < 0) {
                    ball.x = 0;
                    ball.vx *= -bounce;
                }

                if (ball.y + ball.size > window.innerHeight) {
                    ball.y = window.innerHeight - ball.size;
                    ball.vy *= -bounce;
                } else if (ball.y < 0) {
                    ball.y = 0;
                    ball.vy *= -bounce;
                }

                ball.element.style.left = `${ball.x}px`;
                ball.element.style.top = `${ball.y}px`;
            }

            for (let i = 0; i < balls.length; i++) {
                for (let j = i + 1; j < balls.length; j++) {
                    const ball1 = balls[i];
                    const ball2 = balls[j];

                    const dx = ball2.x - ball1.x;
                    const dy = ball2.y - ball1.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = (ball1.size + ball2.size) / 2;

                    if (distance < minDistance) {
                        const angle = Math.atan2(dy, dx);
                        const sin = Math.sin(angle);
                        const cos = Math.cos(angle);

                        const vx1 = ball1.vx * cos + ball1.vy * sin;
                        const vy1 = ball1.vy * cos - ball1.vx * sin;
                        const vx2 = ball2.vx * cos + ball2.vy * sin;
                        const vy2 = ball2.vy * cos - ball2.vx * sin;

                        const m1 = ball1.mass;
                        const m2 = ball2.mass;
                        const v1Final = (vx1 * (m1 - m2) + 2 * m2 * vx2) / (m1 + m2);
                        const v2Final = (vx2 * (m2 - m1) + 2 * m1 * vx1) / (m1 + m2);

                        ball1.vx = v1Final * cos - vy1 * sin;
                        ball1.vy = vy1 * cos + v1Final * sin;
                        ball2.vx = v2Final * cos - vy2 * sin;
                        ball2.vy = vy2 * cos + v2Final * sin;

                        const overlap = minDistance - distance;
                        const moveX = overlap * Math.cos(angle) * 0.5;
                        const moveY = overlap * Math.sin(angle) * 0.5;

                        ball1.x -= moveX;
                        ball1.y -= moveY;
                        ball2.x += moveX;
                        ball2.y += moveY;

                        ball1.element.style.boxShadow = `0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.5)`;
                        ball2.element.style.boxShadow = `0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.5)`;
                        setTimeout(() => {
                            ball1.element.style.boxShadow = `0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)`;
                            ball2.element.style.boxShadow = `0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)`;
                        }, 300);
                    }
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', function() {
        for (const ball of balls) {
            if (ball.x + ball.size > window.innerWidth) {
                ball.x = window.innerWidth - ball.size;
            }
            if (ball.y + ball.size > window.innerHeight) {
                ball.y = window.innerHeight - ball.size;
            }
        }
    });
});
