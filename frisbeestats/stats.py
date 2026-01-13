"""
ultimate_point_logger.py

Requirements: Python 3 (Tkinter included in standard library).
Run: python ultimate_point_logger.py

Features:
- Draws a standard ultimate field: 40 yd width, 70 yd playing field + 20 yd endzones each side (total 110 yd length).
- Prompts for roster (names), then choose 7 players on field.
- Click on field to record events:
    * Normal catch: choose which of 7 players caught it.
    * Drop / Throwaway: choose "drop" or "throwaway"; then choose which of the 7 players made the drop/throwaway.
    * After a drop/throwaway, the next click asks whether turnover was:
        - opponent throwaway
        - defensive block (choose blocking player)
        - goal for other team
    * If click inside our scoring endzone while we are on offense, records goal for catcher and assist for last thrower (if applicable).
- Computes throwing and receiving yards for each player as straight-line distance between thrower and receiver in yards.
- Tracks overall game score.
- Save events and per-player stats to CSV.

Behavior:
- Assumes user logs events in order. Possession logic is basic: catches by selected players are considered our team's possession events.
- Thrower is assumed to be the last player who caught the disc for our team (if any). For the very first catch of the point there is no previous thrower.
"""

import tkinter as tk
from tkinter import simpledialog, messagebox
import math
import csv
from datetime import datetime

# Field dimensions in yards
FIELD_WIDTH_YDS = 40
PLAYING_LENGTH_YDS = 70
ENDZONE_YDS = 20
TOTAL_LENGTH_YDS = PLAYING_LENGTH_YDS + 2 * ENDZONE_YDS  # 110

# Pixel scale: pixels per yard
SCALE = 6
CANVAS_WIDTH = int(TOTAL_LENGTH_YDS * SCALE)  # length horizontally
CANVAS_HEIGHT = int(FIELD_WIDTH_YDS * SCALE)  # width vertically

# Colors
FIELD_COLOR = "#2e8b57"
ENDZONE_COLOR = "#228b22"
LINE_COLOR = "white"
PLAYER_COLORS = ["red", "blue", "yellow", "orange", "cyan", "magenta", "pink"]

