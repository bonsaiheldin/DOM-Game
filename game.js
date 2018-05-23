let game =
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
game.camera =
{
    "x": 0,
    "y": 0,
    "width": game.width,
    "height": game.height,
    "target": null
};

// Initialize world
game.world =
{
    "width": game.width * 2,
    "height": game.height * 2
};

window.onload = function()
{
    // Load audio files
    game.audio.shoot      = new Audio('shoot.ogg?' + Date.now());
    game.audio.hit        = new Audio('hit.ogg?' + Date.now());
    game.audio.explosion  = new Audio('explosion.ogg?' + Date.now());
    game.audio.won        = new Audio('won.ogg?' + Date.now());
    game.audio.lost       = new Audio('lost.ogg?' + Date.now());

    // Assign DIVs for easier access
    game.gui.main           = document.getElementsByTagName('main')[0];
    game.gui.divContainer   = document.getElementById('divContainer');
    game.gui.divCanvas      = document.getElementById('divGame');
    game.gui.divDebug       = document.getElementById('divDebug');
    game.gui.divWon         = document.getElementById('divWon');
    game.gui.divLost        = document.getElementById('divLost');
    game.gui.buttonRestart  = document.getElementById('buttonRestart');

    // Restart button
    game.gui.buttonRestart.onclick = function()
    {
        location.reload();
    };

    // Disable right-click
    // Enabled for demonstration purposes
    game.gui.divContainer.oncontextmenu = function(){ return false; };

    // Disable dragging of images
    game.gui.divContainer.ondragstart = function() { return false; };

    // Container size
    game.gui.divCanvas.style.width = game.width;
    game.gui.divCanvas.style.height = game.height;

    game.gui.main.style.width    = game.width;
    game.gui.main.style.height   = game.height;

    // Keyboard
    game.keyboard =
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
        game.keyboard.isDown[e.keyCode] = true;
        game.keyboard.isUp[e.keyCode] = false;
    }, true);

    window.addEventListener('keyup',   function(e)
    {
        game.keyboard.isDown[e.keyCode] = false;
        game.keyboard.isUp[e.keyCode] = true;
    }, true);

    // Mouse
    game.mouse =
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
        game.mouse.x = e.clientX - game.gui.divCanvas.getBoundingClientRect().x;
        game.mouse.y = e.clientY - game.gui.divCanvas.getBoundingClientRect().y;
    }, false);

    window.addEventListener("mousedown",  function(e)
    {
        game.mouse.isDown[e.button] = true;
        game.mouse.isUp[e.button] = false;
    }, false);

    window.addEventListener("mouseup",    function(e)
    {
        game.mouse.isDown[e.button] = false;
        game.mouse.isUp[e.button] = true;
    }, false);

    // Create the player
    game.player = new game.Unit(game.world.width / 2, game.world.height / 2, "blue");
    game.player.health *= 2; // Double as much life as enemies
    game.player.shootSpeed /= 4; // Quadriple as fast as enemies
    game.player.bulletSpeed *= 2; // Double as fast as enemies

    // Let the camera follow the player
    game.camera.target = game.player;

    // Create some enemies
    for (let i = 0; i < 10; i++)
    {
        let x = game.math.integerInRange(0, game.world.width);
        let y = game.math.integerInRange(0, game.world.height);
        new game.Unit(x, y, "red");
    }

    // Start update and render loops
    MainLoop.setUpdate(game.update).setDraw(game.render).start();
};

//----------------------------------------------------------------------------------------------------

// The update loop: The game logic happens here

//----------------------------------------------------------------------------------------------------

