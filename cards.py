#### Initialization ####
import sqlite3
import webbrowser
import re
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
# Connect to the SQLite database
conn = sqlite3.connect('cards.db', check_same_thread=False)
cursor = conn.cursor()
# Test Database Connection
#cursor.execute('SELECT * From "deck1" LIMIT 1')
#print(cursor.fetchone())
#cursor.execute('SELECT * From "deck1" LIMIT 1')
#print(cursor.fetchone())

#### Variable Initialization ####
#### Converting SQL syntax into Variables ###
deck1 = "deck1"
card_id = "card_id"
primary_id = "primary_id"
front = "front"
back = "back"
difficulty = "difficulty"
pic = "pic"
full_name = "full_ name"
name = "name"
subtitle = "subtitle"
birth_year = "birth_year"
death_year = "death_year"
description = "description"
tags = "tags"
category = "category"
from_book = "from_book"
#Initialize current_card variable
drawn_card = None
nondeck_tables = {'primary_cards', 'secondary_cards', 'decklog', 'sqlite_sequence'}


#### Main Functions ####

def deck_insert(column, value, target_table):
    # Check if the card already exists in the target_table
    check_query = f"""
        SELECT 1 FROM {target_table} WHERE {column} = ?
        LIMIT 1
    """
    cursor.execute(check_query, (value,))
    existing_card = cursor.fetchone()
    if existing_card:
        print(f"Duplicate card with {column} = {value} already exists in {target_table}. No insert performed.")
    else:
        # Insert the card into the target_table with difficulty set to 1
        insert_query = f"""
            INSERT INTO {target_table} (primary_id, card_id, pic, front, back)
            SELECT primary_id, card_id, pic, front, back
            FROM secondary_cards
            WHERE {column} = ?
        """
        cursor.execute(insert_query, (value,))
        conn.commit()
        print(f"Successfully inserted cards with {column} value of {value} into {target_table}")
### Inserts all cards into deck with keyword in any columns ###
def deck_keyword_insert(keyword, source_table, target_table):
    try:
        query = f"""
        INSERT INTO {target_table} (primary_id, card_id, front, back)
        SELECT primary_id, card_id, front, back FROM {source_table}
        WHERE front LIKE ? OR back LIKE ?;
        """
        cursor.execute(query, (f"%{keyword}%", f"%{keyword}%"))     ## % symbol is wildcard matchin 0 or more characters on each side
        conn.commit()
        print(f"Successfully copied entries containing '{keyword}' from {source_table} to {target_table}.")
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
### Removes all cards with matching keyword in any columns ###
def deck_keyword_remove(keyword, table):
    if table in ['primary_cards', 'secondary_cards']:
        print("Error: Select deck, not primary database")
        return    
    try:
        query = f"""
        DELETE FROM {table}
        WHERE front LIKE ? OR back LIKE ?;
        """
        cursor.execute(query, (f"%{keyword}%", f"%{keyword}%"))  # % symbol is wildcard matching 0 or more characters on each side
        conn.commit()
        print(f"Successfully removed entries containing '{keyword}' from {table}.")
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")

def draw_card(deck):
    cursor.execute(f"SELECT * FROM {deck} ORDER BY RANDOM() LIMIT 1;")
    drawn_card = cursor.fetchone()
        # If a card is drawn, print the 'front' column
    if drawn_card:
        print(f"Card drawn: {drawn_card[3]}")  # Assuming 'front' is the third column (index 2)
        input("Press Enter to see the back of the card...")
        print(f"Back: {drawn_card[4]}")

