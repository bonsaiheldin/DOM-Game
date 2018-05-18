let Domy =
{
    "width": 960,
    "height": 540,
    "keyboard": {},
    "mouse": {},
    "player": null,
    "score": 0,
    "canvas": null,
    "units": [],
    "bullets": [],
    "bulletsPool": [],
    "particles": [],
    "math": {},
    "time": {},
    "physics": {},
    "audio": {},
    "camera": {},
    "world": {},
    "gui": {}
};

// Initialize camera
Domy.camera =
{
    "x": 0,
    "y": 0,
    "width": Domy.width,
    "height": Domy.height,
    "target": null
};

// Initialize world
Domy.world =
{
    "width": Domy.width * 2,
    "height": Domy.height * 2
};

window.onload = function()
{
    // Load audio files
    Domy.audio.shoot      = new Audio('shoot.ogg?' + Date.now());
    Domy.audio.hit        = new Audio('hit.ogg?' + Date.now());
    Domy.audio.explosion  = new Audio('explosion.ogg?' + Date.now());
    Domy.audio.won        = new Audio('won.ogg?' + Date.now());
    Domy.audio.lost       = new Audio('lost.ogg?' + Date.now());

    // Assign DIVs for easier access
    Domy.gui.main           = document.getElementsByTagName('main')[0];
    Domy.gui.divContainer   = document.getElementById('divContainer');
    Domy.gui.divCanvas      = document.getElementById('divGame');
    Domy.gui.divDebug       = document.getElementById('divDebug');
    Domy.gui.divWon         = document.getElementById('divWon');
    Domy.gui.divLost        = document.getElementById('divLost');
    Domy.gui.buttonRestart  = document.getElementById('buttonRestart');

    // Restart button
    Domy.gui.buttonRestart.onclick = function()
    {
        location.reload();
    };

    // Disable right-click
    // Enabled for demonstration purposes
    Domy.gui.divContainer.oncontextmenu = function(){ return false; };

    // Disable dragging of images
    Domy.gui.divContainer.ondragstart = function() { return false; };

    // Container size
    Domy.gui.divCanvas.style.width = Domy.width;
    Domy.gui.divCanvas.style.height = Domy.height;

    Domy.gui.main.style.width    = Domy.width;
    Domy.gui.main.style.height   = Domy.height;

    // Keyboard
    Domy.keyboard =
    {
        isDown: [],
        isUp: [],
        bspace: 8,
        tab   : 9,
        enter : 13,
        shift : 16,
        ctrl  : 17,
        alt   : 18,
        pause : 19,
        caps  : 20,
        escape: 27,
        space : 32,

        pgup  : 33,
        pgdn  : 34,
        end   : 35,
        home  : 36,

        up    : 38,
        down  : 40,
        left  : 37,
        right : 39,

        zero  : 48,
        one   : 49,
        two   : 50,
        three : 51,
        four  : 52,
        five  : 53,
        six   : 54,
        seven : 55,
        eight : 56,
        nine  : 57,

        a     : 65,
        b     : 66,
        c     : 67,
        d     : 68,
        e     : 69,
        f     : 70,
        g     : 71,
        h     : 72,
        i     : 73,
        j     : 74,
        k     : 75,
        l     : 76,
        m     : 77,
        n     : 78,
        o     : 79,
        p     : 80,
        q     : 81,
        r     : 82,
        s     : 83,
        t     : 84,
        u     : 85,
        v     : 86,
        w     : 87,
        x     : 88,
        y     : 89,
        z     : 90,

        f1    : 112,
        f2    : 113,
        f3    : 114,
        f4    : 115,
        f5    : 116,
        f6    : 117,
        f7    : 118,
        f8    : 119,
        f9    : 120,
        f10   : 121,
        f11   : 122,
        f12   : 123,

        comma : 188,
        dash  : 189,
        period: 190
    };

    window.addEventListener('keydown', function(e)
    {
        Domy.keyboard.isDown[e.keyCode] = true;
        Domy.keyboard.isUp[e.keyCode] = false;
    }, true);

    window.addEventListener('keyup',   function(e)
    {
        Domy.keyboard.isDown[e.keyCode] = false;
        Domy.keyboard.isUp[e.keyCode] = true;
    }, true);

    // Mouse
    Domy.mouse =
    {
        x: 0,
        y: 0,
        isDown: [],
        isUp: [],
        leftButton: 0,
        middleButton: 1,
        rightButton: 2
    };

    window.addEventListener("mousemove",  function(e)
    {
        // Need to add the bounding box of the game div
        // because it's position is abolute
        Domy.mouse.x = e.clientX - Domy.gui.divCanvas.getBoundingClientRect().x;
        Domy.mouse.y = e.clientY - Domy.gui.divCanvas.getBoundingClientRect().y;
    }, false);

    window.addEventListener("mousedown",  function(e)
    {
        Domy.mouse.isDown[e.button] = true;
        Domy.mouse.isUp[e.button] = false;
    }, false);

    window.addEventListener("mouseup",    function(e)
    {
        Domy.mouse.isDown[e.button] = false;
        Domy.mouse.isUp[e.button] = true;
    }, false);

    // Create the player
    Domy.player = new Domy.Unit(Domy.world.width / 2, Domy.world.height / 2, "blue");
    Domy.player.health *= 2; // Double as much life as enemies
    Domy.player.shootSpeed /= 4; // Quadriple as fast as enemies
    Domy.player.bulletSpeed *= 2; // Double as fast as enemies

    // Let the camera follow the player
    Domy.camera.target = Domy.player;

    // Create some enemies
    for (let i = 0; i < 10; i++)
    {
        let x = Domy.math.integerInRange(0, Domy.world.width);
        let y = Domy.math.integerInRange(0, Domy.world.height);
        new Domy.Unit(x, y, "red");
    }

    // Start update and render loops
    MainLoop.setUpdate(Domy.update).setDraw(Domy.render).start();
};