class UltimateLogger:
    def __init__(self, master):
        self.master = master
        master.title("Ultimate Point Logger")

        # state
        self.roster = []
        self.on_field = []
        self.events = []  # list of event dicts
        self.player_stats = {}  # name -> stats
        self.game_score = {"us":0, "them":0}
        self.possession = False  # whether our team has possession currently
        self.last_catcher = None  # name of last player on our team who caught disc
        self.last_catch_pos = None  # (x_pix, y_pix)
        self.awaiting_turnover_resolution = False

        # UI
        self.canvas = tk.Canvas(master, width=CANVAS_WIDTH, height=CANVAS_HEIGHT, bg=FIELD_COLOR)
        self.canvas.pack(side=tk.LEFT, padx=8, pady=8)
        self.info_frame = tk.Frame(master)
        self.info_frame.pack(side=tk.RIGHT, fill=tk.Y, padx=8, pady=8)

        # Buttons and labels
        tk.Button(self.info_frame, text="Enter Roster", command=self.enter_roster).pack(fill=tk.X)
        tk.Button(self.info_frame, text="Select 7 On-Field", command=self.select_on_field).pack(fill=tk.X, pady=(4,0))
        tk.Button(self.info_frame, text="Start New Point", command=self.start_new_point).pack(fill=tk.X, pady=(4,0))
        tk.Button(self.info_frame, text="Export CSV", command=self.export_csv).pack(fill=tk.X, pady=(20,0))
        tk.Button(self.info_frame, text="Show Stats", command=self.show_stats).pack(fill=tk.X, pady=(4,0))
        tk.Button(self.info_frame, text="Quit", command=master.quit).pack(side=tk.BOTTOM, fill=tk.X, pady=(20,0))

        self.score_label = tk.Label(self.info_frame, text="Score: 0 - 0")
        self.score_label.pack(pady=(10,0))

        self.roster_label = tk.Label(self.info_frame, text="Roster: (none)")
        self.roster_label.pack(pady=(10,0))
        self.on_field_label = tk.Label(self.info_frame, text="On Field: (none)")
        self.on_field_label.pack()

        # draw field
        self.draw_field()
        self.canvas.bind("<Button-1>", self.on_canvas_click)

    # ---------- UI and dialogs ----------
    def enter_roster(self):
        txt = simpledialog.askstring("Roster", "Enter player names separated by commas:", parent=self.master)
        if not txt:
            return
        names = [s.strip() for s in txt.split(",") if s.strip()]
        if len(names) < 7:
            messagebox.showwarning("Roster", "At least 7 names recommended.")
        self.roster = names
        # init stats
        self.player_stats = {n: {"throws":0.0, "receives":0.0, "goals":0, "assists":0} for n in self.roster}
        self.roster_label.config(text="Roster: " + ", ".join(self.roster))

    def select_on_field(self):
        if not self.roster:
            messagebox.showerror("Select On Field", "Enter roster first.")
            return
        dlg = MultiSelectDialog(self.master, "Select 7 On-Field Players", self.roster, select_count=7)
        self.master.wait_window(dlg.top)
        if dlg.result:
            self.on_field = dlg.result
            self.on_field_label.config(text="On Field: " + ", ".join(self.on_field))

    def start_new_point(self):
        if len(self.on_field) != 7:
            messagebox.showerror("Start Point", "Select 7 on-field players before starting a point.")
            return
        self.events.append({"type":"start_point", "time":datetime.now().isoformat(), "on_field":self.on_field.copy()})
        self.possession = False
        self.last_catcher = None
        self.last_catch_pos = None
        self.awaiting_turnover_resolution = False
        messagebox.showinfo("New Point", "New point started. Click on field to record events.")

    def show_stats(self):
        lines = ["Score: {} - {}".format(self.game_score["us"], self.game_score["them"]), ""]
        for p in self.roster:
            s = self.player_stats.get(p, {"throws":0,"receives":0,"goals":0,"assists":0})
            lines.append(f"{p}: throws={s['throws']:.1f} yds, receives={s['receives']:.1f} yds, goals={s['goals']}, assists={s['assists']}")
        messagebox.showinfo("Stats", "\n".join(lines))

    def export_csv(self):
        if not self.events:
            messagebox.showinfo("Export", "No events to export.")
            return
        fname = f"ultimate_events_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        with open(fname, "w", newline='') as f:
            writer = csv.writer(f)
            writer.writerow(["time","type","details"])
            for e in self.events:
                writer.writerow([e.get("time",""), e.get("type",""), str(e)])
        # also export stats
        sf = f"ultimate_stats_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        with open(sf, "w", newline='') as f:
            writer = csv.writer(f)
            writer.writerow(["player","throws_yds","receives_yds","goals","assists"])
            for p, s in self.player_stats.items():
                writer.writerow([p, f"{s['throws']:.1f}", f"{s['receives']:.1f}", s["goals"], s["assists"]])
        messagebox.showinfo("Export", f"Events saved to {fname}\nStats saved to {sf}")

    # ---------- Field drawing ----------
    def draw_field(self):
        self.canvas.delete("all")
        # full rectangle
        self.canvas.create_rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, fill=FIELD_COLOR, width=0)
        # endzones
        ex = ENDZONE_YDS * SCALE
        self.canvas.create_rectangle(0, 0, ex, CANVAS_HEIGHT, fill=ENDZONE_COLOR, outline=ENDZONE_COLOR)
        self.canvas.create_rectangle(CANVAS_WIDTH - ex, 0, CANVAS_WIDTH, CANVAS_HEIGHT, fill=ENDZONE_COLOR, outline=ENDZONE_COLOR)
        # centerlines and markings
        # sideline rectangles drawn by borders (already done). Draw midline between endzones boundaries (20 yd from each edge)
        self.canvas.create_line(ex, 0, ex, CANVAS_HEIGHT, fill=LINE_COLOR)
        self.canvas.create_line(CANVAS_WIDTH - ex, 0, CANVAS_WIDTH - ex, CANVAS_HEIGHT, fill=LINE_COLOR)
        # halfway line (midfield)
        self.canvas.create_line(CANVAS_WIDTH/2, 0, CANVAS_WIDTH/2, CANVAS_HEIGHT, fill=LINE_COLOR, dash=(4,4))
        # labels
        self.canvas.create_text(CANVAS_WIDTH/2, 10, text="Midfield", fill=LINE_COLOR, anchor=tk.N)
        self.canvas.create_text(10, 10, text=f"Endzone (us?)", fill=LINE_COLOR, anchor=tk.NW)
        self.canvas.create_text(CANVAS_WIDTH-10, 10, text=f"Endzone (them?)", fill=LINE_COLOR, anchor=tk.NE)

    # ---------- Click handling and event flow ----------
    def on_canvas_click(self, event):
        # Convert pixel to yards position (x along length, y across width)
        x_pix, y_pix = event.x, event.y
        x_yd = x_pix / SCALE
        y_yd = y_pix / SCALE
        # If awaiting turnover resolution (after a drop/throwaway), handle that popup first
        if self.awaiting_turnover_resolution:
            choice = select_from(self.master, "Turnover outcome", "Select outcome of turnover (opponent):",
                                 ["opponent throwaway", "defensive block", "goal for other team"])
            if not choice:
                return
            e = {"time":datetime.now().isoformat(), "type":"turnover_resolution", "outcome":choice, "pos_pix":(x_pix,y_pix), "pos_yd":(x_yd,y_yd)}
            if choice == "defensive block":
                blocker = select_from(self.master, "Block", "Select blocking player (our team):", self.on_field)
                if not blocker:
                    return
                e["blocker"] = blocker
            self.events.append(e)
            # possession ends for us if opponent outcome not our goal
            self.possession = False
            self.last_catcher = None
            self.last_catch_pos = None
            self.awaiting_turnover_resolution = False
            # if opponent goal, increment their score
            if choice == "goal for other team":
                self.game_score["them"] += 1
                self.update_score_label()
            return

        # Normal click: ask whether this location is a catch, drop, or throwaway
        if not self.on_field:
            messagebox.showerror("No players", "Enter roster and select on-field players before logging events.")
            return

        primary_choice = select_from(self.master, "Event", "Select event at this location:", ["catch", "drop", "throwaway"])
        if not primary_choice:
            return

        if primary_choice == "catch":
            catcher = select_from(self.master, "Catcher", "Select which on-field player caught it:", self.on_field)
            if not catcher:
                return
            # check endzone goal if applicable: if click is inside our offensive endzone and we are on offense
            in_our_endzone = (x_yd <= ENDZONE_YDS)  # left endzone
            in_their_endzone = (x_yd >= (ENDZONE_YDS + PLAYING_LENGTH_YDS))
            # For simplicity assume our offense is attacking left-to-right? We'll treat "if in our team's scoring endzone when we are on offense" as in the endzone on left when possession True and last_catcher != None.
            # More robust: ask user if we are on offense; to keep flow minimal we assume a goal is a catch inside our 'scoring' endzone when possession==True and last thrower exists.
            is_goal_for_us = False
            # If we currently have possession (possession True) and click is inside *the opponent's* endzone from our perspective (we'll treat right endzone as opponent if possession True)
            # Let's consider: If we have possession and click is inside THEIR endzone (right endzone), that's a goal for us.
            if self.possession and in_their_endzone:
                is_goal_for_us = True

            event = {"time":datetime.now().isoformat(), "type":"catch", "player":catcher, "pos_pix":(x_pix,y_pix), "pos_yd":(x_yd,y_yd)}
            # compute throwing/receiving yards if possible
            if self.last_catcher:
                # treat last_catcher as thrower
                thrower = self.last_catcher
                # compute distance between last_catch_pos and current pos in yards
                dx = (x_pix - self.last_catch_pos[0]) / SCALE
                dy = (y_pix - self.last_catch_pos[1]) / SCALE
                dist = math.hypot(dx, dy)
                # attribute throwing yards to thrower, receiving yards to catcher
                self.player_stats.setdefault(thrower, {"throws":0,"receives":0,"goals":0,"assists":0})
                self.player_stats.setdefault(catcher, {"throws":0,"receives":0,"goals":0,"assists":0})
                self.player_stats[thrower]["throws"] += dist
                self.player_stats[catcher]["receives"] += dist
                event["thrower"] = thrower
                event["yards"] = round(dist, 2)
            else:
                event["thrower"] = None
                event["yards"] = 0.0

            # record goal/assist if in opponent endzone and we have possession
            if is_goal_for_us:
                event["goal"] = True
                # goal to catcher
                self.player_stats[catcher]["goals"] += 1
                # assist to the last thrower (if present)
                if event.get("thrower"):
                    assister = event["thrower"]
                    self.player_stats[assister]["assists"] += 1
                self.game_score["us"] += 1
                self.update_score_label()
                # possession resets
                self.possession = False
                self.last_catcher = None
                self.last_catch_pos = None
            else:
                # normal catch: our team has possession now
                self.possession = True
                self.last_catcher = catcher
                self.last_catch_pos = (x_pix,y_pix)

            self.events.append(event)
            # Draw marker
            self.draw_marker(x_pix, y_pix, catcher, event.get("yards",0.0))
            return

        # primary_choice is drop or throwaway: first ask which of our 7 did the drop/throwaway
        offender = select_from(self.master, f"{primary_choice.title()}", f"Select which on-field player made the {primary_choice}:", self.on_field)
        if not offender:
            return
        e = {"time":datetime.now().isoformat(), "type":primary_choice, "player":offender, "pos_pix":(x_pix,y_pix), "pos_yd":(x_yd,y_yd)}
        self.events.append(e)
        # mark awaiting turnover resolution (opponent's result)
        self.awaiting_turnover_resolution = True
        # possession ends in that moment but next click will define opponent outcome
        self.possession = False
        self.last_catcher = None
        self.last_catch_pos = None
        self.draw_marker(x_pix, y_pix, offender, label=primary_choice.upper())
        return

    def update_score_label(self):
        self.score_label.config(text=f"Score: {self.game_score['us']} - {self.game_score['them']}")

    def draw_marker(self, x_pix, y_pix, player, yards=None, label=None):
        # small circle and text
        r = 6
        color = "white"
        self.canvas.create_oval(x_pix - r, y_pix - r, x_pix + r, y_pix + r, fill=color, outline="black")
        txt = player
        if label:
            txt = f"{player} ({label})"
        elif yards:
            txt = f"{player} ({yards:.0f}yd)"
        self.canvas.create_text(x_pix + 10, y_pix - 10, text=txt, anchor=tk.SW, fill="white", font=("Arial", 9, "bold"))