def set_card_difficulty(card_id, new_difficulty, deck):
    # Check current difficulty of the card in the deck
    cursor.execute(f"SELECT difficulty FROM {deck} WHERE card_id = ?", (card_id,))
    current_difficulty_row = cursor.fetchone()    
    old_difficulty = current_difficulty_row[0]    
    # If the difficulty is the same, do nothing
    if old_difficulty == new_difficulty:
        print("Difficulty is already set to the desired value. No changes made.")
        return    
    if new_difficulty == 1:
        # If new difficulty is 1, remove all duplicates and set difficulty to 1
        cursor.execute(f"DELETE FROM {deck} WHERE card_id = ?", (card_id,))
        cursor.execute(f"""
            INSERT INTO {deck} (primary_id, card_id, front, back, difficulty) 
            SELECT primary_id, card_id, front, back, 1 
            FROM secondary_cards 
            WHERE card_id = ?
        """, (card_id,))    
    else:
        # Calculate the difference in difficulty (positive or negative)
        difficulty_difference = new_difficulty - old_difficulty        
        if difficulty_difference > 0:
            # If new difficulty is greater than old, insert new copies of the card
            for _ in range(difficulty_difference):
                cursor.execute(f"""
                    INSERT INTO {deck} (primary_id, card_id, front, back, difficulty) 
                    SELECT primary_id, card_id, front, back, ? 
                    FROM secondary_cards 
                    WHERE card_id = ?
                """, (new_difficulty, card_id))                
            # Update the difficulty for all remaining entries of the card
            cursor.execute(f"""
                UPDATE {deck} 
                SET difficulty = ?
                WHERE card_id = ?
            """, (new_difficulty, card_id))        
        elif difficulty_difference < 0:
            # If new difficulty is less than old, remove extra copies
            cursor.execute(f"""
                DELETE FROM {deck} 
                WHERE card_id = ? 
                LIMIT ?
            """, (card_id, -difficulty_difference))            
            # Update the difficulty for all remaining entries of the card
            cursor.execute(f"""
                UPDATE {deck} 
                SET difficulty = ?
                WHERE card_id = ?
            """, (new_difficulty, card_id))
    # Commit the changes
    conn.commit()
    print(f"Card {card_id} difficulty updated to {new_difficulty} in deck {deck}.")

def reset_deck_difficulty(deck_name):
    # Replace spaces with underscores for formatted deck name
    formatted_deck_name = deck_name.replace(" ", "_")    
    # Remove duplicate entries based on card_id, keeping only one entry per card_id
    cursor.execute(f"""
        DELETE FROM {formatted_deck_name}
        WHERE rowid NOT IN (
            SELECT MIN(rowid)
            FROM {formatted_deck_name}
            GROUP BY card_id
        );
    """)    
    # Set the difficulty for all cards to 1
    cursor.execute(f"""
        UPDATE {formatted_deck_name}
        SET difficulty = 1;
    """)    
    # Commit the changes
    conn.commit()
    print(f'Deck \"{deck_name}\" difficulty reset')

def decklog_to_html():
    print('Fetching deck names...')
    # Fetch all deck names from the decklog (formerly decks_metatable) table
    cursor.execute("SELECT deck_name FROM decklog;")
    decks = cursor.fetchall()
    # Convert list of tuples into a simple list of deck names
    deck_names = [deck[0] for deck in decks]
    print("Decks fetched:", deck_names)
    # Open the existing select_deck.html and modify it
    with open("templates/select_deck.html", "r") as file:
        html_content = file.read()
    # Check if the placeholder exists in the HTML content using regex
    placeholder_match = re.search(r'<ul id="deck-list">.*?</ul>', html_content, flags=re.DOTALL)
    if not placeholder_match:
        print("Error: Placeholder '<ul id=\"deck-list\"></ul>' not found.")
    else:
        print("Placeholder found, proceeding with replacement.")
    # Generate a list of decks in HTML format
    deck_list_html = "<ul>"
    for deck in deck_names:
        deck_list_html += f"<li><a href='/select_deck/{deck}'>Study {deck}</a></li>"
    deck_list_html += "</ul>"
    # Use regex to replace everything inside <ul id="deck-list">...</ul> with the new deck list
    html_content = re.sub(r'(<ul id="deck-list">).*?(</ul>)', r'\1' + deck_list_html + r'\2', html_content, flags=re.DOTALL)
    # Write the updated content back to the file (overwriting only the section)
    with open("templates/select_deck.html", "w") as file:
        file.write(html_content)
    print("HTML file updated successfully.")