//----------------------------------------------------------------------------------------------------

// The update loop: The game logic happens here

//----------------------------------------------------------------------------------------------------

// Updates all entities
Domy.update = function()
{
    Domy.time.now = Date.now();

    // Apply controls only if player is alive
    if (Domy.player.alive)
    {
        Domy.controls();
    }

    for (let i = 0; i < Domy.units.length; i++)
    {
        let unit = Domy.units[i];
        unit.update();
    }

    for (let i = 0; i < Domy.bullets.length; i++)
    {
        let bullet = Domy.bullets[i];
        bullet.update();
    }

    for (let i = 0; i < Domy.particles.length; i++)
    {
        let particle = Domy.particles[i];
        particle.update();
    }

    // Circle collision
    for (let i = 0; i < Domy.units.length; i++)
    {
        let unit = Domy.units[i];

        for (let j = 0; j < Domy.bullets.length; j++)
        {
            let bullet = Domy.bullets[j];

            // Don't let the unit shoot itself :)
            if (bullet.origin !== unit)
            {
                // Only if the unit is actually alive
                if (unit.alive)
                {
                    if (Domy.physics.collideCircle(unit, bullet))
                    {
                        // Damage the unit
                        unit.health -= bullet.damage;

                        // Destroy the unit if health is 0
                        if (unit.health <= 0)
                        {
                            unit.destroy();
                        }

                        // Play hit sound
                        Domy.audio.play('hit');

                        // Destroy the bullet, so it doesn't hit again
                        bullet.destroy();
                    }
                }
            }
        }
    }
};

//----------------------------------------------------------------------------------------------------

// This loop displays what the update loop has produces

//----------------------------------------------------------------------------------------------------

// Updates what is visible
Domy.render = function()
{
    for (let i = 0; i < Domy.units.length; i++)
    {
        let unit = Domy.units[i];
        unit.render();
    }

    for (let i = 0; i < Domy.bullets.length; i++)
    {
        let bullet = Domy.bullets[i];
        bullet.render();
    }

    for (let i = 0; i < Domy.particles.length; i++)
    {
        let particle = Domy.particles[i];
        particle.render();
    }

    Domy.camera.update();

    // Show ingame GUI and debug stuff
    Domy.gui.divDebug.innerHTML = ""
    + "Health: " + Domy.player.health
    + "<br>Score: " + Domy.score
    + "<br>Units: " + Domy.Unit.count
    + "<br>Bullets: " + Domy.Bullet.count
    + "<br>Particles: " + Domy.Particle.count
    + "<br>Position: " + Domy.player.x + " / " + Domy.player.y
};

