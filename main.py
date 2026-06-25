import sys
import json
import time
import pandas as pd
import traceback

from PySide6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLineEdit, QLabel,
    QComboBox, QTextEdit, QFileDialog,
    QCheckBox
)

from vk_api import VKClient
from db import (
    init_db,
    insert_posts,
    insert_session,
    insert_comments,
    get_sessions,
    get_posts_by_session,
    get_comments_for_post,
    search_posts
)

from analytics import (
    top_words,
    avg_post_length,
    posts_by_month,
    sentiment_score
)

from config import TOKEN


class App(QWidget):

    def __init__(self):
        super().__init__()

        self.setWindowTitle("VK Intel v4.2")
        self.resize(1000, 800)

        self.db = init_db()
        self.client = VKClient(TOKEN)

        self.current_session = None

        layout = QVBoxLayout()

        self.input = QLineEdit()
        self.input.setPlaceholderText("Паблик / пользователь")

        self.limit = QComboBox()
        self.limit.addItems(["10", "50", "100", "ВСЕ", "ДРУГОЕ"])

        self.custom_limit = QLineEdit()
        self.custom_limit.setPlaceholderText("Количество постов")
        self.custom_limit.hide()

        self.limit.currentTextChanged.connect(
            lambda v: self.custom_limit.setVisible(v == "ДРУГОЕ")
        )

        self.load_comments = QCheckBox("Загружать комментарии")
        self.export_comments = QCheckBox("Экспортировать комментарии")

        self.btn_collect = QPushButton("Загрузить новую сессию")
        self.btn_collect.clicked.connect(self.collect)

        self.session_selector = QComboBox()
        self.session_selector.currentIndexChanged.connect(self.load_session)

        self.btn_refresh = QPushButton("Обновить список сессий")
        self.btn_refresh.clicked.connect(self.load_sessions)

        self.btn_analyze = QPushButton("Анализировать")
        self.btn_analyze.clicked.connect(self.analyze)

        self.btn_export = QPushButton("Экспорт")
        self.btn_export.clicked.connect(self.export)

        self.preview = QTextEdit()
        self.preview.setReadOnly(True)

        layout.addWidget(QLabel("Источник"))
        layout.addWidget(self.input)
        layout.addWidget(self.limit)
        layout.addWidget(self.custom_limit)
        layout.addWidget(self.load_comments)
        layout.addWidget(self.export_comments)
        layout.addWidget(self.btn_collect)
        layout.addWidget(self.session_selector)
        layout.addWidget(self.btn_refresh)
        layout.addWidget(self.btn_analyze)
        layout.addWidget(self.btn_export)
        layout.addWidget(self.preview)

        self.setLayout(layout)
        self.load_sessions()

    def collect(self):
        try:
            info = self.client.resolve(self.input.text().strip())

            limit_text = self.limit.currentText()

            if limit_text == "ВСЕ":
                limit = 0
            elif limit_text == "ДРУГОЕ":
                limit = int(self.custom_limit.text() or "0")
            else:
                limit = int(limit_text)

            session_id = str(int(time.time()))

            insert_session(
                self.db,
                session_id,
                info["owner_id"],
                info["screen_name"],
                info["display_name"],
                time.strftime("%Y-%m-%d %H:%M:%S")
            )

            posts = self.client.get_posts(
                owner_id=info["owner_id"],
                limit=limit
            )

            insert_posts(self.db, posts, session_id)

            if self.load_comments.isChecked():
                comments = self.client.collect_comments_for_posts(
                    posts,
                    session_id
                )
                insert_comments(self.db, comments)

            self.load_sessions()
            self.render(posts)

        except Exception:
            self.preview.setPlainText(
              traceback.format_exc()
            )

    def load_sessions(self):
        self.session_selector.clear()

        for row in get_sessions(self.db):
            session_id, display_name, screen_name, created_at = row
            self.session_selector.addItem(display_name, session_id)

    def load_session(self):
        session_id = self.session_selector.currentData()
        if not session_id:
            return

        rows = get_posts_by_session(self.db, session_id)

        posts = [{
            "id": r[0],
            "owner_id": r[1],
            "date": r[2],
            "text": r[3],
            "likes": r[4],
            "reposts": r[5],
            "comments": r[6],
            "url": r[7]
        } for r in rows]

        self.render(posts)

    def render(self, posts):
        self.preview.clear()
        for i, p in enumerate(posts, 1):
            self.preview.append(
                f"#{i}\n{p['date']}\n❤️ {p['likes']} 🔁 {p['reposts']} 💬 {p['comments']}\n\n{p['text']}\n\n{'-'*60}\n"
            )

    def analyze(self):
        session_id = self.session_selector.currentData()
        rows = get_posts_by_session(self.db, session_id)

        posts = [{"text": r[3], "date": r[2]} for r in rows]

        self.preview.clear()
        self.preview.append(f"Постов: {len(posts)}")
        self.preview.append(f"Средняя длина: {int(avg_post_length(posts))}")
        self.preview.append(f"Тональность: {sentiment_score(posts)}")

        self.preview.append("\nТОП СЛОВ")
        for w, c in top_words(posts):
            self.preview.append(f"{w}: {c}")

    def export(self):
        session_id = self.session_selector.currentData()
        rows = get_posts_by_session(self.db, session_id)

        data = []

        for r in rows:
            item = {
                "id": r[0],
                "date": r[2],
                "text": r[3],
                "likes": r[4],
                "reposts": r[5],
                "comments_count": r[6],
                "url": r[7]
            }

            if self.export_comments.isChecked():
                item["comments"] = get_comments_for_post(
                    self.db,
                    session_id,
                    r[0]
                )

            data.append(item)

        path, _ = QFileDialog.getSaveFileName(
            self,
            "Экспорт",
            "",
            "JSON (*.json);;CSV (*.csv)"
        )

        if not path:
            return

        if path.endswith(".json"):
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        else:
            pd.DataFrame(data).to_csv(path, index=False)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    w = App()
    w.show()
    sys.exit(app.exec())
