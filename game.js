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
    "math": {},
    "time": {},
    "physics": {},
    "audio": {},
    "gui": {}
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
    game.gui.canvas         = document.getElementById('divGame');
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
    game.gui.canvas.style.width = game.width;
    game.gui.canvas.style.height = game.height;

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
        game.mouse.x = e.clientX - game.gui.canvas.getBoundingClientRect().x;
        game.mouse.y = e.clientY - game.gui.canvas.getBoundingClientRect().y;
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
    game.player = new game.Unit(game.width / 2, game.height / 2, "blue");
    game.player.health = 10; // Double as much life as enemies
    game.player.shootSpeed = 250; // Quadriple as fast as enemies
    game.player.bulletSpeed = 6; // Double as fast as enemies

    // Create some enemies
    for (let i = 0; i < 10; i++)
    {
        let x = game.math.integerInRange(0, game.width);
        let y = game.math.integerInRange(0, game.height);
        let unit = new game.Unit(x, y, "red");
    }

    // Start update and render loops
    MainLoop.setUpdate(game.update).setDraw(game.render).start();
};

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

    // Show ingame GUI and debug stuff
    game.gui.divDebug.innerHTML = ""
    + "Health: " + game.player.health
    + "<br>Score: " + game.score
    + "<br>Units: " + game.Unit.count
    + "<br>Bullets: " + game.Bullet.count;
};

game.controls = function()
{
    if (game.keyboard.isDown[game.keyboard.a])
    {
        game.player.x = parseInt(game.player.x) - game.player.speed;
    }

    else if (game.keyboard.isDown[game.keyboard.d])
    {
        game.player.x = parseInt(game.player.x) + game.player.speed;
    }

    if (game.keyboard.isDown[game.keyboard.w])
    {
        game.player.y = parseInt(game.player.y) - game.player.speed;
    }

    else if (game.keyboard.isDown[game.keyboard.s])
    {
        game.player.y = parseInt(game.player.y) + game.player.speed;
    }

    if (game.mouse.isDown[game.mouse.leftButton])
    {
        let angleToMouse = game.math.angleBetween(game.player.x, game.player.y, game.mouse.x, game.mouse.y);
        game.player.shoot(angleToMouse);
    }
};

// Creates a unit
game.Unit = function(x, y, color)
{
    this.x = x;
    this.y = y;
    this.color = color;

    // Internal values
    this.width = 48;
    this.height = 48;
    this.speed = 3;
    this.health = 5;
    this.alive = true;
    this.shootNext = 0;
    this.shootSpeed = 1000;
    this.bulletSpeed = 3;

    let div = document.createElement('div');
    div.className = "sprite unit " + color;
    game.gui.canvas.appendChild(div);
    this.sprite = div;

    // Add it to the world
    game.units.push(this);
    game.Unit.count += 1;
};

game.Unit.prototype.update = function()
{
    // If this is an enemy
    if (this !== game.player)
    {
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
                }

                // Shoot the player! How nasty D:
                if (distanceToPlayer < 200)
                {
                    this.shoot(angleToPlayer);
                }
            }
        }
    }
    // Collision with game bounds

    // Left
    if (this.x < (this.width / 2))
    {
        this.x = (this.width / 2);
    }

    // Right
    if (this.x + (this.width / 2) > game.width)
    {
        this.x = game.width - (this.width / 2);
    }

    // Top
    if (this.y < (this.height / 2))
    {
        this.y = (this.height / 2);
    }

    // Bottom
    if (this.y + (this.height / 2) > game.height)
    {
        this.y = game.height - (this.height / 2);
    }
};

game.Unit.prototype.render = function()
{
    this.sprite.style.left = (this.x - (this.width / 2)) + "px";
    this.sprite.style.top  = (this.y - (this.height / 2)) + "px";
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
    this.sprite.parentElement.removeChild(this.sprite);
    game.units.splice(game.units.indexOf(this), 1);
    game.Unit.count -= 1;

    // Add points
    if (this !== game.player)
    {
        // Add score to the player
        game.score += 1;

        // Play explosion sound
        game.audio.play('explosion');

        // All enemies defeated? Game won!
        if (game.Unit.count === 1)
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

};

game.Unit.count = 0;

// Creates a bullet
game.Bullet = function(unit, angle, color)
{
    this.x = unit.x;
    this.y = unit.y;
    this.angle = angle;
    this.origin = unit;

    // Internal values
    this.width = 12;
    this.height = 12;
    this.speed = unit.bulletSpeed;
    this.damage = 1;

    this.initX = this.x;
    this.initY = this.y;

    let div = document.createElement('div');
    div.className = "sprite bullet " + color;
    game.gui.canvas.appendChild(div);
    this.sprite = div;

    // Add it to the world
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
     || this.x > game.width + (this.width / 2)
     || this.y < (this.height / 2)
     || this.y > game.height + (this.height / 2))
    {
        this.destroy();
    }

    // Range
    let distanceToOrigin = game.math.distanceBetween(this.x, this.y, game.player.x, game.player.y);
    if (distanceToOrigin > 250)
    {
        this.destroy();
    }
};

game.Bullet.prototype.render = function()
{
    this.sprite.style.left = (this.x - (this.width / 2)) + "px";
    this.sprite.style.top  = (this.y - (this.height / 2)) + "px";
};

game.Bullet.prototype.destroy = function()
{
    this.sprite.parentElement.removeChild(this.sprite);
    game.bullets.splice(game.bullets.indexOf(this), 1);
    game.Bullet.count -= 1;
};

game.Bullet.count = 0;

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

// Audio functions

// Plays an audio file a little better than using file.play() directly
// because that causes sounds to stutter or have a delay between them
game.audio.play = function(file)
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
};