// Updates all entities
game.update = function()
{
    game.time.now = Date.now();

    // Apply controls only if player is alive
    if (game.player.alive)
    {
        game.controls();
    }

    for (let i = 0; i < game.units.length; i++)
    {
        let unit = game.units[i];
        unit.update();
    }

    for (let i = 0; i < game.bullets.length; i++)
    {
        let bullet = game.bullets[i];
        bullet.update();
    }

    for (let i = 0; i < game.particles.length; i++)
    {
        let particle = game.particles[i];
        particle.update();
    }

    // Circle collision
    for (let i = 0; i < game.units.length; i++)
    {
        let unit = game.units[i];

        for (let j = 0; j < game.bullets.length; j++)
        {
            let bullet = game.bullets[j];

            // Don't let the unit shoot itself :)
            if (bullet.origin !== unit)
            {
                // Only if the unit is actually alive
                if (unit.alive)
                {
                    if (game.physics.collideCircle(unit, bullet))
                    {
                        // Damage the unit
                        unit.health -= bullet.damage;

                        // Destroy the unit if health is 0
                        if (unit.health <= 0)
                        {
                            unit.destroy();
                        }

                        // Play hit sound
                        game.audio.play('hit');

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
game.render = function()
{
    for (let i = 0; i < game.units.length; i++)
    {
        let unit = game.units[i];
        unit.render();
    }

    for (let i = 0; i < game.bullets.length; i++)
    {
        let bullet = game.bullets[i];
        bullet.render();
    }

    for (let i = 0; i < game.particles.length; i++)
    {
        let particle = game.particles[i];
        particle.render();
    }

    game.camera.update();

    // Show ingame GUI and debug stuff
    game.gui.divDebug.innerHTML = ""
    + "Health: " + game.player.health
    + "<br>Score: " + game.score
    + "<br>Units: " + game.Unit.count
    + "<br>Bullets: " + game.Bullet.count
    + "<br>Particles: " + game.Particle.count
    + "<br>Position: " + game.player.x + " / " + game.player.y
};

//----------------------------------------------------------------------------------------------------

// Controls

//----------------------------------------------------------------------------------------------------

game.controls = function()
{
    game.player.isMoving = false;

    if (game.keyboard.isDown[game.keyboard.a])
    {
        game.player.x = parseInt(game.player.x) - game.player.speed;
        game.player.isMoving = true;
    }

    else if (game.keyboard.isDown[game.keyboard.d])
    {
        game.player.x = parseInt(game.player.x) + game.player.speed;
        game.player.isMoving = true;
    }

    if (game.keyboard.isDown[game.keyboard.w])
    {
        game.player.y = parseInt(game.player.y) - game.player.speed;
        game.player.isMoving = true;
    }

    else if (game.keyboard.isDown[game.keyboard.s])
    {
        game.player.y = parseInt(game.player.y) + game.player.speed;
        game.player.isMoving = true;
    }

    if (game.mouse.isDown[game.mouse.leftButton])
    {
        let angleToMouse = game.math.angleBetween(game.player.x, game.player.y, game.mouse.x, game.mouse.y);
        game.player.shoot(angleToMouse);
    }
};

//----------------------------------------------------------------------------------------------------

// Entities

//----------------------------------------------------------------------------------------------------

// Creates a unit
game.Unit = function(x, y, color)
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
    game.gui.divCanvas.appendChild(div);
    this.sprite = div;

    // Add it to the game world
    game.units.push(this);
    game.Unit.count += 1;
};

game.Unit.prototype.update = function()
{
    // If this is an enemy
    if (this !== game.player)
    {
        this.isMoving = false;
        if (game.player.alive)
        {
            let distanceToPlayer = game.math.distanceBetween(this.x, this.y, game.player.x, game.player.y);
            if (distanceToPlayer < 250)
            {
                let angleToPlayer = game.math.angleBetween(this.x, this.y, game.player.x, game.player.y);

                // Stop in 100 pixels range
                if (distanceToPlayer > 100)
                {
                    // Move to the player
                    this.x += Math.cos(angleToPlayer * game.math.Pi180) * this.speed / 4;
                    this.y += Math.sin(angleToPlayer * game.math.Pi180) * this.speed / 4;
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
    if (this.x + (this.width / 2) > game.world.width)
    {
        this.x = game.world.width - (this.width / 2);
    }

    // Top
    if (this.y < (this.height / 2))
    {
        this.y = (this.height / 2);
    }

    // Bottom
    if (this.y + (this.height / 2) > game.world.height)
    {
        this.y = game.world.height - (this.height / 2);
    }

    if (this.isMoving)
    {
        new game.Particle(this.x, this.y, "engine");
    }
};

game.Unit.prototype.render = function()
{
    this.sprite.style.left = Math.round(this.x - (this.width / 2)) + "px";
    this.sprite.style.top = Math.round(this.y - (this.height / 2)) + "px";
    this.sprite.style.opacity = this.alpha;
};

// Pew pew
game.Unit.prototype.shoot = function(angle)
{
    if (game.time.now > this.shootNext)
    {
        this.shootNext = game.time.now + this.shootSpeed;

        let color = "red";
        if (this === game.player) { color = "blue"; }

        // Create a bullet
        new game.Bullet(this, angle, color);

        // Play a pew pew sound
        game.audio.play('shoot');
    }
};

game.Unit.prototype.destroy = function()
{
    // Add points
    if (this !== game.player)
    {
        // Add score to the player
        game.score += 1;

        // Play explosion sound
        game.audio.play('explosion');

        // All enemies defeated? Game won!
        if (game.score === 10)
        {
            // Disable controls
            game.player.alive = false;

            // Turn won screen visible
            game.gui.divWon.style.display = "block";

            // Play won sound
            game.audio.play('won');
        }
    }

    // If this was the player, game over D:
    else
    {
        // Disable controls
        game.player.alive = false;

        // Turn lost screen visible
        game.gui.divLost.style.display = "block";

        // Play lost sound
        game.audio.play('lost');
    }

    // Remove it from the game world
    this.sprite.parentElement.removeChild(this.sprite);
    game.units.splice(game.units.indexOf(this), 1);
    game.Unit.count -= 1;
};

game.Unit.count = 0;

// Creates a bullet
game.Bullet = function(unit, angle, color)
{
    if (unit === undefined) { unit = game.player; }
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
    game.gui.divCanvas.appendChild(div);
    this.sprite = div;

    // Add it to the pool
    game.bullets.push(this);
    game.Bullet.count += 1;
};

game.Bullet.prototype.update = function()
{
    // Moving
    this.x += Math.cos(this.angle * game.math.Pi180) * this.speed;
    this.y += Math.sin(this.angle * game.math.Pi180) * this.speed;

    // Bullet should be destroyed if leaving game world
    if (this.x < (this.width / 2)
     || this.x > game.world.width + (this.width / 2)
     || this.y < (this.height / 2)
     || this.y > game.world.height + (this.height / 2))
    {
        this.destroy();
    }

    // Range
    let distanceToOrigin = game.math.distanceBetween(this.x, this.y, this.initX, this.initY);
    if (distanceToOrigin > 250)
    {
        this.destroy();
    }
};

game.Bullet.prototype.render = function()
{
    this.sprite.style.left = Math.round(this.x - (this.width / 2)) + "px";
    this.sprite.style.top = Math.round(this.y - (this.height / 2)) + "px";
    this.sprite.style.opacity = this.alpha;
};

game.Bullet.prototype.destroy = function()
{
    // Remove it from the game world
    this.sprite.parentElement.removeChild(this.sprite);
    game.bullets.splice(game.bullets.indexOf(this), 1);
    game.Bullet.count -= 1;
}

game.Bullet.prototype.kill = function()
{
    // Remove it from the main array
    game.bullets.splice(game.bullets.indexOf(this), 1);

    // Return it to the pool
    game.bulletsPool.push(this);

    // Update counters
    game.Bullet.count -= 1;
    game.Bullet.countDead += 1;
};

game.Bullet.count = 0;
game.Bullet.countDead = 0;

// Returns a dead bullet
game.Bullet.getFromPool = function(x, y)
{
    for (let i = 0; i < game.bullets.length; i++)
    {
        let bullet = game.bullets[i];

        if (bullet.alive === false)
        {
            // Reset the most important values
            bullet.x = x;
            bullet.y = y;

            // Remove it from the pool
            game.bulletsPool.splice(game.bulletsPool.indexOf(this), 1);

            // Add it to the main array
            game.bullets.push(this);

            // Update counters
            game.Bullet.count += 1;
            game.Bullet.countDead -= 1;

            return bullet;
        }
    }
};

// Puts an amount of X bullets into their pool
game.Bullet.prototype.createMultiple = function(amount)
{
    for (let i = 0; i < amount; i++)
    {
        new game.Bullet();
    }
};

// Creates a particle
game.Particle = function(x, y, type)
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
    game.gui.divCanvas.appendChild(div);
    this.sprite = div;

    // Add it to the game world
    game.particles.push(this);
    game.Particle.count += 1;
};

game.Particle.prototype.update = function()
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

game.Particle.prototype.render = function()
{
    this.sprite.style.left = Math.round(this.x - (this.width / 2)) + "px";
    this.sprite.style.top = Math.round(this.y - (this.height / 2)) + "px";
    this.sprite.style.opacity = this.alpha;
};

game.Particle.prototype.destroy = function()
{
    // Remove it from the game world
    this.sprite.parentElement.removeChild(this.sprite);
    game.particles.splice(game.particles.indexOf(this), 1);
    game.Particle.count -= 1;
};

game.Particle.count = 0;

game.camera.update = function()
{
    // Camera follow
    if (game.camera.target !== null)
    {
        let targetX = game.camera.target.x;
        let targetY = game.camera.target.y;

        // Left / right
        if (targetX > game.camera.width / 2
         && targetX <= game.world.width - (game.camera.width / 2))
        {
            game.camera.x = targetX - (game.camera.width / 2);
        }

        // Top / bottom
        if (targetY > game.camera.height / 2
         && targetY <= game.world.height - (game.camera.height / 2))
        {
            game.camera.y = targetY - (game.camera.height / 2);
        }

        // Transform the canvas div
        game.gui.divCanvas.style.left = -game.camera.x;
        game.gui.divCanvas.style.top  = -game.camera.y;
    }
};

//----------------------------------------------------------------------------------------------------

// Math functions

//----------------------------------------------------------------------------------------------------

// Pi constants
game.math.Pi = Math.PI;
game.math.Pi180 = Math.PI/180;
game.math.Pi180r = 180/Math.PI; // r = reversed

// Returns an integer between (including) min and (including) max
game.math.integerInRange = function(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Returns the direction between two poins in degrees
game.math.angleBetween = function(x1, y1, x2, y2)
{
    return Math.atan2(y2 - y1, x2 - x1) * game.math.Pi180r;
};

// Returns the distance between two vectors
game.math.distanceBetween = function(x1, y1, x2, y2)
{
    return Math.hypot(x2 - x1, y2 - y1);
};

//----------------------------------------------------------------------------------------------------

// Physics functions

//----------------------------------------------------------------------------------------------------

// Circle collision
game.physics.collideCircle = function(a, b)
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
game.audio.play = function(file, loop)
{
    var file = game.audio[file];
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