def refresh_decklog():
    # Get the list of all tables in the database
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    existing_tables = {table[0] for table in cursor.fetchall()}  # Use a set for fast lookup
    existing_decks = existing_tables - nondeck_tables           # Exclude nondeck tables
    # Get the list of tables currently in decklog
    cursor.execute("SELECT deck_name FROM decklog;")
    decklog_decks = {row[0] for row in cursor.fetchall()}
    # Identify tables to remove from decklog (exist in decklog but not in existing_tables)
    outdated_decks = decklog_decks - existing_decks
    # Remove outdated tables from decklog
    for deck_name in outdated_decks:
        cursor.execute("DELETE FROM decklog WHERE deck_name = ?", (deck_name,))
    # Insert new tables into decklog, excluding specified tables
    for deck_name in existing_decks:
        if deck_name not in decklog_decks:  # Avoid duplicate inserts
            cursor.execute("INSERT INTO decklog (deck_name) VALUES (?)", (deck_name,))
    # Commit the changes
    conn.commit()
    decklog_to_html()

def create_new_deck(deck_name):
    # Replace spaces with underscores
    formatted_deck_name = deck_name.replace(" ", "_")
    # Check if the table already exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", (formatted_deck_name,))
    if cursor.fetchone():
        print(f"Error: Deck name 'The deck name {deck_name}' already in use.")
        return  # Exit the function if the deck already exists
    create_table_query = f"""
    CREATE TABLE IF NOT EXISTS {formatted_deck_name} (
        primary_id INT,
        card_id INT,
        pic BLOB,
        front TEXT,
        back TEXT,
        difficulty INTEGER DEFAULT 1,
        FOREIGN KEY (primary_id) REFERENCES secondary_cards(primary_id),
        FOREIGN KEY (pic) REFERENCES secondary_cards(pic),
        FOREIGN KEY (front) REFERENCES secondary_cards(front),
        FOREIGN KEY (back) REFERENCES secondary_cards(back),
        FOREIGN KEY (card_id) REFERENCES secondary_cards(card_id) ON DELETE CASCADE
    );
    """    
    cursor.execute(create_table_query)
    refresh_decklog()

def delete_deck(deck_name):
    # Convert spaces to underscores in deck_name
    formatted_deck_name = deck_name.replace(" ", "_")
    # Prevent deletion of essential tables
    if formatted_deck_name in nondeck_tables:
        print(f"Error: Cannot delete protected table '{formatted_deck_name}'.")
        return
    # Execute table deletion
    cursor.execute(f"DROP TABLE IF EXISTS {formatted_deck_name};")
    conn.commit()
    print(f"Deck '{formatted_deck_name}' deleted successfully.")
    refresh_decklog()

def deck_remove(deck_name, *card_ids):
    # Format deck name by replacing spaces with underscores
    formatted_deck_name = deck_name.replace(" ", "_")  
    # Check if the deck name is in the non-deck tables
    if formatted_deck_name in nondeck_tables:
        print(f"Cannot delete from excluded table: {formatted_deck_name}")
        return
    try:
        # Check if the deck table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (formatted_deck_name,))
        table_exists = cursor.fetchone() 
        if not table_exists:
            print(f"Table {formatted_deck_name} does not exist in the database.")
            return     
        # Prepare placeholders for multiple card_ids
        placeholders = ', '.join('?' for _ in card_ids)  
        # Execute the DELETE statement for multiple card_ids
        cursor.execute(f"DELETE FROM {formatted_deck_name} WHERE card_id IN ({placeholders})", tuple(card_ids))       
        # Commit the changes
        cursor.connection.commit()  # Assuming you have the connection object in the cursor       
        # Check if any rows were deleted
        if cursor.rowcount > 0:
            print(f"Cards with card_ids {', '.join(map(str, card_ids))} have been deleted from {formatted_deck_name}.")
        else:
            print(f"No cards found with card_ids {', '.join(map(str, card_ids))} in {formatted_deck_name}.")
    except sqlite3.Error as e:
        print(f"Error occurred: {e}")