//----------------------------------------------------------------------------------------------------

// Controls

//----------------------------------------------------------------------------------------------------

Domy.controls = function()
{
    Domy.player.isMoving = false;

    if (Domy.keyboard.isDown[Domy.keyboard.a])
    {
        Domy.player.x = parseInt(Domy.player.x) - Domy.player.speed;
        Domy.player.isMoving = true;
    }

    else if (Domy.keyboard.isDown[Domy.keyboard.d])
    {
        Domy.player.x = parseInt(Domy.player.x) + Domy.player.speed;
        Domy.player.isMoving = true;
    }

    if (Domy.keyboard.isDown[Domy.keyboard.w])
    {
        Domy.player.y = parseInt(Domy.player.y) - Domy.player.speed;
        Domy.player.isMoving = true;
    }

    else if (Domy.keyboard.isDown[Domy.keyboard.s])
    {
        Domy.player.y = parseInt(Domy.player.y) + Domy.player.speed;
        Domy.player.isMoving = true;
    }

    if (Domy.mouse.isDown[Domy.mouse.leftButton])
    {
        let angleToMouse = Domy.math.angleBetween(Domy.player.x, Domy.player.y, Domy.mouse.x, Domy.mouse.y);
        Domy.player.shoot(angleToMouse);
    }
};

//----------------------------------------------------------------------------------------------------

// Entities

//----------------------------------------------------------------------------------------------------

// Creates a unit
Domy.Unit = function(x, y, color)
{
    this.x = x;
    this.y = y;
    this.color = color;

    // Internal values
    this.alive = true;
    this.alpha = 1;
    this.width = 48;
    this.height = 48;
    this.speed = 3;
    this.health = 5;
    this.shootNext = 0;
    this.shootSpeed = 1000;
    this.bulletSpeed = 3;

    let div = document.createElement('div');
    div.className = "sprite unit " + color;
    Domy.gui.divCanvas.appendChild(div);
    this.sprite = div;

    // Add it to the game world
    Domy.units.push(this);
    Domy.Unit.count += 1;
};

Domy.Unit.prototype.update = function()
{
    // If this is an enemy
    if (this !== Domy.player)
    {
        this.isMoving = false;
        if (Domy.player.alive)
        {
            let distanceToPlayer = Domy.math.distanceBetween(this.x, this.y, Domy.player.x, Domy.player.y);
            if (distanceToPlayer < 250)
            {
                let angleToPlayer = Domy.math.angleBetween(this.x, this.y, Domy.player.x, Domy.player.y);

                // Stop in 100 pixels range
                if (distanceToPlayer > 100)
                {
                    // Move to the player
                    this.x += Math.cos(angleToPlayer * Domy.math.Pi180) * this.speed / 4;
                    this.y += Math.sin(angleToPlayer * Domy.math.Pi180) * this.speed / 4;
                    this.isMoving = true;
                }

                // Shoot the player! How nasty D:
                if (distanceToPlayer < 200)
                {
                    this.shoot(angleToPlayer);
                }
            }
        }
    }

    // Collision with world bounds

    // Left
    if (this.x < (this.width / 2))
    {
        this.x = (this.width / 2);
    }

    // Right
    if (this.x + (this.width / 2) > Domy.world.width)
    {
        this.x = Domy.world.width - (this.width / 2);
    }

    // Top
    if (this.y < (this.height / 2))
    {
        this.y = (this.height / 2);
    }

    // Bottom
    if (this.y + (this.height / 2) > Domy.world.height)
    {
        this.y = Domy.world.height - (this.height / 2);
    }

    if (this.isMoving)
    {
        new Domy.Particle(this.x, this.y, "engine");
    }
};

Domy.Unit.prototype.render = function()
{
    this.sprite.style.left = Math.round(this.x - (this.width / 2)) + "px";
    this.sprite.style.top = Math.round(this.y - (this.height / 2)) + "px";
    this.sprite.style.opacity = this.alpha;
};

