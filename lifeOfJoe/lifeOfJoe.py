import pygame
import sys

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH, SCREEN_HEIGHT = 800, 600
FPS = 30
FONT = pygame.font.SysFont("Arial", 28)
SMALL_FONT = pygame.font.SysFont("Arial", 20)
BACKGROUND_IMAGES = {
    "Childhood": "lifeOfJoe/bedroom.jpg",
    "School": "lifeOfJoe/school.jpg",
    "College": "lifeOfJoe/dorm.jpg",
    "Adult": "lifeOfJoe/livingroom.jpg",
    "Office": "lifeOfJoe/office.jpg",
    "Elder": "lifeOfJoe/nurseryhome.jpg"
}
BUTTON_COLOR = (0, 200, 0)
BUTTON_HOVER_COLOR = (100, 255, 0)

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# Set up the display
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Life of Joe")
clock = pygame.time.Clock()

# Load Joe's character image and scale it
joe_image = pygame.image.load("lifeOfJoe/joe.png")
joe_image = pygame.transform.scale(joe_image, (int(SCREEN_WIDTH/5), int(SCREEN_HEIGHT/4)))

class Button:
    def __init__(self, text, x, y, width, height):
        self.text = text
        self.rect = pygame.Rect(x, y, width, height)
        self.color = BUTTON_COLOR

    def draw(self):
        pygame.draw.rect(screen, self.color, self.rect)
        text_surface = FONT.render(self.text, True, WHITE)
        text_rect = text_surface.get_rect(center=self.rect.center)
        screen.blit(text_surface, text_rect)

    def is_hovered(self):
        mouse_pos = pygame.mouse.get_pos()
        return self.rect.collidepoint(mouse_pos)

class Game:
    def __init__(self):
        self.in_start_screen = True
        self.start_button = Button("Start Game", SCREEN_WIDTH//2 - 100, SCREEN_HEIGHT//2, 200, 50)
        self.health = 100
        self.happiness = 100
        self.age = 5
        self.weight = 20  # Arbitrary starting weight
        self.stage = "Childhood"
        self.background = self.load_and_scale_image(BACKGROUND_IMAGES[self.stage])
        self.questions = iter(self.load_questions())
        self.current_question = next(self.questions, None)

    def load_and_scale_image(self, image_path):
        image = pygame.image.load(image_path)
        return pygame.transform.scale(image, (SCREEN_WIDTH, SCREEN_HEIGHT))

    def load_questions(self):
        return [
            {"text": "Do you ask your parents for an iPad?", "yes": {"health": -5, "happiness": 10}, "no": {}},
            {"text": "Do you join the school soccer team?", "yes": {"health": 10, "happiness": 5}, "no": {}},
        ]

    def update(self):
        if self.age >= 18 and self.stage == "Childhood":
            self.stage = "School"
            self.background = self.load_and_scale_image(BACKGROUND_IMAGES[self.stage])
        # Additional stage updates...

    def draw(self):
        if self.in_start_screen:
            screen.fill(BLACK)
            self.start_button.draw()
            title_surface = FONT.render("Life of Joe", True, WHITE)
            title_rect = title_surface.get_rect(center=(SCREEN_WIDTH//2, SCREEN_HEIGHT//4))
            screen.blit(title_surface, title_rect)
        else:
            screen.blit(self.background, (0, 0))
            screen.blit(joe_image, (SCREEN_WIDTH//4, SCREEN_HEIGHT//4))  # Center Joe on the screen
            self.render_text(f"Health: {self.health}%  Happiness: {self.happiness}%", 10, 10)
            if self.current_question:
                self.render_text(self.current_question['text'], 10, 50)
                # Draw Yes/No buttons...
                # Additional drawing...

    def render_text(self, text, x, y):
        text_surface = SMALL_FONT.render(text, True, WHITE)
        text_rect = text_surface.get_rect(topleft=(x, y))
        screen.blit(text_surface, text_rect)

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN and self.in_start_screen:
            if self.start_button.is_hovered():
                self.in_start_screen = False
        elif event.type == pygame.KEYDOWN and not self.in_start_screen:
            if event.key == pygame.K_y and self.current_question:
                self.apply_effects(self.current_question.get("yes", {}))
                self.current_question = next(self.questions, None)
            elif event.key == pygame.K_n and self.current_question:
                self.current_question = next(self.questions, None)

    def apply_effects(self, effects):
        self.health += effects.get("health", 0)
        self.happiness += effects.get("happiness", 0)
        self.age += 1  # Age increases after every question

game = Game()

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        game.handle_event(event)

    game.update()
    screen.fill(WHITE)
    game.draw()
    pygame.display.flip()
    clock.tick(FPS)

pygame.quit()
sys.exit()