# ---------- Helper dialogs ----------
def select_from(parent, title, prompt, options):
    """Modal dialog that shows a dropdown or list of options and returns selection (or None)."""
    dlg = tk.Toplevel(parent)
    dlg.transient(parent)
    dlg.grab_set()
    dlg.title(title)
    tk.Label(dlg, text=prompt).pack(padx=8, pady=8)
    var = tk.StringVar(value=options[0] if options else "")
    if len(options) <= 6:
        # use OptionMenu
        opt = tk.OptionMenu(dlg, var, *options)
        opt.pack(padx=8, pady=4)
    else:
        # use listbox for many options
        lb = tk.Listbox(dlg, height=8, exportselection=False)
        for it in options:
            lb.insert(tk.END, it)
        lb.pack(padx=8, pady=4)
        def on_select(e=None):
            s = lb.curselection()
            if s:
                var.set(lb.get(s[0]))
        lb.bind("<<ListboxSelect>>", on_select)
    result = {"val": None}
    def on_ok():
        if var.get():
            result["val"] = var.get()
        dlg.destroy()
    def on_cancel():
        dlg.destroy()
    btnf = tk.Frame(dlg)
    btnf.pack(pady=8)
    tk.Button(btnf, text="OK", command=on_ok).pack(side=tk.LEFT, padx=6)
    tk.Button(btnf, text="Cancel", command=on_cancel).pack(side=tk.LEFT, padx=6)
    parent.wait_window(dlg)
    return result["val"]

class MultiSelectDialog:
    def __init__(self, parent, title, options, select_count=None):
        self.top = tk.Toplevel(parent)
        self.top.transient(parent)
        self.top.grab_set()
        self.top.title(title)
        self.select_count = select_count
        tk.Label(self.top, text="Select players:").pack(padx=8, pady=4)
        self.vars = []
        fr = tk.Frame(self.top)
        fr.pack(padx=8, pady=4)
        for i, opt in enumerate(options):
            v = tk.IntVar(value=0)
            cb = tk.Checkbutton(fr, text=opt, variable=v)
            cb.grid(row=i//2, column=i%2, sticky="w", padx=4, pady=2)
            self.vars.append((opt, v))
        btnf = tk.Frame(self.top)
        btnf.pack(pady=8)
        tk.Button(btnf, text="OK", command=self.on_ok).pack(side=tk.LEFT, padx=6)
        tk.Button(btnf, text="Cancel", command=self.on_cancel).pack(side=tk.LEFT, padx=6)