// Pew pew
Domy.Unit.prototype.shoot = function(angle)
{
    if (Domy.time.now > this.shootNext)
    {
        this.shootNext = Domy.time.now + this.shootSpeed;

        let color = "red";
        if (this === Domy.player) { color = "blue"; }

        // Create a bullet
        new Domy.Bullet(this, angle, color);

        // Play a pew pew sound
        Domy.audio.play('shoot');
    }
};

Domy.Unit.prototype.destroy = function()
{
    // Add points
    if (this !== Domy.player)
    {
        // Add score to the player
        Domy.score += 1;

        // Play explosion sound
        Domy.audio.play('explosion');

        // All enemies defeated? Game won!
        if (Domy.Unit.count === 1)
        {
            // Disable controls
            Domy.player.alive = false;

            // Turn won screen visible
            Domy.gui.divWon.style.display = "block";

            // Play won sound
            Domy.audio.play('won');
        }
    }

    // If this was the player, game over D:
    else
    {
        // Disable controls
        Domy.player.alive = false;

        // Turn lost screen visible
        Domy.gui.divLost.style.display = "block";

        // Play lost sound
        Domy.audio.play('lost');
    }

    // Remove it from the game world
    this.sprite.parentElement.removeChild(this.sprite);
    Domy.units.splice(Domy.units.indexOf(this), 1);
    Domy.Unit.count -= 1;
};

Domy.Unit.count = 0;

// Creates a bullet
Domy.Bullet = function(unit, angle, color)
{
    if (unit === undefined) { unit = Domy.player; }
    if (angle === undefined) { angle = 0; }
    if (color === undefined) { color = "red"; }

    this.x = unit.x;
    this.y = unit.y;
    this.angle = angle;
    this.origin = unit;

    // Internal values
    this.alive = true;
    this.alpha = 1;
    this.width = 12;
    this.height = 12;
    this.speed = unit.bulletSpeed;
    this.damage = 1;

    this.initX = this.x;
    this.initY = this.y;

    let div = document.createElement('div');
    div.className = "sprite bullet " + color;
    Domy.gui.divCanvas.appendChild(div);
    this.sprite = div;

    // Add it to the pool
    Domy.bullets.push(this);
    Domy.Bullet.count += 1;
};

Domy.Bullet.prototype.update = function()
{
    // Moving
    this.x += Math.cos(this.angle * Domy.math.Pi180) * this.speed;
    this.y += Math.sin(this.angle * Domy.math.Pi180) * this.speed;

    // Bullet should be destroyed if leaving game world
    if (this.x < (this.width / 2)
     || this.x > Domy.world.width + (this.width / 2)
     || this.y < (this.height / 2)
     || this.y > Domy.world.height + (this.height / 2))
    {
        this.destroy();
    }

    // Range
    let distanceToOrigin = Domy.math.distanceBetween(this.x, this.y, this.initX, this.initY);
    if (distanceToOrigin > 250)
    {
        this.destroy();
    }
};

Domy.Bullet.prototype.render = function()
{
    this.sprite.style.left = Math.round(this.x - (this.width / 2)) + "px";
    this.sprite.style.top = Math.round(this.y - (this.height / 2)) + "px";
    this.sprite.style.opacity = this.alpha;
};

Domy.Bullet.prototype.destroy = function()
{
    // Remove it from the game world
    this.sprite.parentElement.removeChild(this.sprite);
    Domy.bullets.splice(Domy.bullets.indexOf(this), 1);
    Domy.Bullet.count -= 1;
}

Domy.Bullet.prototype.kill = function()
{
    // Remove it from the main array
    Domy.bullets.splice(Domy.bullets.indexOf(this), 1);

    // Return it to the pool
    Domy.bulletsPool.push(this);

    // Update counters
    Domy.Bullet.count -= 1;
    Domy.Bullet.countDead += 1;
};

Domy.Bullet.count = 0;
Domy.Bullet.countDead = 0;

// Returns a dead bullet
Domy.Bullet.getFromPool = function(x, y)
{
    for (let i = 0; i < Domy.bullets.length; i++)
    {
        let bullet = Domy.bullets[i];

        if (bullet.alive === false)
        {
            // Reset the most important values
            bullet.x = x;
            bullet.y = y;

            // Remove it from the pool
            Domy.bulletsPool.splice(Domy.bulletsPool.indexOf(this), 1);

            // Add it to the main array
            Domy.bullets.push(this);

            // Update counters
            Domy.Bullet.count += 1;
            Domy.Bullet.countDead -= 1;

            return bullet;
        }
    }
};