def print_decklist(deck_name):
    # Format deck name by replacing spaces with underscores
    formatted_deck_name = deck_name.replace(" ", "_")
    # Define non-deck tables
    nondeck_tables = {'primary_cards', 'secondary_cards', 'decklog', 'sqlite_sequence'}
    # Check if the deck name is in the non-deck tables
    if formatted_deck_name in nondeck_tables:
        print(f"Error: Cannot print protected table '{formatted_deck_name}'.")
        return
    try:
        # Check if the table exists in the database
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (formatted_deck_name,))
        table_exists = cursor.fetchone()
        if not table_exists:
            print(f"Error: Table '{formatted_deck_name}' does not exist.")
            return
        # Fetch unique entries from the deck table
        cursor.execute(f"SELECT DISTINCT * FROM {formatted_deck_name}")
        # Fetch all rows
        rows = cursor.fetchall()
        # If rows exist, print them, else notify no entries
        if rows:
            for row in rows:
                print(row)
        else:
            print(f"No entries found in '{formatted_deck_name}'.")
    except sqlite3.Error as e:
        print(f"Error occurred: {e}")

def deck_add(deck_name, *card_ids):
    # Format deck name by replacing spaces with underscores
    formatted_deck_name = deck_name.replace(" ", "_")
    # Define non-deck tables
    # Check if the deck name is in the non-deck tables
    if formatted_deck_name in nondeck_tables:
        print(f"Error: Cannot add cards to protected table '{formatted_deck_name}'.")
        return

    try:
        # Check if the deck exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (formatted_deck_name,))
        table_exists = cursor.fetchone()
        if not table_exists:
            print(f"Error: Table '{formatted_deck_name}' does not exist.")
            return

        # Fetch the card details from the 'secondary_cards' table where card_id matches the provided card_ids
        placeholders = ', '.join('?' for _ in card_ids)
        cursor.execute(f"SELECT * FROM secondary_cards WHERE card_id IN ({placeholders})", tuple(card_ids))
        cards_to_add = cursor.fetchall()

        if not cards_to_add:
            print("Error: No valid cards found in 'secondary_cards' for the provided card_ids.")
            return

        # Prevent adding duplicates - Check if any of the cards are already in the deck
        cursor.execute(f"SELECT card_id FROM {formatted_deck_name} WHERE card_id IN ({placeholders})", tuple(card_ids))
        existing_cards = cursor.fetchall()

        # Collect existing card_ids from the deck
        existing_card_ids = {card[0] for card in existing_cards}

        # Filter out duplicates from cards_to_add
        cards_to_insert = [card for card in cards_to_add if card[1] not in existing_card_ids]

        # If no new cards to insert, print the skipped ones
        if len(cards_to_insert) == 0:
            skipped_card_ids = [card_id for card_id in card_ids if card_id in existing_card_ids]
            print(f"The following card(s) were already in the deck and were skipped: {', '.join(map(str, skipped_card_ids))}")
            return

        # Insert the non-duplicate cards into the deck, leaving 'difficulty' to default value
        for card in cards_to_insert:
            # Here, we do not specify the 'difficulty' column, so it will use the default value
            cursor.execute(f"INSERT INTO {formatted_deck_name} (primary_id, card_id, pic, front, back) VALUES (?, ?, ?, ?, ?)", 
                           (card[0], card[1], card[2], card[3], card[4]))

        # Commit the changes to the database
        conn.commit()

        # Inform the user of what happened
        added_cards = len(cards_to_insert)
        if added_cards > 0:
            print(f"Successfully added {added_cards} new card(s) to '{formatted_deck_name}' deck.")
        
    except sqlite3.Error as e:
        print(f"Error occurred: {e}")



#deck_remove(deck1, 45, 46, 47, 48, 49)
deck_add(deck1, 45, 46, 47, 48, 49)


### Function Testing ###
#draw_card(deck1)
#create_new_deck("Study hard bro")
#decklog_to_html()
# Example usage:
#deck_insert(card_id, 43, deck1)
# Example: Set card #5 to difficulty 3 (there will now be 3 copies of it in the deck)
#set_card_difficulty(43, 3, deck1)
# Function Testing
# deck_remove("Augustus", "deck1")
# decklog_to_html()
# deck_add("Augustus", "secondary_cards", "deck1")
# print(draw_card(deck1))


# Close the connection when done
conn.close()




