import PyPDF2

def read_pdf():
    try:
        with open(r"r:\trip\2026학년도 세종고등학교 2학년 수학여행 운영 계획.pdf", "rb") as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for i, page in enumerate(reader.pages):
                text += f"\n--- Page {i+1} ---\n"
                text += page.extract_text()
            print(text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    read_pdf()