// Puts an amount of X bullets into their pool
Domy.Bullet.prototype.createMultiple = function(amount)
{
    for (let i = 0; i < amount; i++)
    {
        new Domy.Bullet();
    }
};

// Creates a particle
Domy.Particle = function(x, y, type)
{
    this.x = x;
    this.y = y;
    this.type = type;

    // Internal values
    this.alive = true;
    this.alpha = 1;
    this.width = 12;
    this.height = 12;

    let div = document.createElement('div');
    div.className = "sprite particle " + type;
    Domy.gui.divCanvas.appendChild(div);
    this.sprite = div;

    // Add it to the game world
    Domy.particles.push(this);
    Domy.Particle.count += 1;
};

Domy.Particle.prototype.update = function()
{
    if (this.alpha > 0)
    {
        this.alpha -= 0.05;

        if (this.alpha <= 0)
        {
            this.destroy();
        }
    }
};

Domy.Particle.prototype.render = function()
{
    this.sprite.style.left = Math.round(this.x - (this.width / 2)) + "px";
    this.sprite.style.top = Math.round(this.y - (this.height / 2)) + "px";
    this.sprite.style.opacity = this.alpha;
};

Domy.Particle.prototype.destroy = function()
{
    // Remove it from the game world
    this.sprite.parentElement.removeChild(this.sprite);
    Domy.particles.splice(Domy.particles.indexOf(this), 1);
    Domy.Particle.count -= 1;
};

Domy.Particle.count = 0;

Domy.camera.update = function()
{
    // Camera follow
    if (Domy.camera.target !== null)
    {
        let targetX = Domy.camera.target.x;
        let targetY = Domy.camera.target.y;

        // Left / right
        if (targetX > Domy.camera.width / 2
         && targetX <= Domy.world.width - (Domy.camera.width / 2))
        {
            Domy.camera.x = targetX - (Domy.camera.width / 2);
        }

        // Top / bottom
        if (targetY > Domy.camera.height / 2
         && targetY <= Domy.world.height - (Domy.camera.height / 2))
        {
            Domy.camera.y = targetY - (Domy.camera.height / 2);
        }

        // Transform the canvas div
        Domy.gui.divCanvas.style.left = -Domy.camera.x;
        Domy.gui.divCanvas.style.top  = -Domy.camera.y;
    }
};

//----------------------------------------------------------------------------------------------------

// Math functions

//----------------------------------------------------------------------------------------------------

// Pi constants
Domy.math.Pi = Math.PI;
Domy.math.Pi180 = Math.PI/180;
Domy.math.Pi180r = 180/Math.PI; // r = reversed

// Returns an integer between (including) min and (including) max
Domy.math.integerInRange = function(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Returns the direction between two poins in degrees
Domy.math.angleBetween = function(x1, y1, x2, y2)
{
    return Math.atan2(y2 - y1, x2 - x1) * Domy.math.Pi180r;
};

// Returns the distance between two vectors
Domy.math.distanceBetween = function(x1, y1, x2, y2)
{
    return Math.hypot(x2 - x1, y2 - y1);
};

//----------------------------------------------------------------------------------------------------

// Physics functions

//----------------------------------------------------------------------------------------------------

// Circle collision
Domy.physics.collideCircle = function(a, b)
{
    let x = a.x - b.x;
    let y = a.y - b.y;
    let r = (a.width / 2) + (b.width / 2);
    return (x * x) + (y * y) < (r * r);
};

//----------------------------------------------------------------------------------------------------

// Audio functions

//----------------------------------------------------------------------------------------------------

// Plays an audio file a little better than using file.play() directly
// because that causes sounds to stutter or have a delay between them
Domy.audio.play = function(file, loop)
{
    var file = Domy.audio[file];
    if (! file.paused)
    {
        file.pause();
        file.currentTime = 0;
        file.play();
    }

    else
    {
        file.play();
    }

    // Music?
    if (loop !== undefined)
    {
        file.loop = loop;
    }
};
